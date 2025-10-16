#!/usr/bin/env python3
"""
Test WebSocket progress tracking for async upload
"""

import asyncio
import websockets
import json
import sys
import time

async def test_websocket_progress(doc_id):
    """Test WebSocket progress tracking"""
    uri = f"ws://localhost:8003/api/v1/automation-service/v1/documents/progress/{doc_id}"
    
    print(f"🔌 Connecting to WebSocket: {uri}")
    print(f"📄 Document ID: {doc_id}")
    print("=" * 50)
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected successfully!")
            print("⏳ Waiting for progress updates...")
            print()
            
            # Listen for progress updates
            timeout = 60  # 60 seconds timeout
            start_time = time.time()
            last_progress = -1
            
            while True:
                try:
                    # Wait for message with timeout
                    message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    data = json.loads(message)
                    
                    current_progress = data.get('progress', 0)
                    stage = data.get('stage', 'unknown')
                    message_text = data.get('message', '')
                    status_code = data.get('statusCode', 'UNKNOWN')
                    
                    # Only print if progress changed
                    if current_progress != last_progress:
                        print(f"📊 Progress: {current_progress:3d}% | Stage: {stage:20s} | Status: {status_code}")
                        if message_text:
                            print(f"💬 Message: {message_text}")
                        print()
                        last_progress = current_progress
                    
                    # Check if complete
                    if data.get('completed') or current_progress >= 100:
                        print("✅ Processing completed!")
                        if data.get('details'):
                            print(f"📋 Final details: {json.dumps(data['details'], indent=2)}")
                        break
                        
                    # Check for errors
                    if data.get('error') or status_code == 'PROCESSING_ERROR':
                        print(f"❌ Error: {data.get('errorMessage', 'Unknown error')}")
                        break
                        
                except asyncio.TimeoutError:
                    current_time = time.time()
                    if current_time - start_time > timeout:
                        print("❌ WebSocket test timed out")
                        break
                    print("⏳ Waiting for progress update...")
                    
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        return False
        
    return True

async def main():
    if len(sys.argv) < 2:
        print("❌ Usage: python test-websocket-progress.py <document_id>")
        sys.exit(1)
    
    doc_id = sys.argv[1]
    result = await test_websocket_progress(doc_id)
    sys.exit(0 if result else 1)

if __name__ == "__main__":
    asyncio.run(main())
