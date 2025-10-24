"""
OpenRouter AI Client
Backup AI provider when Gemini quota exceeded
"""
import os
import requests
import json
import logging
from typing import Dict, Any, Optional
from config_openrouter import OpenRouterConfig


class OpenRouterClient:
    """Client for OpenRouter AI API with multi-model fallback"""
    
    def __init__(self):
        # Use config class instead of direct env vars
        config = OpenRouterConfig.get_config()
        self.api_key = config["api_key"]
        self.primary_model = config["primary_model"]
        self.fallback_models = config["fallback_models"]
        self.all_models = config["fallback_models"] + [self.primary_model]
        self.base_url = config["base_url"]
        
        if not self.api_key:
            logging.warning("[OPENROUTER] API key not configured")
        else:
            logging.info(f"[OPENROUTER] Initialized with {len(self.all_models)} models: primary={self.primary_model}, fallbacks={len(self.fallback_models)}")
    
    def is_available(self) -> bool:
        """Check if OpenRouter is configured and available"""
        return bool(self.api_key)
    
    def _try_model(self, model: str, prompt: str, max_tokens: int) -> Optional[str]:
        """
        Try to generate content with a specific model
        
        Returns:
            Generated text or None if failed
        """
        try:
            url = f"{self.base_url}/chat/completions"
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'model': model,
                'messages': [
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'max_tokens': max_tokens
            }
            
            logging.info(f"[OPENROUTER] Trying model: {model}")
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Extract content from response
            if 'choices' in data and len(data['choices']) > 0:
                choice = data['choices'][0]
                message = choice.get('message', {})
                
                # Try to get content (standard format)
                content = message.get('content', '')
                
                # If no content, try reasoning (some models use this)
                if not content and 'reasoning' in message:
                    content = message['reasoning']
                
                # If still no content, try reasoning_details
                if not content and 'reasoning_details' in message:
                    details = message['reasoning_details']
                    if details and len(details) > 0:
                        content = details[0].get('text', '')
                
                if content:
                    logging.info(f"[OPENROUTER] Model {model} success: {len(content)} chars")
                    return content
                else:
                    logging.warning(f"[OPENROUTER] Model {model} returned no content")
                    return None
            else:
                logging.error(f"[OPENROUTER] Model {model} invalid response format")
                return None
                
        except requests.exceptions.Timeout:
            logging.error(f"[OPENROUTER] Model {model} timeout")
            return None
        except requests.exceptions.RequestException as e:
            logging.error(f"[OPENROUTER] Model {model} request failed: {e}")
            return None
        except Exception as e:
            logging.error(f"[OPENROUTER] Model {model} unexpected error: {e}")
            return None
    
    def generate_content(self, prompt: str, max_tokens: int = 2000) -> Optional[str]:
        """
        Generate content using OpenRouter API with multi-model fallback
        
        Tries models in order:
        1. Primary model
        2. Fallback model 1
        3. Fallback model 2
        ... etc
        
        Args:
            prompt: Text prompt
            max_tokens: Maximum tokens to generate
        
        Returns:
            Generated text or None if all models failed
        """
        if not self.is_available():
            logging.error("[OPENROUTER] Client not configured")
            return None
        
        # Try each model in order
        for i, model in enumerate(self.all_models):
            model_label = "primary" if i == 0 else f"fallback-{i}"
            logging.info(f"[OPENROUTER] Attempting {model_label} model: {model}")
            
            result = self._try_model(model, prompt, max_tokens)
            
            if result:
                logging.info(f"[OPENROUTER] Success with {model_label} model: {model}")
                return result
            else:
                logging.warning(f"[OPENROUTER] {model_label} model {model} failed, trying next...")
        
        # All models failed
        logging.error(f"[OPENROUTER] All {len(self.all_models)} models failed")
        return None
