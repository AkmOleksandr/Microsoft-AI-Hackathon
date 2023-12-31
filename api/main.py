from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from azure.ai.textanalytics import ExtractiveSummaryAction
from flask_cors import CORS, cross_origin
from helpers import _pdf_to_images, _text_from_img, parse_questions
from helpers import *
import openai

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

load_dotenv()

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

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
CONTAINER_NAME = os.getenv('CONTAINER_NAME')
STORAGE_URL = os.getenv('STORAGE_URL')

@app.route('/process-file', methods=['POST'])
def process_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']

    if file:
        output_folder = "local_images"
        os.makedirs(output_folder, exist_ok=True)

        if file.filename.endswith('.pdf'):
            # Save the PDF file locally
            pdf_path = os.path.join(output_folder, 'input.pdf')
            file.save(pdf_path)

            # Convert PDF to images
            images = _pdf_to_images(pdf_path, output_folder)

            # Upload images to Azure Blob Storage
            image_urls = upload_images_to_blob(images, CONTAINER_NAME)

            return jsonify({"image_url": image_urls})

        elif file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            images = []
            # Save the image locally
            img_path = os.path.join(output_folder, 'input_image.png')
            file.save(img_path)
            image = Image.open(img_path)
            images.append(image)

            # Upload image to Azure Blob Storage
            image_url = upload_images_to_blob(images, CONTAINER_NAME)

            return jsonify({"image_url": image_url})

        else:
            return jsonify({"error": "Unsupported file format. Please provide a PDF or image file."}), 400

    else:
        return jsonify({"error": "Invalid file format. Please upload a PDF or image file"}), 400

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

    topics = data.get('title')
    summaries = data.get('summary')

    # Check if past_exam and topics are provided
    if not topics:
        return jsonify({"error": "Please provide both 'past_exam' and 'topics'"}), 400
    
    template = """
You are studying the topic: {topics}

Below are your notes and summaries on key points related to this topic. Use this information to generate 5 multiple-choice questions.

---

{{
    "title": {topics},
    "summary": {summaries},
    "content": "1. [Generated Question 1]\\n   a. [Option 1]\\n   b. [Option 2]\\n   c. [Option 3]\\n   d. [Option 4 - Correct]\\n\\n2. [Generated Question 2]\\n   a. [Option 1]\\n   b. [Option 2 - Correct]\\n   c. [Option 3]\\n   d. [Option 4]\\n\\n3. [Generated Question 3]\\n   a. [Option 1 - Correct]\\n   b. [Option 2]\\n   c. [Option 3]\\n   d. [Option 4]\\n\\n4. [Generated Question 4]\\n   a. [Option 1]\\n   b. [Option 2]\\n   c. [Option 3]\\n   d. [Option 4 - Correct]\\n\\n5. [Generated Question 5]\\n   a. [Option 1]\\n   b. [Option 2]\\n   c. [Option 3 - Correct]\\n   d. [Option 4]"
}}

"""
    formatted_template = template.format(topics=topics, summaries=summaries)

    # Call OpenAI API to generate new exam
    try:
        response = openai.Completion.create(
                    model="gpt-3.5-turbo-instruct",
                    prompt=formatted_template,
                    temperature=0,
                    max_tokens=450,
                    top_p=1,
                    frequency_penalty=0,
                    presence_penalty=0
        )

        # Extract and return the generated questions
        text = response['choices'][0]['text']
        questions = parse_questions(text)

        return jsonify({"generated_questions": questions})

    except Exception as e:
        return jsonify({"error": f"Error calling OpenAI API: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
