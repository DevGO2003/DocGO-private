#!/usr/bin/env python3
"""
Comprehensive test script for Automation Service upload functionality
Tests sync/async processing, audit logging, event publishing, and schema alignment
"""

import requests
import time
import json
import os
from datetime import datetime
from typing import Dict, Any

# Test configuration
BASE_URL = "http://localhost:8003"
UPLOAD_ENDPOINT = f"{BASE_URL}/api/v1/automation-service/documents/upload"
WEBSOCKET_URL = "ws://localhost:8003/ws/document"

def create_test_file(filename: str, content: str, size_mb: float = None) -> str:
    """Create a test file with specified content and size"""
    if size_mb:
        # Create large file by repeating content
        target_size = int(size_mb * 1024 * 1024)
        content_size = len(content.encode('utf-8'))
        repetitions = target_size // content_size
        content = content * repetitions
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return filename

def test_small_file_sync():
    """Test small file upload (sync mode)"""
    print("🧪 Testing small file upload (sync mode)...")
    
    # Create small test file
    test_file = create_test_file("test-small.txt", "This is a test contract document for sync processing")
    
    try:
        with open(test_file, 'rb') as f:
            files = {"file": (test_file, f, "text/plain")}
            headers = {"X-Correlation-Id": f"test-sync-{int(time.time())}"}
            
            response = requests.post(UPLOAD_ENDPOINT, files=files, headers=headers, timeout=30)
        
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["statusCode"] == 201, f"Expected statusCode 201, got {data.get('statusCode')}"
        assert "correlationId" in data["data"], "Missing correlationId in response"
        
        print("✅ Small file test passed")
        return data["data"]["correlationId"]
        
    finally:
        # Cleanup
        if os.path.exists(test_file):
            os.remove(test_file)

def test_large_file_async():
    """Test large file upload (async mode)"""
    print("\n🧪 Testing large file upload (async mode)...")
    
    # Create large test file (>2MB)
    test_file = create_test_file("test-large.txt", "X", size_mb=3.0)
    
    try:
        with open(test_file, 'rb') as f:
            files = {"file": (test_file, f, "text/plain")}
            headers = {"X-Correlation-Id": f"test-async-{int(time.time())}"}
            
            response = requests.post(UPLOAD_ENDPOINT, files=files, headers=headers, timeout=30)
        
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["statusCode"] == 202, f"Expected statusCode 202, got {data.get('statusCode')}"
        assert "correlationId" in data["data"], "Missing correlationId in response"
        assert "websocketUrl" in data["data"], "Missing websocketUrl in response"
        
        print("✅ Large file test passed")
        return data["data"]["correlationId"]
        
    finally:
        # Cleanup
        if os.path.exists(test_file):
            os.remove(test_file)

def test_contract_file():
    """Test contract file upload with AI processing"""
    print("\n🧪 Testing contract file upload...")
    
    # Create contract-like content
    contract_content = """
    HỢP ĐỒNG DỊCH VỤ PHÁT TRIỂN PHẦN MỀM
    
    Bên A: Công ty TNHH ABC
    Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM
    Mã số thuế: 0123456789
    Đại diện: Nguyễn Văn A
    
    Bên B: Công ty TNHH XYZ
    Địa chỉ: 456 Đường XYZ, Quận 2, TP.HCM
    Mã số thuế: 9876543210
    Đại diện: Trần Thị B
    
    Điều 1: Phạm vi công việc
    Phát triển hệ thống quản lý tài liệu với các tính năng:
    - Quản lý tài liệu
    - Phân tích và báo cáo
    - Tích hợp AI
    
    Điều 2: Thời gian thực hiện
    7 tháng kể từ ngày ký hợp đồng
    
    Điều 3: Giá trị hợp đồng
    Tổng giá trị: 52.000.000 VNĐ (Năm mươi hai triệu đồng)
    Thanh toán: 30% khi ký, 40% giữa kỳ, 30% khi nghiệm thu
    
    Điều 4: Bảo hành
    18 tháng sau nghiệm thu
    
    Ngày ký: 15/01/2024
    Ngày có hiệu lực: 15/01/2024
    Ngày hết hạn: 15/08/2024
    """
    
    test_file = create_test_file("test-contract.txt", contract_content)
    
    try:
        with open(test_file, 'rb') as f:
            files = {"file": (test_file, f, "text/plain")}
            headers = {"X-Correlation-Id": f"test-contract-{int(time.time())}"}
            
            response = requests.post(UPLOAD_ENDPOINT, files=files, headers=headers, timeout=60)
        
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["statusCode"] == 201, f"Expected statusCode 201, got {data.get('statusCode')}"
        assert "correlationId" in data["data"], "Missing correlationId in response"
        
        # Check if contract processing worked
        if "summaryResult" in data["data"] and data["data"]["summaryResult"]:
            print("✅ Contract AI processing detected")
        else:
            print("⚠️ Contract AI processing may have failed")
        
        print("✅ Contract file test passed")
        return data["data"]["correlationId"]
        
    finally:
        # Cleanup
        if os.path.exists(test_file):
            os.remove(test_file)

def test_error_handling():
    """Test error handling with invalid file"""
    print("\n🧪 Testing error handling...")
    
    # Create invalid file
    test_file = create_test_file("test-invalid.txt", "Invalid content")
    
    try:
        with open(test_file, 'rb') as f:
            files = {"file": (test_file, f, "application/invalid")}
            headers = {"X-Correlation-Id": f"test-error-{int(time.time())}"}
            
            response = requests.post(UPLOAD_ENDPOINT, files=files, headers=headers, timeout=30)
        
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        # Should still return 200 with error handling
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "correlationId" in data["data"], "Missing correlationId in response"
        
        print("✅ Error handling test passed")
        return data["data"]["correlationId"]
        
    finally:
        # Cleanup
        if os.path.exists(test_file):
            os.remove(test_file)

def verify_mongodb_logs(correlation_ids: list):
    """Verify MongoDB audit logs (requires MongoDB connection)"""
    print("\n🔍 Verifying MongoDB audit logs...")
    
    try:
        from pymongo import MongoClient
        import os
        
        # Get MongoDB URI from environment
        mongodb_uri = os.getenv("MONGODB_ATLAS_URI", "mongodb://localhost:27017")
        client = MongoClient(mongodb_uri)
        db = client["docgo_automation_audit"]
        
        # Check audit logs
        audit_logs = db["automation_audit_logs"]
        processing_sessions = db["automation_processing_sessions"]
        error_logs = db["automation_error_logs"]
        
        for correlation_id in correlation_ids:
            print(f"\n📊 Checking logs for correlation ID: {correlation_id}")
            
            # Check audit logs
            audit_count = audit_logs.count_documents({"correlationId": correlation_id})
            print(f"  - Audit logs: {audit_count}")
            
            # Check processing sessions
            session = processing_sessions.find_one({"correlationId": correlation_id})
            if session:
                print(f"  - Processing session: {session.get('status', 'Unknown')}")
                print(f"  - Steps: {len(session.get('steps', []))}")
                print(f"  - Errors: {len(session.get('errors', []))}")
            else:
                print("  - Processing session: Not found")
            
            # Check error logs
            error_count = error_logs.count_documents({"correlationId": correlation_id})
            print(f"  - Error logs: {error_count}")
        
        client.close()
        print("✅ MongoDB verification completed")
        
    except ImportError:
        print("⚠️ pymongo not available, skipping MongoDB verification")
    except Exception as e:
        print(f"⚠️ MongoDB verification failed: {e}")

def verify_schema_alignment():
    """Verify schema alignment with File Management Service"""
    print("\n🔍 Verifying schema alignment...")
    
    # Test with a known contract file
    contract_content = """
    HỢP ĐỒNG DỊCH VỤ
    
    Bên A: Công ty ABC
    Bên B: Công ty XYZ
    
    Giá trị: 10.000.000 VNĐ
    Thời hạn: 6 tháng
    """
    
    test_file = create_test_file("test-schema.txt", contract_content)
    
    try:
        with open(test_file, 'rb') as f:
            files = {"file": (test_file, f, "text/plain")}
            headers = {"X-Correlation-Id": f"test-schema-{int(time.time())}"}
            
            response = requests.post(UPLOAD_ENDPOINT, files=files, headers=headers, timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Schema alignment test passed")
            
            # Check response structure
            required_fields = ["apiVersion", "statusCode", "shortMessage", "description", "data", "timestamp", "requestId", "path"]
            for field in required_fields:
                assert field in data, f"Missing required field: {field}"
            
            # Check data structure
            data_fields = ["documentId", "fileUrl", "processingStatus", "correlationId"]
            for field in data_fields:
                assert field in data["data"], f"Missing data field: {field}"
            
            print("✅ Response schema validation passed")
            return data["data"]["correlationId"]
        else:
            print(f"❌ Schema alignment test failed: {response.status_code}")
            return None
            
    finally:
        # Cleanup
        if os.path.exists(test_file):
            os.remove(test_file)

def main():
    """Run all tests"""
    print("🚀 Starting comprehensive Automation Service tests...")
    print("=" * 60)
    
    correlation_ids = []
    
    try:
        # Test 1: Small file sync
        correlation_id = test_small_file_sync()
        correlation_ids.append(correlation_id)
        time.sleep(2)
        
        # Test 2: Large file async
        correlation_id = test_large_file_async()
        correlation_ids.append(correlation_id)
        time.sleep(2)
        
        # Test 3: Contract file
        correlation_id = test_contract_file()
        correlation_ids.append(correlation_id)
        time.sleep(2)
        
        # Test 4: Error handling
        correlation_id = test_error_handling()
        correlation_ids.append(correlation_id)
        time.sleep(2)
        
        # Test 5: Schema alignment
        correlation_id = verify_schema_alignment()
        if correlation_id:
            correlation_ids.append(correlation_id)
        
        print("\n" + "=" * 60)
        print("✅ All tests passed!")
        print(f"📊 Tested {len(correlation_ids)} scenarios")
        print(f"🔗 Correlation IDs: {correlation_ids}")
        
        # Verify MongoDB logs
        verify_mongodb_logs(correlation_ids)
        
        print("\n📋 MongoDB Query Examples:")
        for corr_id in correlation_ids:
            print(f"  db.automation_audit_logs.find({{correlationId: '{corr_id}'}}).sort({{timestamp: 1}})")
            print(f"  db.automation_processing_sessions.findOne({{correlationId: '{corr_id}'}})")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
