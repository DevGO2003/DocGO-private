# Thống nhất sử dụng UIComponents trong các page sử dụng HeaderControlLayout

## Mục tiêu
Thay thế tất cả các HTML element thuần bằng các component từ UIComponents để đảm bảo thống nhất trong toàn bộ webapp.

## Yêu cầu

### 1. Sửa Right Section Alignment (✅ Đã hoàn thành)
- HeaderControlLayout đã được sửa để rightActions align phải

### 2. Thay thế các component chưa thống nhất

#### A. RepositoryTabs.tsx
**File:** `frontend/webapp/src/features/repositories/views/components/RepositoryTabs.tsx`
**Thay:** `<button>` tabs → Sử dụng `Tabs`, `TabList`, `CommonTab` từ `@shared/components`
**Yêu cầu:**
- Giữ nguyên functionality (activeTab, onTabChange, counts)
- Giữ nguyên animation và styling hiện tại nếu có thể
- Export component vẫn giữ nguyên interface

#### B. OrganizationWorkspace.tsx
**File:** `frontend/webapp/src/features/organizations/views/pages/OrganizationWorkspace/OrganizationWorkspace.tsx`
**Thay:** 
- Line 234-252: `<button>` tabs → Sử dụng `Tabs`, `TabList`, `CommonTab`
- Giữ nguyên icon và label trong tabs

#### C. OrganizationDetail.tsx
**File:** `frontend/webapp/src/features/organizations/views/pages/OrganizationDetail/OrganizationDetail.tsx`
**Thay:**
- Line 236-249: `<button>` tabs → Sử dụng `Tabs`, `TabList`, `CommonTab`
- Line 424, 436, 448: `<input type="checkbox">` → Sử dụng `Checkbox` component
- Line 269, 273, 279, 286: `<label>` → Sử dụng `Label` component (nếu có trong UIComponents, nếu không thì giữ nguyên)

#### D. RepositoryDetail.tsx
**File:** `frontend/webapp/src/features/repositories/views/pages/RepositoryDetail/RepositoryDetail.tsx`
**Thay:**
- Line 256-295: Tất cả `<button>` cho tabs → Sử dụng `Tabs`, `TabList`, `CommonTab`
- Giữ nguyên icon và translation

#### E. Settings.tsx
**File:** `frontend/webapp/src/features/settings/views/pages/Settings.tsx`
**Thay:**
- Line 166-178: `<button>` tabs → Sử dụng `Tabs`, `TabList`, `CommonTab`
- Line 373-383: `<input type="checkbox">` → Sử dụng `Checkbox` component
- Line 403, 424, 444, 464: `<select>` → Sử dụng `Select` component từ UIComponents
- Line 301: `<button>` show/hide password → Sử dụng `Button` component

#### F. Profile.tsx
**File:** `frontend/webapp/src/features/profile/views/pages/Profile/Profile.tsx`
**Thay:**
- Line 207, 223, 243, 261, 281, 297: `<label>` → Sử dụng `Label` component (nếu có trong UIComponents)

#### G. UploadPage.tsx
**File:** `frontend/webapp/src/features/upload/views/pages/UploadPage.tsx`
**Thay:**
- Line 207-212: `<button>` đóng modal → Sử dụng `Button` component

## Quy tắc khi sửa

1. **Import đúng từ `@shared/components`:**
   ```typescript
   import { Tabs, TabList, CommonTab, Checkbox, Select, Button, Label } from '@shared/components';
   ```

2. **Giữ nguyên functionality:**
   - Không thay đổi logic business
   - Giữ nguyên state management
   - Giữ nguyên event handlers

3. **Giữ nguyên styling khi có thể:**
   - Các className custom có thể cần điều chỉnh để phù hợp với UIComponents
   - Ưu tiên sử dụng props của UIComponents thay vì className trực tiếp

4. **CommonTab usage pattern:**
   ```tsx
   <Tabs>
     <TabList>
       <CommonTab 
         value={tabId} 
         activeValue={activeTab} 
         onSelect={(v) => setActiveTab(v)}
       >
         <Icon className="w-4 h-4" />
         {tab.label}
       </CommonTab>
     </TabList>
   </Tabs>
   ```

5. **Checkbox usage:**
   ```tsx
   <Checkbox 
     checked={value}
     onCheckedChange={(checked) => setValue(checked)}
   />
   ```

6. **Select usage:**
   ```tsx
   <Select
     value={selectedValue}
     onChange={(value) => setSelectedValue(value)}
     options={options}
   />
   ```

## Danh sách các page sử dụng HeaderControlLayout

### Repositories
1. `RepositoryList.tsx` (`/repositories`)
2. `RepositoryDetail.tsx`
3. `RepositoryFilesList.tsx`
4. `RepositoryFileDetail.tsx`

### Organizations
5. `OrganizationList.tsx` (`/organizations`)
6. `OrganizationDetail.tsx`
7. `OrganizationWorkspace.tsx`
8. `OrganizationMembers.tsx`

### Others
9. `Dashboard.tsx` (`/dashboard`)
10. `UploadPage.tsx` (`/upload`)
11. `Profile.tsx` (`/profile`)
12. `Settings.tsx` (`/settings`)

## Kiểm tra sau khi sửa

1. ✅ Tất cả tabs đều sử dụng CommonTab
2. ✅ Tất cả checkbox đều sử dụng Checkbox component
3. ✅ Tất cả select đều sử dụng Select component
4. ✅ Tất cả button (trừ các trường hợp đặc biệt) đều sử dụng Button component
5. ✅ Không có lỗi TypeScript
6. ✅ Không có lỗi linting
7. ✅ Right section của HeaderControlLayout đã align phải

## Lưu ý

- Nếu một component không tồn tại trong UIComponents (ví dụ: Label), hãy giữ nguyên `<label>` và thêm comment `// TODO: Add Label component to UIComponents`
- Kiểm tra documentation của mỗi UIComponent trước khi sử dụng để đảm bảo API đúng
- Test từng page sau khi sửa để đảm bảo không có lỗi runtime
- Đảm bảo responsive design vẫn hoạt động tốt sau khi thay đổi

## Checklist sửa từng file

- [ ] RepositoryTabs.tsx
- [ ] OrganizationWorkspace.tsx
- [ ] OrganizationDetail.tsx
- [ ] RepositoryDetail.tsx
- [ ] Settings.tsx
- [ ] Profile.tsx
- [ ] UploadPage.tsx

