// MongoDB Indexes for DocGO Repository Service
// Database: docgo (production), docgo-dev (development)
// Collection: files

// Switch to database
use docgo;

// Drop existing indexes (optional, for clean setup)
// db.files.dropIndexes();

// ==================== PRIMARY INDEXES ====================

// 1. Unique ID index (created automatically by MongoDB)
// db.files.createIndex({ "_id": 1 }, { unique: true })

// ==================== QUERY INDEXES ====================

// 2. Owner + Status composite index (most common query)
db.files.createIndex(
  { "overview.ownerUserId": 1, "overview.status": 1 },
  { 
    name: "idx_files_owner_status_composite",
    background: true 
  }
);

// 3. Document Type index (filtering by type)
db.files.createIndex(
  { "overview.documentType": 1 },
  { 
    name: "idx_files_document_type",
    background: true 
  }
);

// 4. Contract Dates composite index (date range queries)
db.files.createIndex(
  { "contract.effectiveDate": 1, "contract.expiryDate": 1 },
  { 
    name: "idx_files_contract_dates_composite",
    background: true,
    sparse: true  // Only index documents with contract
  }
);

// 5. MD5 Hash unique index (duplicate detection)
db.files.createIndex(
  { "metadata.file.hash.md5": 1 },
  { 
    name: "idx_files_md5_unique",
    unique: true,
    sparse: true  // Allow docs without hash
  }
);

// 6. Created At descending index (recent first)
db.files.createIndex(
  { "audit.createdAt": -1 },
  { 
    name: "idx_files_created_at_desc",
    background: true 
  }
);

// 7. Updated At descending index (recently modified)
db.files.createIndex(
  { "audit.updatedAt": -1 },
  { 
    name: "idx_files_updated_at_desc",
    background: true 
  }
);

// 8. Title text index (full-text search)
db.files.createIndex(
  { "overview.title": "text" },
  { 
    name: "idx_files_title_text",
    background: true,
    weights: { "overview.title": 10 },
    default_language: "none"  // Support multilingual
  }
);

// ==================== FILE_VERSIONS COLLECTION ====================

// 1. Document ID + Bucket Number composite (version lookup)
db.file_versions.createIndex(
  { "documentId": 1, "bucketNumber": 1 },
  { 
    name: "idx_file_versions_doc_bucket_composite",
    unique: true,
    background: true 
  }
);

// 2. Document ID index (all versions for a document)
db.file_versions.createIndex(
  { "documentId": 1 },
  { 
    name: "idx_file_versions_doc_id",
    background: true 
  }
);

// ==================== FILE_FULL_CONTENTS COLLECTION ====================

// 1. Document ID unique index (one-to-one with files)
db.file_full_contents.createIndex(
  { "documentId": 1 },
  { 
    name: "idx_file_full_contents_doc_id_unique",
    unique: true,
    background: true 
  }
);

// ==================== VERIFY INDEXES ====================

print("\n=== Files Collection Indexes ===");
printjson(db.files.getIndexes());

print("\n=== File Versions Collection Indexes ===");
printjson(db.file_versions.getIndexes());

print("\n=== File Full Contents Collection Indexes ===");
printjson(db.file_full_contents.getIndexes());

print("\n✅ MongoDB Indexes Created Successfully!");
