import time
import uuid
import fitz
import os
from PIL import Image
import io
from dotenv import load_dotenv
from azure.core.credentials import AzureKeyCredential
from azure.ai.textanalytics import TextAnalyticsClient
from msrest.authentication import CognitiveServicesCredentials
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
from azure.storage.blob import BlobServiceClient, ContentSettings
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

load_dotenv()

LANG_KEY = os.getenv('LANGUAGE_KEY')
LANG_ENDPOINT = os.getenv('LANGUAGE_ENDPOINT')
AZURE_STORAGE_CONNECTION_STRING = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
STORAGE_URL = os.getenv('STORAGE_URL')
CV_ENDPOINT = os.getenv('ENDPOINT')
CV_KEY = os.getenv('API_KEY')

tokenizer = AutoTokenizer.from_pretrained("czearing/article-title-generator")
model = AutoModelForSeq2SeqLM.from_pretrained("czearing/article-title-generator")

def authenticate_client():
    ta_credential = AzureKeyCredential(LANG_KEY)
    text_analytics_client = TextAnalyticsClient(
        endpoint=LANG_ENDPOINT,
        credential=ta_credential)
    return text_analytics_client

def generate_title(text):
    input_ids = tokenizer.encode("summarize: " + text, return_tensors="pt", max_length=1024, truncation=True)
    output = model.generate(input_ids, max_length=50, num_beams=5, length_penalty=0.6, no_repeat_ngram_size=2)

    generated_title = tokenizer.decode(output[0], skip_special_tokens=True)
    return generated_title

def _pdf_to_images(pdf_path, output_folder):
    images = []
    pdf_document = fitz.open(pdf_path)

    for page_number in range(pdf_document.page_count):
        page = pdf_document.load_page(page_number)
        image = page.get_pixmap()

        # Save the image locally
        image_path = f"{output_folder}/page_{page_number + 1}.png"
        image.save(image_path)
        image = Image.open(image_path)
        images.append(image)

    return images

def concatenate_images(images):
    # Find the maximum width and total height
    max_width = max(image.width for image in images)
    total_height = sum(image.height for image in images)

    # Create a blank image with the maximum width and total height
    concatenated_image = Image.new('RGBA', (max_width, total_height))

    # Paste each image onto the blank image
    current_height = 0
    for image in images:
        # Resize or crop the image to the maximum width before pasting
        resized_image = image.resize((max_width, image.height))
        concatenated_image.paste(resized_image, (0, current_height))
        current_height += resized_image.height

    return concatenated_image

def upload_images_to_blob(images, container_name):
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
    container_client = blob_service_client.get_container_client(container_name)
    
    # Concatenate images into a single image
    concatenated_image = concatenate_images(images)
    
    # Save the concatenated image to a BytesIO buffer
    concatenated_image_buffer = io.BytesIO()
    concatenated_image.save(concatenated_image_buffer, format='PNG')
    concatenated_image_buffer.seek(0)

    # Upload the concatenated image to Azure Blob Storage
    unique_id = str(uuid.uuid4())
    blob_name = f"{unique_id}_all_pages.png"
    blob_client = container_client.get_blob_client(blob_name)
    blob_client.upload_blob(concatenated_image_buffer.read(), content_settings=ContentSettings(content_type='image/png'))

    # Get the URL of the uploaded blob
    concatenated_image_url = blob_client.url

    return concatenated_image_url

def validate_blob_url(blob_url):
    # Check if the URL is a valid Azure Storage Blob URL
    return blob_url.startswith(STORAGE_URL) and blob_url.endswith('.png')

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

def parse_questions(text):
    # Split the text into individual questions
    questions_raw = text.split('\n\n')

    # Initialize a list to store parsed questions
    parsed_questions = []

    for question_raw in questions_raw:
        # Split each question into lines
        lines = question_raw.strip().split('\n')

        # Extract question and options
        question = lines[0].strip().split('. ')[1]

        # Extract options and correct answer
        options = [line.strip()[3:] for line in lines[1:] if line.strip()]  # Ignore empty lines
        actual_options = [option.split(' - ')[0].strip() for option in options]
        correct_answer = next((option.split(' - ')[0].strip() for option in options if 'Correct' in option), None)

        # Create a dictionary for the parsed question
        parsed_question = {
            'question': question,
            'options': actual_options,
            'correct_answer': correct_answer
        }

        # Append the parsed question to the list
        parsed_questions.append(parsed_question)

    return parsed_questions

