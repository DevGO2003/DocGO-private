#!/usr/bin/env python3
"""
Script test MongoDB MCP Server với MCP Protocol
Tác giả: Moe Moe - Nữ quản gia của quý ngài Thaïs Gault
"""

import requests
import json
import time

def test_mcp_protocol():
    """Test MongoDB MCP Server với MCP Protocol"""
    print("=== TEST MONGODB MCP SERVER MCP PROTOCOL ===")
    print("Tác giả: Moe Moe - Nữ quản gia của quý ngài Thaïs Gault")
    print()
    
    # URL của MCP Server
    mcp_url = "http://localhost:8005"
    
    print(f"1. Kiểm tra MCP Server tại {mcp_url}...")
    
    try:
        # Test basic connection
        response = requests.get(mcp_url, timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        
        if response.status_code == 404:
            print("   ✅ MCP Server đang chạy (404 là bình thường cho MCP)")
        else:
            print(f"   ⚠️  Unexpected status: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("   ❌ Không thể kết nối đến MCP Server")
        return False
    except Exception as e:
        print(f"   ❌ Lỗi: {e}")
        return False
    
    print("\n2. Test MCP Protocol Initialize...")
    
    # Test MCP initialize
    try:
        mcp_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {
                    "name": "test-client",
                    "version": "1.0.0"
                }
            }
        }
        
        response = requests.post(mcp_url, 
                               json=mcp_request,
                               headers={"Content-Type": "application/json"},
                               timeout=10)
        
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:500]}...")
        
        if response.status_code == 200:
            print("   ✅ MCP Initialize thành công!")
            result = response.json()
            print(f"   Result: {json.dumps(result, indent=2)}")
        else:
            print(f"   ⚠️  MCP Initialize trả về status {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Lỗi khi test MCP Initialize: {e}")
    
    print("\n3. Test MCP Protocol List Databases...")
    
    # Test MCP list databases
    try:
        mcp_request = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "list-databases",
            "params": {}
        }
        
        response = requests.post(mcp_url, 
                               json=mcp_request,
                               headers={"Content-Type": "application/json"},
                               timeout=10)
        
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:500]}...")
        
        if response.status_code == 200:
            print("   ✅ MCP List Databases thành công!")
            result = response.json()
            print(f"   Result: {json.dumps(result, indent=2)}")
        else:
            print(f"   ⚠️  MCP List Databases trả về status {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Lỗi khi test MCP List Databases: {e}")
    
    print("\n✅ Test hoàn thành!")
    print("\n📋 Kết luận:")
    print("1. MCP Server đang chạy tại: http://localhost:8005")
    print("2. Sử dụng MCP Protocol (JSON-RPC 2.0)")
    print("3. Có thể tích hợp với Cursor qua MCP configuration")
    print("4. File cấu hình: cursor-mcp-config.json")
    
    return True

if __name__ == "__main__":
    test_mcp_protocol()
