# Cosmomedia Microservices

A modern microservices architecture for managing client projects, services, and billing.

## CI/CD Pipeline

### Environments
- **Development**: Local development environment
- **Test**: Automated testing environment
- **Staging**: Pre-production environment
- **Production**: Live environment

### Pipeline Stages

1. **Test**
   - Unit tests
   - Integration tests
   - MySQL & Redis service containers
   - Environment-specific configuration

2. **Lint**
   - ESLint checks
   - Code style validation

3. **Build**
   - Build Docker base image
   - Build service-specific images
   - Push to Docker Hub

4. **Deploy to Staging**
   - AWS ECS deployment
   - Environment validation
   - Service health checks

5. **Deploy to Production**
   - Manual approval required
   - Zero-downtime deployment
   - Health monitoring

### Required Secrets
```bash
# Docker Hub
DOCKER_USERNAME
DOCKER_PASSWORD

# AWS Configuration
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION

# Environment Secrets
STAGING_DB_PASSWORD
STAGING_JWT_SECRET
PROD_DB_PASSWORD
PROD_JWT_SECRET
```

## Running the Project

You can run the project either with or without Docker. Choose the method that best suits your needs.

### Method 1: Without Docker

#### Prerequisites
- Node.js >= 18
- MySQL 8.0
- Redis

#### Steps

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Up Environment**:
   ```bash
   # For development
   npm run env:dev
   
   # For production
   npm run env:prod
   
   # For testing
   npm run env:test
   ```

3. **Start All Services**:
   ```bash
   # Development mode with hot reload
   npm run dev
   
   # Production mode
   npm start
   
   # Test mode
   npm run test:services
   ```

4. **Or Start Individual Services**:
   ```bash
   # Development mode
   npm run dev:gateway        # Gateway Service (Port 3000)
   npm run dev:employee      # Employee Service (Port 3001)
   npm run dev:client-project # Client Project Service (Port 3002)
   npm run dev:billing       # Billing Service (Port 3003)
   npm run dev:service-catalog # Service Catalog (Port 3004)
   
   # Production mode
   npm run start:gateway
   npm run start:employee
   npm run start:client-project
   npm run start:billing
   npm run start:service-catalog
   ```

### Method 2: With Docker

#### Prerequisites
- Docker >= 24.0
- Docker Compose >= 2.0

#### Steps

1. **Build Base Image**:
   ```bash
   npm run docker:build
   ```

2. **Start Services**:
   ```bash
   # Development mode with hot reload
   npm run docker:dev
   
   # Production mode
   npm run docker:prod
   
   # Test mode
   npm run docker:test
   ```

3. **Manage Services**:
   ```bash
   # View logs
   npm run docker:logs
   
   # Check running services
   npm run docker:ps
   
   # Stop all services
   npm run docker:down
   ```

### Development Tools

1. **View Logs**:
   ```bash
   # Development logs
   npm run logs:dev
   
   # Production logs
   npm run logs:prod
   
   # Error logs only
   npm run logs:error
   ```

2. **Clean Logs**:
   ```bash
   npm run logs:clean
   ```

3. **Code Quality**:
   ```bash
   # Run linter
   npm run lint
   
   # Fix linting issues
   npm run lint:fix
   ```

## Docker Setup

### Prerequisites
- Docker
- Docker Compose

### Quick Start

1. Build the base image:
```bash
npm run docker:build
```

2. Start services in desired environment:
```bash
# Development environment
npm run docker:dev

# Test environment
npm run docker:test

# Production environment
npm run docker:prod
```

### Docker Commands
```bash
# Stop all services and remove volumes
npm run docker:down

# View service logs
npm run docker:logs

# Check service status
npm run docker:ps
```

### Environment Configuration

#### Switch Environments
```bash
npm run env:dev   # Use development environment
npm run env:test  # Use test environment
npm run env:prod  # Use production environment
```

#### Run Services (Without Docker)
```bash
# Run all services
npm start         # Production mode
npm run dev       # Development mode
npm run test:services  # Test mode

# Run individual services
npm run start:gateway  # Production
npm run dev:gateway    # Development
npm run test:gateway   # Test
```

## Environment Validation

Each service validates its environment variables on startup:

### Base Environment Variables
- `NODE_ENV`: Environment (development/test/production)
- `DB_*`: Database configuration
- `JWT_*`: Authentication settings
- `RATE_LIMIT_*`: Rate limiting configuration
- `LOG_LEVEL`: Logging level
- `CORS_ORIGIN`: CORS settings
- `CACHE_*`: Cache configuration

### Service-Specific Variables

#### Gateway Service
- `GATEWAY_PORT`: Service port
- `*_SERVICE_URL`: URLs for all microservices
- `PROXY_TIMEOUT`: Request timeout
- `MAX_PAYLOAD_SIZE`: Maximum request size

#### Employee Service
- `EMPLOYEE_SERVICE_PORT`: Service port
- `PASSWORD_*`: Password security settings
- `SESSION_*`: Session management
- `SMTP_*`: Email notifications (optional)

#### Client Project Service
- `CLIENT_PROJECT_SERVICE_PORT`: Service port
- `MAX_TASKS_PER_PROJECT`: Task limits
- `S3_*`: File storage (optional)

#### Billing Service
- `BILLING_SERVICE_PORT`: Service port
- `*_PREFIX`: Invoice/Quote prefixes
- `STRIPE_*`: Payment processing
- `SMTP_*`: Invoice emails

#### Service Catalog
- `SERVICE_CATALOG_PORT`: Service port
- `MAX_SERVICES_PER_PAGE`: Pagination
- `*_REVIEW_*`: Review settings
- `S3_*`: Image storage (optional)

## Health Checks

### Endpoints

1. **Liveness** (`/live`)
   - Basic service status
   - Quick response
   - No dependency checks

2. **Readiness** (`/ready`)
   - Database connectivity
   - Redis connectivity
   - Service readiness state

3. **Health** (`/health`)
   - Detailed system metrics
   - All dependency statuses
   - Performance metrics
   - Rate limited in production

### Health Metrics

1. **System**
   - CPU load averages
   - Memory usage
   - Process uptime
   - System uptime

2. **Database**
   - Connection status
   - Query latency
   - Connection pool

3. **Redis**
   - Connection status
   - Command latency
   - Memory usage

4. **Dependencies**
   - Service availability
   - Response times
   - Error rates

### Docker Integration

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/live"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Circuit Breaking

- Automatic service isolation
- Dependency failure handling
- Graceful degradation
- Self-healing attempts

## Logging System

### Log Aggregation

#### AWS CloudWatch Integration

- **Log Groups**: Automatically created for each environment
  - Development: `/cosmomedia/development`
  - Staging: `/cosmomedia/staging`
  - Production: `/cosmomedia/production`

- **Log Streams**: Organized by service and date
  - Format: `{service-name}-YYYY-MM-DD`
  - Example: `gateway-service-2025-03-26`

- **Log Retention**:
  - Development: 7 days
  - Staging: 30 days
  - Production: 90 days

- **Log Metrics**:
  - Error rates by service
  - Response times
  - API usage patterns
  - Resource utilization

#### Log Aggregation Features

1. **Batch Processing**:
   - Efficient batching of log events
   - Automatic retry on failures
   - Configurable batch size and interval

2. **Error Handling**:
   - Failed events re-queued
   - Circuit breaking on API failures
   - Detailed error reporting

3. **Performance**:
   - Asynchronous processing
   - Memory-efficient buffering
   - Compression for network transfer

4. **Security**:
   - IAM role-based access
   - Encrypted transmission
   - PII redaction

### Environment-Specific Logging

#### Development
- Pretty-printed console output
- Colorized logs with emojis
- Debug level enabled
- Full error stack traces

#### Test
- Separate test log file
- Debug level for detailed testing
- Structured JSON format

#### Staging
- Combined and error log files
- CloudWatch integration
- Info level by default
- Log rotation enabled

#### Production
- Separate error and combined logs
- CloudWatch integration
- Info level with minimal details
- Secure redaction of sensitive data
- Log rotation with compression

### Log Types

1. **Request Logs**
   - Method, URL, query params
   - Headers (sanitized)
   - Request body (filtered)
   - Response time

2. **Error Logs**
   - Error message and code
   - Stack trace (dev only)
   - Request context
   - User context

3. **Performance Logs**
   - Operation duration
   - Resource usage
   - Slow query warnings

4. **Audit Logs**
   - User actions
   - Data changes
   - Security events

### Log Management

```bash
# View logs
npm run logs:dev     # Development logs
npm run logs:test    # Test logs
npm run logs:staging # Staging logs
npm run logs:prod    # Production logs
npm run logs:error   # Error logs only

# Cleanup
npm run logs:clean   # Remove all logs
```

## Error Handling

### Features

#### Environment-Specific Behavior
- **Development**: Full error details with stack traces
- **Test**: Error details without stack traces
- **Production**: Safe error messages only

#### Error Types
- `AppError`: Base error class
- `ValidationError`: Input validation failures
- `AuthenticationError`: Auth failures (401)
- `AuthorizationError`: Permission issues (403)
- `NotFoundError`: Resource not found (404)
- `ConflictError`: Resource conflicts (409)

#### Error Response Format
```json
{
  "status": "error",
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "errors": [{ "field": "name", "message": "Invalid" }]
  }
}
```

#### Logging
- Development: Colorized console output
- Test: Separate test log file
- Production: Error and combined log files

#### Security Features
- Rate limiting error handling
- Security headers in production
- Safe error messages in production
- Graceful shutdown handling

#### Database Error Handling
- Validation error mapping
- Unique constraint handling
- Transaction error recovery

#### Gateway-Specific Handling
- Service unavailable handling
- Timeout management
- Circuit breaker integration

## Validation Features

- Type checking and conversion
- Required field validation
- Default values
- Value constraints (min/max)
- Enum validation
- URL validation
- Automatic error reporting