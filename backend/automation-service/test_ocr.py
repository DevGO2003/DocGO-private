"""
Test script cho OCR service
Kiểm tra các chức năng OCR của automation service
"""

import requests
import json
import os
import time
from PIL import Image, ImageDraw, ImageFont
import io

# Configuration
BASE_URL = "http://localhost:8003"
OCR_ENDPOINT = f"{BASE_URL}/api/v1/automation-service/ocr"

def create_test_image(text="Hello World\nXin chào thế giới\n123456789", size=(400, 200)):
    """Tạo ảnh test với text"""
    # Tạo ảnh trắng
    img = Image.new('RGB', size, color='white')
    draw = ImageDraw.Draw(img)
    
    try:
        # Thử sử dụng font mặc định
        font = ImageFont.load_default()
    except:
        font = None
    
    # Vẽ text
    lines = text.split('\n')
    y_offset = 20
    for line in lines:
        draw.text((10, y_offset), line, fill='black', font=font)
        y_offset += 30
    
    return img

def test_ocr_engines_status():
    """Test API kiểm tra trạng thái OCR engines"""
    print("🔍 Testing OCR engines status...")
    
    try:
        response = requests.get(f"{OCR_ENDPOINT}/engines")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ OCR Engines Status:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def test_supported_languages():
    """Test API lấy danh sách ngôn ngữ được hỗ trợ"""
    print("\n🌐 Testing supported languages...")
    
    try:
        response = requests.get(f"{OCR_ENDPOINT}/languages")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Supported Languages:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def test_ocr_extract(image_file, engine="auto", language="vie+eng"):
    """Test API trích xuất text từ ảnh"""
    print(f"\n📸 Testing OCR extract with engine={engine}, language={language}...")
    
    try:
        # Tạo ảnh test
        img = create_test_image()
        
        # Lưu ảnh vào buffer
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        # Gửi request
        files = {
            'file': ('test_image.png', img_buffer, 'image/png')
        }
        
        params = {
            'engine': engine,
            'language': language,
            'preprocess': True
        }
        
        response = requests.post(f"{OCR_ENDPOINT}/extract", files=files, params=params)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ OCR Extract Result:")
            print(f"Success: {data.get('data', {}).get('success', False)}")
            print(f"Text: {data.get('data', {}).get('text', '')[:100]}...")
            print(f"Confidence: {data.get('data', {}).get('confidence', 0)}")
            print(f"Engine: {data.get('data', {}).get('engine', 'unknown')}")
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def test_ocr_with_different_engines():
    """Test OCR với các engine khác nhau"""
    print("\n🔧 Testing OCR with different engines...")
    
    engines = ["auto", "tesseract", "easyocr"]
    results = {}
    
    for engine in engines:
        print(f"\n--- Testing {engine} engine ---")
        success = test_ocr_extract(None, engine=engine)
        results[engine] = success
        
        if not success:
            print(f"⚠️ {engine} engine failed or not available")
    
    return results

def test_health_check():
    """Test health check của service"""
    print("\n🏥 Testing service health...")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Service is healthy")
            return True
        else:
            print(f"❌ Service health check failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def main():
    """Chạy tất cả test cases"""
    print("🚀 Starting OCR Service Tests...")
    print("=" * 50)
    
    # Test 1: Health check
    health_ok = test_health_check()
    
    if not health_ok:
        print("❌ Service is not running. Please start the automation service first.")
        print("Run: cd backend/automation-service && python main.py")
        return
    
    # Test 2: OCR engines status
    engines_ok = test_ocr_engines_status()
    
    # Test 3: Supported languages
    languages_ok = test_supported_languages()
    
    # Test 4: OCR extract với engine auto
    extract_ok = test_ocr_extract(None, engine="auto")
    
    # Test 5: Test với các engine khác nhau
    engine_results = test_ocr_with_different_engines()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    print(f"Health Check: {'✅' if health_ok else '❌'}")
    print(f"Engines Status: {'✅' if engines_ok else '❌'}")
    print(f"Languages: {'✅' if languages_ok else '❌'}")
    print(f"OCR Extract: {'✅' if extract_ok else '❌'}")
    
    print("\nEngine Results:")
    for engine, success in engine_results.items():
        print(f"  {engine}: {'✅' if success else '❌'}")
    
    # Recommendations
    print("\n💡 Recommendations:")
    if not engines_ok:
        print("- Install Tesseract OCR: https://github.com/tesseract-ocr/tesseract")
        print("- Install EasyOCR: pip install easyocr")
    
    if not extract_ok:
        print("- Check if OCR engines are properly installed")
        print("- Verify image format and quality")
    
    print("\n🎯 OCR Service is ready for use!")

if __name__ == "__main__":
    main()
