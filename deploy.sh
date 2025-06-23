#!/bin/bash

# Portfolio Site Deployment Script
# This script securely deploys the portfolio site using Docker Compose

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"


# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found. Please copy env.example to .env and configure it."
    exit 1
fi

# Check if required environment variables are set
source .env

required_vars=("DB_PASSWORD" "RECAPTCHA_SECRET_KEY" "EMAILJS_SERVICE_ID" "EMAILJS_TEMPLATE_ID" "EMAILJS_PUBLIC_KEY" "ACME_EMAIL" "TRAEFIK_AUTH")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ] || [[ "${!var}" == *"your_"* ]]; then
        print_error "Environment variable $var is not properly configured in .env file"
        exit 1
    fi
done

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if user is in docker group
if ! groups $USER | grep -q docker; then
    print_warning "User is not in docker group. You may need to run 'sudo usermod -aG docker $USER' and log out/in again."
fi

print_status "Starting deployment..."

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p backups

# Backup existing data if it exists
if docker-compose ps | grep -q "Up"; then
    print_status "Backing up existing data..."
    docker-compose exec postgres pg_dump -U $DB_USER $DB_NAME > backups/backup_$(date +%Y%m%d_%H%M%S).sql 2>/dev/null || print_warning "Could not create backup (database might not be running)"
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down

# Remove old images to ensure fresh build
print_status "Removing old images..."
docker-compose down --rmi all

# Build and start services
print_status "Building and starting services..."
docker-compose up -d --build

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check PostgreSQL
if docker-compose exec postgres pg_isready -U $DB_USER -d $DB_NAME > /dev/null 2>&1; then
    print_status "PostgreSQL is healthy"
else
    print_error "PostgreSQL is not healthy"
    docker-compose logs postgres
    exit 1
fi

# Check Node.js app
if curl -f http://localhost:3000/api/recent-posts > /dev/null 2>&1; then
    print_status "Node.js application is healthy"
else
    print_warning "Node.js application health check failed (this might be normal if it's not exposed externally)"
fi

# Check Traefik
if curl -f http://localhost:80 > /dev/null 2>&1; then
    print_status "Traefik is responding"
else
    print_error "Traefik is not responding"
    docker-compose logs traefik
    exit 1
fi

print_status "Deployment completed successfully!"
print_status "Your site should be available at: https://eastonseidel.com"
print_status "Traefik dashboard: https://traefik.eastonseidel.com"

# Show running containers
print_status "Running containers:"
docker-compose ps

# Show logs
print_status "Recent logs:"
docker-compose logs --tail=20 