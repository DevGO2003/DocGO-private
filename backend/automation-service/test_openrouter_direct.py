#!/usr/bin/env python3
"""
Direct OpenRouter API test
"""
import requests
import json
import os

def test_openrouter_api():
    """Test OpenRouter API directly"""
    
    # API key from user
    api_key = "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"
    
    # Models to test
    models = [
        "deepseek/deepseek-chat-v3.1",
        "alibaba/tongyi-deepresearch-30b-a3b",
        "nvidia/nemotron-nano-9b-v2",
        "meituan/longcat-flash-chat",
        "meta-llama/llama-3.3-8b-instruct"
    ]
    
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    # Test prompt
    prompt = "Hello! Please respond with a simple greeting in Vietnamese."
    
    print(f"🧪 Testing OpenRouter API with prompt: {prompt}")
    print("=" * 60)
    
    for i, model in enumerate(models, 1):
        print(f"\n{i}. Testing model: {model}")
        
        payload = {
            'model': model,
            'messages': [
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'max_tokens': 100
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if 'choices' in data and len(data['choices']) > 0:
                choice = data['choices'][0]
                message = choice.get('message', {})
                content = message.get('content', '')
                
                if content:
                    print(f"   ✅ Success: {content[:100]}...")
                else:
                    print(f"   ⚠️  No content in response")
            else:
                print(f"   ❌ Invalid response format")
                
        except requests.exceptions.Timeout:
            print(f"   ⏰ Timeout")
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Request failed: {e}")
        except Exception as e:
            print(f"   ❌ Unexpected error: {e}")
    
    print("\n" + "=" * 60)
    print("🏁 Test completed!")

if __name__ == "__main__":
    test_openrouter_api()
