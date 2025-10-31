# Hướng dẫn chỉnh sửa RepositoryFilesList.tsx

## Vấn đề
IDE đang tự động revert các thay đổi do auto-format. Cần chỉnh thủ công.

## Các thay đổi cần thực hiện

### 1. Chuyển tabs lên headerChildren (Thứ hai: Chỉnh header tab không có đường phân chia)

**File:** `frontend/webapp/src/features/repositories/views/pages/RepositoryFilesList/RepositoryFilesList.tsx`

**Tìm dòng 276-322** (phần này):
```tsx
      loading={isLoading}
      loadingText={t('repositories.files.loading')}
    >
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header + Filters */}
        <div className="mb-4">
          <Tabs>
            <TabList>
              <CommonTab value="all" activeValue={activeTab} onSelect={(v: string) => setActiveTab(v as 'all' | 'contract')} className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                {t('repositories.files.tabs.all')}
              </CommonTab>
              <CommonTab value="contract" activeValue={activeTab} onSelect={(v: string) => setActiveTab(v as 'all' | 'contract')} className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                {t('repositories.files.tabs.contract')}
              </CommonTab>
            </TabList>
          </Tabs>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t('repositories.files.manage')}</CardTitle>
          </CardHeader>
          <CardContent>
            <FilesFilters
              search={search}
              onSearchChange={setSearch}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onRefresh={refreshFiles}
              status={status}
              onStatusChange={setStatus}
              type={type}
              onTypeChange={setType}
              availableTags={availableTags}
              tagsLoading={tagsLoading}
              tagsError={tagsError}
              selectedTags={selectedTags}
              onToggleTag={toggleTag}
              onRetryTags={retryTags}
              sortBy={sortBy}
              onSortByChange={handleSortByChange}
              sortDirection={sortDirection}
              onSortDirectionChange={handleSortDirectionChange}
              showAdvanced={showAdvanced}
              onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
            />
          </CardContent>
        </Card>

        {/* Content */}
```

**Thay bằng:**
```tsx
      loading={isLoading}
      loadingText={t('repositories.files.loading')}
      headerChildren={(
        <div className="w-full space-y-3">
          {/* Inline tabs - NO border-b to match file detail page */}
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2 py-1.5 text-[10px] md:px-2.5 md:py-1.5 md:text-xs ${activeTab === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {t('repositories.files.tabs.all')}
            </button>
            <button
              onClick={() => setActiveTab('contract')}
              className={`px-2 py-1.5 text-[10px] md:px-2.5 md:py-1.5 md:text-xs border-l border-gray-200 ${activeTab === 'contract' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {t('repositories.files.tabs.contract')}
            </button>
          </div>

          <FilesFilters
            search={search}
            onSearchChange={setSearch}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onRefresh={refreshFiles}
            status={status}
            onStatusChange={setStatus}
            type={type}
            onTypeChange={setType}
            availableTags={availableTags}
            tagsLoading={tagsLoading}
            tagsError={tagsError}
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
            onRetryTags={retryTags}
            sortBy={sortBy}
            onSortByChange={handleSortByChange}
            sortDirection={sortDirection}
            onSortDirectionChange={handleSortDirectionChange}
            showAdvanced={showAdvanced}
            onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
          />
        </div>
      )}
    >
      {/* Content wrapper like src-old PrimaryContent: bg-white, rounded-2xl, border, shadow, padding */}
      <div className="min-h-[260px]">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          {/* Content */}
```

### 2. Đóng div cuối cùng (Thứ nhất: Chỉnh content giống src-old)

**Tìm dòng cuối cùng của component** (trước `</ControlMainLayout>`):
```tsx
        )}
      </div>
    </ControlMainLayout>
```

**Thay bằng:**
```tsx
        )}
        </div>
      </div>
    </ControlMainLayout>
```

### 3. Xóa import không dùng (tùy chọn)

**Tìm dòng 8:**
```tsx
import { Tabs, TabList, CommonTab } from '@shared/components/UIComponents/Tabs/CommonTabs';
```

**Xóa hoặc comment:**
```tsx
// import { Tabs, TabList, CommonTab } from '@shared/components/UIComponents/Tabs/CommonTabs';
```

## Kết quả mong đợi

Sau khi chỉnh xong:
1. ✅ Tabs sẽ hiển thị inline trong header, không có border-b divider
2. ✅ Content sẽ có background trắng, border, rounded, shadow giống src-old
3. ✅ Tất cả text đã dùng i18n (đã hoàn thành)
4. ✅ FilesFilters đã giống src-old (đã hoàn thành)

## Cách thực hiện

1. **Tắt auto-save trong VSCode** (nếu đang bật)
2. **Stop container webapp:**
   ```bash
   docker compose stop webapp
   ```
3. **Chỉnh file** theo hướng dẫn trên
4. **Save file**
5. **Start container webapp:**
   ```bash
   docker compose start webapp
   ```
6. **Kiểm tra** tại `http://localhost:3000/repositories/{id}/files`

## Tham khảo

- **src-old PrimaryContent:** `frontend/src-old/components/ui/PrimaryContent.tsx`
- **src-old inline tabs:** `frontend/src-old/app/(repositories)/repositories/[repositoryId]/files/page.tsx` (dòng 320-340)
- **webapp MainTabsNav:** `frontend/webapp/src/features/repositories/views/components/FileDetail/MainTabsNav.tsx`

