import requests
import json

# Test API extract với nội dung không hợp lệ
def test_extract_api():
    url = "http://127.0.0.1:8017/api/v1/ai-processing-service/extract"
    
    # Tạo file test với nội dung không phải hợp đồng
    test_content = "Đây là một đoạn văn bản thông thường, không phải hợp đồng."
    
    # Tạo file tạm thời
    with open("test_content.txt", "w", encoding="utf-8") as f:
        f.write(test_content)
    
    # Test với file txt (sẽ bị lỗi 400 vì chỉ hỗ trợ docx/pdf)
    try:
        with open("test_content.txt", "rb") as f:
            files = {"file": ("test.txt", f, "text/plain")}
            response = requests.post(url, files=files)
            print(f"Test 1 - File txt: Status {response.status_code}")
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Test 1 error: {e}")
    
    # Test với file docx có nội dung không hợp lệ
    try:
        from docx import Document
        doc = Document()
        doc.add_paragraph("Đây là một đoạn văn bản thông thường, không phải hợp đồng.")
        doc.save("test_invalid.docx")
        
        with open("test_invalid.docx", "rb") as f:
            files = {"file": ("test_invalid.docx", f, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
            response = requests.post(url, files=files)
            print(f"\nTest 2 - Invalid content: Status {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    except Exception as e:
        print(f"Test 2 error: {e}")

if __name__ == "__main__":
    test_extract_api()
