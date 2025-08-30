# Hệ thống Logging cho Luồng Upload File Storage → Contract Service

## Tổng quan

Tài liệu này mô tả hệ thống logging chi tiết đã được bổ sung cho luồng upload từ **File Storage Asset Service** đến **Contract Management Service** trong hệ thống DocGO.

## Luồng Upload và Logging

### 1. File Storage Asset Service (Port 8012)

#### 1.1 Upload File Endpoint (`POST /api/v1/file-storage-asset-service/files`)

**Log Tags:**
- `🚀 [UPLOAD_START]` - Bắt đầu upload file
- `📁 [UPLOAD_INFO]` - Thông tin file upload
- `🔒 [FILENAME_SANITIZATION]` - Chuẩn hóa tên file
- `⚠️ [FILE_SIZE_VALIDATION]` - Kiểm tra kích thước file
- `⚠️ [FILE_TYPE_VALIDATION]` - Kiểm tra loại file
- `✅ [VALIDATION_PASSED]` - Validation thành công
- `📤 [STORAGE_UPLOAD]` - Bắt đầu upload lên storage
- `✅ [STORAGE_UPLOAD_SUCCESS]` - Upload storage thành công
- `🔗 [URL_GENERATION]` - Tạo URL cho file
- `📊 [RESPONSE_DATA]` - Chuẩn bị response data
- `📢 [KAFKA_PUBLISH_START]` - Bắt đầu publish event
- `📋 [EVENT_PAYLOAD]` - Chuẩn bị event payload
- `🔑 [KAFKA_KEY]` - Key cho Kafka message
- `✅ [KAFKA_PUBLISH_SUCCESS]` - Publish event thành công
- `🎉 [UPLOAD_COMPLETE]` - Hoàn thành upload
- `❌ [UPLOAD_FAILED]` - Lỗi upload
- `❌ [KAFKA_PUBLISH_FAILED]` - Lỗi publish event

**Ví dụ Log:**
```
🚀 [UPLOAD_START] Bắt đầu upload file - correlation_id: abc123, user_id: user1, user_role: admin, client_ip: 192.168.1.100
📁 [UPLOAD_INFO] File: contract.pdf, size: 2048576 bytes, content_type: application/pdf, folder: documents
🔒 [FILENAME_SANITIZATION] Tên file gốc: contract.pdf, tên file an toàn: contract.pdf
✅ [VALIDATION_PASSED] File đã vượt qua validation - extension: .pdf, size: 2048576 bytes
📤 [STORAGE_UPLOAD] Bắt đầu upload file lên storage với folder: documents
✅ [STORAGE_UPLOAD_SUCCESS] File đã được upload thành công - file_id: uuid123, s3_key: documents/uuid123_contract.pdf
🔗 [URL_GENERATION] Đã tạo presigned URL cho S3 - s3_key: documents/uuid123_contract.pdf, expires: 7 days
📊 [RESPONSE_DATA] Đã chuẩn bị response data - bucket: docgo-bucket, key: documents/uuid123_contract.pdf, size: 2048576, scan_status: completed
📢 [KAFKA_PUBLISH_START] Bắt đầu publish FileUploaded event lên Kafka topic: file.events
📋 [EVENT_PAYLOAD] Đã chuẩn bị event payload - eventId: def456, fileId: uuid123, filename: contract.pdf
🔑 [KAFKA_KEY] Sử dụng key cho Kafka message: documents/uuid123_contract.pdf (từ field: key)
✅ [KAFKA_PUBLISH_SUCCESS] Đã publish FileUploaded event thành công - topic: file.events, key: documents/uuid123_contract.pdf
🎉 [UPLOAD_COMPLETE] Hoàn thành upload file thành công - correlation_id: abc123, file: contract.pdf
```

#### 1.2 File Service (`services/file_service.py`)

**Log Tags:**
- `📁 [FILE_SERVICE_START]` - Bắt đầu xử lý upload file
- `📖 [FILE_READ]` - Đang đọc nội dung file
- `✅ [FILE_READ_SUCCESS]` - Đọc file thành công
- `🔒 [FILENAME_SANITIZATION]` - Chuẩn hóa tên file
- `📁 [FOLDER_PREFIX]` - Sử dụng folder prefix
- `🆔 [FILE_INFO]` - Tạo thông tin file
- `🔍 [DUPLICATE_CHECK]` - Kiểm tra file trùng lặp
- `🔄 [VERSION_INCREMENT]` - Tạo version mới
- `🆕 [NEW_FILE]` - File mới
- `🗝️ [S3_KEY]` - Tạo S3 key
- `☁️ [S3_UPLOAD_START]` - Bắt đầu upload lên S3
- `📋 [S3_METADATA]` - Chuẩn bị metadata
- `📝 [S3_METADATA_EXTENDED]` - Sử dụng metadata mở rộng
- `✅ [S3_UPLOAD_SUCCESS]` - Upload S3 thành công
- `❌ [S3_UPLOAD_FAILED]` - Lỗi upload S3
- `💾 [LOCAL_STORAGE]` - Lưu file local
- `📁 [LOCAL_DIR]` - Tạo thư mục local
- `✅ [LOCAL_SAVE_SUCCESS]` - Lưu local thành công
- `🛡️ [MALWARE_SCAN_START]` - Bắt đầu quét malware
- `✅ [MALWARE_SCAN_COMPLETE]` - Hoàn thành quét malware
- `📋 [FILE_INFO_CREATED]` - Tạo FileInfo object
- `💾 [DATABASE_SAVE]` - Lưu metadata vào database
- `✅ [DATABASE_SAVE_SUCCESS]` - Lưu database thành công
- `🎉 [FILE_SERVICE_COMPLETE]` - Hoàn thành xử lý upload file
- `❌ [FILE_SERVICE_FAILED]` - Lỗi xử lý upload file

#### 1.3 Malware Scanner (`services/malware_scanner.py`)

**Log Tags:**
- `🛡️ [MALWARE_SCANNER_INIT]` - Khởi tạo MalwareScanner
- `🔍 [MALWARE_SCAN_START]` - Bắt đầu quét malware
- `🦠 [CLAMAV_SCAN]` - Sử dụng ClamAV
- `✅ [CLAMAV_SCAN_COMPLETE]` - ClamAV scan hoàn thành
- `🔍 [BASIC_SCAN]` - Sử dụng basic scan
- `✅ [BASIC_SCAN_COMPLETE]` - Basic scan hoàn thành
- `⚠️ [CLAMAV_FALLBACK]` - Fallback về basic scan
- `✅ [FALLBACK_SCAN_COMPLETE]` - Fallback scan hoàn thành
- `🔌 [CLAMAV_CONNECT]` - Kết nối ClamAV daemon
- `🔌 [CLAMAV_UNIX_SOCKET]` - Sử dụng Unix socket
- `🔌 [CLAMAV_NETWORK]` - Sử dụng network socket
- `🔍 [CLAMAV_SCAN_STREAM]` - Quét file stream với ClamAV
- `🚨 [MALWARE_DETECTED]` - Phát hiện malware
- `✅ [MALWARE_CLEAN]` - File sạch
- `❌ [CLAMAV_SCAN_ERROR]` - Lỗi ClamAV scan
- `🔍 [BASIC_SCAN_START]` - Bắt đầu basic scan
- `⚠️ [SUSPICIOUS_SIZE]` - Kích thước đáng ngờ
- `📏 [SIZE_CHECK_PASSED]` - Kích thước hợp lệ
- `🔍 [SIGNATURE_CHECK]` - Kiểm tra signature
- `🚨 [SUSPICIOUS_PATTERN]` - Phát hiện pattern đáng ngờ
- `✅ [SIGNATURE_CHECK_PASSED]` - Signature check thành công
- `📋 [HEADER_CHECK]` - Kiểm tra header file
- `🚨 [SUSPICIOUS_HEADER]` - Header đáng ngờ
- `✅ [HEADER_CHECK_PASSED]` - Header hợp lệ
- `✅ [BASIC_SCAN_CLEAN]` - Basic scan hoàn thành
- `❌ [BASIC_SCAN_ERROR]` - Lỗi basic scan

### 2. Contract Management Service (Port 8003)

#### 2.1 Contract Kafka Service (`ContractKafkaService.java`)

**Log Tags:**
- `📨 [KAFKA_RECEIVE]` - Nhận message từ Kafka
- `🔍 [EVENT_ANALYSIS]` - Phân tích event
- `✅ [EVENT_MATCH]` - Event type phù hợp
- `⏭️ [EVENT_SKIP]` - Event type không phù hợp
- `❌ [EVENT_PROCESSING_ERROR]` - Lỗi xử lý event
- `🚀 [CONTRACT_PROCESSING_START]` - Bắt đầu xử lý contract
- `❌ [NULL_EVENT]` - Event object null
- `❌ [NULL_DATA]` - Data object null
- `❌ [NULL_ACTOR]` - Actor object null
- `✅ [EVENT_VALIDATION]` - Event validation thành công
- `❌ [NULL_FILE_INFO]` - File information null
- `📁 [FILE_INFO_EXTRACTED]` - Trích xuất thông tin file
- `❌ [MISSING_REQUIRED_FIELDS]` - Thiếu trường bắt buộc
- `❌ [NULL_CONTRACT_SUMMARY]` - Contract summary null
- `📋 [CONTRACT_SUMMARY_EXTRACTED]` - Trích xuất contract summary
- `🔄 [CONTRACT_CREATION_START]` - Bắt đầu tạo contract
- `📝 [CONTRACT_OBJECT_CREATED]` - Tạo Contract object
- `✅ [CONTRACT_SAVED]` - Lưu contract thành công
- `💾 [CONTRACT_SUMMARY_SAVE]` - Lưu contract summary
- `📢 [CONTRACT_UPDATED_EVENT]` - Publish contract-updated event
- `🎉 [CONTRACT_PROCESSING_COMPLETE]` - Hoàn thành xử lý contract
- `❌ [CONTRACT_PROCESSING_ERROR]` - Lỗi xử lý contract
- `💾 [CONTRACT_SUMMARY_SAVE_START]` - Bắt đầu lưu contract summary
- `❌ [INVALID_PARAMS]` - Tham số không hợp lệ
- `📋 [FILE_INFO_DETAILS]` - Thông tin file chi tiết
- `🔑 [KEY_POINTS_EXTRACTED]` - Trích xuất key points
- `🏷️ [CLASSIFICATION_INFO]` - Thông tin classification
- `🔗 [CORRELATION_ID]` - Sử dụng correlation ID
- `📁 [CONTRACT_FILE_SAVE]` - Lưu thông tin file
- `📝 [CONTRACT_SUMMARY_BASIC]` - Lưu thông tin cơ bản
- `📋 [CONTRACT_SUMMARY_DETAILED]` - Lưu thông tin chi tiết
- `✅ [CONTRACT_SUMMARY_SAVE_SUCCESS]` - Lưu contract summary thành công
- `❌ [CONTRACT_SUMMARY_SAVE_ERROR]` - Lỗi lưu contract summary
- `📁 [CONTRACT_FILE_SAVE_START]` - Bắt đầu lưu thông tin file
- `📋 [FILE_INFO_DETAILS]` - Thông tin file chi tiết
- `🔑 [KEY_POINTS]` - Key points
- `🏷️ [CLASSIFICATION]` - Classification
- `💾 [DATABASE_SAVE]` - Lưu vào database
- `✅ [CONTRACT_FILE_SAVE_SUCCESS]` - Lưu thông tin file thành công
- `❌ [CONTRACT_FILE_SAVE_ERROR]` - Lỗi lưu thông tin file
- `📋 [DETAILED_SUMMARY_SAVE_START]` - Bắt đầu lưu contract summary chi tiết
- `👥 [PARTIES_SAVE]` - Lưu thông tin parties
- `👥 [PARTIES_COUNT]` - Số lượng parties
- `👤 [PARTY_SAVE]` - Lưu party
- `✅ [PARTIES_SAVE_SUCCESS]` - Lưu parties thành công
- `⏭️ [NO_PARTIES]` - Không có parties
- `📝 [KEY_CLAUSES_SAVE]` - Lưu thông tin key clauses
- `📝 [KEY_CLAUSES_COUNT]` - Số lượng key clauses
- `📋 [KEY_CLAUSE_SAVE]` - Lưu key clause
- `✅ [KEY_CLAUSES_SAVE_SUCCESS]` - Lưu key clauses thành công
- `⏭️ [NO_KEY_CLAUSES]` - Không có key clauses
- `✅ [FAVORABLE_CLAUSES_SAVE]` - Lưu thông tin favorable clauses
- `✅ [FAVORABLE_CLAUSES_COUNT]` - Số lượng favorable clauses
- `✅ [FAVORABLE_CLAUSE_SAVE]` - Lưu favorable clause
- `✅ [FAVORABLE_CLAUSES_SAVE_SUCCESS]` - Lưu favorable clauses thành công
- `⏭️ [NO_FAVORABLE_CLAUSES]` - Không có favorable clauses
- `⚠️ [UNFAVORABLE_CLAUSES_SAVE]` - Lưu thông tin unfavorable clauses
- `⚠️ [UNFAVORABLE_CLAUSES_COUNT]` - Số lượng unfavorable clauses
- `⚠️ [UNFAVORABLE_CLAUSE_SAVE]` - Lưu unfavorable clause
- `✅ [UNFAVORABLE_CLAUSES_SAVE_SUCCESS]` - Lưu unfavorable clauses thành công
- `⏭️ [NO_UNFAVORABLE_CLAUSES]` - Không có unfavorable clauses
- `💰 [PAYMENT_DETAILS_SAVE]` - Lưu thông tin payment details
- `💰 [PAYMENT_INFO]` - Thông tin payment
- `✅ [PAYMENT_DETAILS_SAVE_SUCCESS]` - Lưu payment details thành công
- `⏭️ [NO_PAYMENT_DETAILS]` - Không có payment details
- `📋 [OTHER_DETAILS_SAVE]` - Lưu thông tin khác
- `📋 [OTHER_INFO]` - Thông tin khác
- `✅ [OTHER_DETAILS_SAVE_SUCCESS]` - Lưu thông tin khác thành công
- `🎉 [DETAILED_SUMMARY_SAVE_COMPLETE]` - Hoàn thành lưu contract summary chi tiết
- `❌ [DETAILED_SUMMARY_SAVE_ERROR]` - Lỗi lưu contract summary chi tiết
- `📢 [CONTRACT_UPDATED_PUBLISH_START]` - Bắt đầu publish ContractUpdated event
- `❌ [INVALID_PARAMS]` - Tham số không hợp lệ
- `📋 [EVENT_PAYLOAD_PREP]` - Chuẩn bị payload
- `📋 [EVENT_PAYLOAD_READY]` - Event payload sẵn sàng
- `📤 [KAFKA_SEND]` - Gửi event lên Kafka
- `✅ [CONTRACT_UPDATED_PUBLISH_SUCCESS]` - Publish ContractUpdated event thành công
- `❌ [CONTRACT_UPDATED_PUBLISH_FAILED]` - Lỗi publish ContractUpdated event

#### 2.2 AI Events Consumer (`AIEventsConsumer.java`)

**Log Tags:**
- `📨 [AI_EVENT_RECEIVE]` - Nhận AI event từ Kafka
- `⚠️ [AI_EVENT_EMPTY]` - AI event message rỗng
- `🔍 [AI_EVENT_PARSE]` - Parse AI event message
- `📋 [AI_EVENT_INFO]` - Thông tin AI event
- `⏭️ [AI_EVENT_SKIP]` - Event type không phù hợp
- `✅ [AI_EVENT_MATCH]` - Event type phù hợp
- `⚠️ [AI_EVENT_MISSING_FIELDS]` - Thiếu trường bắt buộc
- `📁 [AI_EVENT_FILE_INFO]` - Thông tin file từ AI event
- `📢 [CONTRACT_UPDATED_PREP]` - Chuẩn bị publish ContractUpdated event
- `📋 [CONTRACT_UPDATED_PAYLOAD]` - ContractUpdated payload sẵn sàng
- `📤 [KAFKA_SEND]` - Gửi event lên Kafka
- `✅ [CONTRACT_UPDATED_PUBLISH_SUCCESS]` - Publish ContractUpdated event thành công
- `❌ [AI_EVENT_PROCESSING_ERROR]` - Lỗi xử lý AI event

#### 2.3 File Uploaded Event Consumer (`FileUploadedEventConsumer.java`)

**Log Tags:**
- `📨 [FILE_UPLOADED_RECEIVE]` - Nhận FileUploaded event từ Kafka
- `🔍 [FILE_UPLOADED_ANALYSIS]` - Phân tích FileUploaded event
- `✅ [FILE_UPLOADED_MATCH]` - Event type phù hợp
- `⏭️ [FILE_UPLOADED_SKIP]` - Event type không phù hợp
- `⚠️ [FILE_UPLOADED_MISSING_FIELDS]` - Thiếu trường bắt buộc
- `📁 [FILE_UPLOADED_FILE_INFO]` - Thông tin file từ FileUploaded event
- `🔄 [FILE_UPLOADED_PROCESSING_START]` - Bắt đầu xử lý FileUploaded event
- `💾 [FILE_METADATA_CREATE]` - Tạo file metadata record
- `✅ [FILE_METADATA_CREATE_SUCCESS]` - Tạo file metadata record thành công
- `❌ [FILE_METADATA_CREATE_ERROR]` - Lỗi tạo file metadata record
- `📢 [FILE_RECEIVED_PUBLISH_START]` - Bắt đầu publish FileReceived event
- `📋 [FILE_RECEIVED_PAYLOAD]` - FileReceived event payload đã sẵn sàng
- `✅ [FILE_RECEIVED_PUBLISH_SUCCESS]` - Publish FileReceived event thành công
- `❌ [FILE_RECEIVED_PUBLISH_FAILED]` - Lỗi publish FileReceived event
- `✅ [FILE_UPLOADED_PROCESSING_COMPLETE]` - Hoàn thành xử lý FileUploaded event
- `❌ [FILE_UPLOADED_PROCESSING_ERROR]` - Lỗi xử lý FileUploaded event

#### 2.4 Contract Status Event Publisher (`ContractStatusEventPublisher.java`)

**Log Tags:**
- `📢 [CONTRACT_CREATED_PUBLISH_START]` - Bắt đầu publish ContractCreated event
- `📤 [KAFKA_SEND]` - Gửi ContractCreated event lên Kafka
- `✅ [CONTRACT_CREATED_PUBLISH_SUCCESS]` - Publish ContractCreated event thành công
- `❌ [CONTRACT_CREATED_PUBLISH_FAILED]` - Lỗi publish ContractCreated event
- `📢 [CONTRACT_UPDATED_PUBLISH_START]` - Bắt đầu publish ContractUpdated event
- `✅ [CONTRACT_UPDATED_PUBLISH_SUCCESS]` - Publish ContractUpdated event thành công
- `❌ [CONTRACT_UPDATED_PUBLISH_FAILED]` - Lỗi publish ContractUpdated event
- `📢 [CONTRACT_DELETED_PUBLISH_START]` - Bắt đầu publish ContractDeleted event
- `✅ [CONTRACT_DELETED_PUBLISH_SUCCESS]` - Publish ContractDeleted event thành công
- `❌ [CONTRACT_DELETED_PUBLISH_FAILED]` - Lỗi publish ContractDeleted event
- `📢 [CONTRACT_RESTORED_PUBLISH_START]` - Bắt đầu publish ContractRestored event
- `✅ [CONTRACT_RESTORED_PUBLISH_SUCCESS]` - Publish ContractRestored event thành công
- `❌ [CONTRACT_RESTORED_PUBLISH_FAILED]` - Lỗi publish ContractRestored event
- `📢 [CONTRACT_STATUS_CHANGED_PUBLISH_START]` - Bắt đầu publish ContractStatusChanged event
- `✅ [CONTRACT_STATUS_CHANGED_PUBLISH_SUCCESS]` - Publish ContractStatusChanged event thành công
- `❌ [CONTRACT_STATUS_CHANGED_PUBLISH_FAILED]` - Lỗi publish ContractStatusChanged event

#### 2.5 Contract Event Consumer (`ContractEventConsumer.java`)

**Log Tags:**
- `📨 [CONTRACT_EVENT_RECEIVE]` - Nhận contract event từ Kafka
- `🔍 [CONTRACT_EVENT_ANALYSIS]` - Phân tích contract event
- `🔄 [CONTRACT_CREATED_HANDLE]` - Bắt đầu xử lý ContractCreated event
- `📋 [CONTRACT_CREATED_INFO]` - Thông tin contract được tạo
- `✅ [CONTRACT_CREATED_HANDLE_SUCCESS]` - Xử lý ContractCreated event thành công
- `❌ [CONTRACT_CREATED_HANDLE_ERROR]` - Lỗi xử lý ContractCreated event
- `🔄 [CONTRACT_UPDATED_HANDLE]` - Bắt đầu xử lý ContractUpdated event
- `📋 [CONTRACT_UPDATED_INFO]` - Thông tin contract được cập nhật
- `✅ [CONTRACT_UPDATED_HANDLE_SUCCESS]` - Xử lý ContractUpdated event thành công
- `❌ [CONTRACT_UPDATED_HANDLE_ERROR]` - Lỗi xử lý ContractUpdated event
- `🔄 [CONTRACT_DELETED_HANDLE]` - Bắt đầu xử lý ContractDeleted event
- `📋 [CONTRACT_DELETED_INFO]` - Thông tin contract bị xóa
- `✅ [CONTRACT_DELETED_HANDLE_SUCCESS]` - Xử lý ContractDeleted event thành công
- `❌ [CONTRACT_DELETED_HANDLE_ERROR]` - Lỗi xử lý ContractDeleted event
- `🔄 [CONTRACT_RESTORED_HANDLE]` - Bắt đầu xử lý ContractRestored event
- `📋 [CONTRACT_RESTORED_INFO]` - Thông tin contract được khôi phục
- `✅ [CONTRACT_RESTORED_HANDLE_SUCCESS]` - Xử lý ContractRestored event thành công
- `❌ [CONTRACT_RESTORED_HANDLE_ERROR]` - Lỗi xử lý ContractRestored event
- `🔄 [CONTRACT_STATUS_CHANGED_HANDLE]` - Bắt đầu xử lý ContractStatusChanged event
- `📋 [CONTRACT_STATUS_CHANGED_INFO]` - Thông tin thay đổi status
- `✅ [CONTRACT_STATUS_CHANGED_HANDLE_SUCCESS]` - Xử lý ContractStatusChanged event thành công
- `❌ [CONTRACT_STATUS_CHANGED_HANDLE_ERROR]` - Lỗi xử lý ContractStatusChanged event
- `✅ [CONTRACT_EVENT_PROCESSING_SUCCESS]` - Xử lý contract event thành công
- `❌ [CONTRACT_EVENT_PROCESSING_ERROR]` - Lỗi xử lý contract event

#### 2.6 File Processing Status Consumer (`FileProcessingStatusConsumer.java`)

**Log Tags:**
- `📨 [FILE_PROCESSING_STATUS_RECEIVE]` - Nhận file processing status event từ Kafka
- `🔍 [FILE_PROCESSING_STATUS_ANALYSIS]` - Phân tích file processing status event
- `🔄 [FILE_PROCESSING_STARTED_HANDLE]` - Bắt đầu xử lý FileProcessingStarted event
- `📋 [FILE_PROCESSING_STARTED_INFO]` - Thông tin file bắt đầu xử lý
- `✅ [FILE_PROCESSING_STARTED_HANDLE_SUCCESS]` - Xử lý FileProcessingStarted event thành công
- `❌ [FILE_PROCESSING_STARTED_HANDLE_ERROR]` - Lỗi xử lý FileProcessingStarted event
- `🔄 [FILE_PROCESSING_COMPLETED_HANDLE]` - Bắt đầu xử lý FileProcessingCompleted event
- `📋 [FILE_PROCESSING_COMPLETED_INFO]` - Thông tin file hoàn thành xử lý
- `✅ [FILE_PROCESSING_COMPLETED_HANDLE_SUCCESS]` - Xử lý FileProcessingCompleted event thành công
- `❌ [FILE_PROCESSING_COMPLETED_HANDLE_ERROR]` - Lỗi xử lý FileProcessingCompleted event
- `🔄 [FILE_PROCESSING_FAILED_HANDLE]` - Bắt đầu xử lý FileProcessingFailed event
- `📋 [FILE_PROCESSING_FAILED_INFO]` - Thông tin file xử lý thất bại
- `✅ [FILE_PROCESSING_FAILED_HANDLE_SUCCESS]` - Xử lý FileProcessingFailed event thành công
- `❌ [FILE_PROCESSING_FAILED_HANDLE_ERROR]` - Lỗi xử lý FileProcessingFailed event
- `🔄 [FILE_PROCESSING_CANCELLED_HANDLE]` - Bắt đầu xử lý FileProcessingCancelled event
- `📋 [FILE_PROCESSING_CANCELLED_INFO]` - Thông tin file xử lý bị hủy
- `✅ [FILE_PROCESSING_CANCELLED_HANDLE_SUCCESS]` - Xử lý FileProcessingCancelled event thành công
- `❌ [FILE_PROCESSING_CANCELLED_HANDLE_ERROR]` - Lỗi xử lý FileProcessingCancelled event
- `✅ [FILE_PROCESSING_STATUS_PROCESSING_SUCCESS]` - Xử lý file processing status event thành công
- `❌ [FILE_PROCESSING_STATUS_PROCESSING_ERROR]` - Lỗi xử lý file processing status event

**Log Tags:**
- `📨 [AI_EVENT_RECEIVE]` - Nhận AI event từ Kafka
- `⚠️ [AI_EVENT_EMPTY]` - AI event message rỗng
- `🔍 [AI_EVENT_PARSE]` - Parse AI event message
- `📋 [AI_EVENT_INFO]` - Thông tin AI event
- `⏭️ [AI_EVENT_SKIP]` - Event type không phù hợp
- `✅ [AI_EVENT_MATCH]` - Event type phù hợp
- `⚠️ [AI_EVENT_MISSING_FIELDS]` - Thiếu trường bắt buộc
- `📁 [AI_EVENT_FILE_INFO]` - Thông tin file từ AI event
- `📢 [CONTRACT_UPDATED_PREP]` - Chuẩn bị publish ContractUpdated event
- `📋 [CONTRACT_UPDATED_PAYLOAD]` - ContractUpdated payload sẵn sàng
- `📤 [KAFKA_SEND]` - Gửi event lên Kafka
- `✅ [CONTRACT_UPDATED_PUBLISH_SUCCESS]` - Publish ContractUpdated event thành công
- `❌ [AI_EVENT_PROCESSING_ERROR]` - Lỗi xử lý AI event

## Cấu hình Logging

### File Storage Service

```python
# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

### Contract Management Service

```java
// Sử dụng SLF4J với Logback
private static final Logger logger = LoggerFactory.getLogger(ContractKafkaService.class);
```

## Correlation ID

Mỗi request upload sẽ có một `correlation_id` duy nhất được truyền qua các service để theo dõi luồng xử lý:

1. **File Storage Service**: Tạo hoặc nhận `x-correlation-id` từ header
2. **Kafka Events**: Sử dụng `correlationId` trong event payload
3. **Contract Service**: Sử dụng `correlationId` để theo dõi luồng xử lý

## Monitoring và Debugging

### 1. Theo dõi luồng upload hoàn chỉnh:
```bash
# Tìm tất cả logs liên quan đến một correlation_id
grep "abc123" logs/*.log
```

### 2. Theo dõi lỗi:
```bash
# Tìm tất cả lỗi
grep "❌" logs/*.log
```

### 3. Theo dõi Kafka events:
```bash
# Tìm logs liên quan đến Kafka
grep "📢\|📤\|📨" logs/*.log
```

### 4. Theo dõi malware scan:
```bash
# Tìm logs liên quan đến malware scan
grep "🛡️\|🚨\|✅" logs/*.log
```

## Lợi ích của hệ thống logging

1. **Traceability**: Theo dõi được toàn bộ luồng xử lý từ upload đến tạo contract
2. **Debugging**: Dễ dàng xác định vị trí lỗi trong luồng xử lý
3. **Monitoring**: Theo dõi hiệu suất và trạng thái của từng bước
4. **Audit Trail**: Ghi lại lịch sử xử lý cho mục đích audit
5. **Performance Analysis**: Phân tích thời gian xử lý của từng bước

## Troubleshooting

### 1. File upload thất bại
- Kiểm tra logs với tag `❌ [UPLOAD_FAILED]`
- Xác định nguyên nhân từ validation hoặc storage error

### 2. Kafka event không được publish
- Kiểm tra logs với tag `❌ [KAFKA_PUBLISH_FAILED]`
- Xác định vấn đề kết nối Kafka hoặc topic

### 3. Contract không được tạo
- Kiểm tra logs với tag `❌ [CONTRACT_PROCESSING_ERROR]`
- Xác định vấn đề từ AI event hoặc database

### 4. Malware scan thất bại
- Kiểm tra logs với tag `❌ [CLAMAV_SCAN_ERROR]` hoặc `❌ [BASIC_SCAN_ERROR]`
- Xác định vấn đề từ ClamAV daemon hoặc fallback logic
