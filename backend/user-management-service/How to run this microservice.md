# How to run this microservice

## Local (uvicorn)
- python -m venv venv
- venv\Scripts\activate (Windows) / source venv/bin/activate (Unix)
- pip install -r requirements.txt
- uvicorn main:app --reload --port 8002
- Docs: http://localhost:8002/docs#/

## Docker
- docker build -t user-management-service .
- docker run -p 8002:8002 user-management-service
- Docs: http://localhost:8002/docs#/
