#!/bin/bash

# Ubuntu Server Setup Script (Enhanced with MongoDB Backup Tools)
# Installs: Docker, Docker Compose, Nginx, PM2, Node.js 24, npm, pnpm, MongoDB Tools, AWS CLI v2
# Author: System Administrator / Antigravity
# Date: $(date +%Y-%m-%d)

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    error "Please run this script as root or with sudo"
fi

log "Starting Ubuntu Server Setup..."
log "This will install: Docker, Docker Compose, Nginx, PM2, Node.js 24, pnpm, MongoDB Tools, AWS CLI v2"

# Update system packages
log "Updating system packages..."
apt update && apt upgrade -y

# Install prerequisites
log "Installing prerequisites..."
apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    git \
    wget \
    vim \
    unzip

# ============================================
# Install Docker (Latest Version)
# ============================================
log "Installing Docker (latest version)..."

# Remove old Docker versions if present
apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Add Docker's official GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update apt and install Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker service
systemctl start docker
systemctl enable docker

# Add current user to docker group (if not root)
if [ -n "$SUDO_USER" ]; then
    usermod -aG docker "$SUDO_USER"
    log "Added $SUDO_USER to docker group (logout required to take effect)"
fi

# ============================================
# Install Docker Compose (Latest Standalone)
# ============================================
log "Installing Docker Compose standalone..."
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -oP '"tag_name": "\K(.*)(?=")')
curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# ============================================
# Install Nginx
# ============================================
log "Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# ============================================
# Install Node.js 24
# ============================================
log "Installing Node.js 24..."
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs

# ============================================
# Install PM2 and pnpm
# ============================================
log "Installing PM2 and pnpm globally..."
npm install -g pm2 pnpm

log "Configuring PM2 startup..."
if [ -n "$SUDO_USER" ]; then
    # Generate the startup command for the sudo user and execute it
    STARTUP_CMD=$(su - "$SUDO_USER" -c "pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER" | grep "sudo env" | head -n 1)
    if [ -n "$STARTUP_CMD" ]; then
        log "Executing startup command: $STARTUP_CMD"
        eval "$STARTUP_CMD"
    else
        warning "Could not capture PM2 startup command automatically. Please run the command manually if needed."
    fi
else
    pm2 startup systemd || warning "PM2 startup configuration skipped"
fi

# ============================================
# Install MongoDB Database Tools (mongodump)
# ============================================
log "Installing MongoDB Database Tools..."
CODENAME=$(lsb_release -sc)

if [[ "$CODENAME" == "noble" ]]; then
    # For Ubuntu 24.04 (Noble), use MongoDB 8.0 repo (7.0 not fully available for Noble yet)
    MONGO_VERSION="8.0"
    GPG_URL="https://pgp.mongodb.com/server-8.0.asc"
    GPG_FILE="/etc/apt/keyrings/mongodb-server-8.0.gpg"
else
    # For others (Jammy 22.04, etc.), use 7.0
    MONGO_VERSION="7.0"
    GPG_URL="https://www.mongodb.org/static/pgp/server-7.0.asc"
    GPG_FILE="/etc/apt/keyrings/mongodb-server-7.0.gpg"
fi

log "Detected Ubuntu $CODENAME - Using MongoDB $MONGO_VERSION tools"
curl -fsSL "$GPG_URL" | gpg --dearmor -o "$GPG_FILE" --yes
echo "deb [ arch=amd64,arm64 signed-by=$GPG_FILE ] https://repo.mongodb.org/apt/ubuntu $CODENAME/mongodb-org/$MONGO_VERSION multiverse" | tee "/etc/apt/sources.list.d/mongodb-org-$MONGO_VERSION.list"
apt update
apt install -y mongodb-database-tools

# ============================================
# Install AWS CLI v2 (for S3/R2 backups)
# ============================================
log "Installing AWS CLI v2..."
cd /tmp
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip
./aws/install --update
rm -rf aws awscliv2.zip
cd - > /dev/null

# ============================================
# Final Summary
# ============================================
log ""
log "============================================"
log "Installation Summary:"
log "============================================"
log "Docker: $(docker --version)"
log "Docker Compose: $(docker-compose --version)"
log "Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
log "Node.js: $(node -v)"
log "PM2: v$(pm2 -v)"
log "pnpm: v$(pnpm -v)"
log "mongodump: $(mongodump --version | head -n1)"
log "AWS CLI: $(aws --version)"
log "============================================"

INFO_FILE="/root/server-setup-info.txt"
cat > "$INFO_FILE" << EOF
Ubuntu Server Setup Completed: $(date)
============================================
Installed Software Versions:
- Docker: $(docker --version)
- Docker Compose: $(docker-compose --version)
- Nginx: $(nginx -v 2>&1)
- Node.js: $(node -v)
- PM2: v$(pm2 -v)
- pnpm: v$(pnpm -v)
- mongodump: $(mongodump --version | head -n1)
- AWS CLI: $(aws --version)
============================================
EOF

log "Setup completed successfully! Info saved to: $INFO_FILE"
warning "IMPORTANT: Please log out and back in to use Docker as $SUDO_USER"
