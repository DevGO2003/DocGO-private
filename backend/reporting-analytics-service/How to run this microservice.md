# How to run Reporting & Analytics Service (Local)

## Via Python
- python -m venv venv && venv\Scripts\activate
- pip install -r requirements.txt
- uvicorn main:app --host 0.0.0.0 --port 8010 --reload

## Via Docker Compose (recommended)
- docker-compose -f script/docker-compose.local.yml up -d reporting-analytics-service

Docs: http://localhost:8010/docs#/
