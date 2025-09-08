# Cursor Rules for DocGO Project

## General Rules
- Always respond in Vietnamese unless specifically requested otherwise
- Follow the established coding standards and patterns in the codebase
- Use meaningful variable names and comments in Vietnamese
- Maintain consistency with existing code structure

## API Standards
- All APIs must follow the established REST conventions
- Use proper HTTP status codes
- Include comprehensive error handling
- Follow the established response format

## Documentation
- All code changes must be documented
- Update README files when adding new features
- Include usage examples in documentation

## Testing
- Write tests for new functionality
- Ensure existing tests pass before committing changes
- Follow the established testing patterns

## Backend Microservice Auto-Redirect Rule
- **MANDATORY**: All backend microservices MUST implement automatic redirect from root path (`/`) to `/docs`
- **Purpose**: Improve developer experience by automatically showing API documentation when accessing the service root
- **Implementation**:
  - Spring Boot (Java): Add redirect controller or configuration
  - FastAPI (Python): Add redirect middleware or root endpoint
  - Node.js/Next.js: Add redirect in API routes
- **Behavior**: When accessing `http://localhost:PORT/` → automatically redirect to `http://localhost:PORT/docs`
- **Ports affected**: All backend services (8000-8017) except frontend (3000)
- **Exception**: Frontend services should not redirect to /docs

## Microservice Port Mapping
- api-gateway-bff: 8000
- authentication-identity-service: 8001
- user-management-service: 8002
- contract-management-service: 8003
- versioning-document-history-service: 8004
- commenting-collaboration-service: 8005
- approval-workflow-service: 8006
- reminder-scheduler-service: 8007
- esignature-integration-service: 8008
- notification-service: 8009
- reporting-analytics-service: 8010
- ocr-document-extraction-service: 8011
- file-storage-asset-service: 8012
- audit-activity-log-service: 8013
- integration-connectors-service: 8014
- batch-etl-service: 8015
- health-monitoring-agent: 8016
- ai-processing-service: 8017

## Code Quality
- Follow the established naming conventions
- Use proper indentation and formatting
- Include appropriate error handling
- Write clean, maintainable code

## Git Workflow
- Use descriptive commit messages
- Create feature branches for new development
- Ensure all tests pass before merging
- Update documentation as needed
