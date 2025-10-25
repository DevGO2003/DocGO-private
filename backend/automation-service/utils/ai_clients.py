"""
AI Clients initialization module

Centralized initialization of AI clients (Gemini, OpenRouter)
with configuration from environment variables and model caching.
"""

import logging
import os
from typing import Optional
import google.generativeai as genai
from config import Config

logger = logging.getLogger(__name__)

# Model cache file path
MODEL_CACHE_FILE = os.path.join(os.path.dirname(__file__), "..", ".model_cache")


class ModelCache:
    """Cache for successfully used models"""
    
    @staticmethod
    def get_cached_model() -> Optional[str]:
        """Get cached model name from previous successful use"""
        try:
            if os.path.exists(MODEL_CACHE_FILE):
                with open(MODEL_CACHE_FILE, 'r') as f:
                    model_name = f.read().strip()
                    if model_name:
                        logger.info(f"[MODEL_CACHE] Found cached model: {model_name}")
                        return model_name
        except Exception as e:
            logger.warning(f"[MODEL_CACHE] Failed to read cache: {e}")
        return None
    
    @staticmethod
    def save_cached_model(model_name: str) -> None:
        """Save successfully used model name to cache"""
        try:
            with open(MODEL_CACHE_FILE, 'w') as f:
                f.write(model_name)
            logger.info(f"[MODEL_CACHE] Cached model: {model_name}")
        except Exception as e:
            logger.warning(f"[MODEL_CACHE] Failed to save cache: {e}")


class GeminiClient:
    """Gemini AI client wrapper with model caching"""
    
    def __init__(self):
        """Initialize Gemini client with model fallback and caching"""
        self.api_key = Config.get_gemini_api_key()
        genai.configure(api_key=self.api_key)
        self.model = self._initialize_model()
        self.current_model_name = None
    
    def _initialize_model(self):
        """Initialize Gemini model with fallback strategy and caching"""
        # Step 1: Try cached model first (fastest)
        cached_model = ModelCache.get_cached_model()
        if cached_model:
            try:
                model = genai.GenerativeModel(cached_model)
                logger.info(f"[GEMINI_CLIENT] Using cached model: {cached_model}")
                self.current_model_name = cached_model
                return model
            except Exception as e:
                logger.warning(f"[GEMINI_CLIENT] Cached model failed: {e}, trying others...")
        
        # Step 2: Try models from config
        models_to_try = Config.get_gemini_models()
        
        for model_name in models_to_try:
            try:
                model = genai.GenerativeModel(model_name)
                logger.info(f"[GEMINI_CLIENT] Initialized with {model_name}")
                self.current_model_name = model_name
                # Save successful model to cache
                ModelCache.save_cached_model(model_name)
                return model
            except Exception as e:
                logger.warning(f"[GEMINI_CLIENT_FALLBACK] Failed to initialize {model_name}: {e}")
                continue
        
        raise Exception("Could not initialize any Gemini model")
    
    def generate_content(self, prompt: str) -> Optional[str]:
        """Generate content using Gemini"""
        try:
            response = self.model.generate_content(prompt)
            if response.text:
                return response.text
        except Exception as e:
            logger.error(f"[GEMINI_CLIENT_ERROR] {e}")
            raise
        return None


class OpenRouterClient:
    """OpenRouter AI client wrapper"""
    
    def __init__(self):
        """Initialize OpenRouter client"""
        try:
            from utils.openrouter_client_v2 import OpenRouterClient as ORClient
            self.client = ORClient()
            self.available = self.client.is_available()
            if self.available:
                logger.info("[OPENROUTER_CLIENT] Initialized successfully")
            else:
                logger.warning("[OPENROUTER_CLIENT] Not available (no API key)")
        except Exception as e:
            logger.error(f"[OPENROUTER_CLIENT_ERROR] Failed to initialize: {e}")
            self.client = None
            self.available = False
    
    def is_available(self) -> bool:
        """Check if OpenRouter is available"""
        return self.available and self.client is not None
    
    def generate_content(self, prompt: str, max_tokens: int = 2000) -> Optional[str]:
        """Generate content using OpenRouter"""
        if not self.is_available():
            logger.error("[OPENROUTER_CLIENT] Client not available")
            return None
        
        try:
            return self.client.generate_content(prompt, max_tokens)
        except Exception as e:
            logger.error(f"[OPENROUTER_CLIENT_ERROR] {e}")
            raise


class AIClientFactory:
    """Factory for creating AI clients with fallback support"""
    
    _gemini_client: Optional[GeminiClient] = None
    _openrouter_client: Optional[OpenRouterClient] = None
    
    @classmethod
    def get_gemini_client(cls) -> GeminiClient:
        """Get or create Gemini client (singleton)"""
        if cls._gemini_client is None:
            cls._gemini_client = GeminiClient()
        return cls._gemini_client
    
    @classmethod
    def get_openrouter_client(cls) -> OpenRouterClient:
        """Get or create OpenRouter client (singleton)"""
        if cls._openrouter_client is None:
            cls._openrouter_client = OpenRouterClient()
        return cls._openrouter_client
    
    @classmethod
    def is_quota_error(cls, error_str: str) -> bool:
        """Check if error is quota/rate limit error"""
        quota_indicators = [
            '429',
            'quota',
            'rate limit',
            'requests per day',
            'exceeded your current quota'
        ]
        error_lower = error_str.lower()
        return any(indicator in error_lower for indicator in quota_indicators)
