"""
MIME Type Mapper Utility
Maps file extensions to proper MIME types for Gemini API
"""

# Common file extensions to MIME type mapping
MIME_TYPE_MAP = {
    # Microsoft Office
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    # PDF
    '.pdf': 'application/pdf',
    
    # Images
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    
    # Text
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.html': 'text/html',
    '.htm': 'text/html',
    
    # Archives
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.7z': 'application/x-7z-compressed',
}


def get_proper_mime_type(filename: str, current_mime_type: str = None) -> str:
    """
    Get proper MIME type for a file, correcting generic types like application/octet-stream
    
    Args:
        filename: File name with extension
        current_mime_type: Currently detected MIME type (might be incorrect)
    
    Returns:
        Proper MIME type based on file extension
    """
    import os
    
    # Get file extension
    _, ext = os.path.splitext(filename.lower())
    
    # If we have a mapping for this extension, use it
    if ext in MIME_TYPE_MAP:
        return MIME_TYPE_MAP[ext]
    
    # If current mime type is generic or None, try to infer
    if current_mime_type in [None, '', 'application/octet-stream', 'application/binary']:
        # Unknown extension, return a safe default
        return 'application/octet-stream'
    
    # Return current mime type if it seems valid
    return current_mime_type


def is_supported_by_gemini(mime_type: str) -> bool:
    """
    Check if MIME type is supported by Gemini API
    
    Args:
        mime_type: MIME type to check
    
    Returns:
        True if supported, False otherwise
    """
    # Gemini supports these categories
    supported_prefixes = [
        'image/',
        'video/',
        'audio/',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.',  # Office documents
        'application/vnd.ms-',  # Legacy Office
        'text/',
    ]
    
    # Check if mime type starts with any supported prefix
    return any(mime_type.startswith(prefix) for prefix in supported_prefixes)
