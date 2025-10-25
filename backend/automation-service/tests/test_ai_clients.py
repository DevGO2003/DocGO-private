#!/usr/bin/env python3
"""
Test script for AI clients initialization, fallback, and model caching
"""

import os
import sys
import logging
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def test_model_cache():
    """Test ModelCache functionality"""
    print("\n" + "="*60)
    print("TEST 1: Model Cache")
    print("="*60)
    
    try:
        from utils.ai_clients import ModelCache
        
        # Test 1.1: Save model
        print("\n[1.1] Testing save_cached_model()...")
        test_model = "models/gemini-1.5-flash"
        ModelCache.save_cached_model(test_model)
        print(f"✓ Saved model: {test_model}")
        
        # Test 1.2: Get cached model
        print("\n[1.2] Testing get_cached_model()...")
        cached = ModelCache.get_cached_model()
        if cached == test_model:
            print(f"✓ Retrieved cached model: {cached}")
        else:
            print(f"✗ Cache mismatch. Expected: {test_model}, Got: {cached}")
            return False
        
        # Test 1.3: Clear cache
        print("\n[1.3] Testing cache clear...")
        cache_file = Path(__file__).parent / ".model_cache"
        if cache_file.exists():
            cache_file.unlink()
            print(f"✓ Cache file deleted: {cache_file}")
        
        # Test 1.4: Verify cache is empty
        print("\n[1.4] Verifying cache is empty...")
        cached = ModelCache.get_cached_model()
        if cached is None:
            print("✓ Cache is empty")
        else:
            print(f"✗ Cache should be empty but got: {cached}")
            return False
        
        print("\n✓ Model Cache tests PASSED")
        return True
        
    except Exception as e:
        print(f"\n✗ Model Cache tests FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_gemini_client_init():
    """Test GeminiClient initialization"""
    print("\n" + "="*60)
    print("TEST 2: Gemini Client Initialization")
    print("="*60)
    
    try:
        from utils.ai_clients import GeminiClient
        from config import Config
        
        # Test 2.1: Check config
        print("\n[2.1] Checking Gemini configuration...")
        api_key = Config.get_gemini_api_key()
        if api_key:
            print(f"✓ API Key found: {api_key[:20]}...")
        else:
            print("✗ API Key not found")
            return False
        
        models = Config.get_gemini_models()
        print(f"✓ Models from config: {models}")
        
        # Test 2.2: Initialize GeminiClient
        print("\n[2.2] Initializing GeminiClient...")
        client = GeminiClient()
        print(f"✓ GeminiClient initialized")
        print(f"  - Current model: {client.current_model_name}")
        
        # Test 2.3: Check if model is cached
        print("\n[2.3] Checking if model was cached...")
        from utils.ai_clients import ModelCache
        cached = ModelCache.get_cached_model()
        if cached == client.current_model_name:
            print(f"✓ Model cached successfully: {cached}")
        else:
            print(f"✗ Cache mismatch. Expected: {client.current_model_name}, Got: {cached}")
            return False
        
        print("\n✓ Gemini Client Initialization tests PASSED")
        return True
        
    except Exception as e:
        print(f"\n✗ Gemini Client Initialization tests FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_openrouter_client_init():
    """Test OpenRouterClient initialization"""
    print("\n" + "="*60)
    print("TEST 3: OpenRouter Client Initialization")
    print("="*60)
    
    try:
        from utils.ai_clients import OpenRouterClient
        
        # Test 3.1: Initialize OpenRouterClient
        print("\n[3.1] Initializing OpenRouterClient...")
        client = OpenRouterClient()
        print(f"✓ OpenRouterClient initialized")
        
        # Test 3.2: Check availability
        print("\n[3.2] Checking OpenRouter availability...")
        available = client.is_available()
        if available:
            print(f"✓ OpenRouter is available")
        else:
            print(f"⚠ OpenRouter is not available (expected if no API key)")
        
        print("\n✓ OpenRouter Client Initialization tests PASSED")
        return True
        
    except Exception as e:
        print(f"\n✗ OpenRouter Client Initialization tests FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_ai_client_factory():
    """Test AIClientFactory"""
    print("\n" + "="*60)
    print("TEST 4: AI Client Factory")
    print("="*60)
    
    try:
        from utils.ai_clients import AIClientFactory
        
        # Test 4.1: Get Gemini client
        print("\n[4.1] Getting Gemini client from factory...")
        gemini = AIClientFactory.get_gemini_client()
        print(f"✓ Gemini client obtained: {type(gemini).__name__}")
        
        # Test 4.2: Get OpenRouter client
        print("\n[4.2] Getting OpenRouter client from factory...")
        openrouter = AIClientFactory.get_openrouter_client()
        print(f"✓ OpenRouter client obtained: {type(openrouter).__name__}")
        
        # Test 4.3: Check singleton pattern
        print("\n[4.3] Checking singleton pattern...")
        gemini2 = AIClientFactory.get_gemini_client()
        if gemini is gemini2:
            print(f"✓ Singleton pattern works (same instance)")
        else:
            print(f"✗ Singleton pattern failed (different instances)")
            return False
        
        # Test 4.4: Test quota error detection
        print("\n[4.4] Testing quota error detection...")
        test_cases = [
            ("429 Too Many Requests", True),
            ("quota exceeded", True),
            ("rate limit", True),
            ("exceeded your current quota", True),
            ("Invalid API key", False),
            ("Connection timeout", False),
        ]
        
        for error_msg, expected in test_cases:
            result = AIClientFactory.is_quota_error(error_msg)
            status = "✓" if result == expected else "✗"
            print(f"  {status} '{error_msg}' → {result} (expected: {expected})")
            if result != expected:
                return False
        
        print("\n✓ AI Client Factory tests PASSED")
        return True
        
    except Exception as e:
        print(f"\n✗ AI Client Factory tests FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_automation_service():
    """Test AutomationService with new clients"""
    print("\n" + "="*60)
    print("TEST 5: AutomationService Integration")
    print("="*60)
    
    try:
        from services.ai_processing_service import AutomationService
        
        # Test 5.1: Initialize AutomationService
        print("\n[5.1] Initializing AutomationService...")
        service = AutomationService()
        print(f"✓ AutomationService initialized")
        
        # Test 5.2: Check clients
        print("\n[5.2] Checking clients...")
        if hasattr(service, 'gemini_client'):
            print(f"✓ Gemini client available: {type(service.gemini_client).__name__}")
        else:
            print(f"✗ Gemini client not found")
            return False
        
        if hasattr(service, 'openrouter_client'):
            print(f"✓ OpenRouter client available: {type(service.openrouter_client).__name__}")
        else:
            print(f"✗ OpenRouter client not found")
            return False
        
        # Test 5.3: Check Vietnamese instruction
        print("\n[5.3] Checking Vietnamese instruction...")
        if hasattr(service, 'VIETNAMESE_RESPONSE_INSTRUCTION'):
            instruction = service.VIETNAMESE_RESPONSE_INSTRUCTION
            if "TIẾNG VIỆT" in instruction:
                print(f"✓ Vietnamese instruction found")
            else:
                print(f"✗ Vietnamese instruction not correct")
                return False
        else:
            print(f"✗ Vietnamese instruction not found")
            return False
        
        print("\n✓ AutomationService Integration tests PASSED")
        return True
        
    except Exception as e:
        print(f"\n✗ AutomationService Integration tests FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("AI CLIENTS TEST SUITE")
    print("="*60)
    
    results = []
    
    # Run tests
    results.append(("Model Cache", test_model_cache()))
    results.append(("Gemini Client Init", test_gemini_client_init()))
    results.append(("OpenRouter Client Init", test_openrouter_client_init()))
    results.append(("AI Client Factory", test_ai_client_factory()))
    results.append(("AutomationService Integration", test_automation_service()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✓ ALL TESTS PASSED!")
        return 0
    else:
        print(f"\n✗ {total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
