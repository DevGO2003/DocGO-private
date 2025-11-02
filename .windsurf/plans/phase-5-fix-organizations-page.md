# Phase 5: Fix Organizations Page

**Mục tiêu**: Sửa trang organizations theo yêu cầu

**Ưu tiên**: 🟠 **MEDIUM**

**Thời gian ước tính**: 3-4 giờ

---

## ✅ Tasks

### 5.1. HeaderControlLayout - Search Button
**URL**: `http://localhost:3000/organizations`

#### 5.1.1. Di chuyển nút "Tìm kiếm" vào Right Section
- [ ] **Tìm search button hiện tại**
  ```tsx
  // Current position (outside or left)
  <SearchButton />
  ```

- [ ] **Di chuyển vào headerRight**
  ```tsx
  <HeaderControlLayout
    headerRight={
      <>
        <CommonInput 
          type="search"
          placeholder={t('organizations.search')}
          icon="search"
        />
        <RefreshButton />
      </>
    }
  />
  ```

- [ ] **Hoặc dùng Search component nếu có**
  ```tsx
  <UIComponents.Search 
    onSearch={handleSearch}
    placeholder={t('organizations.search')}
  />
  ```

---

### 5.2. Organization Creation Date
#### 5.2.1. Check API Response
- [ ] **Verify API có trả ngày tạo tổ chức**
  ```tsx
  GET /api/v1/organizations
  
  // Check response:
  {
    "organizations": [
      {
        "id": "uuid",
        "name": "...",
        "createdAt": "2024-10-15T10:30:00Z",  // ← Cần có
        ...
      }
    ]
  }
  ```

#### 5.2.2. Display Creation Date
- [ ] **Nếu API có data → Hiển thị**
  ```tsx
  <Text variant="caption">
    {t('organizations.createdAt')}: {formatDate(org.createdAt)}
  </Text>
  ```

- [ ] **Nếu API chưa có → Backend cần sửa**
  - [ ] Document yêu cầu backend
  - [ ] Tạm thời hiển thị placeholder
  - [ ] Log issue

#### 5.2.3. Date Formatting
- [ ] **Format đẹp:**
  ```tsx
  // Options:
  - "15/10/2024"
  - "15 Tháng 10, 2024"
  - "Tháng 10, 2024"
  - "3 tháng trước"
  ```

- [ ] **i18n date format**
  ```tsx
  import { formatDate } from '@/shared/utils/dateUtils';
  
  {formatDate(org.createdAt, 'dd/MM/yyyy', i18n.language)}
  ```

---

### 5.3. Tab "Hợp đồng" và "Kho tài liệu"
#### 5.3.1. Hiển thị 5 gần đây
- [ ] **Tab Hợp đồng:**
  ```tsx
  // Fetch 5 recent contracts
  GET /api/v1/organizations/:id/contracts?limit=5&sort=createdAt:desc
  ```

  - [ ] Display 5 contracts
  - [ ] Sort by recent (createdAt DESC)
  - [ ] Show: Title, Date, Status

- [ ] **Tab Kho tài liệu:**
  ```tsx
  // Fetch 5 recent repositories
  GET /api/v1/organizations/:id/repositories?limit=5&sort=createdAt:desc
  ```

  - [ ] Display 5 repositories
  - [ ] Sort by recent
  - [ ] Show: Name, Files count, Date

#### 5.3.2. Nút "Mở danh sách kho"
- [ ] **Thêm button bên trái "Làm mới"**
  ```tsx
  <HeaderControlLayout
    headerRight={
      <>
        <CommonButton 
          icon="folder-open"
          onClick={openFullList}
        >
          {t('organizations.openRepositoryList')}
        </CommonButton>
        <RefreshButton />
      </>
    }
  />
  ```

- [ ] **OnClick action:**
  - [ ] Navigate to `/organizations/:id/repositories`
  - [ ] Or open modal với full list
  - [ ] Or expand inline

#### 5.3.3. Recent Contracts Button
- [ ] **Tương tự cho tab Hợp đồng:**
  ```tsx
  <CommonButton 
    icon="file-text"
    onClick={openContractsList}
  >
    {t('organizations.openContractList')}
  </CommonButton>
  ```

#### 5.3.4. Empty States
- [ ] **Khi chưa có contracts:**
  ```tsx
  <EmptyState 
    icon="file-text"
    title={t('organizations.noContracts')}
    description={t('organizations.noContractsDesc')}
  />
  ```

- [ ] **Khi chưa có repositories:**
  ```tsx
  <EmptyState 
    icon="folder"
    title={t('organizations.noRepositories')}
    description={t('organizations.noRepositoriesDesc')}
  />
  ```

---

### 5.4. Tab "Thông tin" - Di chuyển lên đầu
#### 5.4.1. Tabs Order
- [ ] **Current order (example):**
  ```tsx
  const tabs = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'contracts', label: 'Hợp đồng' },
    { id: 'repositories', label: 'Kho tài liệu' },
    { id: 'info', label: 'Thông tin' },  // ← Cần di chuyển
    { id: 'members', label: 'Thành viên' }
  ];
  ```

- [ ] **New order:**
  ```tsx
  const tabs = [
    { id: 'info', label: 'Thông tin' },  // ← LÊN ĐẦU
    { id: 'overview', label: 'Tổng quan' },
    { id: 'contracts', label: 'Hợp đồng' },
    { id: 'repositories', label: 'Kho tài liệu' },
    { id: 'members', label: 'Thành viên' }
  ];
  ```

#### 5.4.2. Update Default Tab
- [ ] **Set "Thông tin" as default active tab**
  ```tsx
  const [activeTab, setActiveTab] = useState('info');
  ```

---

### 5.5. UIComponents Audit
- [ ] **Kiểm tra và thay thế:**
  - [ ] Tabs → UIComponents/Tabs
  - [ ] Cards → UIComponents/Card
  - [ ] Buttons → UIComponents/Button
  - [ ] Input (search) → UIComponents/Input
  - [ ] Table → UIComponents/Table
  - [ ] Icons → UIComponents/Icon
  - [ ] Empty states → UIComponents styled

---

### 5.6. i18n Completion
- [ ] **Organizations page:**
  ```json
  {
    "organizations": {
      "title": "Tổ chức",
      "search": "Tìm kiếm tổ chức...",
      "createdAt": "Ngày tạo",
      "openRepositoryList": "Mở danh sách kho",
      "openContractList": "Mở danh sách hợp đồng",
      "noContracts": "Chưa có hợp đồng",
      "noContractsDesc": "Tổ chức này chưa có hợp đồng nào",
      "noRepositories": "Chưa có kho tài liệu",
      "noRepositoriesDesc": "Tổ chức này chưa có kho tài liệu nào",
      "tabs": {
        "info": "Thông tin",
        "overview": "Tổng quan",
        "contracts": "Hợp đồng",
        "repositories": "Kho tài liệu",
        "members": "Thành viên"
      }
    }
  }
  ```

- [ ] **Add to vi.json and en.json**

---

## 📊 Success Criteria

- ✅ Nút "Tìm kiếm" đã di chuyển vào Right Section
- ✅ Ngày tạo tổ chức được hiển thị (hoặc đã document yêu cầu backend)
- ✅ Tab "Hợp đồng": Chỉ hiện 5 gần đây
- ✅ Tab "Kho tài liệu": Chỉ hiện 5 gần đây
- ✅ Nút "Mở danh sách kho" bên trái "Làm mới"
- ✅ Nút "Mở danh sách hợp đồng" (tương tự)
- ✅ Tab "Thông tin" đã lên đầu và là default tab
- ✅ Tất cả components từ UIComponents
- ✅ Hoàn thiện i18n

---

## 🚀 Next Phase

➡️ **Phase 6**: i18n completion & Layout refactoring
