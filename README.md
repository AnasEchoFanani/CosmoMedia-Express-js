# Cosmomedia Microservices

A modern microservices architecture for managing client projects, services, and billing.

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

## Validation Features

- Type checking and conversion
- Required field validation
- Default values
- Value constraints (min/max)
- Enum validation
- URL validation
- Automatic error reporting