---
id: "rule-mcp-database"
trigger: model_decision
description:
  This rule establishes Model Context Protocol (MCP) standards for database operations in DocGO including MongoDB and Redis interactions, comprehensive error handling, retry logic, and performance optimization strategies.
  It prioritizes MCP tools over terminal commands for database queries, ensuring faster, safer, and more reliable database operations with proper error recovery mechanisms.
  The rule covers batch operations, caching strategies, security practices, monitoring procedures, and fallback mechanisms to maintain robust database integration patterns.
globs:
  - "**/*.java"
  - "**/*.py"
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.json"
  - "**/*.yaml"
  - "**/*.yml"
  - "**/*.xml"
  - "**/*.md"
  - "**/*.txt"
  - "**/*.html"
  - "**/src/**/*.*"
  - "**/config/**/*.*"
  - "**/scripts/**/*.*"
tags:
  - mcp
  - database
  - mongodb
  - redis
  - operations
  - error-handling
  - retry
  - performance
  - optimization
  - fallback
---

# MCP Database Operations cho DocGO

## Mục tiêu
- Ưu tiên MCP tools cho database operations
- Đồng nhất error handling và retry logic
- Tối ưu hóa performance và batching
- Đảm bảo fallback khi MCP fails

## 1. Database Operations (MongoDB, Redis)

### ✅ SỬ DỤNG MCP:
- **Xem dữ liệu trong database**: `mcp_MongoDB_list_collections`, `mcp_MongoDB_find`
- **Kiểm tra schema**: `mcp_MongoDB_schema`
- **Thống kê database**: `mcp_MongoDB_db_stats`, `mcp_MongoDB_storage_size`
- **Truy vấn dữ liệu**: `mcp_MongoDB_aggregate`, `mcp_MongoDB_count`
- **Quản lý collections**: `mcp_MongoDB_create_collection`, `mcp_MongoDB_drop_collection`

### ❌ KHÔNG SỬ DỤNG:
- `docker exec` để vào MongoDB shell
- Terminal commands để connect database
- Manual database queries qua terminal

### Ví dụ sử dụng:
```javascript
// ✅ ĐÚNG: Sử dụng MCP để xem collections
mcp_MongoDB_list_collections()

// ✅ ĐÚNG: Sử dụng MCP để tìm dữ liệu
mcp_MongoDB_find({
  collection: "users",
  query: { status: "active" },
  limit: 10
})

// ❌ SAI: Sử dụng terminal
run_terminal_cmd("docker exec -it mongodb mongo --eval 'db.users.find()'")
```

## 2. MongoDB Operations

### Collection Management
```javascript
// List all collections
const collections = await mcp_MongoDB_list_collections()

// Get collection schema
const schema = await mcp_MongoDB_schema({
  collection: "users"
})

// Create new collection
await mcp_MongoDB_create_collection({
  collection: "new_collection"
})

// Drop collection
await mcp_MongoDB_drop_collection({
  collection: "old_collection"
})
```

### Data Querying
```javascript
// Find documents with query
const users = await mcp_MongoDB_find({
  collection: "users",
  query: { status: "active" },
  limit: 10,
  skip: 0
})

// Count documents
const count = await mcp_MongoDB_count({
  collection: "users",
  query: { status: "active" }
})

// Aggregate data
const stats = await mcp_MongoDB_aggregate({
  collection: "users",
  pipeline: [
    { $match: { status: "active" } },
    { $group: { _id: "$department", count: { $sum: 1 } } }
  ]
})
```

### Database Statistics
```javascript
// Get database stats
const dbStats = await mcp_MongoDB_db_stats()

// Get storage size
const storageSize = await mcp_MongoDB_storage_size()

// Get collection stats
const collectionStats = await mcp_MongoDB_collection_stats({
  collection: "users"
})
```

## 3. Redis Operations

### Key Management
```javascript
// Set key-value
await mcp_Redis_set({
  key: "user:123",
  value: JSON.stringify({ name: "John", email: "john@example.com" }),
  ttl: 3600
})

// Get key
const user = await mcp_Redis_get({
  key: "user:123"
})

// Delete key
await mcp_Redis_del({
  key: "user:123"
})
```

### List Operations
```javascript
// Push to list
await mcp_Redis_lpush({
  key: "queue:jobs",
  value: JSON.stringify({ jobId: "123", type: "process" })
})

// Pop from list
const job = await mcp_Redis_rpop({
  key: "queue:jobs"
})

// Get list length
const length = await mcp_Redis_llen({
  key: "queue:jobs"
})
```

### Hash Operations
```javascript
// Set hash field
await mcp_Redis_hset({
  key: "user:123",
  field: "name",
  value: "John Doe"
})

// Get hash field
const name = await mcp_Redis_hget({
  key: "user:123",
  field: "name"
})

// Get all hash fields
const userData = await mcp_Redis_hgetall({
  key: "user:123"
})
```

## 4. Error Handling với MCP

### Khi MCP tool fails:
1. **Retry với parameters khác** nếu có thể
2. **Fallback về terminal commands** chỉ khi cần thiết
3. **Log error và suggest alternatives**

### Ví dụ error handling:
```javascript
try {
  // Thử MCP trước
  const result = await mcp_MongoDB_find({
    collection: "users",
    query: { status: "active" }
  })
} catch (error) {
  // Fallback về terminal nếu MCP fails
  console.log("MCP failed, using terminal fallback")
  run_terminal_cmd("docker exec -it mongodb mongo --eval 'db.users.find({status: \"active\"})'")
}
```

### Retry Logic
```javascript
async function mcpWithRetry(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

// Usage
const users = await mcpWithRetry(() => 
  mcp_MongoDB_find({
    collection: "users",
    query: { status: "active" }
  })
)
```

## 5. Performance Optimization

### Batch Operations
```javascript
// Parallel operations
const [collections, stats, schema] = await Promise.all([
  mcp_MongoDB_list_collections(),
  mcp_MongoDB_db_stats(),
  mcp_MongoDB_schema({ collection: "users" })
])

// Batch queries
const queries = [
  { collection: "users", query: { status: "active" } },
  { collection: "orders", query: { status: "pending" } },
  { collection: "products", query: { inStock: true } }
]

const results = await Promise.all(
  queries.map(q => mcp_MongoDB_find(q))
)
```

### Caching Results
```javascript
// Cache frequently accessed data
const cache = new Map()

async function getCachedUsers() {
  if (cache.has('users')) {
    return cache.get('users')
  }
  
  const users = await mcp_MongoDB_find({
    collection: "users",
    query: { status: "active" }
  })
  
  cache.set('users', users)
  return users
}
```

### Query Optimization
```javascript
// Use limit for large datasets
const users = await mcp_MongoDB_find({
  collection: "users",
  query: {},
  limit: 100  // Giới hạn kết quả
})

// Use skip for pagination
const page2 = await mcp_MongoDB_find({
  collection: "users",
  query: {},
  limit: 20,
  skip: 20
})
```

## 6. Security với MCP

### Bảo mật:
- **Không expose sensitive data** trong MCP calls
- **Sử dụng environment variables** cho credentials
- **Validate input parameters** trước khi gọi MCP
- **Log MCP operations** để audit

### Ví dụ bảo mật:
```javascript
// ✅ An toàn: Sử dụng env vars
const mongoUri = process.env.MONGODB_URI

// ✅ An toàn: Validate input
if (!collectionName || typeof collectionName !== 'string') {
  throw new Error('Invalid collection name')
}

// ✅ An toàn: Gọi MCP với validated input
const result = await mcp_MongoDB_find({
  collection: collectionName,
  query: validatedQuery
})
```

## 7. Monitoring và Logging

### Operation Logging
```javascript
async function loggedMongoOperation(operation, params) {
  const startTime = Date.now()
  try {
    const result = await operation(params)
    const duration = Date.now() - startTime
    
    console.log(`MongoDB operation completed in ${duration}ms`)
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`MongoDB operation failed after ${duration}ms:`, error)
    throw error
  }
}

// Usage
const users = await loggedMongoOperation(mcp_MongoDB_find, {
  collection: "users",
  query: { status: "active" }
})
```

### Performance Metrics
```javascript
// Track operation metrics
const metrics = {
  totalOperations: 0,
  successfulOperations: 0,
  failedOperations: 0,
  averageResponseTime: 0
}

async function trackOperation(operation, params) {
  metrics.totalOperations++
  const startTime = Date.now()
  
  try {
    const result = await operation(params)
    metrics.successfulOperations++
    return result
  } catch (error) {
    metrics.failedOperations++
    throw error
  } finally {
    const duration = Date.now() - startTime
    metrics.averageResponseTime = 
      (metrics.averageResponseTime + duration) / 2
  }
}
```

## 8. Best Practices

### Do's
- **Sử dụng MCP tools** cho tất cả database operations
- **Implement retry logic** cho failed operations
- **Use batch operations** khi có thể
- **Cache frequently accessed data**
- **Log operations** để monitoring
- **Validate inputs** trước khi gọi MCP

### Don'ts
- **Không sử dụng terminal commands** khi có MCP tương đương
- **Không hardcode credentials** trong MCP calls
- **Không ignore errors** từ MCP operations
- **Không query large datasets** without limits
- **Không expose sensitive data** trong logs

---

**Lưu ý**: MCP database operations này đảm bảo tính nhất quán và hiệu quả cho việc tương tác với database trong DocGO ecosystem.