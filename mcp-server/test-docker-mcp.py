#!/usr/bin/env python3
"""
Script test MongoDB MCP Server trong Docker
Tác giả: Moe Moe - Nữ quản gia của quý ngài Thaïs Gault
"""

import requests
import json
import time
import sys

def test_mcp_server_http():
    """Test MongoDB MCP Server qua HTTP"""
    print("=== TEST MONGODB MCP SERVER HTTP ===")
    print("Tác giả: Moe Moe - Nữ quản gia của quý ngài Thaïs Gault")
    print()
    
    # URL của MCP Server
    mcp_url = "http://localhost:8005"
    
    print(f"1. Kiểm tra MCP Server tại {mcp_url}...")
    
    try:
        # Test health check
        response = requests.get(f"{mcp_url}/health", timeout=10)
        if response.status_code == 200:
            print("✅ MCP Server đang chạy")
        else:
            print(f"⚠️  MCP Server trả về status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Không thể kết nối đến MCP Server")
        print("   Hãy chạy: docker-compose -f docker-compose.local.yml up mongodb-mcp-server")
        return False
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False
    
    print("\n2. Test MCP Server endpoints...")
    
    # Test các endpoints khác nhau
    endpoints = [
        "/",
        "/health", 
        "/status",
        "/info"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{mcp_url}{endpoint}", timeout=5)
            print(f"   {endpoint}: {response.status_code}")
            if response.status_code == 200:
                print(f"      Content: {response.text[:100]}...")
        except Exception as e:
            print(f"   {endpoint}: Error - {e}")
    
    print("\n3. Test MongoDB connection qua MCP...")
    
    # Test MongoDB connection
    try:
        # Gửi request để test MongoDB connection
        test_payload = {
            "method": "list-databases",
            "params": {}
        }
        
        response = requests.post(f"{mcp_url}/", 
                               json=test_payload, 
                               headers={"Content-Type": "application/json"},
                               timeout=10)
        
        if response.status_code == 200:
            print("✅ MongoDB connection qua MCP thành công")
            result = response.json()
            print(f"   Response: {json.dumps(result, indent=2)[:200]}...")
        else:
            print(f"⚠️  MongoDB connection trả về status {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
            
    except Exception as e:
        print(f"❌ Lỗi khi test MongoDB connection: {e}")
    
    print("\n✅ Test hoàn thành!")
    print("\n📋 Hướng dẫn sử dụng:")
    print("1. MCP Server đang chạy tại: http://localhost:8005")
    print("2. Sử dụng HTTP transport cho Cursor MCP configuration")
    print("3. File cấu hình: cursor-mcp-http-config.json")
    
    return True

if __name__ == "__main__":
    success = test_mcp_server_http()
    sys.exit(0 if success else 1)
