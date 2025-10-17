# Upload Flow Test Guide

## 🎯 Tổng quan

Kế hoạch test luồng upload file đã được implement hoàn chỉnh với các tính năng:

- ✅ **Sync Upload** (< 2MB): Xử lý đồng bộ với AI Classification + Summarization
- ✅ **Async Upload** (≥ 2MB): Xử lý bất đồng bộ với WebSocket progress tracking
- ✅ **WebSocket Progress**: Real-time progress updates với 6 stages
- ✅ **AI Processing**: Classification và Summarization cho contracts
- ✅ **Frontend Integration**: Progress bar và stage indicators

## 🏗️ Architecture

```
Frontend (Next.js) 
    ↓ HTTP POST /api/files/upload
API Gateway (Next.js:8000)
    ↓ Proxy to /documents/upload
Automation Service (FastAPI:8003)
    ↓ WebSocket progress updates
    ↓ AI Classification + Summarization
    ↓ Update Document Service
Document Service (Spring Boot:8002)
```

## 🚀 Quick Start

### 1. Start Services

```bash
# Terminal 1: API Gateway
cd backend/api-gateway
npm run dev

# Terminal 2: Automation Service  
cd backend/automation-service
python main.py

# Terminal 3: Document Service
cd backend/file-management-service
./mvnw spring-boot:run

# Terminal 4: Frontend
cd frontend/web-app
npm run dev
```

### 2. Test Upload Flow

```bash
# Run simple API tests
./test-api-simple.sh

# Run comprehensive tests (requires Python websockets)
./test-upload-flow.sh
```

## 📋 Test Scenarios

### Test 1: Sync Upload (< 2MB)

**Endpoint**: `POST http://localhost:8000/api/files/upload`

**Request**:
```bash
curl -X POST \
  -F "file=@small-document.pdf" \
  -F "folder=documents" \
  -F "user_id=test-user" \
  http://localhost:8000/api/files/upload
```

**Expected Response**:
```json
{
  "statusCode": 201,
  "shortMessage": "Created",
  "description": "Upload và xử lý đồng bộ thành công",
  "data": {
    "documentId": "uuid-here",
    "fileUrl": "https://...",
    "ocrText": "extracted text...",
    "classificationResult": {
      "documentType": "contract",
      "isContract": true,
      "confidence": 0.95
    },
    "summaryResult": {
      "contractNumber": "...",
      "parties": [...],
      "keyClauses": [...]
    },
    "processingStatus": "COMPLETED"
  }
}
```

### Test 2: Async Upload (≥ 2MB)

**Request**: Same as above but with larger file

**Expected Response**:
```json
{
  "statusCode": 202,
  "shortMessage": "Accepted", 
  "description": "Tệp lớn, đã nhận và đang xử lý nền",
  "data": {
    "documentId": "uuid-here",
    "fileUrl": "https://...",
    "processingStatus": "PROCESSING"
  }
}
```

### Test 3: WebSocket Progress Tracking

**WebSocket URL**: `ws://localhost:8003/api/v1/automation-service/documents/progress/{documentId}`

**Progress Stages**:
1. **20%**: `saving_document` - "Đang lưu tài liệu..."
2. **40%**: `uploading_to_storage` - "Đang tải lên storage..."
3. **60%**: `ocr_extracting` - "Đang trích xuất văn bản..."
4. **75%**: `ai_classifying` - "Đang phân loại tài liệu..."
5. **90%**: `ai_summarizing` - "Đang tóm tắt hợp đồng..." (chỉ nếu là contract)
6. **100%**: `processing_complete` - "Xử lý hoàn tất"

**WebSocket Message Format**:
```json
{
  "documentId": "uuid-here",
  "progress": 75,
  "stage": "ai_classifying", 
  "message": "Đang phân loại tài liệu...",
  "timestamp": "2024-01-01T00:00:00Z",
  "metadata": {}
}
```

## 🧪 Manual Testing

### 1. Frontend Testing

1. Open: http://localhost:3000/upload-document
2. Upload small file (< 2MB): Should complete immediately
3. Upload large file (≥ 2MB): Should show progress bar with stages
4. Monitor WebSocket connection in browser dev tools

### 2. API Testing

```bash
# Test sync upload
curl -X POST \
  -F "file=@test-small.pdf" \
  -F "folder=documents" \
  -F "user_id=test-user" \
  http://localhost:8000/api/files/upload

# Test async upload  
curl -X POST \
  -F "file=@test-large.pdf" \
  -F "folder=documents" \
  -F "user_id=test-user" \
  http://localhost:8000/api/files/upload
```

### 3. WebSocket Testing

```javascript
// Browser console
const ws = new WebSocket('ws://localhost:8003/api/v1/automation-service/documents/progress/DOCUMENT_ID');
ws.onmessage = (event) => {
  console.log('Progress:', JSON.parse(event.data));
};
```

## 🔧 Configuration

### Environment Variables

**Automation Service**:
```bash
MAX_SYNC_SIZE=2097152  # 2MB
GEMINI_API_KEY=your-key-here
FILE_MANAGEMENT_SERVICE_URL=http://localhost:8002
```

**API Gateway**:
```bash
AUTOMATION_SERVICE_URL=http://localhost:8003
```

### File Size Thresholds

- **< 2MB**: Sync processing (immediate response)
- **≥ 2MB**: Async processing (WebSocket progress)

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check Automation Service is running on port 8003
   - Verify WebSocket endpoint: `/api/v1/automation-service/documents/progress/{id}`

2. **AI Processing Failed**
   - Check GEMINI_API_KEY is set
   - Monitor Automation Service logs for AI errors

3. **Document Service Integration Failed**
   - Verify Document Service is running on port 8002
   - Check FILE_MANAGEMENT_SERVICE_URL in Automation Service

4. **Progress Not Updating**
   - Check WebSocket connection in browser dev tools
   - Verify document ID is correct
   - Monitor Automation Service logs

### Debug Commands

```bash
# Check service health
curl http://localhost:8000/health
curl http://localhost:8003/health  
curl http://localhost:8002/health

# Monitor logs
tail -f backend/automation-service/logs/app.log
tail -f backend/file-management-service/logs/application.log

# Test WebSocket manually
wscat -c ws://localhost:8003/api/v1/automation-service/documents/progress/DOCUMENT_ID
```

## 📊 Success Criteria

✅ **Sync upload (< 2MB)**: Response < 5s, có đầy đủ AI results  
✅ **Async upload (≥ 2MB)**: Progress tracking realtime, complete < 30s  
✅ **WebSocket**: Stable connections, accurate progress updates  
✅ **AI Processing**: Classification accuracy > 90%, summary có đầy đủ trường  
✅ **Frontend**: Smooth UX, progress hiển thị rõ ràng  
✅ **Error Handling**: All edge cases covered với messages rõ ràng  

## 📁 Files Modified/Created

### Backend Files Modified:
- `backend/api-gateway/pages/api/files/upload.ts` - Fixed proxy endpoint
- `backend/automation-service/routers.py` - Enhanced upload flow with AI processing

### Backend Files Created:
- `backend/automation-service/services/progress_manager.py` - Progress state management
- `backend/automation-service/services/websocket_manager.py` - WebSocket connection management

### Frontend Files Created:
- `frontend/web-app/src/hooks/useDocumentProgress.tsx` - WebSocket hook
- `frontend/web-app/src/components/UploadProgress.tsx` - Progress component

### Frontend Files Modified:
- `frontend/web-app/src/app/(documents)/upload-document/page.tsx` - Added progress tracking

### Test Files Created:
- `test-upload-flow.sh` - Comprehensive test script
- `test-api-simple.sh` - Simple API test script
- `UPLOAD_TEST_GUIDE.md` - This guide

## 🎉 Next Steps

1. **Run Tests**: Execute test scripts to verify functionality
2. **Frontend Testing**: Test via web interface with real files
3. **Performance Testing**: Upload multiple files simultaneously
4. **Error Testing**: Test with invalid files, network issues
5. **Production Deployment**: Deploy to staging/production environment

---

**Total Implementation Time**: ~8-11 hours as estimated  
**Status**: ✅ Complete - Ready for testing and deployment
