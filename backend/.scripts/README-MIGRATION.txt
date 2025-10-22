=============================================================================
HƯỚNG DẪN MIGRATION - Chuẩn hóa Naming Convention
=============================================================================

CẢNH BÁO: BACKUP DỮ LIỆU TRƯỚC KHI CHẠY!

Thay đổi chính:
1. Database: docgo_user_service → docgo (unified)
2. Collection: documents → files
3. Field naming: snake_case → camelCase

=============================================================================
BƯỚC 1: BACKUP DATABASE
=============================================================================

# Backup docgo_user_service
mongodump --uri="$MONGODB_ATLAS_URI" --db=docgo_user_service --out=./backup/

# Backup docgo (nếu đã có data)
mongodump --uri="$MONGODB_ATLAS_URI" --db=docgo --out=./backup/

=============================================================================
BƯỚC 2: CHẠY MIGRATION SCRIPT
=============================================================================

# Option 1: Dùng mongosh (recommended)
mongosh "$MONGODB_ATLAS_URI" --file migrate-to-unified-naming.js

# Option 2: Dùng mongo (legacy)
mongo "$MONGODB_ATLAS_URI" migrate-to-unified-naming.js

=============================================================================
BƯỚC 3: VERIFY MIGRATION
=============================================================================

# Connect to MongoDB
mongosh "$MONGODB_ATLAS_URI"

# Switch to docgo database
use docgo

# Check collections
show collections

# Verify data
db.users.findOne()
db.organizations.findOne()
db.files.findOne()

# Check counts
db.users.count()
db.organizations.count()
db.user_events.count()
db.files.count()

# Verify field names (should be camelCase)
db.users.findOne({}, {firstName: 1, lastName: 1, createdAt: 1})
db.files.findOne({}, {overview: 1, metadata: 1, contract: 1})

=============================================================================
BƯỚC 4: UPDATE ENVIRONMENT VARIABLES
=============================================================================

# File: backend/user-management-service/.env
MONGODB_DATABASE=docgo

# File: backend/repository-management-service/.env
MONGODB_DATABASE=docgo

=============================================================================
BƯỚC 5: RESTART SERVICES
=============================================================================

# PowerShell
docker-compose restart user-management-service
Start-Sleep -Seconds 10
docker-compose restart repository-management-service
Start-Sleep -Seconds 10

# Verify services
docker-compose ps
docker-compose logs user-management-service --tail=50
docker-compose logs repository-management-service --tail=50

=============================================================================
BƯỚC 6: TEST API
=============================================================================

# Test User Service
curl http://localhost:8001/api/v1/user-management-service/users

# Test Repository Service  
curl http://localhost:8002/api/v1/repository-management-service/files

=============================================================================
BƯỚC 7: DROP OLD DATABASE (SAU KHI VERIFY OK)
=============================================================================

# CẢNH BÁO: CHỈ CHẠY SAU KHI ĐÃ VERIFY MIGRATION THÀNH CÔNG!

mongosh "$MONGODB_ATLAS_URI"

use docgo_user_service
db.dropDatabase()

=============================================================================
ROLLBACK (NẾU CẦN)
=============================================================================

# Restore from backup
mongorestore --uri="$MONGODB_ATLAS_URI" --db=docgo_user_service ./backup/docgo_user_service/

mongorestore --uri="$MONGODB_ATLAS_URI" --db=docgo ./backup/docgo/

=============================================================================
CHECKLIST
=============================================================================

[  ] 1. Backup databases
[  ] 2. Run migration script
[  ] 3. Verify data in new database
[  ] 4. Update .env files
[  ] 5. Restart services
[  ] 6. Test APIs
[  ] 7. Monitor for errors (24h)
[  ] 8. Drop old database

=============================================================================
EXPECTED RESULTS
=============================================================================

✅ Database 'docgo' chứa tất cả collections:
   - users (camelCase fields)
   - organizations (camelCase fields)
   - user_events (camelCase fields)
   - files (camelCase fields)

✅ Field naming convention:
   - firstName, lastName, createdAt, updatedAt
   - organizationId, ownerUserId
   - emailVerified, twoFactorEnabled

✅ Collections indexed properly
✅ Services connect to unified 'docgo' database
✅ APIs return correct data

=============================================================================
SUPPORT
=============================================================================

Nếu gặp lỗi:
1. Check logs: docker-compose logs [service-name]
2. Verify MongoDB connection
3. Rollback if needed
4. Contact team lead

Version: 1.0.0
Last Updated: 2025-10-22
