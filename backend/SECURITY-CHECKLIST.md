# 🔒 Security Checklist - DocGO Backend

## ⚠️ CẢNH BÁO BẢO MẬT

**KHÔNG BAO GIỜ** commit các thông tin nhạy cảm sau vào Git:
- ❌ MongoDB Atlas URI với credentials
- ❌ Database passwords
- ❌ API keys, JWT secrets
- ❌ OAuth client secrets
- ❌ AWS/S3 access keys

---

## ✅ Quy tắc bảo mật

### 1. Environment Variables

**ĐÚNG:** ✅
```properties
# application.properties
spring.data.mongodb.uri=${MONGODB_ATLAS_URI}
spring.data.mongodb.database=${MONGODB_DATABASE:docgo}
```

**SAI:** ❌
```properties
# application.properties
spring.data.mongodb.uri=mongodb+srv://user:password@cluster.mongodb.net
```

---

### 2. File .env

**Cấu trúc:**
```
backend/
├── user-management-service/
│   ├── .env                # ❌ KHÔNG commit (trong .gitignore)
│   └── .env.example        # ✅ Commit (template không có secrets)
└── repository-management-service/
    ├── .env                # ❌ KHÔNG commit
    └── .env.example        # ✅ Commit (template)
```

**File .env (local development):**
```bash
# THỰC TẾ - KHÔNG commit
MONGODB_ATLAS_URI=mongodb+srv://actual_user:actual_password@cluster.mongodb.net/docgo
JWT_SECRET=actual_jwt_secret_base64_encoded
GOOGLE_CLIENT_SECRET=actual_google_secret
```

**File .env.example (template):**
```bash
# TEMPLATE - Commit được
MONGODB_ATLAS_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/docgo
JWT_SECRET=<generate-strong-base64-secret>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

---

### 3. Kiểm tra .gitignore

**PHẢI có trong .gitignore:**
```gitignore
# Environment files
.env
.env.local
.env.*.local
*.env

# Backup files
*.bak
backup/

# IDE files
.idea/
.vscode/
*.iml
```

---

### 4. Migration Scripts

**ĐÚNG:** ✅
```bash
# Sử dụng environment variable
mongosh "$MONGODB_ATLAS_URI" --file migrate.js
mongodump --uri="$MONGODB_ATLAS_URI" --out=./backup/
```

**SAI:** ❌
```bash
# Hardcode credentials
mongosh "mongodb+srv://user:pass@cluster.mongodb.net" --file migrate.js
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net" --out=./backup/
```

---

### 5. Docker Compose

**ĐÚNG:** ✅
```yaml
services:
  user-service:
    environment:
      - MONGODB_ATLAS_URI=${MONGODB_ATLAS_URI}
      - JWT_SECRET=${JWT_SECRET}
```

**SAI:** ❌
```yaml
services:
  user-service:
    environment:
      - MONGODB_ATLAS_URI=mongodb+srv://user:pass@cluster.mongodb.net
      - JWT_SECRET=hardcoded_secret
```

---

## 🛡️ Best Practices

### Production Deployment

1. **Sử dụng Secret Manager:**
   - AWS Secrets Manager
   - Azure Key Vault
   - Google Cloud Secret Manager
   - HashiCorp Vault

2. **Environment Variables trong CI/CD:**
   - GitHub Secrets
   - GitLab CI/CD Variables
   - Jenkins Credentials

3. **Rotate Credentials định kỳ:**
   - MongoDB: 90 days
   - JWT Secret: 180 days
   - OAuth Secrets: 180 days

---

## 📋 Pre-commit Checklist

Trước mỗi commit, kiểm tra:

- [ ] Không có hardcoded credentials trong code
- [ ] Không có `.env` trong staged files
- [ ] Chỉ có `.env.example` được commit
- [ ] application.properties chỉ dùng `${ENV_VAR}`
- [ ] Migration scripts dùng `$MONGODB_ATLAS_URI`
- [ ] Docker compose dùng environment variables
- [ ] .gitignore đã update đầy đủ

---

## 🚨 Nếu đã leak credentials

**Hành động ngay lập tức:**

1. **Rotate credentials:**
   ```bash
   # MongoDB Atlas
   # 1. Login Atlas Console
   # 2. Database Access → Reset Password
   # 3. Update .env local
   ```

2. **Revoke compromised secrets:**
   - Google OAuth: Revoke client secret
   - AWS: Rotate access keys
   - JWT: Generate new secret

3. **Scan git history:**
   ```bash
   # Tìm sensitive data trong history
   git log -p | grep -i "password\|secret\|key"
   ```

4. **Rewrite git history (nếu cần):**
   ```bash
   # Sử dụng BFG Repo-Cleaner hoặc git-filter-repo
   # CHỈ làm khi thực sự cần thiết
   ```

---

## 📧 Báo cáo vấn đề bảo mật

Nếu phát hiện lỗ hổng bảo mật:
1. **KHÔNG** tạo public issue
2. Liên hệ team lead trực tiếp
3. Gửi email: security@devgo2003.com

---

## 📚 Resources

- [MongoDB Security Best Practices](https://www.mongodb.com/docs/manual/security/)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

---

**Last Updated:** 2025-10-22  
**Version:** 1.0.0
