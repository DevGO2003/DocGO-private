#!/usr/bin/env python3
"""
Simple WebSocket test using built-in libraries
"""

import socket
import base64
import json
import sys

def test_websocket(doc_id):
    """Test WebSocket connection using raw socket"""
    try:
        # Create socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect(('localhost', 8003))
        
        # WebSocket handshake
        key = base64.b64encode(b'test-key').decode()
        handshake = (
            f"GET /api/v1/automation-service/documents/progress/{doc_id} HTTP/1.1\r\n"
            f"Host: localhost:8003\r\n"
            f"Upgrade: websocket\r\n"
            f"Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            f"Sec-WebSocket-Version: 13\r\n"
            f"\r\n"
        )
        
        sock.send(handshake.encode())
        
        # Read response
        response = sock.recv(1024).decode()
        print(f"WebSocket handshake response: {response[:200]}...")
        
        if "101 Switching Protocols" in response:
            print("✅ WebSocket connection established!")
            
            # Try to read some data
            try:
                data = sock.recv(1024)
                if data:
                    print(f"📊 Received data: {data[:100]}...")
                else:
                    print("⏳ No data received yet")
            except:
                print("⏳ No data available")
        else:
            print("❌ WebSocket handshake failed")
            
        sock.close()
        return True
        
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❌ Usage: python test-websocket-simple.py <document_id>")
        sys.exit(1)
    
    doc_id = sys.argv[1]
    result = test_websocket(doc_id)
    sys.exit(0 if result else 1)
