<!-- 33aa7c24-f656-47f9-a5b2-37df5b9a6db0 f189ba15-343a-44cd-ac1a-600446c1269d -->
# Kế hoạch: Chuẩn hóa schema document card và UI

## Phạm vi
- Cập nhật schema tài liệu theo yêu cầu: `documentType` là MIME/extension; `category` là loại nghiệp vụ (ví dụ: HOP_DONG_DICH_VU).
- Migration full dữ liệu hiện có; logic xác định category: ưu tiên user metadata, fallback AI.
- Cập nhật API Document Service, Automation Service, Frontend hiển thị card.

## Thay đổi chính
### 1) Backend – Document Management Service (Spring)
- Sửa entity `DocumentEntity` và DTO response:
  - `documentType: string` (MIME), `extension: string`, `category: enum|string`.
  - Thêm `contractMetadata` (optional) chỉ khi category là hợp đồng.
- Cập nhật repository/query nếu có filter theo documentType cũ.
- Adapter mapping từ DB → API response theo chuẩn mới.
- Endpoint `GET /documents` vẫn giữ params cũ; không trả HTTP 204, dùng statusCode 204 trong body như tiêu chuẩn hiện có.

### 2) Backend – Automation Service (FastAPI)
- Khi upload, điền `documentType` từ `file.content_type`, `extension` từ tên file.
- Xác định `category` theo chiến lược kết hợp (user metadata > AI fallback).
- Nếu category là hợp đồng, tạo `contractMetadata` (effectiveDate/expiryDate/totalValue/currency) từ AI hoặc payload.
- Publish Kafka event với payload chuẩn mới để đồng bộ sang Document Service.

### 3) Migration dữ liệu (full)
- Viết job migration (1 lần) đọc tất cả documents:
  - Điền `documentType` từ metadata/s3Key/filename → map MIME.
  - Suy luận `extension` từ filename.
  - Xác định `category`: nếu có dữ liệu hợp đồng (effective/expiry/totalValue) → HOP_DONG_CHUNG; nếu có nhãn AI → map tương ứng; nếu có user metadata → ưu tiên.
  - Chuẩn hóa record và lưu lại.
- Ghi log progress và id các bản ghi lỗi để retry.

### 4) Frontend – web-app
- Cập nhật types `Document` theo schema mới.
- `DocumentsTable.tsx`: chọn card theo `category` (bắt đầu bằng `HOP_DONG_` → `ContractCard`, ngược lại `GeneralFileCard`).
- `ContractCard.tsx`: dùng `contractMetadata.*` thay cho field rải rác; fallback hiển thị `N/A` nếu thiếu.
- Hiển thị badge loại file theo `extension` (fallback `documentType`).

### 5) API Contract & Docs
- Cập nhật OpenAPI/Swagger mô tả output mới (Java SpringDoc + FastAPI docs) theo Event & API Standards.
- Đảm bảo backward-compat tạm thời: nếu client cũ đọc trường cũ, thêm mapper tạm (deprecate) trong 1 phiên bản.

### 6) Kiểm thử
- Unit + Integration cho mapping/migration.
- E2E: upload nhỏ (<2MB) sync và lớn (>=2MB) async, xác minh WebSocket progress, xác minh hiển thị UI mới.
- Kiểm tra `getAllDocuments` trả đúng dữ liệu sau migration.

## Rủi ro & Giảm thiểu
- Sai map MIME: dùng thư viện chuẩn + danh sách override.
- Dữ liệu thiếu contract fields: set `category` non-contract, hoặc `HOP_DONG_CHUNG` và `contractMetadata` rỗng, ghi log để xử lý thủ công.
- Tương thích ngược: giữ field cũ ở DTO trong 1 phiên bản với @JsonProperty(access = READ_ONLY) và đánh dấu deprecated (tuỳ chọn), hoặc chỉ cập nhật FE đồng bộ.


### To-dos

- [ ] Cập nhật DocumentEntity/DTO: documentType, extension, category, contractMetadata
- [ ] Update mapper từ DB → API response theo schema mới
- [ ] Automation Service set documentType/extension và xác định category (metadata > AI)
- [ ] Chuẩn hóa payload Kafka đồng bộ sang Document Service
- [ ] Viết job migration full chuẩn hóa dữ liệu cũ
- [ ] Cập nhật types FE theo schema mới
- [ ] Sửa DocumentsTable chọn card theo category; ContractCard dùng contractMetadata
- [ ] Cập nhật Swagger/OpenAPI mô tả schema mới
- [ ] Unit/Integration test cho mapper, migration, upload
- [ ] E2E: upload sync/async, WebSocket progress, FE hiển thị