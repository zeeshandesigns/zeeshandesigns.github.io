#!/bin/bash

# PakGifts Quick Setup Script
# This script helps with initial project setup

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           PakGifts E-commerce Platform Setup                  ║"
echo "║           Digital Gift Cards with Dual Delivery System         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Setup backend environment
echo "📝 Setting up backend environment..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from template"
    echo "⚠️  Please update the following in backend/.env:"
    echo "   - DB_PASSWORD"
    echo "   - JWT_SECRET (run: openssl rand -base64 32)"
    echo "   - ENCRYPTION_KEY (run: openssl rand -hex 32)"
    echo "   - Payment gateway credentials (JazzCash, EasyPaisa)"
    echo "   - SMTP credentials"
    echo ""
else
    echo "ℹ️  backend/.env already exists"
fi

# Generate secure keys
echo "🔐 Generating secure keys..."
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)

echo "Generated keys (save these securely):"
echo "JWT_SECRET=$JWT_SECRET"
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo ""

# Offer to update .env file
read -p "Do you want to automatically update backend/.env with these keys? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" backend/.env
    sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" backend/.env
    echo "✅ Updated backend/.env with generated keys"
fi
echo ""

# Ask about deployment mode
echo "🚀 Choose deployment mode:"
echo "1) Development (with hot reload)"
echo "2) Production (optimized build)"
read -p "Enter choice (1 or 2): " mode

if [ "$mode" = "1" ]; then
    echo ""
    echo "Starting in DEVELOPMENT mode..."
    echo ""
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
    
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    
    echo ""
    echo "✅ Dependencies installed!"
    echo ""
    echo "To start development servers:"
    echo "  Backend:  cd backend && npm run dev"
    echo "  Frontend: cd frontend && npm start"
    echo ""
    echo "Or use Docker Compose:"
    echo "  docker-compose up"
    
elif [ "$mode" = "2" ]; then
    echo ""
    echo "Starting in PRODUCTION mode with Docker..."
    echo ""
    
    # Build and start services
    echo "🏗️  Building Docker images..."
    docker-compose build
    
    echo ""
    echo "🚀 Starting services..."
    docker-compose up -d
    
    echo ""
    echo "⏳ Waiting for services to be ready..."
    sleep 10
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        echo "✅ Services are running!"
        echo ""
        echo "Access the application at:"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend API: http://localhost:5000"
        echo "  API Health: http://localhost:5000/api/health"
        echo ""
        echo "View logs with: docker-compose logs -f"
        echo "Stop services with: docker-compose down"
    else
        echo "❌ Services failed to start. Check logs with: docker-compose logs"
    fi
else
    echo "Invalid choice. Exiting."
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete!                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📚 Documentation:"
echo "  - README.md - General documentation"
echo "  - API_DOCUMENTATION.md - API reference"
echo "  - DEPLOYMENT.md - Production deployment guide"
echo ""
echo "🔧 Next steps:"
echo "  1. Update backend/.env with payment gateway credentials"
echo "  2. Update backend/.env with SMTP settings"
echo "  3. Initialize database with sample data"
echo "  4. Create admin user account"
echo ""
echo "Happy coding! 🎉"
