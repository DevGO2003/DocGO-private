# 📊 SCHEMA IMPROVEMENT PLAN - DocGO Repository Service

**Objective**: Đạt 100% khớp với schema mẫu `document-management-sample.json`

**Current Status**: ~40% completion  
**Target**: 100% completion

**Total Effort**: ~27 hours across 4 phases

---

## 📈 Overview

| Phase | Priority | Effort | Target % | Description |
|-------|----------|--------|----------|-------------|
| [Phase 1](./phase-1-critical.md) | ⭐⭐⭐ CRITICAL | 7.5h | 70% | Core fields - production ready |
| [Phase 2](./phase-2-high-priority.md) | ⭐⭐ HIGH | 7h | 95% | Business logic - contract workflow |
| [Phase 3](./phase-3-medium-priority.md) | ⭐ MEDIUM | 5.5h | 99% | Polish - nice-to-have features |
| [Phase 4](./phase-4-low-priority.md) | LOW | 7h | 100% | Perfect match - optional |

---

## 🎯 Phase Breakdown

### **PHASE 1: CRITICAL** (7.5h) ⭐⭐⭐

**Goal**: Đạt 70% schema, đủ dùng cho production MVP

**Tasks**:
- ✅ Task 1.1: Bổ sung overview fields (2h)
  - contractType, ownerUserId, region, new
- ✅ Task 1.2: Bổ sung contract core (3h)
  - effectiveDate, expiryDate, totalValue, currency
  - project, department, priority, confidentiality
- ✅ Task 1.3: Thêm file.version (0.5h)
- ✅ Task 1.4: Hoàn thiện audit core (2h)
  - createdAt, createdBy, lastModifiedAt, etc.

**Deliverables**:
- Overview + Contract + File + Audit có đầy đủ core fields
- API response đạt 70% schema

---

### **PHASE 2: HIGH** (7h) ⭐⭐

**Goal**: Đạt 95% schema, hỗ trợ đầy đủ contract workflow

**Tasks**:
- ✅ Task 2.1: Map contract extended (2h)
  - workflow, parties, payment
- ✅ Task 2.2: Verify storage.s3 extended (1h)
  - url, objectKey, versionId, checksum
- ✅ Task 2.3: Populate metadata.fileSystem (2h)
  - 9 fields đầy đủ
- ✅ Task 2.4: Populate metadata.technical (2h)
  - 7 fields bao gồm wordCount, characterCount

**Deliverables**:
- Contract workflow hoàn chỉnh
- Storage & Metadata đầy đủ
- API response đạt 95% schema

---

### **PHASE 3: MEDIUM** (5.5h) ⭐

**Goal**: Đạt 99% schema completion

**Tasks**:
- ✅ Task 3.1: Verify contract advanced (1h)
  - clauses, reminders, risk, compliance
- ✅ Task 3.2: Add content.sections (1h)
- ✅ Task 3.3: Add storage policies (1.5h)
  - retentionPolicy, accessControl
- ✅ Task 3.4: Add audit logs (2h)
  - changeHistory, accessLog arrays

**Deliverables**:
- Schema gần như hoàn chỉnh
- API response đạt 99% schema

---

### **PHASE 4: LOW** (7h) 🏆

**Goal**: Đạt 100% perfect match (optional)

**Tasks**:
- ⭕ Task 4.1: Implement versioning full (4h)
  - Create VersioningService
  - Full versioning object với 8 fields
- ⭕ Task 4.2: Add metadata PDF-specific (2h)
  - originalDocument, archivedDocument
- ⭕ Task 4.3: Add root processing (1h)

**Deliverables**:
- 100% schema match với mẫu
- Production-ready với full features

---

## 📋 Quick Start

### Recommended Approach:

#### **Option A: Quick Win** ⚡ (14.5h)
```
Phase 1 + 2 → 95% schema → Production MVP
```

#### **Option B: Complete** 🎯 (20h)
```
Phase 1 + 2 + 3 → 99% schema → Production Ready
```

#### **Option C: Perfect** 💎 (27h)
```
All Phases → 100% schema → Future-proof
```

---

## 🚀 Getting Started

### 1. Read phase plans:
```bash
# Phase 1 (must do)
cat phase-1-critical.md

# Phase 2 (recommended)
cat phase-2-high-priority.md

# Phase 3 (nice to have)
cat phase-3-medium-priority.md

# Phase 4 (optional)
cat phase-4-low-priority.md
```

### 2. Start implementation:
```bash
# Create feature branch
git checkout -b feature/schema-improvement

# Start with Phase 1
# Follow tasks in phase-1-critical.md
```

### 3. Test after each phase:
```bash
# Build
cd backend/repository-management-service
./gradlew clean build

# Restart service
docker-compose restart repository-management-service

# Test
powershell -File test-upload-file.ps1
powershell -File test-get-file.ps1

# Verify schema %
curl -X GET "http://localhost:8002/api/v1/repository-management-service/files/{fileId}" > response.json
# Compare with .cursor/documents/api-docs/document-management-sample.json
```

---

## 📊 Progress Tracking

### Overall Progress:

| Metric | Current | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|--------|---------|---------|---------|---------|---------|
| **Schema %** | 40% | 70% | 95% | 99% | 100% |
| **Effort** | 0h | 7.5h | 14.5h | 20h | 27h |
| **Status** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

### Checklist by Section:

#### ✅ Completed (from previous work):
- [x] Root response structure (apiVersion, statusCode, etc.)
- [x] Enum normalization (status, documentType, priority, etc.)
- [x] Storage.s3 basic mapping
- [x] Contract basic structure

#### ⬜ Phase 1 - Critical:
- [ ] overview: contractType, ownerUserId, region, new
- [ ] contract: 8 core fields
- [ ] file.version
- [ ] audit: 6 core fields

#### ⬜ Phase 2 - High:
- [ ] contract: workflow, parties, payment
- [ ] storage.s3: extended fields
- [ ] metadata.fileSystem: 9 fields
- [ ] metadata.technical: 7 fields

#### ⬜ Phase 3 - Medium:
- [ ] contract: clauses, reminders, risk, compliance
- [ ] content.sections
- [ ] storage: policies (retention, access control)
- [ ] audit: logs (changeHistory, accessLog)

#### ⬜ Phase 4 - Low:
- [ ] versioning: full object
- [ ] metadata: originalDocument, archivedDocument
- [ ] data.processing: root field

---

## 🔧 Technical Notes

### Files to Modify:

**Backend (Java)**:
- `FileEventConsumer.java` - Kafka event handlers
- `FileService.java` - DTO mapping logic
- `FileUpdateService.java` - Update operations
- `FileEntity.java` - MongoDB entity
- `dto/*.java` - Response DTOs

**New Files to Create**:
- `VersioningService.java` (Phase 4)
- Multiple new DTOs for nested structures

### Database Considerations:

- **Phase 1-3**: No schema changes, chỉ populate existing fields
- **Phase 4**: Cần add `versioning` field to FileEntity (migration required)

### Testing Strategy:

1. **Unit tests**: Test mappers in isolation
2. **Integration tests**: Test full flow with Kafka events
3. **API tests**: Verify response structure
4. **Schema validation**: Compare with sample.json

---

## 📞 Support & References

### Documentation:
- Schema mẫu: `.cursor/documents/api-docs/document-management-sample.json`
- API docs: Coming soon

### Related Memories:
- Enum normalization patterns
- Kafka event structures
- DTO mapping conventions

### Contact:
- Team: DevGO2003
- Project: DocGO Document Management

---

## 🎉 Success Criteria

### Phase 1 Complete:
```bash
✓ overview có 10 fields
✓ contract có 8 core fields
✓ file.version present
✓ audit có 6 core fields
✓ API test pass
✓ Schema ~70%
```

### Phase 2 Complete:
```bash
✓ contract workflow, parties, payment
✓ storage.s3 extended
✓ metadata.fileSystem & technical complete
✓ Schema ~95%
```

### Phase 3 Complete:
```bash
✓ contract advanced fields
✓ content.sections
✓ storage policies
✓ audit logs
✓ Schema ~99%
```

### Phase 4 Complete:
```bash
✓ versioning full object
✓ metadata PDF-specific
✓ root processing field
✓ Schema 100% ✨
```

---

## 📝 Notes

- **Recommended**: Start với Phase 1 + 2 để đạt 95% cho production MVP
- **Phase 3**: Implement nếu cần polish và full features
- **Phase 4**: Optional, chỉ khi cần 100% perfect match
- **Estimation**: Dựa trên 1 developer full-time

---

**Last Updated**: Oct 21, 2025  
**Status**: Planning Complete, Ready to Implement  
**Next Action**: Review Phase 1 plan và bắt đầu Task 1.1
