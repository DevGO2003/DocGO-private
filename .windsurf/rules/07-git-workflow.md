---
id: "rule-git-workflow"
trigger: model_decision
description: |
  This rule establishes comprehensive Git workflow standards for DocGO including remote repository management (origin/private), push workflows, branching strategies, and security best practices.
  It ensures secure code deployment with proper separation of public and private repositories, consistent branching patterns, and robust security measures for sensitive data handling.
  The rule covers commit message standards, conflict resolution procedures, repository maintenance, and collaboration workflows to maintain high-quality version control practices.
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
  - git
  - workflow
  - remotes
  - origin
  - private
  - security
  - branching
  - push
  - collaboration
---

# Git Workflow Standards cho DocGO

## Mục tiêu
- Chuẩn hóa Git remotes và push workflow
- Đồng nhất branching strategy cho team
- Bảo mật thông tin nhạy cảm trong Git
- Tối ưu hóa collaboration workflow

## 1. Git Remote Configuration

### Remote Setup
```bash
# Origin remote (public repository)
git remote add origin https://github.com/DevGO2003/DocGO.git

# Private remote (sensitive data)
git remote add private https://github.com/DevGO2003/DocGO-private.git

# Verify remotes
git remote -v
```

### Remote Purposes
- **origin**: Public repository (code nguồn, không chứa secrets)
- **private**: Private repository (API keys, database credentials, sensitive files)

## 2. Push Workflow

### Code Public (Không chứa secrets)
```bash
# Push to origin first
git push origin main

# Then push to private
git push private main
```

### Code Sensitive (Chứa secrets)
```bash
# CHỈ push to private
git push private main

# KHÔNG push to origin
```

### Workflow Steps
1. **Check status**: `git status --porcelain`
2. **Add changes**: `git add .`
3. **Commit**: `git commit -m "feat: add new feature"`
4. **Check remotes**: `git remote -v`
5. **Push accordingly**:
   - Public code → `git push origin main; git push private main`
   - Sensitive code → `git push private main`

## 3. Branching Strategy

### Branch Naming Convention
- **main**: Production-ready code
- **develop**: Development integration branch
- **feature/**: New features (`feature/user-authentication`)
- **bugfix/**: Bug fixes (`bugfix/login-error`)
- **hotfix/**: Critical fixes (`hotfix/security-patch`)
- **release/**: Release preparation (`release/v1.2.0`)

### Branch Workflow
```bash
# Create feature branch
git checkout -b feature/new-api-endpoint

# Work on feature
git add .
git commit -m "feat: add new API endpoint"

# Push feature branch
git push origin feature/new-api-endpoint

# Create Pull Request
# After review and merge, delete branch
git branch -d feature/new-api-endpoint
```

## 4. Security Practices

### Sensitive Data Protection
- **KHÔNG commit** files chứa secrets:
  - `.env` files
  - API keys
  - Database credentials
  - Private certificates
  - Configuration files với sensitive data

### Pre-commit Checks
```bash
# Check for sensitive data before commit
git diff --cached | grep -i "password\|secret\|key\|token"

# Check .env files
git status --porcelain | grep "\.env$"

# If found, unstage and add to .gitignore
git reset HEAD .env
echo ".env" >> .gitignore
```

### .gitignore Standards
```gitignore
# Environment files
.env
.env.local
.env.production
.env.*.local

# Secrets
**/secrets/
**/credentials/
**/*.pem
**/*.key
**/*.p12

# Database files
**/*.db
**/*.sqlite
**/*.sqlite3

# Logs
**/*.log
**/logs/

# Build artifacts
**/node_modules/
**/target/
**/__pycache__/
**/dist/
**/build/
```

## 5. Commit Message Standards

### Commit Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```bash
# Good commit messages
git commit -m "feat(auth): add JWT token validation"
git commit -m "fix(api): resolve CORS issue in user service"
git commit -m "docs(readme): update installation instructions"
git commit -m "refactor(database): optimize user queries"

# Bad commit messages
git commit -m "fix"
git commit -m "update stuff"
git commit -m "WIP"
```

## 6. Collaboration Workflow

### Pull Request Process
1. **Create feature branch** từ `develop`
2. **Implement changes** với proper commits
3. **Push branch** to origin
4. **Create Pull Request** với description chi tiết
5. **Code review** bởi team members
6. **Address feedback** và update PR
7. **Merge** sau khi approved
8. **Delete branch** sau khi merge

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No sensitive data included
```

## 7. Conflict Resolution

### Merge Conflicts
```bash
# Pull latest changes
git pull origin main

# Resolve conflicts in files
# Edit conflicted files manually

# Add resolved files
git add .

# Complete merge
git commit -m "resolve: merge conflicts in user service"
```

### Rebase Strategy
```bash
# Interactive rebase for clean history
git rebase -i HEAD~3

# Squash commits if needed
# Edit commit messages
# Continue rebase
git rebase --continue
```

## 8. Repository Maintenance

### Cleanup Commands
```bash
# Remove untracked files
git clean -fd

# Remove merged branches
git branch --merged | grep -v main | xargs -n 1 git branch -d

# Prune remote references
git remote prune origin

# Garbage collection
git gc --prune=now
```

### Repository Size Management
```bash
# Check repository size
du -sh .git

# Check large files
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | awk '/^blob/ {print substr($0,6)}' | sort -k2nr | head -10

# Remove large files from history (if needed)
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch large-file.zip' --prune-empty --tag-name-filter cat -- --all
```

## 9. Backup & Recovery

### Backup Strategy
```bash
# Create backup branch
git checkout -b backup/$(date +%Y%m%d)

# Push backup to private remote
git push private backup/$(date +%Y%m%d)

# Tag important commits
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
git push private v1.0.0
```

### Recovery Procedures
```bash
# Recover from accidental deletion
git reflog
git checkout <commit-hash>

# Recover deleted branch
git checkout -b recovered-branch <commit-hash>

# Reset to previous commit
git reset --hard HEAD~1
```

## 10. Troubleshooting

### Common Issues
1. **Push rejected**: Check remote permissions
2. **Merge conflicts**: Resolve manually
3. **Detached HEAD**: Checkout to branch
4. **Lost commits**: Use reflog
5. **Large files**: Use Git LFS

### Debug Commands
```bash
# Check repository status
git status --porcelain

# Check remote configuration
git remote -v

# Check branch information
git branch -a

# Check commit history
git log --oneline -10

# Check file changes
git diff --name-only
```

---

**Lưu ý**: Git workflow standards này đảm bảo tính nhất quán và bảo mật cho việc quản lý code trong DocGO project.