"""
OpenRouter Configuration for DocGO Automation Service
Backup AI provider when Gemini fails or quota exceeded
"""
import os
from typing import List, Dict, Any

class OpenRouterConfig:
    """OpenRouter configuration class"""
    
    # API Configuration
    API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    PRIMARY_MODEL: str = os.getenv("OPENROUTER_MODEL", "deepseek/deepseek-chat-v3.1")
    FALLBACK_MODELS: str = os.getenv("OPENROUTER_FALLBACK_MODELS", "meituan/longcat-flash-chat")
    
    # Base URL
    BASE_URL: str = "https://openrouter.ai/api/v1"
    
    @classmethod
    def get_config(cls) -> Dict[str, Any]:
        """Get OpenRouter configuration"""
        return {
            "api_key": cls.API_KEY,
            "primary_model": cls.PRIMARY_MODEL,
            "fallback_models": [m.strip() for m in cls.FALLBACK_MODELS.split(',') if m.strip()],
            "base_url": cls.BASE_URL,
            "enabled": bool(cls.API_KEY)
        }
    
    @classmethod
    def is_enabled(cls) -> bool:
        """Check if OpenRouter is enabled"""
        return bool(cls.API_KEY)
    
    @classmethod
    def get_all_models(cls) -> List[str]:
        """Get all available models (primary + fallbacks)"""
        models = [cls.PRIMARY_MODEL]
        if cls.FALLBACK_MODELS:
            models.extend([m.strip() for m in cls.FALLBACK_MODELS.split(',') if m.strip()])
        return models
