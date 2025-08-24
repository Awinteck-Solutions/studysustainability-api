# Simple Docker Setup

## 🐳 Quick Start

### Build and Run with Docker Compose (Recommended)

```bash
# Build and start all services
docker compose up --build -d

# View logs
docker compose logs -f api

# Stop all services
docker compose down
```

### Build and Run Manually

```bash
# Build the image
docker build -f Dockerfile.simple -t study-sustainability-api:simple .

# Run with MongoDB and Redis
docker run -d --name mongo -p 27017:27017 mongo:7.0
docker run -d --name redis -p 6379:6379 redis:7.2-alpine

# Run the API
docker run -d --name study-api -p 3000:3000 \
  --link mongo:mongo --link redis:redis \
  -e DB_URL=mongodb://mongo:27017/study_sustainability \
  -e REDIS_URL=redis://redis:6379 \
  -e NODE_ENV=development \
  study-sustainability-api:simple
```

## 📋 Available Commands

### Docker Compose
```bash
# Start services
docker compose up -d

# Rebuild and start
docker compose up --build -d

# View logs
docker compose logs -f api

# Stop services
docker compose down

# Remove volumes
docker compose down -v
```

### Docker Commands
```bash
# Build image
docker build -f Dockerfile.simple -t study-sustainability-api:simple .

# Run container
docker run -d -p 3000:3000 study-sustainability-api:simple

# View logs
docker logs study-api

# Stop container
docker stop study-api
```

## 🔧 Configuration

### Environment Variables
- `DB_URL`: MongoDB connection string
- `REDIS_URL`: Redis connection string
- `NODE_ENV`: Environment (development/production)
- `PORT`: Application port (default: 3000)

### Services
- **API**: Port 3000 (Node.js application)
- **MongoDB**: Port 27017 (Database)
- **Redis**: Port 6379 (Cache)

## 🚀 Access Points

- **API**: http://localhost:3000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## 📝 Notes

- Uses Node.js 18 Alpine for smaller image size
- Includes all dependencies for TypeScript compilation
- Non-root user for security
- Health checks enabled
- Volume mounts for persistent data

---

**Simple and ready to use!** 🎉
