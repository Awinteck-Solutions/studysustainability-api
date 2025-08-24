# Docker Setup Guide

## 🐳 Overview

This project includes Docker configuration for easy development and deployment. The setup includes:

- **API Application**: Node.js 20.19.0 with TypeScript (using ts-node for development)
- **MongoDB**: Database service
- **Redis**: Caching service

## 🚀 Quick Start

### Development Environment

1. **Build and start all services** (simple setup):
   ```bash
   docker compose -f docker-compose.simple.yml up --build
   ```

2. **Or use the full setup with MongoDB Express**:
   ```bash
   docker compose up --build
   ```

3. **Access the application**:
   - API: http://localhost:3000
   - MongoDB Express: http://localhost:8081 (admin/password) - only with full setup

4. **Stop all services**:
   ```bash
   docker compose down
   ```

### Production Deployment

1. **Build production image**:
   ```bash
   docker build -f Dockerfile.prod -t study-sustainability-api:prod .
   ```

2. **Run production container**:
   ```bash
   docker run -d \
     --name study-sustainability-api \
     -p 3000:3000 \
     -e NODE_ENV=production \
     -e MONGODB_URI=your_mongodb_uri \
     -e REDIS_URL=your_redis_url \
     study-sustainability-api:prod
   ```

## 📋 Available Commands

### Docker Compose Commands

```bash
# Start simple setup (recommended for development)
docker compose -f docker-compose.simple.yml up

# Start simple setup in background
docker compose -f docker-compose.simple.yml up -d

# Start full setup with MongoDB Express
docker compose up

# Rebuild and start
docker compose -f docker-compose.simple.yml up --build

# Stop all services
docker compose down

# View logs
docker compose logs -f api

# Restart specific service
docker compose restart api

# Remove all containers and volumes
docker compose down -v
```

### Docker Commands

```bash
# Build development image
docker build -t study-sustainability-api:dev .

# Build production image
docker build -f Dockerfile.prod -t study-sustainability-api:prod .

# Run container (requires external MongoDB and Redis)
docker run -d -p 3000:3000 study-sustainability-api:dev

# View container logs
docker logs -f <container_name>

# Execute commands in container
docker exec -it <container_name> sh

# Remove container
docker rm -f <container_name>
```

## 🔧 Configuration

### Environment Variables

The Docker Compose files include basic environment variables. For production, create a `.env` file:

```env
# Application
NODE_ENV=production
PORT=3000

# MongoDB
MONGODB_URI=mongodb://mongo:27017/study_sustainability

# Redis
REDIS_URL=redis://redis:6379

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
```

### Docker Compose Environment

The `docker-compose.simple.yml` includes basic environment variables:

```yaml
services:
  api:
    environment:
      - NODE_ENV=development
      - PORT=3000
      - MONGODB_URI=mongodb://mongo:27017/study_sustainability
      - REDIS_URL=redis://redis:6379
```

## 🏗️ Architecture

### Services

1. **API Service** (`api`)
   - Port: 3000
   - Node.js 20.19.0 Alpine
   - TypeScript application with ts-node
   - Health checks enabled

2. **MongoDB Service** (`mongo`)
   - Port: 27017
   - MongoDB 7.0
   - Persistent data storage
   - No authentication (development)

3. **Redis Service** (`redis`)
   - Port: 6379
   - Redis 7.2 Alpine
   - Caching layer
   - AOF persistence

### Volumes

- `mongo_data`: MongoDB persistent data
- `redis_data`: Redis persistent data
- `./uploads`: Application uploads directory

### Networks

- `app-network`: Internal communication between services

## 🔍 Monitoring & Debugging

### Health Checks

The application includes health checks:

```bash
# Check container health
docker ps

# View health check logs
docker inspect <container_name> | grep Health -A 10
```

### Logs

```bash
# View all logs
docker compose logs

# Follow specific service logs
docker compose logs -f api

# View last 100 lines
docker compose logs --tail=100 api
```

### Database Access

```bash
# Access MongoDB shell
docker exec -it study-sustainability-mongo mongosh

# Access Redis CLI
docker exec -it study-sustainability-redis redis-cli
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Container Won't Start**
   ```bash
   # Check container logs
   docker logs <container_name>
   
   # Check container status
   docker ps -a
   ```

3. **Database Connection Issues**
   ```bash
   # Check MongoDB status
   docker compose logs mongo
   
   # Restart MongoDB
   docker compose restart mongo
   ```

4. **Redis Connection Issues**
   ```bash
   # Check Redis status
   docker compose logs redis
   
   # Test Redis connection
   docker exec -it study-sustainability-redis redis-cli ping
   ```

5. **TypeScript Build Issues**
   ```bash
   # The current setup uses ts-node for development
   # If you need to build, fix TypeScript errors first
   npm run build
   ```

### Performance Optimization

1. **Reduce Image Size**:
   ```bash
   # Use production Dockerfile
   docker build -f Dockerfile.prod -t study-sustainability-api:prod .
   ```

2. **Optimize Build**:
   ```bash
   # Use build cache
   docker build --build-arg BUILDKIT_INLINE_CACHE=1 .
   ```

## 🔒 Security

### Best Practices

1. **Non-root User**: Container runs as non-root user
2. **Network Isolation**: Services communicate via internal network
3. **Health Checks**: Automatic health monitoring
4. **Development Mode**: Uses ts-node for development

### Security Checklist

- [ ] Environment variables properly configured
- [ ] Non-root user enabled
- [ ] Health checks implemented
- [ ] Network isolation configured
- [ ] Use production Dockerfile for deployment

## 📊 Performance

### Image Sizes

- **Development**: ~200MB
- **Production**: ~150MB (multi-stage build)

### Resource Usage

- **API Service**: ~100MB RAM, ~0.5 CPU
- **MongoDB**: ~200MB RAM, ~0.3 CPU
- **Redis**: ~50MB RAM, ~0.1 CPU

## 🎯 Next Steps

1. **Test the Setup**:
   ```bash
   docker compose -f docker-compose.simple.yml up --build
   ```

2. **Customize Environment**: Update environment variables
3. **Add Monitoring**: Implement logging and monitoring
4. **Scale Services**: Configure for production load
5. **Backup Strategy**: Set up database backups

## 📝 Notes

- **Development Mode**: The current Dockerfile uses `ts-node` for development
- **TypeScript Issues**: Some TypeScript compilation issues exist that need to be resolved for production builds
- **Simple Setup**: Use `docker-compose.simple.yml` for basic development
- **Production**: Use `Dockerfile.prod` for production deployment

---

**Note**: The current setup is optimized for development. For production, ensure all TypeScript compilation issues are resolved and use the production Dockerfile.
