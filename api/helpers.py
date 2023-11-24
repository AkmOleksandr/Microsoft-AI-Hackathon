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