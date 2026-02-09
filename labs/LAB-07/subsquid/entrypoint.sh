#!/bin/bash
set -e
echo "Running migrations..."
npx squid-typeorm-migration apply || true
echo "Starting processor..."
node -r dotenv/config lib/main.js
