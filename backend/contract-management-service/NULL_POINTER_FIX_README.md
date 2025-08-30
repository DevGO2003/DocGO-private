# Sửa lỗi NullPointerException trong ContractKafkaService

## Vấn đề
Lỗi `NullPointerException` xảy ra ở dòng 72 trong `ContractKafkaService.java` khi cố gắng gọi `fileInformation.get("fileId")` vì biến `fileInformation` là `null`.

## Nguyên nhân
Biến `fileInformation` có thể là `null` nếu:
1. `data` không chứa key `"file_information"`
2. Giá trị của `"file_information"` là `null`
3. Các trường khác trong event cũng có thể là `null`

## Giải pháp đã thực hiện

### 1. Thêm kiểm tra null cho `event`
```java
if (event == null) {
    logger.error("event is null");
    return;
}
```

### 2. Thêm kiểm tra null cho `data` và `actor`
```java
if (data == null) {
    logger.error("data is null in event: {}", event);
    return;
}

if (actor == null) {
    logger.error("actor is null in event: {}", event);
    return;
}
```

### 3. Thêm kiểm tra null cho `fileInformation`
```java
if (fileInformation == null) {
    logger.error("file_information is null in event data: {}", data);
    return;
}
```

### 4. Thêm kiểm tra null cho các trường bắt buộc
```java
if (fileId == null || filename == null || summary == null) {
    logger.error("Required fields are null - fileId: {}, filename: {}, summary: {}", fileId, filename, summary);
    return;
}
```

### 5. Thêm kiểm tra null cho `contractSummary`
```java
if (contractSummary == null) {
    logger.error("contract_summary is null in event data: {}", data);
    return;
}
```

### 6. Thêm kiểm tra null cho các method khác
- `saveContractSummary()`
- `saveContractFile()`
- `saveDetailedContractSummary()`
- `publishContractUpdated()`

## Các thay đổi trong code

### Method `processSummaryCreated()`
- Thêm kiểm tra null cho tất cả các tham số quan trọng
- Log lỗi chi tiết khi có giá trị null
- Return sớm để tránh xử lý tiếp

### Method `saveContractSummary()`
- Kiểm tra null cho `contractId`, `fileInformation`, `contractSummary`, `event`
- Log lỗi và return sớm nếu có tham số null

### Method `saveContractFile()`
- Kiểm tra null cho `contractId`, `fileInformation`, `event`
- Log lỗi và return sớm nếu có tham số null

### Method `saveDetailedContractSummary()`
- Kiểm tra null cho `contractId`, `contractSummary`
- Log lỗi và return sớm nếu có tham số null

### Method `publishContractUpdated()`
- Kiểm tra null cho tất cả các tham số
- Log lỗi và return sớm nếu có tham số null

## Lợi ích của việc sửa lỗi

1. **Tránh crash**: Ứng dụng không bị crash khi gặp dữ liệu null
2. **Logging tốt hơn**: Có thể theo dõi được chính xác vấn đề ở đâu
3. **Xử lý graceful**: Return sớm thay vì tiếp tục xử lý với dữ liệu không hợp lệ
4. **Dễ debug**: Có thể xác định được nguyên nhân gốc rễ của vấn đề

## Test cases đã thêm

File test `ContractKafkaServiceTest.java` bao gồm các test case:
- Test với event null
- Test với data null
- Test với actor null
- Test với file_information null
- Test với contract_summary null
- Test với các trường bắt buộc null
- Test với dữ liệu hợp lệ

## Khuyến nghị

1. **Kiểm tra dữ liệu đầu vào**: Đảm bảo rằng các service gửi event có cung cấp đầy đủ dữ liệu
2. **Validation**: Thêm validation cho dữ liệu đầu vào ở tầng controller hoặc service
3. **Schema validation**: Sử dụng JSON schema để validate event structure
4. **Monitoring**: Theo dõi log để phát hiện sớm các vấn đề về dữ liệu

## Cách test

```bash
# Chạy test
mvn test -Dtest=ContractKafkaServiceTest

# Hoặc chạy toàn bộ test
mvn test
```
