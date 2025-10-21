---
id: "rule-mcp-external"
description: "Ưu tiên MCP cho external operations (GitHub, Browser, Discord), priority rules, và fallback strategies cho DocGO"
alwaysApply: false
globs:
  - "**/github*.py"
  - "**/browser*.py"
  - "**/discord*.py"
  - "**/external*.py"
tags:
  - mcp
  - external
  - github
  - browser
  - chrome
  - discord
  - priority
  - fallback
  - automation
  - integration
---

# MCP External Operations cho DocGO

## Mục tiêu
- Ưu tiên MCP tools cho external operations
- Đồng nhất GitHub, Browser, Discord operations
- Tối ưu hóa priority rules và fallback strategies
- Đảm bảo reliability cho external integrations

## 1. GitHub Operations

### ✅ SỬ DỤNG MCP:
- **Tạo repository**: `mcp_Github_create_repository`
- **Tạo issue/PR**: `mcp_Github_create_issue`, `mcp_Github_create_pull_request`
- **Tìm kiếm code**: `mcp_Github_search_code`
- **Quản lý files**: `mcp_Github_create_or_update_file`, `mcp_Github_push_files`

### ❌ KHÔNG SỬ DỤNG:
- `git` commands qua terminal khi có MCP tương đương
- Manual GitHub API calls

### Repository Management
```javascript
// Create new repository
const repo = await mcp_Github_create_repository({
  name: "docgo-feature",
  description: "New feature for DocGO",
  private: true
})

// Search repositories
const repos = await mcp_Github_search_repositories({
  query: "user:DevGO2003 docgo"
})
```

### Issue Management
```javascript
// Create issue
const issue = await mcp_Github_create_issue({
  owner: "DevGO2003",
  repo: "DocGO",
  title: "Bug: Login not working",
  body: "Description of the bug...",
  labels: ["bug", "high-priority"]
})

// List issues
const issues = await mcp_Github_list_issues({
  owner: "DevGO2003",
  repo: "DocGO",
  state: "open"
})
```

### Pull Request Management
```javascript
// Create pull request
const pr = await mcp_Github_create_pull_request({
  owner: "DevGO2003",
  repo: "DocGO",
  title: "feat: add new API endpoint",
  head: "feature/new-api",
  base: "main",
  body: "Description of changes..."
})

// List pull requests
const prs = await mcp_Github_list_pull_requests({
  owner: "DevGO2003",
  repo: "DocGO",
  state: "open"
})
```

### File Operations
```javascript
// Create or update file
await mcp_Github_create_or_update_file({
  owner: "DevGO2003",
  repo: "DocGO",
  path: "src/api/new-endpoint.js",
  content: "// New API endpoint code",
  message: "feat: add new API endpoint",
  branch: "feature/new-api"
})

// Push multiple files
await mcp_Github_push_files({
  owner: "DevGO2003",
  repo: "DocGO",
  branch: "feature/new-api",
  message: "feat: add multiple files",
  files: [
    { path: "src/api/endpoint1.js", content: "..." },
    { path: "src/api/endpoint2.js", content: "..." }
  ]
})
```

## 2. Browser Operations

### ✅ SỬ DỤNG MCP:
- **Navigate**: `mcp_Chrome_navigate_page`
- **Take screenshot**: `mcp_Chrome_take_screenshot`
- **Interact with elements**: `mcp_Chrome_click`, `mcp_Chrome_fill`
- **Debug**: `mcp_Chrome_list_console_messages`, `mcp_Chrome_list_network_requests`

### ❌ KHÔNG SỬ DỤNG:
- Manual browser automation
- Selenium scripts qua terminal

### Navigation
```javascript
// Navigate to page
await mcp_Chrome_navigate_page({
  url: "http://localhost:3000"
})

// Navigate with timeout
await mcp_Chrome_navigate_page({
  url: "http://localhost:3000",
  timeout: 10000
})
```

### Screenshots
```javascript
// Take full page screenshot
await mcp_Chrome_take_screenshot({
  fullPage: true,
  format: "png"
})

// Take element screenshot
await mcp_Chrome_take_screenshot({
  uid: "element-uid",
  format: "png"
})

// Take screenshot with quality
await mcp_Chrome_take_screenshot({
  fullPage: true,
  format: "jpeg",
  quality: 80
})
```

### Element Interaction
```javascript
// Click element
await mcp_Chrome_click({
  uid: "button-uid"
})

// Fill form field
await mcp_Chrome_fill({
  uid: "input-uid",
  value: "test@example.com"
})

// Fill multiple form fields
await mcp_Chrome_fill_form({
  elements: [
    { uid: "username-input", value: "testuser" },
    { uid: "password-input", value: "testpass" }
  ]
})
```

### Debugging
```javascript
// Get console messages
const consoleLogs = await mcp_Chrome_list_console_messages()

// Get network requests
const networkRequests = await mcp_Chrome_list_network_requests({
  resourceTypes: ["xhr", "fetch"]
})

// Get specific network request
const request = await mcp_Chrome_get_network_request({
  url: "http://localhost:8000/api/users"
})
```

## 3. Discord Operations

### ✅ SỬ DỤNG MCP:
- **Send messages**: `mcp_Discord_send_message`
- **Read messages**: `mcp_Discord_read_messages`
- **Manage listeners**: `mcp_Discord_create_listener`, `mcp_Discord_remove_listener`

### Message Operations
```javascript
// Send message to channel
await mcp_Discord_send_message({
  channel: "general",
  message: "Hello from DocGO bot!"
})

// Send message to specific server
await mcp_Discord_send_message({
  server: "DocGO Server",
  channel: "general",
  message: "Hello from DocGO bot!"
})
```

### Message Reading
```javascript
// Read recent messages
const messages = await mcp_Discord_read_messages({
  channel: "general",
  limit: 50
})

// Read messages from specific server
const messages = await mcp_Discord_read_messages({
  server: "DocGO Server",
  channel: "general",
  limit: 50
})
```

### Listener Management
```javascript
// Create message listener
await mcp_Discord_create_listener({
  keywords: ["help", "support"],
  handlerId: "help-handler",
  description: "Help command listener"
})

// List active listeners
const listeners = await mcp_Discord_list_listeners()

// Remove listener
await mcp_Discord_remove_listener({
  listenerId: "listener-123"
})
```

## 4. Priority Rules

### Thứ tự ưu tiên:
1. **MCP Tools** (cao nhất) - Nhanh, an toàn, có error handling
2. **Codebase Search** - Tìm kiếm trong code
3. **File Operations** - Đọc/ghi file
4. **Terminal Commands** (thấp nhất) - Chỉ khi không có MCP tương đương

### Ví dụ workflow tối ưu:

#### Scenario: Debug frontend issue
```javascript
// 1. ✅ Sử dụng MCP để navigate
await mcp_Chrome_navigate_page({
  url: "http://localhost:3000"
})

// 2. ✅ Sử dụng MCP để take screenshot
await mcp_Chrome_take_screenshot({
  fullPage: true
})

// 3. ✅ Sử dụng MCP để check console
const consoleLogs = await mcp_Chrome_list_console_messages()

// 4. ✅ Sử dụng MCP để check network
const networkRequests = await mcp_Chrome_list_network_requests()
```

#### Scenario: GitHub workflow
```javascript
// 1. ✅ Sử dụng MCP để search code
const codeResults = await mcp_Github_search_code({
  q: "repo:DevGO2003/DocGO authentication"
})

// 2. ✅ Sử dụng MCP để create issue
const issue = await mcp_Github_create_issue({
  owner: "DevGO2003",
  repo: "DocGO",
  title: "Bug found in authentication",
  body: "Found issue in auth flow..."
})

// 3. ✅ Sử dụng MCP để create PR
const pr = await mcp_Github_create_pull_request({
  owner: "DevGO2003",
  repo: "DocGO",
  title: "fix: resolve authentication bug",
  head: "bugfix/auth-issue",
  base: "main"
})
```

## 5. Error Handling với MCP

### GitHub Error Handling
```javascript
try {
  const repo = await mcp_Github_create_repository({
    name: "new-repo",
    description: "New repository"
  })
} catch (error) {
  if (error.message.includes("already exists")) {
    console.log("Repository already exists, using existing one")
  } else {
    console.error("Failed to create repository:", error)
    // Fallback to terminal git commands
  }
}
```

### Browser Error Handling
```javascript
try {
  await mcp_Chrome_navigate_page({
    url: "http://localhost:3000"
  })
} catch (error) {
  console.error("Failed to navigate:", error)
  // Fallback to manual browser opening
  run_terminal_cmd("start http://localhost:3000")
}
```

### Discord Error Handling
```javascript
try {
  await mcp_Discord_send_message({
    channel: "general",
    message: "Hello!"
  })
} catch (error) {
  console.error("Failed to send Discord message:", error)
  // Fallback to other notification methods
}
```

## 6. Performance Optimization

### Parallel Operations
```javascript
// Parallel GitHub operations
const [repos, issues, prs] = await Promise.all([
  mcp_Github_search_repositories({ query: "user:DevGO2003" }),
  mcp_Github_list_issues({ owner: "DevGO2003", repo: "DocGO" }),
  mcp_Github_list_pull_requests({ owner: "DevGO2003", repo: "DocGO" })
])
```

### Caching Results
```javascript
// Cache GitHub search results
const cache = new Map()

async function getCachedRepos(query) {
  if (cache.has(query)) {
    return cache.get(query)
  }
  
  const repos = await mcp_Github_search_repositories({ query })
  cache.set(query, repos)
  return repos
}
```

## 7. Security với MCP

### GitHub Security
```javascript
// ✅ An toàn: Sử dụng environment variables
const githubToken = process.env.GITHUB_TOKEN

// ✅ An toàn: Validate input
if (!owner || !repo) {
  throw new Error('Owner and repo are required')
}

// ✅ An toàn: Gọi MCP với validated input
const issues = await mcp_Github_list_issues({
  owner: validatedOwner,
  repo: validatedRepo
})
```

### Browser Security
```javascript
// ✅ An toàn: Validate URLs
function isValidUrl(url) {
  try {
    new URL(url)
    return url.startsWith('http://') || url.startsWith('https://')
  } catch {
    return false
  }
}

if (isValidUrl(url)) {
  await mcp_Chrome_navigate_page({ url })
} else {
  throw new Error('Invalid URL')
}
```

## 8. Best Practices

### Do's
- **Sử dụng MCP tools** cho tất cả external operations
- **Implement proper error handling** cho failed operations
- **Use parallel operations** khi có thể
- **Cache frequently accessed data**
- **Validate inputs** trước khi gọi MCP
- **Log operations** để monitoring

### Don'ts
- **Không sử dụng terminal commands** khi có MCP tương đương
- **Không hardcode credentials** trong MCP calls
- **Không ignore errors** từ MCP operations
- **Không expose sensitive data** trong logs
- **Không make unnecessary external calls**

---

**Lưu ý**: MCP external operations này đảm bảo tính nhất quán và hiệu quả cho việc tương tác với external services trong DocGO ecosystem.