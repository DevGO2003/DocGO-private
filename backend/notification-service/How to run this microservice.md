# How to run Notification Service (Local)

## Via Python
- python -m venv venv && venv\Scripts\activate
- pip install -r requirements.txt
- uvicorn main:app --host 0.0.0.0 --port 8009 --reload

## Via Docker Compose (recommended)
- docker-compose -f script/docker-compose.local.yml up -d notification-service

Docs: http://localhost:8009/docs#/
