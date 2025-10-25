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
        self.current_model_name = None
        genai.configure(api_key=self.api_key)
        self.model = self._initialize_model()
    
    def _initialize_model(self):
        """Initialize Gemini model with fallback strategy"""
        # Try models from config
        models_to_try = Config.get_gemini_models()
        
        for model_name in models_to_try:
            try:
                model = genai.GenerativeModel(model_name)
                # Use actual model name from genai (may have 'models/' prefix)
                actual_model_name = model.model_name
                logger.info(f"[GEMINI_CLIENT] Initialized with {actual_model_name}")
                self.current_model_name = actual_model_name
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
    """OpenRouter AI client wrapper with model fallback"""
    
    def __init__(self):
        """Initialize OpenRouter client with model fallback"""
        self.api_key = Config.get_openrouter_api_key()
        self.models_to_try = Config.get_openrouter_models()
        self.current_model_name = None
        self.client = None
        
        if not self.api_key:
            logger.warning("[OPENROUTER_CLIENT] API key not configured")
            return
        
        # Configure genai with OpenRouter API key
        genai.configure(api_key=self.api_key)
        
        # Try models in order
        for model_name in self.models_to_try:
            try:
                self.client = genai.GenerativeModel(model_name)
                self.current_model_name = model_name
                logger.info(f"[OPENROUTER_CLIENT] Initialized with model: {model_name}")
                return
            except Exception as e:
                logger.warning(f"[OPENROUTER_CLIENT_FALLBACK] Failed to initialize {model_name}: {e}")
                continue
        
        logger.error("[OPENROUTER_CLIENT] Could not initialize any OpenRouter model")
        self.client = None
    
    def is_available(self) -> bool:
        """Check if OpenRouter client is available"""
        return self.client is not None and bool(self.api_key)
    
    def generate_content(self, prompt: str, max_tokens: int = 2000) -> Optional[str]:
        """Generate content using OpenRouter"""
        if not self.is_available():
            logger.error("[OPENROUTER_CLIENT] Client not available")
            return None
        
        try:
            response = self.client.generate_content(prompt, max_tokens)
            if response and response.text:
                logger.info(f"[OPENROUTER_CLIENT] Success with model: {self.current_model_name}")
                return response.text
            return None
        except Exception as e:
            logger.error(f"[OPENROUTER_CLIENT_ERROR] {e}")
            raise


class AIClientFactory:
    """Factory for creating AI clients with fallback support and model caching"""
    
    _gemini_client: Optional[GeminiClient] = None
    _openrouter_client: Optional[OpenRouterClient] = None
    _current_model: Optional[str] = None
    _current_client: Optional[str] = None
    
    @classmethod
    def get_gemini_client(cls) -> GeminiClient:
        """Get or create Gemini client (singleton)"""
        if cls._gemini_client is None:
            cls._gemini_client = GeminiClient()
            cls._current_client = "gemini"
            cls._current_model = f"gemini:{cls._gemini_client.current_model_name}"
            logger.info(f"[AI_FACTORY] Initialized Gemini client with model: {cls._gemini_client.current_model_name}")
        return cls._gemini_client
    
    @classmethod
    def get_openrouter_client(cls) -> OpenRouterClient:
        """Get or create OpenRouter client (singleton)"""
        if cls._openrouter_client is None:
            cls._openrouter_client = OpenRouterClient()
            cls._current_client = "openrouter"
            cls._current_model = Config.get_openrouter_model()
            logger.info(f"[AI_FACTORY] Initialized OpenRouter client with model: {cls._current_model}")
        return cls._openrouter_client
    
    @classmethod
    def get_current_client(cls) -> str:
        """Get current active AI client name"""
        if cls._current_client is None:
            cls.get_gemini_client()  # Initialize default
        return cls._current_client
    
    @classmethod
    def get_current_model(cls) -> str:
        """Get current active model name"""
        if cls._current_model is None:
            cls.get_gemini_client()  # Initialize default
        return cls._current_model
    
    @classmethod
    def set_current_model(cls, model_name: str, client_name: str = "gemini") -> None:
        """Set current model and client, save to cache"""
        cls._current_model = f"{client_name}:{model_name}"
        cls._current_client = client_name
        ModelCache.save_cached_model(model_name)
        logger.info(f"[AI_FACTORY] Switched to {client_name} model: {model_name}")
    
    @classmethod
    def get_cached_client_model(cls) -> Optional[tuple]:
        """Get cached client and model from file"""
        cached = ModelCache.get_cached_model()
        if cached and ":" in cached:
            client_name, model_name = cached.split(":", 1)
            logger.info(f"[AI_FACTORY] Found cached: client={client_name}, model={model_name}")
            return (client_name, model_name)
        return None
    
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
