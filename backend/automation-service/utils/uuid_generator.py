"""
UUID Generator Utility
"""
import uuid
from datetime import datetime

def uuid7() -> str:
    """
    Generate UUID v7 (time-based)
    """
    # For now, use UUID v4 as fallback since UUID v7 is not available in standard library
    return str(uuid.uuid4())

def generate_uuid_v7() -> str:
    """
    Generate UUID v7 (alias for uuid7)
    """
    return uuid7()

def generate_document_id() -> str:
    """
    Generate document ID with timestamp
    """
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return f"DOC-{timestamp}-{uuid.uuid4().hex[:8].upper()}"
