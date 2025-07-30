#!/bin/bash

# Data replication script for staging environment
# Replicates production data to staging with anonymization

set -e

echo "📊 Starting production data replication to staging..."

# Database replication with anonymization
echo "🗄️ Replicating database..."
pg_dump $PROD_DATABASE_URL \
  --no-owner \
  --no-privileges \
  --exclude-table-data=sessions \
  --exclude-table-data=logs \
  | sed 's/PROD_/STAGING_/g' \
  | psql $STAGING_DATABASE_URL

# Anonymize sensitive data
echo "🔒 Anonymizing sensitive data..."
psql $STAGING_DATABASE_URL << EOF
-- Anonymize user emails and names
UPDATE users SET 
  email = 'user' || id || '@example.com',
  "firstName" = 'User',
  "lastName" = id::text,
  phone = '+1555000' || LPAD(id::text, 4, '0')
WHERE email != 'admin@example.com';

-- Clear sensitive fields
UPDATE users SET 
  password = '\$2b\$10\$dummy.hash.for.staging.environment',
  "twoFactorSecret" = NULL;

-- Clear session data
TRUNCATE sessions;
TRUNCATE logs;

-- Update timestamps to recent dates
UPDATE users SET 
  "createdAt" = NOW() - (random() * interval '90 days'),
  "updatedAt" = NOW() - (random() * interval '30 days');
EOF

# File storage replication (excluding sensitive files)
echo "📁 Replicating file storage..."
aws s3 sync s3://$PROD_S3_BUCKET s3://$STAGING_S3_BUCKET \
  --exclude "sensitive/*" \
  --exclude "private/*" \
  --exclude "*.key" \
  --exclude "*.pem" \
  --delete

# Generate sample test data
echo "🎭 Generating additional test data..."
psql $STAGING_DATABASE_URL << EOF
-- Insert test projects
INSERT INTO projects (id, name, description, "userId", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'Test Project ' || generate_series,
  'Sample project for testing #' || generate_series,
  (SELECT id FROM users ORDER BY random() LIMIT 1),
  NOW() - (random() * interval '60 days'),
  NOW() - (random() * interval '30 days')
FROM generate_series(1, 50);

-- Insert test files
INSERT INTO files (id, "originalName", "fileName", "mimeType", size, "projectId", "userId", "createdAt")
SELECT 
  gen_random_uuid(),
  'sample-file-' || generate_series || '.jpg',
  'sample-' || generate_series || '.jpg',
  'image/jpeg',
  floor(random() * 5000000 + 100000)::integer,
  (SELECT id FROM projects ORDER BY random() LIMIT 1),
  (SELECT id FROM users ORDER BY random() LIMIT 1),
  NOW() - (random() * interval '30 days')
FROM generate_series(1, 200);
EOF

# Update Redis cache
echo "⚡ Clearing and updating cache..."
redis-cli -u $STAGING_REDIS_URL FLUSHALL

echo "✅ Data replication completed successfully!"
echo "📊 Staging environment now has anonymized production data"
echo "🔗 Staging database: $(echo $STAGING_DATABASE_URL | sed 's/:[^@]*@/:***@/')"