<!-- 4c6a3fdf-3586-4e06-b51f-30c78753ec9f 8b2eaffd-a5bf-4627-ba2d-dc14a1217646 -->
# Kế hoạch kiểm thử (Docker Compose + timeout 20s)

## Chuẩn bị

- ENV tối thiểu (một terminal):
```bash
export AS_BASE_URL=http://localhost:8003
export DS_BASE_URL=http://localhost:8002
export MAX_SYNC_SIZE=2097152   # 2MB
export S3_ENABLED=false        # hybrid: ưu tiên local trước
```

- Tạo thư mục local: `mkdir -p backend/automation-service/uploads`
- Đảm bảo cổng trống: 3000, 8002, 8003

## Khởi động dịch vụ (timeout 20s)

- Chọn một compose file có sẵn (ưu tiên script/local nếu có):
```bash
timeout 20s docker compose -f script/docker-compose.local.yml up -d || true
# hoặc
timeout 20s docker compose -f script/docker-compose.dev.yml up -d || true
# hoặc
timeout 20s docker compose up -d || true
```

- Trạng thái và log gần đây:
```bash
docker compose ps
docker compose logs --since=30s
```


## Health checks (mỗi lệnh timeout 20s)

```bash
# Gateway
timeout 20s curl -sf http://localhost:3000/api/health || true
# Automation Service
timeout 20s curl -sf http://localhost:8003/health || true
# Document Service (swagger UI hiển thị)
timeout 20s curl -sf http://localhost:8002/docs || true
```

Nếu lỗi: `docker compose logs --since=30s web-app automation-service document-management-service`

## Test upload nhỏ (≤2MB) — 201 + COMPLETED

```bash
# Chuẩn bị file nhỏ nếu chưa có
dd if=/dev/urandom of=/tmp/small.pdf bs=1024 count=100 2>/dev/null

# Upload
timeout 20s curl -s -H "Content-Type: multipart/form-data" \
 -F "file=@/tmp/small.pdf" \
 http://localhost:3000/api/files/upload | tee /tmp/upload_small.json | jq .

# Xác thực
doc=$(jq -r '.data.documentId' /tmp/upload_small.json)
echo "documentId=$doc"
# GET document
timeout 20s curl -s http://localhost:3000/api/documents/${doc} | jq .
```

Nếu fail: `docker compose logs --since=30s automation-service document-management-service`

## Test upload lớn (>2MB) — 202 + PROCESSING + WS progress

```bash
# Chuẩn bị file lớn ~3MB
dd if=/dev/urandom of=/tmp/big.pdf bs=1024 count=3072 2>/dev/null

# Upload
timeout 20s curl -s -H "Content-Type: multipart/form-data" \
 -F "file=@/tmp/big.pdf" \
 http://localhost:3000/api/files/upload | tee /tmp/upload_big.json | jq .

DOC_ID=$(jq -r '.data.documentId' /tmp/upload_big.json)
echo "documentId=$DOC_ID"

# WS progress (nếu có wscat)
timeout 20s wscat -c ws://localhost:8003/api/v1/automation-service/v1/documents/progress/${DOC_ID} || true

# Poll trạng thái đến COMPLETED (tối đa 10 lần)
for i in {1..10}; do 
  timeout 20s curl -s http://localhost:3000/api/documents/${DOC_ID} | jq -r '.data.processingStatus'; 
  sleep 2; 
done
```

Nếu không COMPLETED trong ~20s: `docker compose logs --since=60s automation-service document-management-service`

## Test trực tiếp endpoints documents (qua Gateway)

```bash
# POST create (rời)
timeout 20s curl -s -X POST http://localhost:3000/api/documents \
 -H 'Content-Type: application/json' \
 -d '{"fileName":"demo.pdf","fileSize":123,"fileType":"application/pdf","processingStatus":"PENDING"}' | jq .

# PUT update processing-result
timeout 20s curl -s -X PUT http://localhost:3000/api/documents/${DOC_ID} \
 -H 'Content-Type: application/json' \
 -d '{"processingStatus":"COMPLETED","ocrText":"","classificationResult":{}}' | jq .

# GET
timeout 20s curl -s http://localhost:3000/api/documents/${DOC_ID} | jq .
```

## Tiêu chí pass/fail

- Upload nhỏ: `statusCode=201`, `data.processingStatus=COMPLETED`, GET trả `COMPLETED`.
- Upload lớn: `statusCode=202`, WS nhận 20/50/70/90/100; GET chuyển `COMPLETED` trong <= ~20s.
- Mọi response là `RestResponse` (HTTP 200), không trả HTTP 204.

## Dọn dẹp (tùy chọn)

```bash
timeout 20s docker compose down || true
```

### To-dos

- [ ] Thêm routes proxy `/api/files/*` và `/api/documents/*` tại Next.js Gateway
- [ ] Triển khai AS `POST /documents/upload` hybrid storage sync/async + gọi DS
- [ ] Thêm WS `/progress/{documentId}` và phát tiến độ trong pipeline
- [ ] Bổ sung/đảm bảo DS POST/PUT/GET documents với JSONB
- [ ] Thêm ENV và config cho hybrid storage và MAX_SYNC_SIZE
- [ ] Chạy curl/wscat test các luồng nhỏ/lớn và xác nhận RestResponse