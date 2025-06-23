#!/bin/bash

# Namecheap API Setup Script
# This script helps you get your Namecheap API credentials for DNS challenge

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "=========================================="
echo "Namecheap API Setup for DNS Challenge"
echo "=========================================="
echo ""

print_info "To use DNS challenge with Let's Encrypt, you need Namecheap API credentials."
echo ""

print_info "Step 1: Get your Namecheap API credentials"
echo "1. Go to https://ap.www.namecheap.com/settings/tools/apiaccess/"
echo "2. Enable API access if not already enabled"
echo "3. Add your server's IP address to the whitelist"
echo "4. Copy your API key"
echo ""

print_info "Step 2: Get your server's public IP"
echo "Your server's public IP address:"
curl -s ifconfig.me
echo ""
echo ""

print_info "Step 3: Configure your .env file"
echo "Add these lines to your .env file:"
echo ""
echo "NAMECHEAP_API_USER=your_namecheap_username"
echo "NAMECHEAP_API_KEY=your_namecheap_api_key"
echo "NAMECHEAP_CLIENT_IP=$(curl -s ifconfig.me)"
echo ""

print_warning "Important Notes:"
echo "- Replace 'your_namecheap_username' with your Namecheap account username"
echo "- Replace 'your_namecheap_api_key' with the API key from Step 1"
echo "- The NAMECHEAP_CLIENT_IP should be your server's public IP (shown above)"
echo "- Make sure your domain's nameservers are set to Namecheap's DNS servers"
echo ""

print_info "Step 4: Verify your domain configuration"
echo "Your domain should use these nameservers:"
echo "- dns1.registrar-servers.com"
echo "- dns2.registrar-servers.com"
echo ""

print_info "Step 5: Test the configuration"
echo "After setting up your .env file, run:"
echo "docker-compose up -d"
echo ""

print_success "DNS challenge setup complete!"
echo "This method is more reliable and doesn't require port 80 to be open." 