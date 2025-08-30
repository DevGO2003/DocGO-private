# Tài liệu Luồng Event trong Hệ thống DocGO

## Tổng quan

Tài liệu này mô tả đầy đủ luồng event từ **File Storage Asset Service** đến **Contract Management Service** và các event handlers đã được bổ sung để đảm bảo tính nhất quán và traceability trong hệ thống.

## Luồng Event Hoàn Chỉnh

### 1. File Upload Flow

```
📤 File Upload Request
    ↓
🚀 File Storage Service (Port 8012)
    ↓
📁 File Processing & Validation
    ↓
☁️ Storage Upload (S3/Local)
    ↓
🛡️ Malware Scanning
    ↓
📢 Kafka: FileUploaded Event
    ↓
📨 Contract Service: FileUploadedEventConsumer
    ↓
💾 File Metadata Creation
    ↓
📢 Kafka: FileReceived Event
```

### 2. AI Processing Flow

```
📨 FileUploaded Event
    ↓
🤖 AI Processing Service
    ↓
🔍 Document Analysis
    ↓
📋 Summary Generation
    ↓
📢 Kafka: SummaryCreated Event
    ↓
📨 Contract Service: ContractKafkaService
    ↓
📋 Contract Creation
    ↓
📢 Kafka: ContractUpdated Event
```

### 3. Contract Management Flow

```
📋 Contract Creation/Update
    ↓
💾 Database Operations
    ↓
📢 Kafka: Contract Status Events
    ↓
📨 Other Services: ContractEventConsumer
    ↓
🔄 Status Synchronization
```

## Các Event Handlers Đã Bổ Sung

### 1. FileUploadedEventConsumer

**Mục đích**: Xử lý FileUploaded events từ File Storage Service

**Topic**: `file.events`

**Event Types**: `FileUploaded`

**Chức năng**:
- Nhận và parse FileUploaded events
- Tạo file metadata records
- Publish FileReceived events
- Logging chi tiết với correlation ID

**Log Tags**:
- `📨 [FILE_UPLOADED_RECEIVE]` - Nhận event
- `🔍 [FILE_UPLOADED_ANALYSIS]` - Phân tích event
- `💾 [FILE_METADATA_CREATE]` - Tạo metadata
- `📢 [FILE_RECEIVED_PUBLISH_START]` - Publish FileReceived

### 2. ContractStatusEventPublisher

**Mục đích**: Publish các contract status change events

**Topic**: `contract.events`

**Event Types**:
- `ContractCreated`
- `ContractUpdated`
- `ContractDeleted`
- `ContractRestored`
- `ContractStatusChanged`

**Chức năng**:
- Publish events khi contract status thay đổi
- Đảm bảo consistency giữa các services
- Logging chi tiết với correlation ID

**Log Tags**:
- `📢 [CONTRACT_*_PUBLISH_START]` - Bắt đầu publish
- `📤 [KAFKA_SEND]` - Gửi lên Kafka
- `✅ [CONTRACT_*_PUBLISH_SUCCESS]` - Publish thành công

### 3. ContractEventConsumer

**Mục đích**: Consume contract events từ các service khác

**Topic**: `contract.events`

**Event Types**: Tất cả contract events

**Chức năng**:
- Nhận và xử lý contract events
- Cập nhật cache, notifications
- Trigger workflows
- Logging chi tiết với correlation ID

**Log Tags**:
- `📨 [CONTRACT_EVENT_RECEIVE]` - Nhận event
- `🔄 [CONTRACT_*_HANDLE]` - Xử lý event
- `📋 [CONTRACT_*_INFO]` - Thông tin event

### 4. FileProcessingStatusConsumer

**Mục đích**: Xử lý file processing status events từ AI Service

**Topic**: `file-processing-status`

**Event Types**:
- `FileProcessingStarted`
- `FileProcessingCompleted`
- `FileProcessingFailed`
- `FileProcessingCancelled`

**Chức năng**:
- Theo dõi trạng thái xử lý file
- Cập nhật contract status
- Trigger notifications
- Logging chi tiết với correlation ID

**Log Tags**:
- `📨 [FILE_PROCESSING_STATUS_RECEIVE]` - Nhận event
- `🔄 [FILE_PROCESSING_*_HANDLE]` - Xử lý event
- `📋 [FILE_PROCESSING_*_INFO]` - Thông tin event

## Kafka Topics

### 1. `file.events`
- **Publisher**: File Storage Asset Service
- **Consumers**: Contract Management Service, AI Processing Service
- **Event Types**: `FileUploaded`

### 2. `ai.events`
- **Publisher**: AI Processing Service
- **Consumers**: Contract Management Service
- **Event Types**: `SummaryCreated`

### 3. `contract.events`
- **Publisher**: Contract Management Service
- **Consumers**: Contract Management Service, Other Services
- **Event Types**: `ContractCreated`, `ContractUpdated`, `ContractDeleted`, `ContractRestored`, `ContractStatusChanged`

### 4. `file-processing-status`
- **Publisher**: AI Processing Service
- **Consumers**: Contract Management Service
- **Event Types**: `FileProcessingStarted`, `FileProcessingCompleted`, `FileProcessingFailed`, `FileProcessingCancelled`

## Correlation ID Flow

```
1. File Upload Request
   ↓
2. File Storage Service generates/uses correlation_id
   ↓
3. FileUploaded Event includes correlationId
   ↓
4. FileUploadedEventConsumer processes with correlationId
   ↓
5. FileReceived Event includes correlationId
   ↓
6. AI Processing Service uses correlationId
   ↓
7. SummaryCreated Event includes correlationId
   ↓
8. ContractKafkaService processes with correlationId
   ↓
9. ContractUpdated Event includes correlationId
   ↓
10. Other consumers use correlationId for tracing
```

## Monitoring và Debugging

### 1. Theo dõi Event Flow

```bash
# Theo dõi tất cả events với correlation ID
grep "correlation_id_here" logs/*.log

# Theo dõi specific event types
grep "📨\|📢\|📤" logs/*.log

# Theo dõi errors
grep "❌" logs/*.log
```

### 2. Kiểm tra Kafka Topics

```bash
# Kiểm tra file.events
kafka-console-consumer --bootstrap-server localhost:9092 --topic file.events --from-beginning

# Kiểm tra ai.events
kafka-console-consumer --bootstrap-server localhost:9092 --topic ai.events --from-beginning

# Kiểm tra contract.events
kafka-console-consumer --bootstrap-server localhost:9092 --topic contract.events --from-beginning

# Kiểm tra file-processing-status
kafka-console-consumer --bootstrap-server localhost:9092 --topic file-processing-status --from-beginning
```

### 3. Health Checks

```bash
# Kiểm tra service status
curl http://localhost:8012/health  # File Storage Service
curl http://localhost:8003/health  # Contract Management Service

# Kiểm tra Kafka connectivity
kafka-topics --bootstrap-server localhost:9092 --list
```

## Lợi ích của Hệ thống Event Hoàn Chỉnh

### 1. **Traceability**
- Theo dõi được toàn bộ luồng xử lý từ upload đến contract creation
- Correlation ID xuyên suốt các services
- Audit trail đầy đủ

### 2. **Decoupling**
- Services không phụ thuộc trực tiếp vào nhau
- Dễ dàng thêm/sửa/xóa services
- Scalability tốt hơn

### 3. **Consistency**
- Event-driven architecture đảm bảo data consistency
- Các services có thể sync status
- Error handling và retry mechanisms

### 4. **Monitoring**
- Real-time monitoring của toàn bộ system
- Performance metrics cho từng step
- Alerting cho failures

### 5. **Debugging**
- Dễ dàng xác định vị trí lỗi
- Logs chi tiết với emoji và tags
- Correlation ID để trace requests

## Troubleshooting

### 1. Event không được publish
- Kiểm tra Kafka connectivity
- Verify topic names và permissions
- Check service logs cho errors

### 2. Event không được consume
- Kiểm tra consumer group configuration
- Verify topic names
- Check consumer logs

### 3. Correlation ID bị mất
- Kiểm tra header forwarding
- Verify event payload structure
- Check logging configuration

### 4. Performance issues
- Monitor Kafka lag
- Check consumer processing time
- Verify resource allocation

## Kết luận

Hệ thống event đã được bổ sung đầy đủ để đảm bảo:

1. **End-to-end traceability** với correlation ID
2. **Comprehensive logging** với emoji và tags
3. **Event-driven architecture** hoàn chỉnh
4. **Error handling** và monitoring
5. **Scalability** và maintainability

Tất cả các event handlers đều có logging chi tiết và error handling, giúp developers và DevOps engineers dễ dàng monitor, debug và maintain hệ thống.
