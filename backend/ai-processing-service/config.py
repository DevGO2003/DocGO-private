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

# Consumer topic
def get_kafka_file_uploaded_topic():
    return os.getenv("KAFKA_FILE_UPLOADED_TOPIC", "file.uploaded")

# Producer topics
def get_kafka_text_extracted_topic():
    return os.getenv("KAFKA_TEXT_EXTRACTED_TOPIC", "ai.text.extracted")

def get_kafka_document_classified_topic():
    return os.getenv("KAFKA_DOCUMENT_CLASSIFIED_TOPIC", "ai.document.classified")

def get_kafka_contract_summary_topic():
    return os.getenv("KAFKA_CONTRACT_SUMMARY_TOPIC", "contract.summary.updated")

def get_kafka_client_id():
    return os.getenv("KAFKA_CLIENT_ID", "ai-processing-service")
