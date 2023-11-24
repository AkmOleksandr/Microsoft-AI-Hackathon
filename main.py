from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
from azure.ai.textanalytics import ExtractiveSummaryAction
from transformers import AutoTokenizer, AutoModel
import time
from msrest.authentication import CognitiveServicesCredentials
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
import uuid
from azure.storage.blob import BlobServiceClient, ContentSettings
import fitz
import openai 
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

app = Flask(__name__)

load_dotenv()


# ALL CONTENT -> SUMMARY
LANG_KEY = os.getenv('LANGUAGE_KEY')
LANG_ENDPOINT = os.getenv('LANGUAGE_ENDPOINT')

def authenticate_client():
    ta_credential = AzureKeyCredential(LANG_KEY)
    text_analytics_client = TextAnalyticsClient(
        endpoint=LANG_ENDPOINT,
        credential=ta_credential)
    return text_analytics_client

tokenizer = AutoTokenizer.from_pretrained("czearing/article-title-generator")
model = AutoModelForSeq2SeqLM.from_pretrained("czearing/article-title-generator")

def generate_title(text):
    input_ids = tokenizer.encode("summarize: " + text, return_tensors="pt", max_length=1024, truncation=True)
    output = model.generate(input_ids, max_length=50, num_beams=5, length_penalty=0.6, no_repeat_ngram_size=2)

    generated_title = tokenizer.decode(output[0], skip_special_tokens=True)
    return generated_title

@app.route('/summarize', methods=['POST'])
def summarize_text():
    data = request.get_json()

    if 'text' not in data:
        return jsonify({'error': 'Missing "text" parameter'}), 400

    text_to_summarize = data['text']
    max_sentence_count = data.get('max_sentence_count', 5)

    client = authenticate_client()

    document = [text_to_summarize]

    poller = client.begin_analyze_actions(
        document,
        actions=[
            ExtractiveSummaryAction(max_sentence_count=max_sentence_count)
        ],
    )
    res = ""
    document_results = poller.result()
    for result in document_results:
        extract_summary_result = result[0]  # first document, first result
        if extract_summary_result.is_error:
            return jsonify({'error': f'Error: {extract_summary_result.code} - {extract_summary_result.message}'}), 500

        res += " ".join([sentence.text for sentence in extract_summary_result.sentences])

    return jsonify({'summary': res, 'title': generate_title(res)})


# PDF -> IMAGE
AZURE_STORAGE_CONNECTION_STRING = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
CONTAINER_NAME = os.getenv('CONTAINER_NAME')
STORAGE_URL = os.getenv('STORAGE_URL')

def _pdf_to_images(pdf_path, output_folder):
    images = []
    pdf_document = fitz.open(pdf_path)

    for page_number in range(pdf_document.page_count):
        page = pdf_document.load_page(page_number)
        image = page.get_pixmap()

        # Save the image locally
        image_path = f"{output_folder}/page_{page_number + 1}.png"
        image.save(image_path)
        images.append(image_path)

    return images

def upload_images_to_blob(images, container_name):
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
    container_client = blob_service_client.get_container_client(container_name)

    image_urls = []

    for idx, image_path in enumerate(images):
        with open(image_path, "rb") as image_file:
            # Upload image to Azure Blob Storage
            unique_id = str(uuid.uuid4())
            blob_name = f"{unique_id}_page_{idx + 1}.png"
            blob_client = container_client.get_blob_client(blob_name)
            blob_client.upload_blob(image_file.read(), content_settings=ContentSettings(content_type='image/png'))

            # Get the URL of the uploaded blob
            image_url = blob_client.url

            # Ensure the URL is valid and can be accessed
            if validate_blob_url(image_url):
                image_urls.append(image_url)
            else:
                print(f"Error: Unable to access the URL for {blob_name}")

    return image_urls

def validate_blob_url(blob_url):
    # Check if the URL is a valid Azure Storage Blob URL
    return blob_url.startswith(STORAGE_URL) and blob_url.endswith('.png')

@app.route('/pdf-to-image', methods=['POST'])
def pdf_to_image():
    # Check if the request contains a file
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']

    # Check if the file is a PDF
    if file and file.filename.endswith('.pdf'):
        # Specify the folder to save images locally
        output_folder = "local_images"

        # Create the output folder if it doesn't exist
        os.makedirs(output_folder, exist_ok=True)

        # Save the PDF file locally
        pdf_path = os.path.join(output_folder, 'input.pdf')
        file.save(pdf_path)

        # Convert PDF to images and upload to Azure Blob Storage
        images = _pdf_to_images(pdf_path, output_folder)
        image_urls = upload_images_to_blob(images, CONTAINER_NAME)

        # Return the image URLs in the response
        return jsonify({"image_urls": image_urls})

    else:
        return jsonify({"error": "Invalid file format. Please upload a PDF file"}), 400

# IMAGE -> TEXT
CV_ENDPOINT = os.getenv('ENDPOINT')
CV_KEY = os.getenv('API_KEY')

def _text_from_img(image_url):
    cv_client = ComputerVisionClient(CV_ENDPOINT, CognitiveServicesCredentials(CV_KEY))

    response = cv_client.read(url=image_url, language='en', raw=True)
    operation_location = response.headers['Operation-Location']
    operation_id = operation_location.split('/')[-1]
    res = ""

    result = None
    while result is None or result.status in [OperationStatusCodes.running, OperationStatusCodes.not_started]:
        time.sleep(1) 
        result = cv_client.get_read_result(operation_id)
    
    if result.status == OperationStatusCodes.succeeded:
        read_results = result.analyze_result.read_results
        for analyzed_result in read_results:
            for line in analyzed_result.lines:
                res += " " + line.text
    elif result.status == OperationStatusCodes.failed:
        print("Operation failed. Check the details.")
    else:
        print(f"Unexpected operation status: {result.status}")

    return res

@app.route('/image-to-text', methods=['POST'])
def extract_text_from_image():
    data = request.get_json()

    if 'image_url' not in data:
        return jsonify({'error': 'Missing "image_url" parameter'}), 400

    image_url = data['image_url']
    extracted_text = _text_from_img(image_url)

    return jsonify({'extracted_text': extracted_text})

# EXAM GENERATION
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

@app.route('/generate-new-exam', methods=['POST'])
def generate_new_exam():
    # Get past_exam and topics from the request data
    data = request.get_json()

    past_exam = data.get('past_exam')
    topics = data.get('topics')

    # Check if past_exam and topics are provided
    if not past_exam or not topics:
        return jsonify({"error": "Please provide both 'past_exam' and 'topics'"}), 400

    # Call OpenAI API to generate new exam
    try:
        res = openai.Completion.create(
            model="gpt-3.5-turbo-instruct",
            prompt=f"Generate a set of questions following this structure: {past_exam} cover these topics: {topics}, assign weight to each question s.t. the total weight is 100 points",
            max_tokens=500,
            temperature=0
        )

        # Extract and return the generated questions
        generated_questions = res['choices'][0]['text']
        return jsonify({"generated_questions": generated_questions})

    except Exception as e:
        return jsonify({"error": f"Error calling OpenAI API: {str(e)}"}), 500
    
# ASSESS AN EXAM
@app.route('/exam-assessment', methods=['POST'])
def exam_assessment():
    # Get input from the request data
    data = request.get_json()

    exam_input = data.get('exam_input')

    # Check if exam_input is provided
    if not exam_input:
        return jsonify({"error": "Please provide 'exam_input'"}), 400

    # Call OpenAI API to perform exam assessment
    try:
        res = openai.Completion.create(
            model="gpt-3.5-turbo-instruct",
            prompt=f"act as a professor, give a grade for every answer and provide feedback for this exam: {exam_input}",
            max_tokens=500,
            temperature=0
        )

        # Extract and return the assessment result
        assessment_result = res['choices'][0]['text']
        return jsonify({"assessment_result": assessment_result})

    except Exception as e:
        return jsonify({"error": f"Error calling OpenAI API: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
