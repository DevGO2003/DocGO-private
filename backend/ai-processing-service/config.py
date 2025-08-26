import os
from dotenv import load_dotenv

load_dotenv()  # Tải các biến môi trường từ file .env

def get_gemini_api_key():
    """
    Lấy Gemini API Key từ biến môi trường.
    Ném ra lỗi nếu không tìm thấy key.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("Biến môi trường GEMINI_API_KEY chưa được thiết lập.")
    return api_key

# Kafka configs
def get_kafka_bootstrap_servers():
    return os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")

def get_kafka_file_events_topic():
    return os.getenv("KAFKA_FILE_EVENTS_TOPIC", "file.events")

def get_kafka_ai_events_topic():
    return os.getenv("KAFKA_AI_EVENTS_TOPIC", "ai.events")

def get_kafka_client_id():
    return os.getenv("KAFKA_CLIENT_ID", "ai-processing-service")