#!/bin/bash

# Test Upload Flow Script
# Tests sync/async upload with WebSocket progress tracking

echo "🚀 Starting Upload Flow Tests"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_GATEWAY_URL="http://localhost:8000"
AUTOMATION_SERVICE_URL="http://localhost:8003"
DOCUMENT_SERVICE_URL="http://localhost:8002"
WEBSOCKET_URL="ws://localhost:8003"

# Test files
SMALL_PDF="test-files/small-document.pdf"  # < 2MB
LARGE_PDF="test-files/large-document.pdf"   # >= 2MB
CONTRACT_PDF="test-files/sample-contract.pdf"

# Create test files if they don't exist
create_test_files() {
    echo -e "${BLUE}📁 Creating test files...${NC}"
    
    mkdir -p test-files
    
    # Create small PDF (< 2MB)
    if [ ! -f "$SMALL_PDF" ]; then
        echo "Creating small PDF..."
        # Create a simple PDF with text
        echo "This is a small test document for sync upload testing." > test-files/small-doc.txt
        # Convert to PDF (requires pandoc or similar)
        # For now, we'll create a dummy file
        dd if=/dev/zero of="$SMALL_PDF" bs=1024 count=1000 2>/dev/null
    fi
    
    # Create large PDF (>= 2MB)
    if [ ! -f "$LARGE_PDF" ]; then
        echo "Creating large PDF..."
        dd if=/dev/zero of="$LARGE_PDF" bs=1024 count=3000 2>/dev/null
    fi
    
    # Create contract PDF
    if [ ! -f "$CONTRACT_PDF" ]; then
        echo "Creating contract PDF..."
        dd if=/dev/zero of="$CONTRACT_PDF" bs=1024 count=1500 2>/dev/null
    fi
    
    echo -e "${GREEN}✅ Test files created${NC}"
}

# Test service health
test_service_health() {
    echo -e "${BLUE}🏥 Testing service health...${NC}"
    
    # Test API Gateway
    echo "Testing API Gateway..."
    if curl -s "$API_GATEWAY_URL/health" > /dev/null; then
        echo -e "${GREEN}✅ API Gateway is healthy${NC}"
    else
        echo -e "${RED}❌ API Gateway is not responding${NC}"
        return 1
    fi
    
    # Test Automation Service
    echo "Testing Automation Service..."
    if curl -s "$AUTOMATION_SERVICE_URL/health" > /dev/null; then
        echo -e "${GREEN}✅ Automation Service is healthy${NC}"
    else
        echo -e "${RED}❌ Automation Service is not responding${NC}"
        return 1
    fi
    
    # Test Document Service
    echo "Testing Document Service..."
    if curl -s "$DOCUMENT_SERVICE_URL/health" > /dev/null; then
        echo -e "${GREEN}✅ Document Service is healthy${NC}"
    else
        echo -e "${RED}❌ Document Service is not responding${NC}"
        return 1
    fi
}

# Test sync upload (file < 2MB)
test_sync_upload() {
    echo -e "${BLUE}📤 Testing sync upload (file < 2MB)...${NC}"
    
    local response=$(curl -s -X POST \
        -F "file=@$SMALL_PDF" \
        -F "folder=documents" \
        -F "user_id=test-user" \
        "$API_GATEWAY_URL/api/files/upload")
    
    echo "Response: $response"
    
    # Check if response contains 201 status
    if echo "$response" | grep -q '"statusCode":201'; then
        echo -e "${GREEN}✅ Sync upload successful${NC}"
        
        # Extract document ID
        local doc_id=$(echo "$response" | grep -o '"documentId":"[^"]*"' | cut -d'"' -f4)
        echo "Document ID: $doc_id"
        
        return 0
    else
        echo -e "${RED}❌ Sync upload failed${NC}"
        return 1
    fi
}

# Test async upload (file >= 2MB)
test_async_upload() {
    echo -e "${BLUE}📤 Testing async upload (file >= 2MB)...${NC}"
    
    local response=$(curl -s -X POST \
        -F "file=@$LARGE_PDF" \
        -F "folder=documents" \
        -F "user_id=test-user" \
        "$API_GATEWAY_URL/api/files/upload")
    
    echo "Response: $response"
    
    # Check if response contains 202 status
    if echo "$response" | grep -q '"statusCode":202'; then
        echo -e "${GREEN}✅ Async upload accepted${NC}"
        
        # Extract document ID
        local doc_id=$(echo "$response" | grep -o '"documentId":"[^"]*"' | cut -d'"' -f4)
        echo "Document ID: $doc_id"
        
        return $doc_id
    else
        echo -e "${RED}❌ Async upload failed${NC}"
        return 1
    fi
}

# Test WebSocket progress tracking
test_websocket_progress() {
    local doc_id=$1
    
    if [ -z "$doc_id" ]; then
        echo -e "${RED}❌ No document ID provided for WebSocket test${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🔌 Testing WebSocket progress tracking for document: $doc_id${NC}"
    
    # Create a simple WebSocket client using Python
    cat > test_websocket.py << EOF
import asyncio
import websockets
import json
import sys

async def test_websocket(doc_id):
    uri = f"ws://localhost:8003/api/v1/automation-service/v1/documents/progress/{doc_id}"
    
    try:
        async with websockets.connect(uri) as websocket:
            print(f"Connected to WebSocket for document: {doc_id}")
            
            # Send ping
            await websocket.send("ping")
            
            # Listen for progress updates
            timeout = 30  # 30 seconds timeout
            start_time = asyncio.get_event_loop().time()
            
            while True:
                try:
                    # Wait for message with timeout
                    message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    data = json.loads(message)
                    
                    print(f"Progress: {data.get('progress', 0)}% - {data.get('stage', 'unknown')} - {data.get('message', '')}")
                    
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
    doc_id = sys.argv[1] if len(sys.argv) > 1 else None
    if not doc_id:
        print("❌ No document ID provided")
        sys.exit(1)
    
    result = asyncio.run(test_websocket(doc_id))
    sys.exit(0 if result else 1)
EOF

    # Run WebSocket test
    python3 test_websocket.py "$doc_id"
    local ws_result=$?
    
    # Cleanup
    rm -f test_websocket.py
    
    if [ $ws_result -eq 0 ]; then
        echo -e "${GREEN}✅ WebSocket progress tracking successful${NC}"
        return 0
    else
        echo -e "${RED}❌ WebSocket progress tracking failed${NC}"
        return 1
    fi
}

# Test document service integration
test_document_service() {
    echo -e "${BLUE}📄 Testing Document Service integration...${NC}"
    
    # Get documents list
    local response=$(curl -s "$DOCUMENT_SERVICE_URL/api/v1/document-management-service/v1/documents?page=0&size=10")
    
    echo "Documents response: $response"
    
    if echo "$response" | grep -q '"statusCode":200'; then
        echo -e "${GREEN}✅ Document Service is accessible${NC}"
        return 0
    else
        echo -e "${RED}❌ Document Service integration failed${NC}"
        return 1
    fi
}

# Main test execution
main() {
    echo -e "${YELLOW}🧪 Starting comprehensive upload flow tests${NC}"
    echo "=============================================="
    
    # Create test files
    create_test_files
    
    # Test service health
    if ! test_service_health; then
        echo -e "${RED}❌ Service health check failed. Please start all services first.${NC}"
        echo "Required services:"
        echo "  - API Gateway (port 8000)"
        echo "  - Automation Service (port 8003)"
        echo "  - Document Service (port 8002)"
        exit 1
    fi
    
    echo ""
    echo -e "${YELLOW}📋 Running test scenarios...${NC}"
    echo "================================"
    
    # Test 1: Sync upload
    echo ""
    echo -e "${BLUE}Test 1: Sync Upload (< 2MB)${NC}"
    echo "------------------------"
    if test_sync_upload; then
        echo -e "${GREEN}✅ Sync upload test passed${NC}"
    else
        echo -e "${RED}❌ Sync upload test failed${NC}"
    fi
    
    # Test 2: Async upload
    echo ""
    echo -e "${BLUE}Test 2: Async Upload (>= 2MB)${NC}"
    echo "------------------------"
    doc_id=$(test_async_upload)
    if [ $? -eq 0 ] && [ -n "$doc_id" ]; then
        echo -e "${GREEN}✅ Async upload test passed${NC}"
        
        # Test 3: WebSocket progress tracking
        echo ""
        echo -e "${BLUE}Test 3: WebSocket Progress Tracking${NC}"
        echo "--------------------------------"
        if test_websocket_progress "$doc_id"; then
            echo -e "${GREEN}✅ WebSocket progress tracking test passed${NC}"
        else
            echo -e "${RED}❌ WebSocket progress tracking test failed${NC}"
        fi
    else
        echo -e "${RED}❌ Async upload test failed${NC}"
    fi
    
    # Test 4: Document Service integration
    echo ""
    echo -e "${BLUE}Test 4: Document Service Integration${NC}"
    echo "------------------------------------"
    if test_document_service; then
        echo -e "${GREEN}✅ Document Service integration test passed${NC}"
    else
        echo -e "${RED}❌ Document Service integration test failed${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}🏁 Test Summary${NC}"
    echo "==============="
    echo "All tests completed. Check the results above."
    echo ""
    echo "Next steps:"
    echo "1. Test via web interface: http://localhost:3000/upload-document"
    echo "2. Monitor logs for detailed processing information"
    echo "3. Check Document Service for created records"
}

# Run main function
main "$@"
