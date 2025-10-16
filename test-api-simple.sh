#!/bin/bash

# Simple API Test Script
# Tests upload endpoints directly

echo "🚀 Simple Upload API Tests"
echo "=========================="

# Configuration
API_GATEWAY_URL="http://localhost:8000"
AUTOMATION_SERVICE_URL="http://localhost:8003"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Create a small test file
echo "📁 Creating test file..."
echo "This is a test document for upload testing." > test-document.txt
echo "File created: test-document.txt"

# Test 1: Health checks
echo ""
echo -e "${BLUE}Test 1: Health Checks${NC}"
echo "-------------------"

echo "Testing API Gateway..."
if curl -s "$API_GATEWAY_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ API Gateway OK${NC}"
else
    echo -e "${RED}❌ API Gateway not responding${NC}"
fi

echo "Testing Automation Service..."
if curl -s "$AUTOMATION_SERVICE_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ Automation Service OK${NC}"
else
    echo -e "${RED}❌ Automation Service not responding${NC}"
fi

# Test 2: Direct Automation Service upload
echo ""
echo -e "${BLUE}Test 2: Direct Automation Service Upload${NC}"
echo "----------------------------------------"

echo "Uploading to Automation Service directly..."
response=$(curl -s -X POST \
    -F "file=@test-document.txt" \
    -F "folder=documents" \
    -F "user_id=test-user" \
    "$AUTOMATION_SERVICE_URL/api/v1/automation-service/v1/documents/upload")

echo "Response:"
echo "$response" | jq . 2>/dev/null || echo "$response"

# Check response
if echo "$response" | grep -q '"statusCode":201'; then
    echo -e "${GREEN}✅ Sync upload successful (201)${NC}"
elif echo "$response" | grep -q '"statusCode":202'; then
    echo -e "${GREEN}✅ Async upload accepted (202)${NC}"
    
    # Extract document ID for WebSocket test
    doc_id=$(echo "$response" | grep -o '"documentId":"[^"]*"' | cut -d'"' -f4)
    echo "Document ID: $doc_id"
    
    # Test WebSocket connection
    echo ""
    echo -e "${BLUE}Testing WebSocket connection...${NC}"
    echo "WebSocket URL: ws://localhost:8003/api/v1/automation-service/v1/documents/progress/$doc_id"
    echo "You can test this manually with a WebSocket client"
    
else
    echo -e "${RED}❌ Upload failed${NC}"
fi

# Test 3: API Gateway upload
echo ""
echo -e "${BLUE}Test 3: API Gateway Upload${NC}"
echo "-------------------------"

echo "Uploading via API Gateway..."
response=$(curl -s -X POST \
    -F "file=@test-document.txt" \
    -F "folder=documents" \
    -F "user_id=test-user" \
    "$API_GATEWAY_URL/api/files/upload")

echo "Response:"
echo "$response" | jq . 2>/dev/null || echo "$response"

# Check response
if echo "$response" | grep -q '"statusCode":201'; then
    echo -e "${GREEN}✅ API Gateway sync upload successful (201)${NC}"
elif echo "$response" | grep -q '"statusCode":202'; then
    echo -e "${GREEN}✅ API Gateway async upload accepted (202)${NC}"
else
    echo -e "${RED}❌ API Gateway upload failed${NC}"
fi

# Cleanup
echo ""
echo "🧹 Cleaning up..."
rm -f test-document.txt

echo ""
echo -e "${GREEN}✅ Tests completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Start all services:"
echo "   - API Gateway: http://localhost:8000"
echo "   - Automation Service: http://localhost:8003"
echo "   - Document Service: http://localhost:8002"
echo "2. Test via web interface: http://localhost:3000/upload-document"
echo "3. Monitor WebSocket connections for progress updates"
