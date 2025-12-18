#!/bin/bash

# DrawTrack Deployment Script
# Run this on your VPS

echo "🚀 DrawTrack Deployment Script"
echo "=============================="

# Create project directory
mkdir -p ~/drawtrack
cd ~/drawtrack

# Create .env file
cat > .env << 'EOF'
DB_USER=postgres
DB_PASSWORD=DrawTrack2025SecurePass
DB_NAME=drawtrack
JWT_SECRET=drawtrack_jwt_secret_key_2025_very_secure_random_string
EOF

# Create docker-compose.prod.yml
cat > docker-compose.yml << 'EOF'
services:
  postgres:
    image: postgres:16-alpine
    container_name: drawtrack-db
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-DrawTrack2025SecurePass}
      POSTGRES_DB: ${DB_NAME:-drawtrack}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - drawtrack-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: brambrim/drawtrack-backend:latest
    container_name: drawtrack-backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - DATABASE_URL=postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-DrawTrack2025SecurePass}@postgres:5432/${DB_NAME:-drawtrack}?schema=public
      - JWT_SECRET=${JWT_SECRET:-drawtrack_jwt_secret_key_2025}
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - drawtrack-network
    volumes:
      - uploads_data:/app/uploads

  frontend:
    image: brambrim/drawtrack-frontend:latest
    container_name: drawtrack-frontend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - drawtrack-network

volumes:
  postgres_data:
  uploads_data:

networks:
  drawtrack-network:
    driver: bridge
EOF

echo "📦 Pulling Docker images..."
docker pull brambrim/drawtrack-frontend:latest
docker pull brambrim/drawtrack-backend:latest

echo "🔄 Starting services..."
docker-compose up -d

echo "⏳ Waiting for database to be ready..."
sleep 15

echo "🗄️ Running database migrations..."
docker exec drawtrack-backend npx prisma migrate deploy

echo ""
echo "✅ Deployment Complete!"
echo "========================"
echo "Frontend: http://YOUR_VPS_IP:3001"
echo "Backend:  http://YOUR_VPS_IP:5000"
echo ""
echo "Useful commands:"
echo "  docker-compose ps          - Check status"
echo "  docker-compose logs -f     - View logs"
echo "  docker-compose down        - Stop all"
echo "  docker-compose pull && docker-compose up -d  - Update"
