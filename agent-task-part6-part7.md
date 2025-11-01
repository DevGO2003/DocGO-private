# Agent Task: Phần 6 & Phần 7 - Thay đổi Organizations & Settings

## MỤC TIÊU
Thực hiện các thay đổi theo yêu cầu Phần 6 và Phần 7 cho trang `/organizations` và `/settings`, đồng thời cải thiện xử lý authentication.

---

## PHẦN 6: `/organizations` - Các thay đổi UI

### 1. File: `frontend/webapp/src/features/organizations/views/pages/OrganizationList/OrganizationList.tsx`

#### Thay đổi cần thực hiện:
- **Kiểm tra và đảm bảo hiển thị ngày tổ chức:**
  - File đã có code hiển thị `createdAt` ở dòng 244-250
  - Cần kiểm tra xem API có trả về field `createdAt` hay không
  - Nếu chưa có, cần đảm bảo API trả về field này
  - Format ngày hiện tại: `formatDate(org.createdAt)` - kiểm tra xem có đúng format không

**Kiểm tra:**
```typescript
// Dòng 243-250
{/* Created Date */}
<div className="flex items-center justify-between text-sm">
  <div className="flex items-center gap-1 text-gray-500">
    <Calendar className="w-3 h-3" />
    <span>
      {formatDate(org.createdAt)}
    </span>
  </div>
</div>
```

**Action:** Đảm bảo `org.createdAt` được fetch từ API và hiển thị đúng. Nếu cần, thêm console.log để debug.

---

### 2. File: `frontend/webapp/src/features/organizations/views/pages/OrganizationWorkspace/OrganizationWorkspace.tsx`

#### Thay đổi lớn:

#### A. Thêm nút "Mở danh sách kho" ở Tab Hợp đồng và Kho tài liệu

**Vị trí thay đổi:**
- **Tab Contracts (dòng 284-375):** Thêm nút "Mở danh sách kho" bên trái nút làm mới
- **Tab Repositories (dòng 396-460):** Thêm nút tương tự

**Code cần thêm:**
```typescript
// Trong Tab Contracts, sau dòng 303, trước </CardContent>
<div className="flex items-center gap-2">
  <Button 
    variant="outline"
    onClick={() => navigate(`/organizations/${id}/contracts/full-list`)}
    className="flex items-center gap-2"
  >
    <Folder className="w-4 h-4" />
    Mở danh sách kho
  </Button>
  <Button variant="outline">
    {t('organizations.workspace.filter')}
  </Button>
</div>

// Trong Tab Repositories, trong CardHeader hoặc trước CardContent
<CardHeader>
  <div className="flex items-center justify-between">
    <CardTitle className="flex items-center gap-2">
      <Folder className="w-5 h-5" />
      {t('organizations.workspace.repositoriesTitle')}
    </CardTitle>
    <Button 
      variant="outline"
      onClick={() => navigate(`/organizations/${id}/repositories/full-list`)}
      className="flex items-center gap-2"
    >
      <Folder className="w-4 h-4" />
      Mở danh sách kho
    </Button>
  </div>
</CardHeader>
```

#### B. Gộp Tab Hợp đồng và Tab Chờ phê duyệt thành 1 tab "Hợp đồng"

**Thay đổi:**

1. **Xóa tab "pending-approvals" khỏi type và tabs array:**
   - Dòng 45: Xóa `'pending-approvals'` khỏi `WorkspaceTab` type
   - Dòng 102-109: Xóa object tab có `id: 'pending-approvals'`

2. **Cập nhật Tab Contracts để hiển thị tất cả hợp đồng, ưu tiên hiển thị chờ phê duyệt:**
   - Dòng 284-375: Sửa logic trong tab `contracts`
   - Hiển thị tất cả hợp đồng
   - Các hợp đồng có status `PENDING_APPROVAL` phải được hiển thị HẾT (không giới hạn)
   - Thêm filter/search trong tab này
   - Loại bỏ phần tìm kiếm riêng (nếu có tab tìm kiếm riêng)

**Code mẫu:**
```typescript
// Trong tab contracts, filter và hiển thị
{activeTab === 'contracts' && (
  <div className="space-y-6">
    {/* Search and Filter */}
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={t('organizations.workspace.searchContracts')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            {t('organizations.workspace.filter')}
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Contracts List - Hiển thị tất cả, ưu tiên chờ phê duyệt */}
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('organizations.workspace.allContracts')}</CardTitle>
          {contractsFetching && !contractsLoading && (
            <span className="text-sm text-blue-600 flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
              {t('organizations.workspace.updating')}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {contractsLoading ? (
          <div className="text-center py-12">
            <LoadingSpinner text={t('organizations.workspace.loadingContracts')} />
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{t('organizations.workspace.noContracts')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Hiển thị chờ phê duyệt trước */}
            {contracts
              .filter(c => c.status === 'PENDING_APPROVAL')
              .filter(c => !searchTerm || c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || c.content?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((contract) => (
                // Contract card với highlight
              ))}
            
            {/* Hiển thị các hợp đồng khác */}
            {contracts
              .filter(c => c.status !== 'PENDING_APPROVAL')
              .filter(c => !searchTerm || c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || c.content?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((contract) => (
                // Contract card
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  </div>
)}
```

3. **Xóa Tab Pending Approvals:**
   - Dòng 377-393: XÓA toàn bộ code của tab `'pending-approvals'`

#### C. Di chuyển Stats Cards vào Tab Báo cáo và thêm 2 card mới

**Thay đổi:**

1. **Xóa Stats Cards ở đầu component:**
   - Dòng 198-251: XÓA hoặc comment toàn bộ phần stats cards

2. **Tạo/Update Tab Báo cáo:**
   - Tạo tab `'reports'` nếu chưa có
   - Thêm stats cards vào tab này:
     - Tổng số hợp đồng
     - Đang chờ
     - Đã duyệt
     - Đã từ chối
     - **Tổng số file** (MỚI - cần fetch từ API)
     - **Tổng số repository** (MỚI - dùng `repositoriesData?.totalElements || 0`)

**Code mẫu cho Tab Reports:**
```typescript
{activeTab === 'reports' && (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* Tổng số hợp đồng */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-700 font-medium">{t('organizations.workspace.stats.totalContracts')}</p>
            <p className="text-3xl font-bold text-blue-900">{stats.totalContracts}</p>
          </div>
          <FileText className="w-10 h-10 text-blue-500" />
        </div>
      </motion.div>

      {/* Đang chờ */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-yellow-700 font-medium">{t('organizations.workspace.stats.pending')}</p>
            <p className="text-3xl font-bold text-yellow-900">{stats.pendingApprovals}</p>
          </div>
          <Clock className="w-10 h-10 text-yellow-500" />
        </div>
      </motion.div>

      {/* Đã duyệt */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700 font-medium">{t('organizations.workspace.stats.approved')}</p>
            <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
          </div>
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
      </motion.div>

      {/* Đã từ chối */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-700 font-medium">{t('organizations.workspace.stats.rejected')}</p>
            <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
          </div>
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
      </motion.div>

      {/* Tổng số file - MỚI */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-700 font-medium">Tổng số file</p>
            <p className="text-3xl font-bold text-purple-900">{totalFiles || 0}</p>
          </div>
          <FileIcon className="w-10 h-10 text-purple-500" />
        </div>
      </motion.div>

      {/* Tổng số repository - MỚI */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-indigo-700 font-medium">Tổng số repository</p>
            <p className="text-3xl font-bold text-indigo-900">{repositoriesData?.totalElements || 0}</p>
          </div>
          <Folder className="w-10 h-10 text-indigo-500" />
        </div>
      </motion.div>
    </div>
  </div>
)}
```

**Note:** Cần fetch tổng số file từ API. Có thể dùng hook `useDocuments` hoặc tạo hook mới.

3. **Thay đổi thứ tự tabs:**
   - Dòng 102-109: Sắp xếp lại thứ tự tabs, đặt `'reports'` lên đầu tiên (bên trái "Hợp đồng")

**Code cập nhật:**
```typescript
const tabs = [
  { id: 'reports' as WorkspaceTab, label: t('organizations.workspace.tabs.reports'), icon: BarChart3 },
  { id: 'contracts' as WorkspaceTab, label: t('organizations.workspace.tabs.contracts'), icon: FileText },
  // Xóa pending-approvals
  { id: 'repositories' as WorkspaceTab, label: t('organizations.workspace.tabs.repositories'), icon: Folder },
  { id: 'members' as WorkspaceTab, label: t('organizations.workspace.tabs.members'), icon: Users },
  { id: 'settings' as WorkspaceTab, label: t('organizations.workspace.tabs.settings'), icon: Settings },
];
```

4. **Cập nhật type:**
   - Dòng 45: Cập nhật type `WorkspaceTab`

```typescript
type WorkspaceTab = 'reports' | 'contracts' | 'repositories' | 'members' | 'settings';
```

#### D. Giới hạn hiển thị gần đây và thêm nút "Mở danh sách kho"

- **Tab Contracts:** Chỉ hiển thị 10-20 items gần đây, thêm nút để mở danh sách đầy đủ
- **Tab Repositories:** Tương tự

**Logic cần thêm:**
```typescript
// State để control việc hiển thị đầy đủ hay chỉ gần đây
const [showAllContracts, setShowAllContracts] = useState(false);
const [showAllRepositories, setShowAllRepositories] = useState(false);

// Trong tab contracts
const displayedContracts = showAllContracts 
  ? contracts 
  : contracts.slice(0, 10); // Chỉ hiển thị 10 items gần đây

// Thêm nút "Mở danh sách kho" hoặc "Thu gọn"
{!showAllContracts && contracts.length > 10 && (
  <Button 
    variant="outline"
    onClick={() => setShowAllContracts(true)}
    className="mt-4"
  >
    Mở danh sách kho ({contracts.length} hợp đồng)
  </Button>
)}
```

---

## PHẦN 7: Authentication & Settings

### 3. File: `frontend/webapp/src/shared/lib/api/apiClient.ts`

#### Thay đổi: Xử lý tự động refresh token khi gặp lỗi "Missing or invalid authorization header"

**Vị trí:** Response interceptor (dòng 50-85)

**Thay đổi cụ thể:**

1. **Cải thiện detection của lỗi authorization:**
   - Kiểm tra không chỉ status code 401/403 mà còn cả error message
   - Phát hiện message chứa "Missing or invalid authorization header"

2. **Logic auto-retry:**
   - Khi phát hiện lỗi authorization header
   - Tự động gọi `handleUnauthorized()` để refresh token
   - Retry lại request ban đầu với access token mới

**Code cần thay đổi:**

```typescript
// Thay thế phần response interceptor (dòng 50-85)
this.client.interceptors.response.use(
  (response: any) => {
    if (response.data && typeof response.data.statusCode === 'number') {
      const statusCode = response.data.statusCode
      const isSuccess = statusCode === 200 || statusCode === 201 || statusCode === 204
      if (!isSuccess) {
        const error = { response: { status: response.status, data: response.data } }
        this.handleApiError(error)
        return Promise.reject(error)
      }
    }
    return response
  },
  async (error: any) => {
    const originalRequest = error.config
    const responseData = error.response?.data
    
    // Extract error message
    const errorMessage = (responseData?.description || responseData?.shortMessage || '').toLowerCase()
    
    // Check for "Missing or invalid authorization header" message
    const isAuthHeaderError = errorMessage.includes('missing') || 
                             errorMessage.includes('invalid authorization') ||
                             errorMessage.includes('authorization header')
    
    // Check for 401/403 status
    const isUnauthorized = error.response?.status === 401 || 
                          error.response?.data?.statusCode === 401 ||
                          isAuthHeaderError
    const isForbidden = error.response?.status === 403 || 
                       error.response?.data?.statusCode === 403
    
    // Auto retry với refresh token
    if ((isUnauthorized || isForbidden) && !originalRequest._retry) {
      originalRequest._retry = true
      
      if (env.isDev) {
        console.log('[API] Detected authorization error, attempting token refresh...', {
          isAuthHeaderError,
          status: error.response?.status,
          message: errorMessage
        })
      }
      
      try {
        const refreshSuccess = await this.handleUnauthorized()
        if (refreshSuccess) {
          const newToken = this.getAuthToken()
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            if (env.isDev) {
              console.log('[API] Token refreshed successfully, retrying request...', originalRequest.url)
            }
            return this.client(originalRequest)
          }
        }
      } catch (retryError) {
        console.error('[API] Request retry failed:', retryError)
        // Logout user nếu refresh token cũng thất bại
        this.logout()
      }
    }
    this.handleApiError(error)
    return Promise.reject(error)
  }
)
```

**Lưu ý:**
- Đảm bảo logic `handleUnauthorized()` và `doTokenRefresh()` đã hoạt động đúng
- Có thể cần thêm logic để tránh loop vô hạn (giới hạn số lần retry)

---

### 4. File: `frontend/webapp/src/shared/lib/api/enhancedApiClient.ts` (Nếu có sử dụng)

**Thay đổi tương tự như apiClient.ts:**
- Dòng 73-104: Cập nhật response interceptor với logic tương tự
- Đảm bảo consistency giữa 2 API clients

---

### 5. File: `frontend/webapp/src/features/settings/views/pages/Settings.tsx`

#### Thay đổi: Kiểm tra Preview content của detail file

**Vấn đề:** Cần kiểm tra xem preview content của detail file đã sử dụng PreviewPanel hay vẫn còn là plaintext.

**Hành động:**

1. **Tìm kiếm các component/file liên quan đến preview trong Settings:**
   - Kiểm tra xem có component nào trong Settings hiển thị file detail/preview không
   - Nếu có, kiểm tra xem đã dùng `PreviewPanel` hay chưa

2. **Nếu cần thêm Preview:**
   - Import `PreviewPanel` từ `@shared/components`
   - Thay thế plaintext preview bằng `PreviewPanel`

**Code mẫu (nếu cần):**
```typescript
import { PreviewPanel } from '@shared/components';

// Trong component
<PreviewPanel
  selectedFile={selectedFile}
  title="File Preview"
  placeholder="Chọn file để xem trước"
>
  {/* Preview content */}
  {selectedFile && (
    <div>
      {/* Render preview based on file type */}
    </div>
  )}
</PreviewPanel>
```

**Note:** File Settings.tsx hiện tại không có preview file. Cần xác định xem có component nào khác trong Settings liên quan đến file preview không. Nếu không có, có thể bỏ qua task này hoặc hỏi lại user.

---

## TÓM TẮT CHECKLIST

### Phần 6: Organizations
- [ ] Kiểm tra hiển thị ngày tổ chức trong OrganizationList.tsx
- [ ] Thêm nút "Mở danh sách kho" ở Tab Contracts (OrganizationWorkspace.tsx)
- [ ] Thêm nút "Mở danh sách kho" ở Tab Repositories (OrganizationWorkspace.tsx)
- [ ] Gộp tab Hợp đồng và Chờ phê duyệt thành 1 tab
- [ ] Xóa tab "pending-approvals"
- [ ] Cập nhật logic hiển thị hợp đồng (ưu tiên chờ phê duyệt)
- [ ] Di chuyển Stats Cards vào Tab Báo cáo
- [ ] Thêm card "Tổng số file" vào Tab Báo cáo
- [ ] Thêm card "Tổng số repository" vào Tab Báo cáo
- [ ] Thay đổi thứ tự tabs (Báo cáo lên đầu)
- [ ] Giới hạn hiển thị gần đây cho Tab Contracts
- [ ] Giới hạn hiển thị gần đây cho Tab Repositories

### Phần 7: Authentication & Settings
- [ ] Cập nhật apiClient.ts để xử lý "Missing or invalid authorization header"
- [ ] Thêm auto-retry logic với refresh token
- [ ] Cập nhật enhancedApiClient.ts (nếu có dùng)
- [ ] Kiểm tra và cập nhật Preview content trong Settings.tsx (nếu có)

---

## LƯU Ý

1. **API Changes:** Một số thay đổi có thể cần API support (ví dụ: fetch tổng số file). Cần kiểm tra backend có API này chưa.

2. **Translation Keys:** Một số text mới cần thêm translation keys. Kiểm tra file i18n và thêm các keys cần thiết.

3. **Routing:** Nếu thêm route mới cho "Mở danh sách kho", cần update routing config.

4. **Testing:** Sau khi thay đổi, cần test:
   - Auto refresh token khi gặp lỗi authorization
   - Tab switching và data display
   - Filter/search trong tab hợp đồng
   - Stats cards trong tab báo cáo

---

## FILES TỔNG HỢP

1. `frontend/webapp/src/features/organizations/views/pages/OrganizationList/OrganizationList.tsx`
2. `frontend/webapp/src/features/organizations/views/pages/OrganizationWorkspace/OrganizationWorkspace.tsx`
3. `frontend/webapp/src/shared/lib/api/apiClient.ts`
4. `frontend/webapp/src/shared/lib/api/enhancedApiClient.ts` (nếu có dùng)
5. `frontend/webapp/src/features/settings/views/pages/Settings.tsx`
6. Có thể cần thêm file API nếu cần fetch data mới (tổng số file)

---

**Ngày tạo:** 2024
**Trạng thái:** Chưa thực hiện

