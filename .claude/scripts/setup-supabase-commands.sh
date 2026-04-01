#!/bin/bash
# Supabase setup script for the salon management app
# This script will be executed after a Supabase project has been manually created.
# It generates TypeScript types and sets up the .env file.

# Prompt for user to input Supabase project details
echo "=== Supabase Setup ==="
read -p "Enter your Supabase Project API URL (e.g., https://xyz.supabase.co): " SUPABASE_URL
read -p "Enter your Supabase Project Database URL (e.g., postgresql://...) " DATABASE_URL
read -p "Enter your Supabase Auth Base URL (e.g., https://xyz.supabase.co/auth/v1): " AUTH_BASE_URL

# Write .env file
mkdir -p $(dirname .env) 2>/dev/null || true
cat <<EOF > .env
DATABASE_URL=$DATABASE_URL
SUPABASE_URL=$SUPABASE_URL
NEON_AUTH_BASE_URL=$AUTH_BASE_URL
EOF

echo "Created .env file."

# Generate TypeScript types
echo "Generating TypeScript types..."
mkdir -p core/api
npx supabase gen types typescript --project-id $(echo $SUPABASE_URL | sed -E 's#https://([^/.]+)\.supabase\.co#\1#') --schema public > core/api/supabase-types.ts

echo "Types generated and saved to core/api/supabase-types.ts"