#!/bin/bash

# MongoDB Atlas Backup Script for Cloudflare R2
# This script backs up the MongoDB Atlas database, compresses it, uploads to R2, and manages retention.

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Log function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Source environment variables from .env in the same directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [[ ! -f "$ENV_FILE" ]]; then
    log "ERROR: .env file not found at $ENV_FILE"
    exit 1
fi

source "$ENV_FILE"

# Check required environment variables
required_vars=("MONGODB_CONNECTION_STRING" "R2_ACCESS_KEY_ID" "R2_SECRET_ACCESS_KEY" "R2_BUCKET_NAME" "R2_ENDPOINT")
for var in "${required_vars[@]}"; do
    if [[ -z "${!var:-}" ]]; then
        log "ERROR: Required environment variable $var is not set"
        exit 1
    fi
done

# Variables
MONGO_CONNECTION="$MONGODB_CONNECTION_STRING"
R2_ACCESS_KEY="$R2_ACCESS_KEY_ID"
R2_SECRET_KEY="$R2_SECRET_ACCESS_KEY"
R2_BUCKET="$R2_BUCKET_NAME"
R2_ENDPOINT_URL="$R2_ENDPOINT"
PREFIX="mongodb-backups/"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M)
FILENAME="letstry_dev_backup_${TIMESTAMP}.gz"
TEMP_DIR="/tmp/mongodb_backup_$(date +%s)"

log "Starting MongoDB backup process"

# Create temp directory
mkdir -p "$TEMP_DIR"
log "Created temp directory: $TEMP_DIR"

# Run mongodump
log "Running mongodump..."
mongodump --uri="$MONGO_CONNECTION" --out="$TEMP_DIR/dump" --gzip
log "Mongodump completed"

# Compress the dump
log "Compressing dump..."
cd "$TEMP_DIR"
tar -czf "$FILENAME" dump/
log "Compression completed: $FILENAME"

# Upload to R2
log "Uploading to R2..."
AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY" AWS_SECRET_ACCESS_KEY="$R2_SECRET_KEY" AWS_DEFAULT_REGION=auto aws s3 cp "$FILENAME" "s3://$R2_BUCKET/$PREFIX$FILENAME" --endpoint-url="$R2_ENDPOINT_URL"
log "Upload completed"

# Retention management: Keep only last 5 days
log "Checking retention policy (keep last 5 days)..."
FIVE_DAYS_AGO=$(date -v-5d +%Y-%m-%d)

# List objects in the prefix
OBJECT_LIST=$(AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY" AWS_SECRET_ACCESS_KEY="$R2_SECRET_KEY" AWS_DEFAULT_REGION=auto aws s3 ls "s3://$R2_BUCKET/$PREFIX" --endpoint-url="$R2_ENDPOINT_URL" --recursive | awk '{print $4}')

for OBJECT in $OBJECT_LIST; do
    # Extract date from filename (assuming format letstry_dev_backup_YYYY-MM-DD_HH-MM.gz)
    if [[ $OBJECT =~ letstry_dev_backup_([0-9]{4}-[0-9]{2}-[0-9]{2}) ]]; then
        OBJECT_DATE="${BASH_REMATCH[1]}"
        if [[ "$OBJECT_DATE" < "$FIVE_DAYS_AGO" ]]; then
            log "Deleting old backup: $OBJECT"
            AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY" AWS_SECRET_ACCESS_KEY="$R2_SECRET_KEY" AWS_DEFAULT_REGION=auto aws s3 rm "s3://$R2_BUCKET/$OBJECT" --endpoint-url="$R2_ENDPOINT_URL"
        fi
    fi
done

log "Retention check completed"

# Cleanup local files
log "Cleaning up local files..."
cd /
rm -rf "$TEMP_DIR"
log "Cleanup completed"

log "Backup process completed successfully"