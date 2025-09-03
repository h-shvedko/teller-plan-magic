# Docker Setup Guide for Teller Plan Magic

This guide provides detailed instructions for setting up and running Teller Plan Magic using Docker with a complete Supabase stack.

## Prerequisites

- Docker Engine 20.0+ installed
- Docker Compose 2.0+ installed
- Git (for cloning the repository)
- At least 4GB of available RAM
- Ports 8080, 54321-54328, and 80 available

## Quick Start

### Development Environment

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd teller-plan-magic
   ```

2. **Start the development environment**
   ```bash
   ./scripts/docker-dev.sh start
   ```

3. **Access the applications**
   - React App: http://localhost:8080
   - Supabase Studio: http://localhost:54324
   - Supabase API: http://localhost:54321
   - Database: postgresql://postgres:postgres@localhost:54322/postgres

### Production Environment

1. **Configure production settings**
   ```bash
   cp .env.docker.prod .env
   # Edit .env with your production configuration
   ```

2. **Deploy production environment**
   ```bash
   ./scripts/docker-prod.sh deploy
   ```

3. **Access the production app**
   - Application: http://localhost (port 80)

## Detailed Setup

### Development Environment

The development environment includes:
- React application with hot reload
- Complete local Supabase stack
- Development databases with sample data
- Email testing with Inbucket

#### Starting Development
```bash
# Start all services
./scripts/docker-dev.sh start

# View logs
./scripts/docker-dev.sh logs

# Check service status
./scripts/docker-dev.sh status

# Stop services
./scripts/docker-dev.sh stop
```

#### Development Services
- **app**: React dev server (port 8080)
- **supabase-db**: PostgreSQL database (port 54322)
- **supabase-api**: Auth service (port 54321)
- **supabase-studio**: Database dashboard (port 54324)
- **supabase-storage**: File storage (port 54327)
- **supabase-rest**: REST API (port 54323)
- **supabase-inbucket**: Email testing (port 54325)
- **supabase-imgproxy**: Image processing (port 54328)

### Production Environment

The production environment includes:
- Optimized React build with Nginx
- Production Supabase configuration
- Security headers and SSL/TLS support
- Automated backups and monitoring

#### Production Deployment
```bash
# Build production images
./scripts/docker-prod.sh build

# Deploy with automatic build and start
./scripts/docker-prod.sh deploy

# View production logs
./scripts/docker-prod.sh logs

# Stop production services
./scripts/docker-prod.sh stop
```

#### Production Configuration
Edit `.env.docker.prod` with your production values:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Domain Configuration
API_EXTERNAL_URL=https://yourdomain.com
GOTRUE_SITE_URL=https://yourdomain.com

# Security
JWT_SECRET=your-secure-32-character-secret
POSTGRES_PASSWORD=your-secure-database-password

# Email Configuration
SMTP_HOST=smtp.your-provider.com
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
ADMIN_EMAIL=admin@yourdomain.com
```

## Database Management

### Development Database
```bash
# Reset development database
./scripts/docker-dev.sh reset-db

# Run migrations
./scripts/docker-dev.sh migrate

# Access database directly
docker-compose exec supabase-db psql -U postgres postgres
```

### Production Database
```bash
# Create backup
./scripts/docker-prod.sh backup-db

# Restore from backup
./scripts/docker-prod.sh restore-db backup_file.sql

# Update Supabase schema
./scripts/docker-prod.sh update-supabase
```

## Environment Files

### .env.docker (Development)
- Local Supabase configuration
- Development database credentials
- Hot reload settings

### .env.docker.prod (Production)
- Production Supabase configuration
- Secure passwords and secrets
- SMTP and domain settings

## Networking

The Docker setup uses a custom network `teller-network` for service communication:

```
teller-network (bridge)
├── app (8080)
├── supabase-db (54322)
├── supabase-api (54321)
├── supabase-storage (54327)
├── supabase-rest (54323)
├── supabase-studio (54324)
├── supabase-inbucket (54325)
└── supabase-imgproxy (54328)
```

## Volumes and Data Persistence

### Development Volumes
- `supabase-db-data`: Development database storage
- `supabase-storage-data`: Development file storage
- Source code mounting for hot reload

### Production Volumes
- `supabase-db-prod`: Production database storage
- `supabase-storage-prod`: Production file storage
- Nginx configuration mounting

## SSL/TLS Configuration

For production HTTPS, add SSL certificates:

1. **Place certificates in `ssl/` directory**
   ```
   ssl/
   ├── cert.pem
   └── key.pem
   ```

2. **Update nginx.conf**
   ```nginx
   server {
       listen 443 ssl;
       ssl_certificate /etc/nginx/ssl/cert.pem;
       ssl_certificate_key /etc/nginx/ssl/key.pem;
       # ... rest of configuration
   }
   ```

3. **Mount SSL certificates**
   ```yaml
   app-prod:
     volumes:
       - ./ssl:/etc/nginx/ssl:ro
   ```

## Monitoring and Logs

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# With helper scripts
./scripts/docker-dev.sh logs app
./scripts/docker-prod.sh logs app
```

### Service Health
```bash
# Check service status
docker-compose ps

# Health check specific service
docker-compose exec app curl http://localhost:8080/health
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   sudo netstat -tulpn | grep :8080
   
   # Kill process or change port in docker-compose.yml
   ```

2. **Database Connection Issues**
   ```bash
   # Check database logs
   ./scripts/docker-dev.sh logs supabase-db
   
   # Restart database
   docker-compose restart supabase-db
   ```

3. **Permission Issues**
   ```bash
   # Fix Docker permissions
   sudo usermod -aG docker $USER
   newgrp docker
   ```

4. **Low Disk Space**
   ```bash
   # Clean up Docker resources
   ./scripts/docker-dev.sh cleanup
   
   # Remove unused images
   docker image prune -f
   ```

### Reset Everything
```bash
# Stop all services and remove volumes
./scripts/docker-dev.sh cleanup

# Remove all Docker resources
docker system prune -a
```

## Performance Optimization

### Development
- Use `docker-compose.override.yml` for dev-specific settings
- Enable source code mounting for instant updates
- Use multi-stage builds for faster rebuilds

### Production
- Optimize Docker images with multi-stage builds
- Enable Nginx caching and compression
- Use health checks for reliability
- Implement resource limits

## Security Best Practices

1. **Change Default Passwords**
   - Update all default passwords in production
   - Use strong, unique secrets for JWT tokens

2. **Network Security**
   - Use custom Docker networks
   - Limit port exposure to necessary services only

3. **Environment Variables**
   - Never commit sensitive data to version control
   - Use `.env` files for configuration
   - Rotate secrets regularly

4. **SSL/TLS**
   - Use HTTPS in production
   - Keep certificates up to date
   - Use strong cipher suites

## Backup and Recovery

### Automated Backups
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="backups/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# Database backup
./scripts/docker-prod.sh backup-db > "$BACKUP_DIR/database.sql"

# Storage backup
docker-compose exec supabase-storage tar czf - /var/lib/storage > "$BACKUP_DIR/storage.tar.gz"

echo "Backup completed: $BACKUP_DIR"
EOF

chmod +x backup.sh
```

### Recovery Process
```bash
# Stop services
./scripts/docker-prod.sh stop

# Restore database
./scripts/docker-prod.sh restore-db backups/20240101/database.sql

# Restore storage
docker-compose exec supabase-storage tar xzf - -C / < backups/20240101/storage.tar.gz

# Start services
./scripts/docker-prod.sh start
```

## Scaling and Load Balancing

For high-traffic production deployments:

1. **Use Docker Swarm or Kubernetes**
2. **Implement load balancer (nginx, HAProxy)**
3. **Scale horizontally with multiple app instances**
4. **Use external database for better performance**
5. **Implement Redis for caching**

## Maintenance

### Regular Tasks
- Monitor disk space and logs
- Update Docker images regularly
- Backup databases frequently
- Rotate logs and clean up old data
- Monitor service health and performance

### Updates
```bash
# Pull latest images
docker-compose pull

# Rebuild with latest changes
./scripts/docker-prod.sh deploy

# Update Supabase schema
./scripts/docker-prod.sh update-supabase
```

This Docker setup provides a complete, production-ready environment that closely mirrors cloud deployments while enabling efficient local development.