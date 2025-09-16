# Docker Local Development

Khởi động môi trường phát triển local với Docker Compose cho tất cả services của DocGO.

## Mô tả
Command này sẽ khởi động tất cả microservices của DocGO trong môi trường development với hot reload và volume mount.

## Cách sử dụng
Gõ /docker-local trong Agent input để chạy command này.

## Lệnh thực thi
`ash
docker-compose -f docker-compose.local.yml up -d
`

## Kết quả mong đợi
- Tất cả services sẽ được khởi động trên các port cố định
- API Gateway BFF: http://localhost:8000
- Authentication Service: http://localhost:8001  
- User Management Service: http://localhost:8002
- Contract Management Service: http://localhost:8003
- AI Processing Service: http://localhost:8017
- Và các services khác theo port mapping đã định

## Lưu ý
- Đảm bảo Docker Desktop đang chạy
- Kiểm tra port không bị conflict
- Sử dụng docker-local-logs để xem logs
- Sử dụng docker-local-down để dừng services
