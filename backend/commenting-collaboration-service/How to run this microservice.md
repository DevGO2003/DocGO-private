# How to run this microservice

## Local (uvicorn)
- python -m venv venv
- venv\Scripts\activate (Windows) / source venv/bin/activate (Unix)
- pip install -r requirements.txt
- uvicorn main:app --reload --port 8000
- Docs: http://localhost:8000/docs#/

## Docker
- docker build -t commenting-collaboration-service .
- docker run -p 8005:8000 commenting-collaboration-service
- Docs: http://localhost:8005/docs#/
