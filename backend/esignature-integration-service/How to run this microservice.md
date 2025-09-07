# How to run eSignature Integration Service (Local)

## Via Python
- python -m venv venv && venv\Scripts\activate
- pip install -r requirements.txt
- uvicorn main:app --host 0.0.0.0 --port 8008 --reload

## Via Docker Compose (recommended)
- docker-compose -f script/docker-compose.local.yml up -d esignature-integration-service

Docs: http://localhost:8008/docs#/
