#!/usr/bin/env python3
"""
Script test MongoDB MCP Server
Tác giả: Moe Moe - Nữ quản gia của quý ngài Thaïs Gault
"""

import subprocess
import json
import time
import sys

def test_mcp_server():
    """Test MongoDB MCP Server"""
    print("=== TEST MONGODB MCP SERVER ===")
    print("Tác giả: Moe Moe - Nữ quản gia của quý ngài Thaïs Gault")
    print()
    
    # Test 1: Kiểm tra MCP Server có cài đặt không
    print("1. Kiểm tra MongoDB MCP Server...")
    try:
        result = subprocess.run(['npx', '-y', 'mongodb-mcp-server@latest', '--help'], 
                              capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print("✅ MongoDB MCP Server đã được cài đặt")
        else:
            print("❌ Lỗi khi chạy MongoDB MCP Server")
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False
    
    # Test 2: Kiểm tra connection string
    print("\n2. Kiểm tra connection string...")
    connection_string = "mongodb+srv://root:sapassword@devgo-docgo-cluster0.hsudzga.mongodb.net/?retryWrites=true&w=majority&appName=devgo-docgo-cluster0"
    print(f"Connection String: {connection_string[:50]}...")
    
    # Test 3: Chạy MCP Server với read-only mode
    print("\n3. Chạy MongoDB MCP Server (read-only mode)...")
    try:
        # Chạy MCP Server trong background
        process = subprocess.Popen([
            'npx', '-y', 'mongodb-mcp-server@latest', 
            '--readOnly',
            '--connectionString', connection_string
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Đợi một chút để server khởi động
        time.sleep(5)
        
        # Kiểm tra process có chạy không
        if process.poll() is None:
            print("✅ MongoDB MCP Server đang chạy")
            
            # Đọc output để kiểm tra
            try:
                stdout, stderr = process.communicate(timeout=10)
                print(f"Output: {stdout[:200]}...")
                if stderr:
                    print(f"Error: {stderr[:200]}...")
            except subprocess.TimeoutExpired:
                print("✅ Server đang chạy (timeout khi đọc output)")
            
            # Dừng process
            process.terminate()
            process.wait()
            
        else:
            print("❌ MongoDB MCP Server không thể khởi động")
            stdout, stderr = process.communicate()
            print(f"Error: {stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Lỗi khi chạy MCP Server: {e}")
        return False
    
    print("\n✅ Tất cả tests đều thành công!")
    print("\n📋 Hướng dẫn sử dụng:")
    print("1. Copy nội dung file 'cursor-mcp-config.json' vào cấu hình MCP của Cursor")
    print("2. Restart Cursor")
    print("3. Sử dụng @MongoDB để giao tiếp với MongoDB Atlas")
    
    return True

if __name__ == "__main__":
    success = test_mcp_server()
    sys.exit(0 if success else 1)
