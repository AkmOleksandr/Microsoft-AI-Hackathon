from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from azure.ai.textanalytics import ExtractiveSummaryAction
from helpers import _pdf_to_images, _text_from_img
from helpers import *
# import openai

app = Flask(__name__)

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

@app.route('/image-to-text', methods=['POST'])
def extract_text_from_image():
    data = request.get_json()

    if 'image_url' not in data:
        return jsonify({'error': 'Missing "image_url" parameter'}), 400

    image_url = data['image_url']
    extracted_text = _text_from_img(image_url)

    return jsonify({'extracted_text': extracted_text})

# EXAM GENERATION
# OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# openai.api_key = OPENAI_API_KEY

# @app.route('/generate-new-exam', methods=['POST'])
# def generate_new_exam():
#     # Get past_exam and topics from the request data
#     data = request.get_json()

#     past_exam = data.get('past_exam')
#     topics = data.get('topics')
#     summaries = data.get('summaries')

#     # Check if past_exam and topics are provided
#     if not past_exam or not topics:
#         return jsonify({"error": "Please provide both 'past_exam' and 'topics'"}), 400

#     # Call OpenAI API to generate new exam
#     try:
#         res = openai.Completion.create(
#             model="gpt-3.5-turbo-instruct",
#             prompt=f"Generate a set of questions following this structure: {past_exam} cover these topics: {topics} given the following information {summaries}, assign weight to each question s.t. the total weight is 100 points",
#             max_tokens=500,
#             temperature=0
#         )

#         # Extract and return the generated questions
#         generated_questions = res['choices'][0]['text']
#         return jsonify({"generated_questions": generated_questions})

#     except Exception as e:
#         return jsonify({"error": f"Error calling OpenAI API: {str(e)}"}), 500
    
# # ASSESS AN EXAM
# @app.route('/exam-assessment', methods=['POST'])
# def exam_assessment():
#     # Get input from the request data
#     data = request.get_json()

#     exam_input = data.get('exam_input')

#     # Check if exam_input is provided
#     if not exam_input:
#         return jsonify({"error": "Please provide 'exam_input'"}), 400

#     # Call OpenAI API to perform exam assessment
#     try:
#         res = openai.Completion.create(
#             model="gpt-3.5-turbo-instruct",
#             prompt=f"act as a professor, give a grade for every answer and provide feedback for this exam: {exam_input}",
#             max_tokens=500,
#             temperature=0
#         )

#         # Extract and return the assessment result
#         assessment_result = res['choices'][0]['text']
#         return jsonify({"assessment_result": assessment_result})

#     except Exception as e:
#         return jsonify({"error": f"Error calling OpenAI API: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
