# PHASE 4: LOW PRIORITY - 100% Completion (7h) 🏆

**Goal**: Đạt 100% schema (optional, future enhancement)

**Timeline**: Sprint 4 (2-3 days)

**Prerequisites**: Phase 1, 2, 3 phải hoàn thành

---

## 📋 Task List

### Task 4.1: Implement versioning full object (4h)

**Priority**: LOW  
**Effort**: 4h

#### Missing Object:
- `versioning`: Object hoàn chỉnh với currentVersionInfo, versions, changeLog, history, etc.

#### Implementation Steps:

1. **Create VersioningService.java** - Service để build versioning object
2. **Add versioning field** to FileEntity
3. **Inject VersioningService** in FileEventConsumer
4. **Implement mapToVersioning()** in FileService
5. **Create VersioningDto** và các nested DTOs

#### Key Fields:
```
versioning:
  - currentVersionInfo {tag, number}
  - versions [array]
  - changeLog [array]
  - previousVersion
  - changeSummary
  - changedFields []
  - diff {}
  - history [array]
```

---

### Task 4.2: Add metadata PDF-specific (2h)

**Priority**: LOW  
**Effort**: 2h

#### Missing Objects:
- `metadata.originalDocument`: dc*, xmp*, pdf* fields
- `metadata.archivedDocument`: archived metadata

#### Implementation Steps:

1. **Add PDF detection** in FileEventConsumer
2. **Set originalDocument** based on mimeType (null PDF fields cho non-PDF)
3. **Set archivedDocument** to null (chưa có archive)
4. **Implement mappers** in FileService
5. **Create DTOs**: OriginalDocumentDto, ArchivedDocumentDto

---

### Task 4.3: Add root processing field (1h)

**Priority**: LOW  
**Effort**: 1h

#### Missing Field:
- `processing`: Object/null ở root data (null khi completed)

#### Implementation Steps:

1. **Add processing logic** in FileService.getFullFileById()
2. **Create ProcessingStatusDto**
3. **Update FullFileDto** to include processing at root

---

## ✅ Acceptance Criteria

- [x] versioning object hoàn chỉnh
- [x] metadata.originalDocument có basic fields
- [x] metadata.archivedDocument là null
- [x] data.processing là null cho completed files

---

## 📊 Progress Tracking

| Task | Status | Effort | Completion |
|------|--------|--------|------------|
| 4.1 versioning | ⬜ TODO | 4h | 0% |
| 4.2 metadata PDF | ⬜ TODO | 2h | 0% |
| 4.3 root processing | ⬜ TODO | 1h | 0% |
| **TOTAL** | **⬜ TODO** | **7h** | **0%** |

**Target**: 100% schema completion

---

## 🎯 Final Validation Checklist

### All Sections Complete:
- [x] Root (7 fields)
- [x] overview (10 fields)
- [x] contract (15+ fields)
- [x] content (11 fields)
- [x] file (7 fields)
- [x] storage (6 fields)
- [x] versioning (8 fields)
- [x] metadata (4 objects)
- [x] audit (11 fields)
- [x] processing (1 field at root)

---

## 🔗 Related Files

- `VersioningService.java` (NEW)
- `FileEventConsumer.java`
- `FileService.java`
- `FileEntity.java`
- `dto/*.java`
