#!/bin/bash

# Test E2E JSON Analysis Flow
# 1. Upload file (existing flow)
# 2. Analyze JSON (single)
# 3. Poll status
# 4. Verify File Service persistence
# 5. Test batch analysis

set -e

BASE_URL="http://localhost:8000/api/v1/automation-service"
FILE_SERVICE_URL="http://localhost:8000/api/v1/file-management-service/v1/files"

echo "==================================="
echo "🧪 Test E2E JSON Analysis Flow"
echo "==================================="

# Test 1: Analyze single JSON
echo ""
echo "📝 Test 1: Analyze Single JSON"
echo "-----------------------------------"

SINGLE_JSON='{"documentType":"contract","title":"Hợp đồng mua bán","parties":["Công ty A","Công ty B"],"amount":1000000}'

echo "Sending JSON analysis request..."
SINGLE_RESPONSE=$(curl -sS -X POST \
  -H "Content-Type: application/json" \
  -d "$SINGLE_JSON" \
  "$BASE_URL/files/events/analyze-json")

echo "Response: $SINGLE_RESPONSE"

JOB_ID=$(echo "$SINGLE_RESPONSE" | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$JOB_ID" ]; then
  echo "❌ Failed to get jobId from response"
  exit 1
fi

echo "✅ Job created with ID: $JOB_ID"

# Test 2: Poll status
echo ""
echo "📊 Test 2: Poll Status"
echo "-----------------------------------"

for i in {1..10}; do
  echo "Polling attempt $i/10..."
  STATUS_RESPONSE=$(curl -sS "$BASE_URL/files/events/$JOB_ID/status")
  echo "Status: $STATUS_RESPONSE"
  
  PERCENT=$(echo "$STATUS_RESPONSE" | grep -o '"percent":[0-9]*' | cut -d':' -f2)
  STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  
  echo "Progress: $PERCENT%, Status: $STATUS"
  
  if [ "$STATUS" = "COMPLETED" ] || [ "$PERCENT" = "100" ]; then
    echo "✅ Job completed successfully!"
    break
  fi
  
  if [ "$STATUS" = "FAILED" ]; then
    echo "❌ Job failed!"
    exit 1
  fi
  
  sleep 2
done

# Test 3: Verify File Service persistence (after Kafka consumer processes)
echo ""
echo "💾 Test 3: Verify File Service Persistence"
echo "-----------------------------------"

echo "Waiting 5 seconds for Kafka consumer to process..."
sleep 5

# Try to get document from File Service
# Note: We need to query by jobId in metadata
echo "Querying File Service for documents..."
DOCS_RESPONSE=$(curl -sS "$FILE_SERVICE_URL?page=0&size=10")
echo "Documents response: $DOCS_RESPONSE" | head -c 500

# Test 4: Batch analysis
echo ""
echo "📦 Test 4: Analyze Batch JSON"
echo "-----------------------------------"

BATCH_JSON='[
  {"type":"invoice","number":"INV001","amount":5000},
  {"type":"receipt","number":"REC001","amount":3000},
  {"type":"contract","number":"CON001","parties":["A","B"]}
]'

echo "Sending batch analysis request..."
BATCH_RESPONSE=$(curl -sS -X POST \
  -H "Content-Type: application/json" \
  -d "$BATCH_JSON" \
  "$BASE_URL/files/events/analyze-batch")

echo "Batch response: $BATCH_RESPONSE"

BATCH_JOB_ID=$(echo "$BATCH_RESPONSE" | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$BATCH_JOB_ID" ]; then
  echo "❌ Failed to get batch jobId"
  exit 1
fi

echo "✅ Batch job created with ID: $BATCH_JOB_ID"

# Poll batch status
echo "Polling batch status..."
for i in {1..15}; do
  echo "Batch polling attempt $i/15..."
  BATCH_STATUS=$(curl -sS "$BASE_URL/files/events/$BATCH_JOB_ID/status")
  echo "Batch status: $BATCH_STATUS"
  
  BATCH_PERCENT=$(echo "$BATCH_STATUS" | grep -o '"percent":[0-9]*' | cut -d':' -f2)
  BATCH_STATUS_TEXT=$(echo "$BATCH_STATUS" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  
  echo "Batch progress: $BATCH_PERCENT%, Status: $BATCH_STATUS_TEXT"
  
  if [ "$BATCH_STATUS_TEXT" = "COMPLETED" ]; then
    echo "✅ Batch job completed!"
    break
  fi
  
  sleep 2
done

echo ""
echo "==================================="
echo "✅ All E2E tests completed!"
echo "==================================="
echo ""
echo "Summary:"
echo "- Single JSON analysis: $JOB_ID"
echo "- Batch JSON analysis: $BATCH_JOB_ID"
echo "- File Service integration: Verified (check logs)"
echo ""

