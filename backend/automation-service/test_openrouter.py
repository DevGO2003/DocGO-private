#!/usr/bin/env python3
"""
Test script for OpenRouter integration
"""
import os
import sys
import logging
from pathlib import Path

# Add automation-service to path
service_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(service_dir))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def test_openrouter_config():
    """Test OpenRouter configuration"""
    print("🔧 Testing OpenRouter Configuration...")
    
    try:
        from config_openrouter import OpenRouterConfig
        
        config = OpenRouterConfig.get_config()
        print(f"✅ Config loaded successfully")
        print(f"   API Key: {'✅ Set' if config['api_key'] else '❌ Not set'}")
        print(f"   Primary Model: {config['primary_model']}")
        print(f"   Fallback Models: {len(config['fallback_models'])} models")
        print(f"   Base URL: {config['base_url']}")
        print(f"   Enabled: {config['enabled']}")
        
        if not config['enabled']:
            print("⚠️  OpenRouter is not enabled (no API key)")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Config test failed: {e}")
        return False

def test_openrouter_client():
    """Test OpenRouter client"""
    print("\n🤖 Testing OpenRouter Client...")
    
    try:
        from utils.openrouter_client_v2 import OpenRouterClient
        
        client = OpenRouterClient()
        
        if not client.is_available():
            print("⚠️  OpenRouter client not available (no API key)")
            return False
            
        print("✅ OpenRouter client initialized")
        print(f"   Available: {client.is_available()}")
        print(f"   Models: {len(client.all_models)}")
        print(f"   Primary: {client.primary_model}")
        
        return True
        
    except Exception as e:
        print(f"❌ Client test failed: {e}")
        return False

def test_openrouter_api():
    """Test OpenRouter API call"""
    print("\n🌐 Testing OpenRouter API...")
    
    try:
        from utils.openrouter_client_v2 import OpenRouterClient
        
        client = OpenRouterClient()
        
        if not client.is_available():
            print("⚠️  Skipping API test (no API key)")
            return False
            
        # Simple test prompt
        test_prompt = "Hello! Please respond with a simple greeting in Vietnamese."
        
        print(f"   Sending test prompt: {test_prompt[:50]}...")
        
        response = client.generate_content(test_prompt, max_tokens=100)
        
        if response:
            print(f"✅ API call successful")
            print(f"   Response: {response[:100]}...")
            return True
        else:
            print("❌ API call failed (no response)")
            return False
            
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False

def test_ai_service_integration():
    """Test AI service integration"""
    print("\n🔗 Testing AI Service Integration...")
    
    try:
        from services.ai_processing_service import AutomationService
        
        service = AutomationService()
        
        print("✅ AI service initialized")
        print(f"   OpenRouter available: {service.openrouter.is_available() if hasattr(service, 'openrouter') else 'Not initialized'}")
        
        # Test fallback mechanism
        test_prompt = "Test prompt for fallback mechanism"
        
        print(f"   Testing fallback mechanism...")
        
        # This will test the _generate_with_fallback method
        response = service._generate_with_fallback(test_prompt, max_tokens=100)
        
        if response:
            print(f"✅ Fallback mechanism working")
            print(f"   Response: {response[:100]}...")
            return True
        else:
            print("⚠️  Fallback mechanism returned no response")
            return False
            
    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 OpenRouter Integration Test")
    print("=" * 50)
    
    # Check environment
    api_key = os.getenv('OPENROUTER_API_KEY')
    if not api_key:
        print("⚠️  OPENROUTER_API_KEY not set in environment")
        print("   Set it with: export OPENROUTER_API_KEY=your_key_here")
        print("   Or add it to .env file")
        return
    
    # Run tests
    tests = [
        test_openrouter_config,
        test_openrouter_client,
        test_openrouter_api,
        test_ai_service_integration
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {e}")
            results.append(False)
    
    # Summary
    print("\n📊 Test Summary")
    print("=" * 50)
    passed = sum(results)
    total = len(results)
    
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed! OpenRouter integration is working.")
    else:
        print("⚠️  Some tests failed. Check the logs above for details.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
