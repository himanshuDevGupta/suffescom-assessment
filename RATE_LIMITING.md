# Rate Limiting & Redis Setup Guide

## Overview
This project now has Redis-backed rate limiting for scalable, distributed request throttling.

### Rate Limiting Configuration
- **Global Limiter**: 100 requests per minute per IP
- **Withdrawal Limiter**: 10 requests per minute per authenticated user or IP

Both limiters return standard HTTP rate-limit headers:
- `RateLimit-Limit`
- `RateLimit-Remaining`
- `RateLimit-Reset`

### Redis Setup

#### Development (Local Redis)
Start Redis:
```bash
redis-server
```

Or with Docker:
```bash
docker run -d -p 6379:6379 redis:latest
```

#### Production (Environment Variable)
Set `REDIS_URL` to your Redis instance:
```bash
export REDIS_URL=redis://your-redis-host:6379
# or with auth
export REDIS_URL=redis://:password@your-redis-host:6379
```

### Files Added/Modified
- `src/config/redis.js` — Redis client initialization
- `src/app.js` — Rate limiting middleware using Redis store
- `package.json` — New dependencies: `ioredis`, `rate-limit-redis`, `express-rate-limit`

### Testing Rate Limits
```bash
# Make multiple requests quickly
for i in {1..15}; do curl -i http://localhost:3000/health; done
```

Expected: After 10 requests (or 100 for global), you'll see `429 Too Many Requests`.

### Error Handling
If Redis is unavailable, the app will still start and use in-memory rate limiting (single-instance only). Monitor Redis connection status and configure alerts for production.

## Next Steps
- Add Bull/BullMQ job queue for async withdrawal processing
- Add per-user concurrency locks with Redlock
- Add monitoring and metrics (Prometheus, Datadog)
