#!/usr/bin/env python3
"""Test Gemini API Key"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import Config
import google.generativeai as genai

print("[TEST] Gemini API Key Validation")
print("=" * 50)

try:
    api_key = Config.get_gemini_api_key()
    print(f"✓ API Key found: {api_key[:20]}...")
    
    # Configure genai
    genai.configure(api_key=api_key)
    print("✓ genai.configure() successful")
    
    # Get models
    models = Config.get_gemini_models()
    print(f"✓ Models from config: {models}")
    
    # Try to create model
    for model_name in models:
        try:
            print(f"\n[TEST] Trying model: {model_name}")
            model = genai.GenerativeModel(model_name)
            print(f"  ✓ Model created successfully")
            
            # Try simple generation
            response = model.generate_content("Hello")
            print(f"  ✓ Generation successful: {response.text[:50]}...")
            break
        except Exception as e:
            print(f"  ✗ Failed: {str(e)[:100]}")
            continue
    
    print("\n" + "=" * 50)
    print("[SUCCESS] API Key is valid!")
    
except Exception as e:
    print(f"\n✗ ERROR: {e}")
    print("\n" + "=" * 50)
    print("[FAILED] API Key validation failed!")
    sys.exit(1)
