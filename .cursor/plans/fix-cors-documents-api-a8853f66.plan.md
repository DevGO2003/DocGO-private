<!-- a8853f66-29c9-4742-91bb-50654ff3d5e3 f0c8a659-28e9-4005-af65-da33db45d651 -->
# Implement Document Card Types - Contract vs Document

## Phân tích hiện trạng

### Backend Structure
- **DocumentEntity**: Có các trường cơ bản (title, description, status, fileType, fileSize, category, tags)
- **Contract**: Có thêm contractNumber, contractType, parties, totalValue, effectiveDate, expiryDate, riskLevel
- Frontend đang map tất cả documents thành Contract format (sai)

### Frontend Current State
- File: `frontend/web-app/src/app/(documents)/documents/page.tsx`
- Type: `frontend/web-app/src/app/(documents)/documents/_types/index.ts`
- Component: `frontend/web-app/src/app/(documents)/documents/_components/DocumentsTable.tsx`
- Tab hiện tại: "Tất cả file" vs "File hợp đồng" (line 301-312)
- Logic filter: `activeTab === 'all' ? items : items.filter(c => c.contractNumber || c.contractType)`

## Kế hoạch thực hiện

### 1. Bổ sung dữ liệu mẫu vào MongoDB

**Collection**: `documents`
**Add 5 records** tài liệu thông thường (không phải contract):

```javascript
{
  id: "DOC-2024-001",
  title: "Báo cáo tài chính Q1 2024",
  description: "Báo cáo tài chính quý 1 năm 2024",
  status: "ACTIVE",
  fileType: "PDF",
  fileSize: 2621440, // 2.5 MB
  category: "Financial Report",
  tags: ["tài-chính", "2024", "quan-trọng"],
  userId: "system",
  fileName: "bao-cao-tai-chinh-q1-2024.pdf"
}
```

**5 records cần thêm:**
1. Báo cáo tài chính Q1 2024 (PDF, Financial Report)
2. Hướng dẫn sử dụng hệ thống (DOCX, User Guide)
3. Kế hoạch kinh doanh 2024 (PDF, Business Plan)
4. Báo cáo dự án IT (PDF, Project Report)
5. Tài liệu đào tạo nhân viên (PPT, Training Material)

**Action**: Sử dụng MongoDB MCP tools để insert documents

### 2. Update Backend Response

**File**: `backend/document-management-service/src/main/java/com/devgo2003/docgo/document_service/controller/DocumentController.java`

**Hiện trạng**: Endpoint `/documents` trả về mixed documents và contracts

**Action cần làm**:
- Kiểm tra endpoint có phân biệt document type không
- Nếu cần: Thêm field `documentType` hoặc `isContract` vào response
- Logic phân biệt: Nếu có `contractNumber` → Contract, ngược lại → Document

### 3. Update Frontend Types

**File**: `frontend/web-app/src/app/(documents)/documents/_types/index.ts`

**Changes**:
```typescript
// Base type cho tất cả documents
export type BaseDocument = {
  id: string
  title: string
  description?: string
  status: string
  tags?: string[]
  createdAt: string
  updatedAt: string
  fileType?: string
  fileSize?: number
  fileName?: string
  userId?: string
  category?: string
}

// Type cho Contract (extends BaseDocument)
export type ContractDocument = BaseDocument & {
  documentType: 'contract'
  contractNumber: string
  contractType: string
  parties: Party[]
  totalValue: number
  currency: string
  effectiveDate: string
  expiryDate: string
  riskLevel?: string
}

// Type cho Document thông thường
export type RegularDocument = BaseDocument & {
  documentType: 'document'
  author?: string
}

// Union type
export type Document = ContractDocument | RegularDocument
```

### 4. Create Document Card Component

**New File**: `frontend/web-app/src/app/(documents)/documents/_components/RegularDocumentCard.tsx`

**Structure**:
```tsx
// Card cho tài liệu thông thường
// - Header: Icon file + Title + Status badge
// - Metadata: Mã TL, Description
// - Tags row: [PDF] [#tag1] [#tag2]
// - Info: Author, Created date, File size
// - Actions: View detail, Preview, Download
```

**Design như hình đã gửi**:
- Background: Dark blue gradient
- Icon: File type icon (PDF, DOCX, etc.)
- Layout: Compact, clear hierarchy
- Actions: 3 buttons bottom (Detail, Preview, Download)

### 5. Update DocumentsTable Component

**File**: `frontend/web-app/src/app/(documents)/documents/_components/DocumentsTable.tsx`

**Changes**:
- Add type guard: `isContract(doc: Document): doc is ContractDocument`
- Render logic:
  ```tsx
  {items.map(doc => 
    isContract(doc) 
      ? <ContractCard key={doc.id} document={doc} />
      : <RegularDocumentCard key={doc.id} document={doc} />
  )}
  ```

### 6. Update Tab Filter Logic

**File**: `frontend/web-app/src/app/(documents)/documents/page.tsx`

**Current filter** (line 353):
```tsx
activeTab === 'all' ? items : items.filter(c => c.contractNumber || c.contractType)
```

**New filter**:
```tsx
const filteredItems = activeTab === 'all' 
  ? items 
  : items.filter(doc => doc.documentType === 'contract')
```

### 7. Update API Mapper

**File**: `frontend/web-app/src/app/(documents)/documents/_services/mappers.ts`

**Update `mapApiDocumentToUi`**:
- Detect document type from API response
- Map to correct type (ContractDocument or RegularDocument)
- Set `documentType` field

**Logic phân biệt**:
```typescript
const documentType = apiDoc.contractNumber ? 'contract' : 'document'
```

## Rủi ro và xử lý

### Risk 1: Backend không trả về field phân biệt
**Solution**: Frontend tự detect dựa trên `contractNumber` presence

### Risk 2: Existing data không có author/userId
**Solution**: Fallback to "system" hoặc "Không xác định"

### Risk 3: File size không có
**Solution**: Display "N/A" hoặc ẩn field

### Risk 4: UI layout break
**Solution**: Responsive design với breakpoints

## Testing checklist

- [ ] MongoDB có 5 records tài liệu thông thường
- [ ] Tab "Tất cả file" hiển thị cả Contract và Document cards
- [ ] Tab "File hợp đồng" chỉ hiển thị Contract cards
- [ ] Contract cards giữ nguyên design hiện tại
- [ ] Document cards hiển thị đúng theo design mới
- [ ] Actions (view, preview, download) hoạt động
- [ ] Responsive trên mobile/tablet
- [ ] Loading states và error handling

## Files cần sửa

1. Backend: Không cần sửa (có thể check endpoint)
2. Frontend Types: `_types/index.ts`
3. New Component: `_components/RegularDocumentCard.tsx`
4. Update Component: `_components/DocumentsTable.tsx`
5. Update Mapper: `_services/mappers.ts`
6. Update Page: `page.tsx` (filter logic)
7. MongoDB: Insert 5 documents via MCP tools

### To-dos

- [ ] Thêm 5 records tài liệu thông thường vào MongoDB collection documents
- [ ] Update TypeScript types để phân biệt Contract và Regular Document
- [ ] Tạo component RegularDocumentCard.tsx với design mới
- [ ] Update DocumentsTable để render đúng card type
- [ ] Update tab filter logic trong page.tsx
- [ ] Update API mapper để detect document type
- [ ] Test tất cả scenarios và verify UI