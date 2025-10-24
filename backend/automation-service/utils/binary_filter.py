"""
Binary Content Filter Utility
Prevents logging of binary data that could crash the database or fill logs
"""

def is_likely_binary(text: str, sample_size: int = 100) -> bool:
    """
    Check if text is likely binary content
    
    Args:
        text: String to check
        sample_size: Number of characters to sample
    
    Returns:
        True if text appears to be binary, False otherwise
    """
    if not text or not isinstance(text, str):
        return False
    
    # Sample first N characters
    sample = text[:sample_size]
    
    # Count non-printable characters
    non_printable_count = sum(1 for char in sample if ord(char) < 32 and char not in '\n\r\t')
    
    # If more than 30% are non-printable, likely binary
    return non_printable_count > len(sample) * 0.3


def safe_log_text(text: str | None, max_length: int = 200) -> str:
    """
    Safely log text content, filtering binary data
    
    Args:
        text: Text to log
        max_length: Maximum length to log
    
    Returns:
        Safe string for logging
    """
    if text is None:
        return "<None>"
    
    if not isinstance(text, str):
        return f"<Non-string: {type(text).__name__}>"
    
    # Check if binary
    if is_likely_binary(text):
        return f"<Binary data: {len(text)} bytes>"
    
    # Truncate if too long
    if len(text) > max_length:
        return f"{text[:max_length]}... (total: {len(text)} chars)"
    
    return text


def safe_log_dict(data: dict, binary_keys: list = None) -> dict:
    """
    Safely log dictionary, filtering binary content from specified keys
    
    Args:
        data: Dictionary to log
        binary_keys: List of keys that might contain binary data
    
    Returns:
        Safe dictionary for logging
    """
    if binary_keys is None:
        binary_keys = ['text', 'plaintext', 'content', 'extractedText', 'ocr']
    
    safe_data = data.copy()
    
    for key in binary_keys:
        if key in safe_data:
            value = safe_data[key]
            
            # Handle nested dict (like ocr: {text: ...})
            if isinstance(value, dict) and 'text' in value:
                safe_data[key] = {**value, 'text': safe_log_text(value['text'])}
            else:
                safe_data[key] = safe_log_text(value)
    
    return safe_data
