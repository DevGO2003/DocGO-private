# DocGO Organization API Test Guide

## Overview
This guide provides comprehensive testing for the Organization Management API endpoints in the user-management-service.

## Service Configuration
- **Base URL**: `http://localhost:8001`
- **API Base**: `/api/v1/user-management-service/organizations`
- **Port**: 8001
- **Database**: MongoDB Atlas

## Available Test Scripts

### 1. Quick Test Script (Recommended)
**File**: `test-org-quick.ps1`
- Tests the most important endpoints
- Includes cleanup operations
- Easy to run and understand

### 2. Comprehensive Test Script
**File**: `test-organization-api.ps1`
- Tests all available endpoints
- Includes error handling scenarios
- More detailed testing

### 3. Batch File Test
**File**: `test-org-api.bat`
- Simple curl-based tests
- Works on any Windows system
- No PowerShell dependencies

## API Endpoints Tested

### Core Organization Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/organizations` | Get all organizations with pagination |
| POST | `/organizations` | Create new organization |
| GET | `/organizations/{id}` | Get organization by ID |
| PUT | `/organizations/{id}` | Update organization |
| DELETE | `/organizations/{id}` | Delete organization |

### Member Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/organizations/{id}/members` | Invite member to organization |
| GET | `/organizations/{id}/members` | Get organization members |
| PUT | `/organizations/{id}/members/{userId}` | Update member information |
| DELETE | `/organizations/{id}/members/{userId}` | Remove member from organization |

### Admin Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/organizations/{id}/admins` | Add admin to organization |
| DELETE | `/organizations/{id}/admins/{userId}` | Remove admin from organization |

### Ownership & Invitations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/organizations/{id}/transfer-ownership` | Transfer organization ownership |
| GET | `/organizations/invitations/pending` | Get pending invitations |
| POST | `/organizations/invitations/{token}/accept` | Accept invitation |
| POST | `/organizations/invitations/{token}/reject` | Reject invitation |

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/organizations/users/available` | Get available users for invitation |

## Request/Response Examples

### Create Organization
```json
POST /api/v1/user-management-service/organizations
{
  "name": "Test Organization",
  "code": "TEST_ORG",
  "description": "Test organization for API testing",
  "address": "123 Test Street",
  "phone": "+1234567890",
  "email": "test@organization.com",
  "website": "https://test-org.com",
  "ownerUserId": "user-123"
}
```

### Update Organization
```json
PUT /api/v1/user-management-service/organizations/{id}
{
  "name": "Updated Organization Name",
  "description": "Updated description",
  "phone": "+0987654321"
}
```

### Invite Member
```json
POST /api/v1/user-management-service/organizations/{id}/members
{
  "userId": "member-123",
  "roleId": "role-456"
}
```

## Running the Tests

### Prerequisites
1. Start the user-management-service:
   ```bash
   cd backend/user-management-service
   mvn spring-boot:run
   ```

2. Ensure the service is running on port 8001

### PowerShell Test (Recommended)
```powershell
# Run the quick test
.\test-org-quick.ps1

# Run the comprehensive test
.\test-organization-api.ps1
```

### Batch File Test
```cmd
# Run the batch test
test-org-api.bat
```

## Expected Results

### Successful Response Format
```json
{
  "statusCode": 200,
  "shortMessage": "Success",
  "description": "Operation completed successfully",
  "data": { ... },
  "apiVersion": "v1",
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "uuid-here",
  "path": "/api/v1/user-management-service/organizations"
}
```

### Error Response Format
```json
{
  "statusCode": 400,
  "shortMessage": "Bad Request",
  "description": "Validation error message",
  "data": null,
  "apiVersion": "v1",
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "uuid-here",
  "path": "/api/v1/user-management-service/organizations"
}
```

## Common Issues & Solutions

### 1. Service Not Running
**Error**: Connection refused
**Solution**: Start the service with `mvn spring-boot:run`

### 2. Authentication Required
**Error**: 401 Unauthorized
**Solution**: Check if JWT authentication is configured and provide valid tokens

### 3. Database Connection
**Error**: MongoDB connection failed
**Solution**: Check MongoDB Atlas connection string in `.env` file

### 4. Validation Errors
**Error**: 400 Bad Request
**Solution**: Check request body format and required fields

## Test Data

### Test Organization
- **Name**: "Test Organization"
- **Code**: "TEST_ORG"
- **Owner**: "test-user-123"

### Test Users
- **Member**: "test-member-789"
- **Admin**: "test-admin-456"

## Monitoring & Logs

### Service Logs
Check the console output for detailed logs:
```
[OrganizationController] Creating organization: Test Organization
[OrganizationController] Getting organization with id: org-123
```

### Health Check
```bash
curl http://localhost:8001/actuator/health
```

## Additional Resources

- **Swagger UI**: `http://localhost:8001/docs`
- **API Docs**: `http://localhost:8001/v3/api-docs`
- **Health Endpoint**: `http://localhost:8001/actuator/health`

## Troubleshooting

1. **Check service status**: `curl http://localhost:8001/actuator/health`
2. **View logs**: Check console output for error messages
3. **Verify configuration**: Check `application.properties` and `.env` files
4. **Test connectivity**: Use `telnet localhost 8001` to verify port accessibility

## Support

For issues with the API testing:
1. Check the service logs
2. Verify all prerequisites are met
3. Test individual endpoints with curl
4. Check the Swagger UI for API documentation
