# How to run Integration Connectors Service (Local)

## Via Python
- python -m venv venv && venv\Scripts\activate
- pip install -r requirements.txt
- uvicorn main:app --host 0.0.0.0 --port 8014 --reload

## Via Docker Compose (recommended)
- docker-compose -f script/docker-compose.local.yml up -d integration-connectors-service

Docs: http://localhost:8014/docs#/
