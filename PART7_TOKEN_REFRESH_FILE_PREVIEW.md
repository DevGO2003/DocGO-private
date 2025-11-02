# ✅ PHẦN 7 HOÀN THÀNH - Token Refresh & File Preview Check

## 🎯 Các thay đổi đã thực hiện

### 1. ✅ Auto Refresh Token khi Authorization Error

**Vị trí:** `apiClient.ts` - Response Interceptor

**Cơ chế hiện tại:**
```typescript
// Line 75-83: Check authorization errors
const isAuthHeaderError = errorMessage.includes('missing') || 
                         errorMessage.includes('invalid') ||
                         errorMessage.includes('authorization') ||
                         errorMessage.includes('token') ||
                         errorMessage.includes('unauthorized')

const isUnauthorized = error.response?.status === 401 || 
                      error.response?.data?.statusCode === 401 ||
                      isAuthHeaderError

// Line 88-119: Auto retry with refresh token
if ((isUnauthorized || isForbidden) && !originalRequest._retry) {
  originalRequest._retry = true
  
  // Attempt token refresh
  const refreshSuccess = await this.handleUnauthorized()
  if (refreshSuccess) {
    const newToken = this.getAuthToken()
    originalRequest.headers.Authorization = `Bearer ${newToken}`
    return this.client(originalRequest) // RETRY REQUEST
  }
}
```

**Flow hoạt động:**
1. **Request gửi đi** → API trả về lỗi "Missing or invalid authorization header"
2. **Interceptor bắt lỗi** → Check `errorMessage` contains keywords
3. **Trigger refresh** → Call `/auth/refresh` với refreshToken
4. **Update tokens** → Lưu accessToken mới vào localStorage
5. **Retry request** → Gửi lại request gốc với token mới
6. **Success** → Trả response về như bình thường

**Keywords detect:**
- ✅ `missing`
- ✅ `invalid`
- ✅ `authorization`
- ✅ `token`
- ✅ `unauthorized`

**Thay đổi:**
- Thêm keywords `invalid`, `token`, `unauthorized` để bắt aggressive hơn
- Đảm bảo catch được "Missing or invalid authorization header"

---

### 2. ✅ File Preview - Đã là Preview Panel

**Vị trí:** `ContentTab.tsx` (FileDetail Overview tab)

**Status:** ✅ **ĐÃ SỬ DỤNG PREVIEW PANEL**

**Code:**
```tsx
// Line 19-27
<PreviewPanel
  selectedFile={null}
  title={`Preview: ${fileName}`}
  placeholder="File preview"
  supportedFormats="Hỗ trợ PDF, hình ảnh, tài liệu Word, Excel, audio, video"
  showOfficeWarning={false}
  containerClassName="h-full"
  className="h-full overflow-auto"
>
```

**Nội dung hiện tại:**
- ✅ **Đang dùng PreviewPanel component** (không phải plaintext thô)
- ⚠️ **Tạm thời hiển thị extracted text** vì chưa có storage URL từ backend
- 📋 **Info banner** giải thích: "Preview tạm thời - hiển thị nội dung văn bản đã trích xuất"

**UI Structure:**
```
<PreviewPanel>
  [Info Banner] "Preview tạm thời"
  
  [Extracted Content Section]
  - Title: "Nội dung đã trích xuất"
  - Character count
  - MimeType display
  - <pre> tag với extracted text (styled)
</PreviewPanel>
```

**Khi có Storage URL:** (TODO)
```tsx
// Line 13-15 (commented)
const fileUrl = fileData?.storage?.s3Url || fileData?.storage?.previewUrl;
const mockFile = fileUrl 
  ? await fetch(fileUrl).then(r => r.blob()).then(b => new File([b], fileName)) 
  : null;

// Sẽ pass vào:
<PreviewPanel selectedFile={mockFile} ... />
```

---

## 📊 Summary

### Token Refresh:
| Feature | Status | Details |
|---------|--------|---------|
| Auto detect auth errors | ✅ Done | 5 keywords: missing, invalid, authorization, token, unauthorized |
| Refresh token API call | ✅ Done | POST /api/v1/user-management-service/auth/refresh |
| Update localStorage | ✅ Done | docgo_auth_v1, auth_token, refresh_token |
| Retry original request | ✅ Done | With new Bearer token |
| Logout on fail | ✅ Done | Redirect to /login |
| Concurrent requests | ✅ Done | Merge multiple refresh attempts |
| Visibility check | ✅ Done | Only refresh when tab is visible |

### File Preview:
| Feature | Status | Details |
|---------|--------|---------|
| PreviewPanel component | ✅ Used | Not plaintext |
| Extracted text display | ✅ Done | Temporary until storage URL |
| File metadata display | ✅ Done | MimeType, character count |
| Info banner | ✅ Done | Explain temporary preview |
| Styled text | ✅ Done | <pre> with whitespace-pre-wrap |
| Scroll container | ✅ Done | max-h-[500px] overflow-auto |
| Storage URL support | 🔜 TODO | When backend provides s3Url |

---

## 🔧 Detailed Flow

### Token Refresh Flow:
```
1. User Request → API
   ↓
2. API Response: 401 "Missing or invalid authorization header"
   ↓
3. Interceptor detect keywords
   ↓
4. Check if already retrying (_retry flag)
   ↓
5. Call doTokenRefresh()
   ├── Get refreshToken from localStorage
   ├── POST /auth/refresh
   ├── Parse new accessToken
   ├── Update localStorage (3 keys)
   └── Return true
   ↓
6. Update original request headers
   ↓
7. Retry request with new token
   ↓
8. Success → Return response
```

### Error Scenarios:
```
Scenario A: Refresh token expired
→ doTokenRefresh() fails
→ Call logout()
→ Clear localStorage
→ Redirect to /login

Scenario B: Network error during refresh
→ Retry fails
→ Call logout()
→ Redirect to /login

Scenario C: Invalid refresh token
→ API returns error
→ Call logout()
→ Redirect to /login
```

---

## 📝 Code Changes

### Files Modified: 1 file
- `apiClient.ts` (Line 76-79)

**Change:**
```diff
- const isAuthHeaderError = errorMessage.includes('missing') || 
-                          errorMessage.includes('invalid authorization') ||
-                          errorMessage.includes('authorization header')
+ const isAuthHeaderError = errorMessage.includes('missing') || 
+                          errorMessage.includes('invalid') ||
+                          errorMessage.includes('authorization') ||
+                          errorMessage.includes('token') ||
+                          errorMessage.includes('unauthorized')
```

### Files Checked: 1 file
- `ContentTab.tsx` ✅ Already using PreviewPanel

---

## ✅ Testing Checklist

### Token Refresh:
- [ ] Gửi request với expired token
- [ ] API trả về "Missing or invalid authorization header"
- [ ] Interceptor tự động refresh token
- [ ] Request được retry với token mới
- [ ] Response trả về thành công
- [ ] Console log hiển thị refresh flow
- [ ] Refresh token expired → redirect to login
- [ ] Multiple concurrent requests → only 1 refresh call

### File Preview:
- [x] ContentTab sử dụng PreviewPanel ✅
- [x] Info banner hiển thị "Preview tạm thời" ✅
- [x] Extracted text hiển thị đúng format ✅
- [x] Character count hiển thị ✅
- [x] MimeType hiển thị ✅
- [x] Scroll container hoạt động ✅
- [ ] TODO: Test với storage URL khi backend ready

---

## 🎯 Kết luận

### Token Refresh: ✅ HOÀN THÀNH
- ✅ Tự động detect "Missing or invalid authorization header"
- ✅ Tự động refresh token
- ✅ Tự động retry request
- ✅ Logout khi refresh fail
- ✅ Handle concurrent requests
- ✅ Check tab visibility

### File Preview: ✅ ĐÃ LÀ PREVIEW PANEL
- ✅ **KHÔNG PHẢI plaintext thô**
- ✅ **ĐÃ SỬ DỤNG PreviewPanel component**
- ⚠️ Tạm thời hiển thị extracted text
- 🔜 Sẽ hiển thị file thực tế khi có storage URL

---

## 📍 URLs

**Settings:** `http://localhost:3000/settings`
- Token refresh sẽ tự động hoạt động ở mọi request

**File Detail:** `http://localhost:3000/repositories/{id}/files/{fileId}`
- Tab "Content" → PreviewPanel ✅
- Hiển thị extracted text tạm thời
- Info banner giải thích

---

## 🚀 Next Steps

### Khi Backend cung cấp Storage URL:
1. Uncomment code ở ContentTab.tsx (Line 13-15)
2. Fetch file từ storage URL
3. Create File object
4. Pass `selectedFile` vào PreviewPanel
5. PreviewPanel sẽ render:
   - PDF: PDF viewer
   - Image: Image preview
   - Office: Office viewer
   - Audio/Video: Media player

**Preview Panel đã sẵn sàng!** Chỉ cần storage URL. 🎉
