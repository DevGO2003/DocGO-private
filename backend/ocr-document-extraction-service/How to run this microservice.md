# How to run OCR Document Extraction Service (Local)

## Via Python
- python -m venv venv && venv\Scripts\activate
- pip install -r requirements.txt
- uvicorn main:app --host 0.0.0.0 --port 8011 --reload

## Via Docker Compose (recommended)
- docker-compose -f script/docker-compose.local.yml up -d ocr-document-extraction-service

Docs: http://localhost:8011/docs#/
