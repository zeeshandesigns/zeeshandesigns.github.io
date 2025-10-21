# PakGifts Deployment Guide

## Prerequisites

### Hardware Requirements
- **Minimum**: 2 CPU cores, 4GB RAM, 20GB storage
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB SSD storage

### Software Requirements
- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- Docker 20.10+
- Docker Compose 2.0+
- Git

## Production Deployment

### 1. Server Setup

#### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

#### Install Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Clone Repository
```bash
git clone https://github.com/zeeshandesigns/zeeshandesigns.github.io.git
cd zeeshandesigns.github.io
```

### 3. Environment Configuration

#### Backend Environment
```bash
cp backend/.env.example backend/.env
nano backend/.env
```

**Critical settings to update**:
```
NODE_ENV=production
JWT_SECRET=<generate-strong-random-key>
ENCRYPTION_KEY=<32-character-hex-key>

DB_PASSWORD=<strong-database-password>

JAZZCASH_MERCHANT_ID=<your-merchant-id>
JAZZCASH_PASSWORD=<your-password>
JAZZCASH_SALT=<your-salt>

EASYPAISA_STORE_ID=<your-store-id>
EASYPAISA_API_KEY=<your-api-key>

SMTP_HOST=<your-smtp-server>
SMTP_USER=<your-email>
SMTP_PASSWORD=<your-email-password>
```

**Generate secure keys**:
```bash
# JWT Secret (random string)
openssl rand -base64 32

# Encryption Key (32 bytes hex)
openssl rand -hex 32
```

#### Frontend Environment
Create `frontend/.env.production`:
```
REACT_APP_API_URL=https://api.pakgifts.com/api
```

### 4. Database Setup

#### Option A: Using Docker Compose (Recommended)
Database is automatically initialized with schema.

#### Option B: External PostgreSQL
```bash
# Create database
createdb -h your-db-host -U postgres pakgifts_db

# Run schema
psql -h your-db-host -U postgres -d pakgifts_db -f backend/src/database/schema.sql
```

Update `docker-compose.yml` to remove postgres service and update connection strings.

### 5. SSL/TLS Configuration

#### Get SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot
sudo certbot certonly --standalone -d pakgifts.com -d www.pakgifts.com
```

#### Configure Nginx
Update `nginx/nginx.conf` with SSL configuration:
```nginx
server {
    listen 443 ssl http2;
    server_name pakgifts.com www.pakgifts.com;

    ssl_certificate /etc/letsencrypt/live/pakgifts.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pakgifts.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # ... rest of configuration
}
```

Update `docker-compose.yml` to mount certificates:
```yaml
nginx:
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
```

### 6. Build and Deploy

#### Production Build
```bash
# Build services
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 7. Initialize Data

#### Create Admin User
```bash
docker-compose exec backend node src/scripts/create-admin.js
```

#### Import Initial Product Categories
```bash
docker-compose exec postgres psql -U postgres -d pakgifts_db
# Run INSERT statements for categories
```

### 8. Configure Firewall

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### 9. Setup Monitoring

#### Application Logs
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
```

#### Create log rotation
```bash
sudo nano /etc/logrotate.d/docker-compose
```

Content:
```
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  size=10M
  missingok
  delaycompress
  copytruncate
}
```

### 10. Backup Strategy

#### Database Backup Script
Create `/opt/pakgifts/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/backups/pakgifts"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U postgres pakgifts_db > $BACKUP_DIR/db_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql" -mtime +30 -delete
```

Make executable:
```bash
chmod +x /opt/pakgifts/backup.sh
```

#### Setup Cron Job
```bash
crontab -e
```

Add:
```
0 2 * * * /opt/pakgifts/backup.sh
```

### 11. Performance Optimization

#### Enable Redis Persistence
Update `docker-compose.yml`:
```yaml
redis:
  command: redis-server --appendonly yes
```

#### PostgreSQL Tuning
Create `postgres/postgresql.conf`:
```
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

Mount in docker-compose:
```yaml
postgres:
  volumes:
    - ./postgres/postgresql.conf:/etc/postgresql/postgresql.conf
```

### 12. Security Hardening

#### Rate Limiting
Already configured in Express middleware.

#### Fail2Ban for Nginx
```bash
sudo apt install fail2ban
```

Create `/etc/fail2ban/filter.d/nginx-limit-req.conf`:
```
[Definition]
failregex = limiting requests, excess:.* by zone.*client: <HOST>
ignoreregex =
```

Add to `/etc/fail2ban/jail.local`:
```
[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 5
findtime = 600
bantime = 3600
```

#### Regular Updates
```bash
# Update containers weekly
docker-compose pull
docker-compose up -d
```

### 13. Monitoring & Alerts

#### Health Checks
Use the `/api/health` endpoint with monitoring tools:
- UptimeRobot
- Pingdom
- Custom monitoring script

#### Setup Alerts
Configure email alerts for:
- Low inventory
- Failed payments
- System errors
- Database issues

### 14. Testing Production Deployment

```bash
# Health check
curl https://pakgifts.com/api/health

# Test frontend
curl https://pakgifts.com

# Test database connection
docker-compose exec backend npm run db:test
```

### 15. Rollback Procedure

```bash
# Stop current version
docker-compose down

# Checkout previous version
git checkout <previous-commit>

# Rebuild and restart
docker-compose build
docker-compose up -d

# Restore database if needed
docker-compose exec -T postgres psql -U postgres pakgifts_db < /backups/pakgifts/db_backup.sql
```

## Scaling

### Horizontal Scaling
1. Use external PostgreSQL (managed service)
2. Use external Redis (managed service)
3. Deploy multiple backend instances
4. Use load balancer (Nginx, HAProxy, or cloud load balancer)

### Vertical Scaling
1. Increase server resources
2. Optimize database queries
3. Add indexes as needed
4. Implement caching strategy

## Troubleshooting

### Database Connection Issues
```bash
docker-compose logs postgres
docker-compose exec postgres psql -U postgres -l
```

### Backend Not Starting
```bash
docker-compose logs backend
docker-compose exec backend npm run test
```

### Frontend Build Fails
```bash
docker-compose logs frontend
docker-compose exec frontend npm run build
```

## Maintenance

### Update Application
```bash
git pull origin main
docker-compose build
docker-compose up -d
```

### Database Migrations
```bash
docker-compose exec backend npm run migrate
```

### Clean Up
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

## Support

For deployment issues:
- Check logs: `docker-compose logs`
- Review documentation
- Contact: support@pakgifts.com
