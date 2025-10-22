// MongoDB Migration Script - Chuẩn hóa Naming Convention
// Migrate từ snake_case sang camelCase và consolidate databases

// =============================================================================
// PHASE 1: Migrate User Service Collections (docgo_user_service → docgo)
// =============================================================================

print("=== PHASE 1: Migrating User Service Collections ===");

// Connect to source database
db = db.getSiblingDB('docgo_user_service');

// 1.1. Migrate users collection
print("\n1. Migrating users collection...");
let userCount = 0;
db.users.find().forEach(function(doc) {
    let updatedDoc = {
        _id: doc._id,
        username: doc.username,
        email: doc.email,
        password: doc.password,
        firstName: doc.first_name || doc.firstName,
        lastName: doc.last_name || doc.lastName,
        phone: doc.phone,
        status: doc.status,
        role: doc.role,
        lastLogin: doc.last_login || doc.lastLogin,
        emailVerified: doc.email_verified || doc.emailVerified,
        profilePicture: doc.profile_picture || doc.profilePicture,
        organizationId: doc.organization_id || doc.organizationId,
        organizationIds: doc.organization_ids || doc.organizationIds,
        activeOrganizationId: doc.active_organization_id || doc.activeOrganizationId,
        createdAt: doc.created_at || doc.createdAt,
        updatedAt: doc.updated_at || doc.updatedAt,
        createdBy: doc.created_by || doc.createdBy,
        updatedBy: doc.updated_by || doc.updatedBy,
        roleIds: doc.role_ids || doc.roleIds,
        permissionIds: doc.permission_ids || doc.permissionIds,
        loginAttempts: doc.login_attempts || doc.loginAttempts || 0,
        twoFactorEnabled: doc.two_factor_enabled || doc.twoFactorEnabled || false,
        twoFactorSecret: doc.two_factor_secret || doc.twoFactorSecret,
        avatarUrl: doc.avatar_url || doc.avatarUrl,
        groups: doc.groups,
        lockedUntil: doc.locked_until || doc.lockedUntil
    };
    
    // Save to unified database
    db.getSiblingDB('docgo').users.insertOne(updatedDoc);
    userCount++;
});
print(`✓ Migrated ${userCount} users`);

// 1.2. Migrate organizations collection
print("\n2. Migrating organizations collection...");
let orgCount = 0;
db.organizations.find().forEach(function(doc) {
    let updatedDoc = {
        _id: doc._id,
        name: doc.name,
        code: doc.code,
        description: doc.description,
        address: doc.address,
        phone: doc.phone,
        email: doc.email,
        website: doc.website,
        status: doc.status,
        createdAt: doc.created_at || doc.createdAt,
        updatedAt: doc.updated_at || doc.updatedAt,
        createdBy: doc.created_by || doc.createdBy,
        updatedBy: doc.updated_by || doc.updatedBy,
        deletedAt: doc.deleted_at || doc.deletedAt,
        userIds: doc.user_ids || doc.userIds,
        ownerUserId: doc.owner_user_id || doc.ownerUserId,
        adminUserIds: doc.admin_user_ids || doc.adminUserIds,
        memberCount: doc.member_count || doc.memberCount || 0,
        settings: doc.settings ? {
            allowMemberInvite: doc.settings.allow_member_invite || doc.settings.allowMemberInvite,
            requireAdminApproval: doc.settings.require_admin_approval || doc.settings.requireAdminApproval,
            maxMembers: doc.settings.max_members || doc.settings.maxMembers,
            customSettings: doc.settings.custom_settings || doc.settings.customSettings
        } : null
    };
    
    db.getSiblingDB('docgo').organizations.insertOne(updatedDoc);
    orgCount++;
});
print(`✓ Migrated ${orgCount} organizations`);

// 1.3. Migrate user_events collection
print("\n3. Migrating user_events collection...");
let eventCount = 0;
db.user_events.find().forEach(function(doc) {
    let updatedDoc = {
        _id: doc._id,
        userId: doc.user_id || doc.userId,
        eventType: doc.event_type || doc.eventType,
        eventDescription: doc.event_description || doc.eventDescription,
        ipAddress: doc.ip_address || doc.ipAddress,
        userAgent: doc.user_agent || doc.userAgent,
        eventData: doc.event_data || doc.eventData,
        createdAt: doc.created_at || doc.createdAt,
        updatedAt: doc.updated_at || doc.updatedAt
    };
    
    db.getSiblingDB('docgo').user_events.insertOne(updatedDoc);
    eventCount++;
});
print(`✓ Migrated ${eventCount} user_events`);

// 1.4. Migrate other collections (roles, permissions, etc.)
print("\n4. Migrating other collections...");
const otherCollections = [
    'roles',
    'permissions', 
    'user_permissions',
    'organization_roles',
    'organization_permissions',
    'organization_memberships',
    'invitations',
    'user_sessions'
];

otherCollections.forEach(function(collName) {
    if (db.getCollectionNames().includes(collName)) {
        let count = db[collName].count();
        if (count > 0) {
            print(`  - Copying ${collName}: ${count} documents`);
            db[collName].find().forEach(function(doc) {
                db.getSiblingDB('docgo')[collName].insertOne(doc);
            });
        }
    }
});

// =============================================================================
// PHASE 2: Rename Repository Service Collection (documents → files)
// =============================================================================

print("\n=== PHASE 2: Renaming Repository Collections ===");

db = db.getSiblingDB('docgo');

// 2.1. Check if 'documents' collection exists
if (db.getCollectionNames().includes('documents')) {
    print("\n5. Renaming 'documents' → 'files'...");
    let docCount = db.documents.count();
    
    // Copy all documents to 'files' collection
    db.documents.find().forEach(function(doc) {
        db.files.insertOne(doc);
    });
    
    print(`✓ Copied ${docCount} documents to 'files' collection`);
    
    // Drop old 'documents' collection
    db.documents.drop();
    print("✓ Dropped 'documents' collection");
} else {
    print("\n5. Collection 'documents' not found, skipping...");
}

// =============================================================================
// PHASE 3: Create Indexes
// =============================================================================

print("\n=== PHASE 3: Creating Indexes ===");

// Users indexes
print("\n6. Creating indexes for users...");
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "organizationId": 1, "status": 1 });
db.users.createIndex({ "createdAt": -1 });
print("✓ Created users indexes");

// Organizations indexes
print("\n7. Creating indexes for organizations...");
db.organizations.createIndex({ "code": 1 }, { unique: true });
db.organizations.createIndex({ "ownerUserId": 1 });
db.organizations.createIndex({ "status": 1 });
print("✓ Created organizations indexes");

// User Events indexes
print("\n8. Creating indexes for user_events...");
db.user_events.createIndex({ "userId": 1, "createdAt": -1 });
db.user_events.createIndex({ "eventType": 1 });
db.user_events.createIndex({ "createdAt": -1 });
print("✓ Created user_events indexes");

// Files indexes
print("\n9. Creating indexes for files...");
db.files.createIndex({ "id": 1 }, { unique: true });
db.files.createIndex({ "overview.ownerUserId": 1, "overview.status": 1 });
db.files.createIndex({ "overview.documentType": 1 });
db.files.createIndex({ "contract.effectiveDate": 1, "contract.expiryDate": 1 });
db.files.createIndex({ "metadata.file.hash.md5": 1 });
db.files.createIndex({ "audit.createdAt": -1 });
db.files.createIndex({ "audit.updatedAt": -1 });
print("✓ Created files indexes");

// =============================================================================
// PHASE 4: Verification
// =============================================================================

print("\n=== PHASE 4: Verification ===");

print("\n10. Verifying migration...");
print(`  - users: ${db.users.count()} documents`);
print(`  - organizations: ${db.organizations.count()} documents`);
print(`  - user_events: ${db.user_events.count()} documents`);
print(`  - files: ${db.files.count()} documents`);

print("\n✅ Migration completed successfully!");
print("\n⚠️  IMPORTANT: Backup your data before dropping old database!");
print("To drop old database, run: db.getSiblingDB('docgo_user_service').dropDatabase()");
