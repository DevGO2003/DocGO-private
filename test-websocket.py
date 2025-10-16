#!/usr/bin/env python3
"""
Simple WebSocket test for upload progress tracking
"""

import asyncio
import websockets
import json
import sys

async def test_websocket(doc_id):
    uri = f"ws://localhost:8003/api/v1/automation-service/v1/documents/progress/{doc_id}"
    
    print(f"🔌 Connecting to WebSocket: {uri}")
    
    try:
        async with websockets.connect(uri) as websocket:
            print(f"✅ Connected to WebSocket for document: {doc_id}")
            
            # Send ping
            await websocket.send("ping")
            print("📤 Sent ping")
            
            # Listen for progress updates
            timeout = 30  # 30 seconds timeout
            start_time = asyncio.get_event_loop().time()
            
            while True:
                try:
                    # Wait for message with timeout
                    message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    data = json.loads(message)
                    
                    print(f"📊 Progress: {data.get('progress', 0)}% - {data.get('stage', 'unknown')} - {data.get('message', '')}")
                    
                    # Check if complete
                    if data.get('completed') or data.get('progress', 0) >= 100:
                        print("✅ Processing completed!")
                        break
                        
                    # Check for errors
                    if data.get('error'):
                        print(f"❌ Error: {data.get('errorMessage', 'Unknown error')}")
                        break
                        
                except asyncio.TimeoutError:
                    current_time = asyncio.get_event_loop().time()
                    if current_time - start_time > timeout:
                        print("❌ WebSocket test timed out")
                        break
                    print("⏳ Waiting for progress update...")
                    
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        return False
        
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❌ Usage: python test-websocket.py <document_id>")
        sys.exit(1)
    
    doc_id = sys.argv[1]
    result = asyncio.run(test_websocket(doc_id))
    sys.exit(0 if result else 1)
