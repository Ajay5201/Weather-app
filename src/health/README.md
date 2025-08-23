# Health Check Module

This module provides comprehensive health checking capabilities for the Weather App API.

## Features

- **Basic Health Check**: Overall application health status
- **Detailed Health Check**: Extended health information with system metrics
- **Readiness Probe**: Kubernetes readiness probe endpoint
- **Liveness Probe**: Kubernetes liveness probe endpoint

## Endpoints

### GET `/api/v1/health`
Basic health check that returns the overall application status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123456,
  "environment": "development",
  "version": "0.0.1",
  "services": {
    "database": "healthy",
    "memory": "healthy"
  }
}
```

### GET `/api/v1/health/detailed`
Detailed health check with system information and metrics.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123456,
  "environment": "development",
  "version": "0.0.1",
  "services": {
    "database": "healthy",
    "memory": "healthy"
  },
  "memory": {
    "heapUsed": 45.2,
    "heapTotal": 64.0,
    "external": 12.8,
    "rss": 67.5
  },
  "process": {
    "pid": 12345,
    "nodeVersion": "v18.20.8",
    "platform": "darwin",
    "arch": "x64"
  }
}
```

### GET `/api/v1/health/ready`
Readiness probe for Kubernetes deployments.

**Response:**
```json
{
  "status": "ready"
}
```

### GET `/api/v1/health/live`
Liveness probe for Kubernetes deployments.

**Response:**
```json
{
  "status": "alive"
}
```

## Health Checks

### Database Health
Currently implemented as a placeholder. In production, you should:
- Check actual database connection
- Verify database responsiveness
- Monitor connection pool health

### Memory Health
Monitors Node.js memory usage:
- Heap memory usage
- External memory usage
- RSS (Resident Set Size)
- Considers unhealthy if memory usage > 90%

## Usage in Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: weather-app
spec:
  template:
    spec:
      containers:
      - name: weather-app
        image: weather-app:latest
        livenessProbe:
          httpGet:
            path: /api/v1/health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Future Enhancements

- Database connection health checks
- External service health monitoring
- Custom health check providers
- Health check metrics export
- Health check history and trends
