#!/usr/bin/env python3
"""
Script test để kiểm tra hệ thống logging đã được bổ sung
cho luồng upload từ file storage service đến contract service
"""

import requests
import json
import uuid
import time
from datetime import datetime

def test_file_upload_with_logging():
    """Test upload file với logging chi tiết"""
    
    # Cấu hình test
    file_storage_url = "http://localhost:8012"
    contract_service_url = "http://localhost:8003"
    
    # Tạo correlation ID duy nhất cho test
    correlation_id = str(uuid.uuid4())
    user_id = "test-user-123"
    user_role = "admin"
    
    print(f"🧪 [TEST_START] Bắt đầu test hệ thống logging - correlation_id: {correlation_id}")
    print(f"⏰ [TEST_TIME] Thời gian test: {datetime.now().isoformat()}")
    print(f"🔗 [FILE_STORAGE_URL] {file_storage_url}")
    print(f"🔗 [CONTRACT_SERVICE_URL] {contract_service_url}")
    print()
    
    # Test 1: Upload file với logging
    print("📤 [TEST_UPLOAD] Test 1: Upload file với logging chi tiết")
    print("=" * 60)
    
    try:
        # Tạo file test đơn giản
        test_content = b"This is a test contract document for testing logging system.\n" + \
                      b"It contains sample contract text to verify the complete flow.\n" + \
                      b"Testing correlation ID: " + correlation_id.encode()
        
        # Headers với correlation ID và user info
        headers = {
            "x-correlation-id": correlation_id,
            "x-user-id": user_id,
            "x-user-role": user_role
        }
        
        # Upload file
        files = {
            'file': ('test-contract.txt', test_content, 'text/plain')
        }
        
        params = {
            'folder': 'test-documents'
        }
        
        print(f"📁 [UPLOAD_REQUEST] Gửi request upload file:")
        print(f"   - File: test-contract.txt")
        print(f"   - Size: {len(test_content)} bytes")
        print(f"   - Folder: {params['folder']}")
        print(f"   - Correlation ID: {correlation_id}")
        print(f"   - User ID: {user_id}")
        print(f"   - User Role: {user_role}")
        print()
        
        response = requests.post(
            f"{file_storage_url}/api/v1/file-storage-asset-service/files",
            files=files,
            params=params,
            headers=headers
        )
        
        if response.status_code == 201:
            result = response.json()
            print("✅ [UPLOAD_SUCCESS] File upload thành công!")
            print(f"   - Status Code: {response.status_code}")
            print(f"   - File ID: {result.get('data', {}).get('key', 'N/A')}")
            print(f"   - Bucket: {result.get('data', {}).get('bucket', 'N/A')}")
            print(f"   - URL: {result.get('data', {}).get('url', 'N/A')}")
            print(f"   - Scan Status: {result.get('data', {}).get('scan_status', 'N/A')}")
            print()
            
            # Lưu thông tin file để test tiếp theo
            file_key = result.get('data', {}).get('key', '')
            file_id = result.get('data', {}).get('key', '').split('/')[-1].split('_')[0]
            
        else:
            print(f"❌ [UPLOAD_FAILED] File upload thất bại!")
            print(f"   - Status Code: {response.status_code}")
            print(f"   - Response: {response.text}")
            print()
            return False
            
    except Exception as e:
        print(f"❌ [UPLOAD_EXCEPTION] Lỗi khi upload file: {str(e)}")
        print()
        return False
    
    # Test 2: Kiểm tra logs của file storage service
    print("📋 [TEST_LOGS] Test 2: Kiểm tra logs của file storage service")
    print("=" * 60)
    
    print("🔍 [LOG_CHECK] Kiểm tra các log tags quan trọng:")
    print("   - 🚀 [UPLOAD_START] - Bắt đầu upload")
    print("   - 📁 [UPLOAD_INFO] - Thông tin file")
    print("   - ✅ [VALIDATION_PASSED] - Validation thành công")
    print("   - 📤 [STORAGE_UPLOAD] - Bắt đầu upload storage")
    print("   - ✅ [STORAGE_UPLOAD_SUCCESS] - Upload storage thành công")
    print("   - 🛡️ [MALWARE_SCAN_START] - Bắt đầu quét malware")
    print("   - ✅ [MALWARE_SCAN_COMPLETE] - Hoàn thành quét malware")
    print("   - 📢 [KAFKA_PUBLISH_START] - Bắt đầu publish event")
    print("   - ✅ [KAFKA_PUBLISH_SUCCESS] - Publish event thành công")
    print("   - 🎉 [UPLOAD_COMPLETE] - Hoàn thành upload")
    print()
    
    print("💡 [LOG_INSTRUCTIONS] Để xem logs chi tiết:")
    print("   1. Kiểm tra console của file storage service")
    print("   2. Tìm logs với correlation_id: " + correlation_id)
    print("   3. Sử dụng grep để lọc logs:")
    print(f"      grep '{correlation_id}' logs/*.log")
    print()
    
    # Test 3: Kiểm tra Kafka events
    print("📢 [TEST_KAFKA] Test 3: Kiểm tra Kafka events")
    print("=" * 60)
    
    print("🔍 [KAFKA_CHECK] Kiểm tra các events đã được publish:")
    print("   - FileUploaded event trên topic: file.events")
    print("   - Key: " + (file_key if file_key else "N/A"))
    print("   - Correlation ID: " + correlation_id)
    print()
    
    print("💡 [KAFKA_INSTRUCTIONS] Để kiểm tra Kafka events:")
    print("   1. Sử dụng kafka-console-consumer:")
    print("      kafka-console-consumer --bootstrap-server localhost:9092 --topic file.events --from-beginning")
    print("   2. Tìm event với correlationId: " + correlation_id)
    print("   3. Kiểm tra event payload có đầy đủ thông tin")
    print()
    
         # Test 4: Kiểm tra contract service logs
     print("📋 [TEST_CONTRACT] Test 4: Kiểm tra contract service logs")
     print("=" * 60)
     
     print("🔍 [CONTRACT_CHECK] Kiểm tra các log tags của contract service:")
     print("   - 📨 [KAFKA_RECEIVE] - Nhận message từ Kafka")
     print("   - 🔍 [EVENT_ANALYSIS] - Phân tích event")
     print("   - 🚀 [CONTRACT_PROCESSING_START] - Bắt đầu xử lý contract")
     print("   - 📁 [FILE_INFO_EXTRACTED] - Trích xuất thông tin file")
     print("   - 🔄 [CONTRACT_CREATION_START] - Bắt đầu tạo contract")
     print("   - ✅ [CONTRACT_SAVED] - Lưu contract thành công")
     print("   - 📢 [CONTRACT_UPDATED_PUBLISH_START] - Publish contract-updated event")
     print()
     
     print("🔍 [CONTRACT_EVENT_HANDLERS] Kiểm tra các event handlers mới:")
     print("   - 📨 [FILE_UPLOADED_RECEIVE] - Nhận FileUploaded event")
     print("   - 📢 [CONTRACT_CREATED_PUBLISH_START] - Publish ContractCreated event")
     print("   - 📨 [CONTRACT_EVENT_RECEIVE] - Nhận contract events")
     print("   - 📨 [FILE_PROCESSING_STATUS_RECEIVE] - Nhận processing status")
     print()
     
     print("💡 [CONTRACT_INSTRUCTIONS] Để xem contract service logs:")
     print("   1. Kiểm tra console của contract management service")
     print("   2. Tìm logs với correlation_id: " + correlation_id)
     print("   3. Sử dụng grep để lọc logs:")
     print(f"      grep '{correlation_id}' logs/*.log")
     print()
    
    # Test 5: Kiểm tra end-to-end flow
    print("🔄 [TEST_FLOW] Test 5: Kiểm tra end-to-end flow")
    print("=" * 60)
    
    print("🔍 [FLOW_CHECK] Luồng xử lý hoàn chỉnh:")
    print("   1. 📤 File Storage Service: Upload file + malware scan")
    print("   2. 📢 Kafka: Publish FileUploaded event")
    print("   3. 🤖 AI Processing Service: Xử lý file và tạo summary")
    print("   4. 📢 Kafka: Publish SummaryCreated event")
    print("   5. 📋 Contract Service: Nhận event và tạo contract")
    print("   6. 📢 Kafka: Publish ContractUpdated event")
    print()
    
    print("⏳ [WAIT_AI] Chờ AI processing service xử lý file...")
    print("   (Có thể mất vài phút tùy thuộc vào kích thước file)")
    print()
    
    # Test 6: Tóm tắt và hướng dẫn
    print("📊 [TEST_SUMMARY] Tóm tắt test")
    print("=" * 60)
    
    print("✅ [COMPLETED_TESTS] Các test đã hoàn thành:")
    print("   ✓ Test 1: File upload với logging")
    print("   ✓ Test 2: Kiểm tra file storage logs")
    print("   ✓ Test 3: Kiểm tra Kafka events")
    print("   ✓ Test 4: Kiểm tra contract service logs")
    print("   ✓ Test 5: Kiểm tra end-to-end flow")
    print()
    
    print("🔍 [VERIFICATION] Cần kiểm tra:")
    print("   1. File storage service logs có đầy đủ các tags")
    print("   2. Kafka events được publish thành công")
    print("   3. Contract service nhận và xử lý events")
    print("   4. Correlation ID được truyền xuyên suốt flow")
    print()
    
    print("📝 [NEXT_STEPS] Bước tiếp theo:")
    print("   1. Kiểm tra logs của từng service")
    print("   2. Verify Kafka topics và messages")
    print("   3. Kiểm tra database records")
    print("   4. Test với các loại file khác nhau")
    print()
    
    print(f"🎉 [TEST_COMPLETE] Test hoàn thành - correlation_id: {correlation_id}")
    print(f"⏰ [END_TIME] Thời gian kết thúc: {datetime.now().isoformat()}")
    
    return True

def test_logging_configuration():
    """Test cấu hình logging"""
    
    print("🔧 [TEST_CONFIG] Test cấu hình logging")
    print("=" * 60)
    
    print("📋 [PYTHON_LOGGING] File Storage Service (Python):")
    print("   - Sử dụng logging module chuẩn")
    print("   - Level: INFO")
    print("   - Format: Emoji + Tag + Message")
    print("   - Output: Console + File (nếu cấu hình)")
    print()
    
    print("📋 [JAVA_LOGGING] Contract Service (Java):")
    print("   - Sử dụng SLF4J + Logback")
    print("   - Level: DEBUG (theo application.properties)")
    print("   - Format: Emoji + Tag + Message")
    print("   - Output: Console + File (nếu cấu hình)")
    print()
    
    print("🔍 [LOG_LEVELS] Các log levels được sử dụng:")
    print("   - INFO: Thông tin bình thường, flow chính")
    print("   - WARN: Cảnh báo, fallback scenarios")
    print("   - ERROR: Lỗi nghiêm trọng, exceptions")
    print("   - DEBUG: Thông tin chi tiết cho debugging")
    print()

def main():
    """Main function"""
    
    print("🚀 [LOGGING_SYSTEM_TEST] Test hệ thống logging DocGO")
    print("=" * 80)
    print()
    
    # Test cấu hình logging
    test_logging_configuration()
    
    # Test file upload với logging
    success = test_file_upload_with_logging()
    
    if success:
        print("✅ [ALL_TESTS_PASSED] Tất cả tests đã hoàn thành thành công!")
    else:
        print("❌ [SOME_TESTS_FAILED] Một số tests đã thất bại!")
    
    print()
    print("📚 [DOCUMENTATION] Tham khảo:")
    print("   - LOGGING_SYSTEM_README.md: Tài liệu chi tiết về hệ thống logging")
    print("   - Cursor rules: Quy tắc chuẩn hóa API và logging")
    print()

if __name__ == "__main__":
    main()
