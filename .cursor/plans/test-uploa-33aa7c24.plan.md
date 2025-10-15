<!-- 33aa7c24-f656-47f9-a5b2-37df5b9a6db0 b9963e00-dcba-4e6c-95e3-c96b3cdf2ee5 -->
# FE render documents list from File Management Service

## Scope
Render `/documents` using `GET /api/v1/file-management-service/v1/files` with pagination/sort. Keep existing cards (`ContractCard`/`GeneralFileCard`).

## Changes

### 1) Types (reuse)
- Reuse `FileApiData` and `RestResponse` from `/_types/file-api.ts`.
- Add a lightweight `FileApiPage<T>` type for list pagination if needed.

### 2) Service (Data access)
- Add `frontend/web-app/src/app/(documents)/documents/_services/file-list-api.ts` with:
  - `fetchFiles(params)` → calls list endpoint with `page,size,sortBy,sortDirection,includeDeleted=false,view=full`.
  - Returns parsed JSON `RestResponse<Page<FileApiData>>`.

### 3) Mapper (API → UI list)
- Add `frontend/web-app/src/app/(documents)/documents/_services/file-list-mapper.ts`:
  - `mapFileApiToUiDocument` (reuse from detail) for each item.
  - `mapFileApiPageToPaginatedDocuments(resp)` → `{ content, totalElements, totalPages }` for UI.
  - Ensure `documentType` is passed through (`CONTRACT` vs GENERAL/null) and `contractMetadata` populated.

### 4) Controller (List page loader)
- Update `frontend/web-app/src/app/(documents)/documents/page.tsx`:
  - Server component preferred: read searchParams (`page`, `size`, `sortBy`, `sortDirection`), default `page=0,size=10,sortBy=createdAt,sortDirection=DESC`.
  - Call `fetchFiles`, map via `mapFileApiPageToPaginatedDocuments`.
  - Render existing `DocumentsTable` with mapped `Paginated<Document>`.
  - Ensure link to detail: `/documents/${doc.id}`.

### 5) DocumentsTable compatibility
- Verify `DocumentsTable.tsx` expects `Paginated<Document>` and decides card: `doc.documentType === 'CONTRACT' ? <ContractCard/> : <GeneralFileCard/>`.
- If it needs props rename/shape, adapt minimal shim in page.tsx before passing.

### 6) Query/pagination controls
- Preserve current UI controls (if any). If none, simple pager:
  - `Next`/`Prev` `Link` using `page`/`size` out of `searchParams`.

### 7) Env/config
- Reuse `NEXT_PUBLIC_FILE_MGMT_BASE_URL`.

### 8) Tests
- Unit: list mapper maps `CONTRACT` and GENERAL items correctly.
- Integration: list page renders both card types; pagination total displayed correctly.

## Snippets

### file-list-api.ts
```ts
import type { FileApiResponse } from '../_types/file-api'
const BASE_URL = process.env.NEXT_PUBLIC_FILE_MGMT_BASE_URL || 'http://localhost:8002'
export async function fetchFiles(params: { page?: number; size?: number; sortBy?: string; sortDirection?: 'ASC'|'DESC'; includeDeleted?: boolean; view?: 'full'|'card'|'table' }): Promise<any> {
  const q = new URLSearchParams({
    page: String(params.page ?? 0),
    size: String(params.size ?? 10),
    sortBy: params.sortBy ?? 'createdAt',
    sortDirection: params.sortDirection ?? 'DESC',
    includeDeleted: String(params.includeDeleted ?? false),
    view: params.view ?? 'full',
  })
  const url = `${BASE_URL}/api/v1/file-management-service/v1/files?${q.toString()}`
  const res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' })
  if (!res.ok) throw new Error(`Fetch files failed: ${res.status} ${res.statusText}`)
  return res.json()
}
```

### file-list-mapper.ts
```ts
import type { Paginated, Document } from '../_types'
import type { FileApiData } from '../_types/file-api'
import { mapFileApiToUiDocument } from './file-mapper'

export function mapFileApiPageToPaginatedDocuments(payload: any): Paginated<Document> {
  const data = payload?.data
  if (Array.isArray(data?.content)) {
    return {
      content: data.content.map((x: FileApiData) => mapFileApiToUiDocument(x)),
      totalElements: Number(data.totalElements ?? 0),
      totalPages: Number(data.totalPages ?? 1),
    }
  }
  return { content: [], totalElements: 0, totalPages: 0 }
}
```

### documents/page.tsx
```ts
import { fetchFiles } from './_services/file-list-api'
import { mapFileApiPageToPaginatedDocuments } from './_services/file-list-mapper'
import DocumentsTable from './_components/DocumentsTable'

export default async function DocumentsPage({ searchParams }: { searchParams: Record<string, string|undefined> }) {
  const page = Number(searchParams.page ?? 0)
  const size = Number(searchParams.size ?? 10)
  const sortBy = String(searchParams.sortBy ?? 'createdAt')
  const sortDirection = (searchParams.sortDirection === 'ASC' ? 'ASC' : 'DESC') as 'ASC'|'DESC'
  let payload
  try { payload = await fetchFiles({ page, size, sortBy, sortDirection, includeDeleted: false, view: 'full' }) } catch (e:any) {
    return <div className="p-6 text-red-600">Lỗi tải danh sách: {e?.message}</div>
  }
  const paginated = mapFileApiPageToPaginatedDocuments(payload)
  return (
    <div className="p-4">
      <DocumentsTable paginatedDocuments={paginated} />
    </div>
  )
}
```

## Edge cases
- `overview.documentType` null → mapper sets `documentType` undefined → `GeneralFileCard`.
- Missing `file.type/size` → undefined; cards already handle fallback.
- Non-200 → hiển thị lỗi gọn.

## Acceptance
- `/documents` hiển thị danh sách từ File API, phân trang hoạt động, card CONTRACT hiện trường hợp hợp đồng, GENERAL hiện thông tin file.

### To-dos

- [ ] Confirm list API types reuse or add FileApiPage<T>
- [ ] Create fetchFiles service for list endpoint
- [ ] Map list response to Paginated<Document>
- [ ] Update /documents/page.tsx to load list from File API
- [ ] Verify DocumentsTable props/conditional render for cards
- [ ] Unit test list mapper for CONTRACT/GENERAL items
- [ ] Integration test list page loader renders cards correctly