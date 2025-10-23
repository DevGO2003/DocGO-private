# Files to Delete

## ❌ Old FileEventConsumer
**Path**: `src/main/java/com/devgo2003/docgo/repository_service/consumer/FileEventConsumer.java`

**Reason**: Duplicate bean conflict. New FileEventConsumer already exists in:
- `src/main/java/com/devgo2003/docgo/repository_service/service/event/consumer/FileEventConsumer.java`

**Error**:
```
ConflictingBeanDefinitionException: 
Annotation-specified bean name 'fileEventConsumer' conflicts with existing bean
```

**Action**: Delete the old file manually

**Command**:
```bash
rm backend/repository-management-service/src/main/java/com/devgo2003/docgo/repository_service/consumer/FileEventConsumer.java
```
