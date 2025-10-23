#!/usr/bin/env python3
"""
Script upload DOCX file vào automation-service
Giải quyết vấn đề PowerShell không hỗ trợ -Form parameter
"""

import requests
import os
import sys
from pathlib import Path

def upload_docx_file(file_path: str, service_url: str = "http://localhost:8003"):
    """
    Upload DOCX file vào automation-service
    
    Args:
        file_path: Đường dẫn đến file DOCX
        service_url: URL của automation-service
    """
    
    if not os.path.exists(file_path):
        print(f"❌ File không tồn tại: {file_path}")
        return False
    
    # Kiểm tra extension
    if not file_path.lower().endswith(('.docx', '.doc')):
        print(f"❌ File phải là DOCX/DOC: {file_path}")
        return False
    
    # Endpoint upload
    upload_url = f"{service_url}/api/v1/automation-service/files"
    
    try:
        # Mở file và upload
        with open(file_path, 'rb') as file:
            files = {
                'file': (os.path.basename(file_path), file, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
            }
            
            print(f"📤 Uploading {file_path} to {upload_url}")
            
            response = requests.post(
                upload_url,
                files=files,
                timeout=60  # 60 giây timeout
            )
            
            print(f"📊 Status Code: {response.status_code}")
            print(f"📋 Response: {response.text}")
            
            if response.status_code == 200:
                print("✅ Upload thành công!")
                return True
            else:
                print(f"❌ Upload thất bại: {response.status_code}")
                return False
                
    except requests.exceptions.RequestException as e:
        print(f"❌ Lỗi kết nối: {e}")
        return False
    except Exception as e:
        print(f"❌ Lỗi không xác định: {e}")
        return False

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python upload_docx.py <file_path> [service_url]")
        print("Example: python upload_docx.py /app/uploads/contract.docx")
        sys.exit(1)
    
    file_path = sys.argv[1]
    service_url = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:8003"
    
    print(f"🚀 Starting upload: {file_path}")
    print(f"🌐 Service URL: {service_url}")
    
    success = upload_docx_file(file_path, service_url)
    
    if success:
        print("🎉 Upload hoàn thành!")
        sys.exit(0)
    else:
        print("💥 Upload thất bại!")
        sys.exit(1)

if __name__ == "__main__":
    main()
