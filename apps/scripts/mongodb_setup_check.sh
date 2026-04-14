#!/bin/bash

# MongoDB Backup Setup Verification Script
# This script checks if all dependencies and configurations are ready for backups.

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "===================================================="
echo "   MongoDB Backup Setup Verification"
echo "===================================================="

ERROR_COUNT=0
WARNING_COUNT=0

# Helper function to check if a binary exists
check_binary() {
    local cmd=$1
    local name=$2
    if command -v "$cmd" >/dev/null 2>&1; then
        echo -e "[ ${GREEN}OK${NC} ] $name is installed"
    else
        echo -e "[ ${RED}FAIL${NC} ] $name is NOT installed ($cmd missing)"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
}

# 1. Check Binary Dependencies
echo -e "\n1. Checking Binary Dependencies..."
check_binary "mongodump" "MongoDB Database Tools (mongodump)"
check_binary "aws" "AWS CLI (for Cloudflare R2)"
check_binary "tar" "GNU Tar"
check_binary "gzip" "Gzip"

# 2. Check Environment Configuration
echo -e "\n2. Checking Environment Configuration..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [[ -f "$ENV_FILE" ]]; then
    echo -e "[ ${GREEN}OK${NC} ] .env file found at $ENV_FILE"
    
    # Check for required variables
    required_vars=("MONGODB_CONNECTION_STRING" "R2_ACCESS_KEY_ID" "R2_SECRET_ACCESS_KEY" "R2_BUCKET_NAME" "R2_ENDPOINT")
    
    # We use a subshell to source it safely without affecting this script's env
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" "$ENV_FILE"; then
            val=$(grep "^$var=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
            if [[ -z "$val" ]]; then
                echo -e "[ ${RED}FAIL${NC} ] $var is present but empty in .env"
                ERROR_COUNT=$((ERROR_COUNT + 1))
            else
                echo -e "[ ${GREEN}OK${NC} ] $var is set"
            fi
        else
            echo -e "[ ${RED}FAIL${NC} ] $var is missing from .env"
            ERROR_COUNT=$((ERROR_COUNT + 1))
        fi
    done
else
    echo -e "[ ${RED}FAIL${NC} ] .env file not found"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

# 3. Check System / OS Compatibility
echo -e "\n3. Checking System Compatibility..."

# Check date command style (BSD vs GNU)
if date -v-1d >/dev/null 2>&1; then
    echo -e "[ ${GREEN}OK${NC} ] Detected BSD/macOS date command (compatible)"
elif date --date="1 day ago" >/dev/null 2>&1; then
    echo -e "[ ${GREEN}OK${NC} ] Detected GNU/Linux date command (compatible)"
else
    echo -e "[ ${YELLOW}WARN${NC} ] Could not determine date command style. Retention logic might fail."
    WARNING_COUNT=$((WARNING_COUNT + 1))
fi

# Check write access to /tmp
if [ -w "/tmp" ]; then
    echo -e "[ ${GREEN}OK${NC} ] Have write access to /tmp"
else
    echo -e "[ ${RED}FAIL${NC} ] NO write access to /tmp"
    ERROR_COUNT=$((ERROR_COUNT + 1))
fi

# Summary
echo -e "\n===================================================="
if [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${GREEN}SUCCESS:${NC} Environment is ready for backups!"
    if [ $WARNING_COUNT -gt 0 ]; then
        echo -e "${YELLOW}NOTE:${NC} There are $WARNING_COUNT warning(s) that might need attention."
    fi
else
    echo -e "${RED}FAILED:${NC} Found $ERROR_COUNT error(s). Please fix them before running backups."
fi
echo "===================================================="

# Exit with status 1 if there are errors, otherwise 0
[ $ERROR_COUNT -eq 0 ] && exit 0 || exit 1
