#!/bin/bash

echo "🔧 Setting up Prisma..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Push schema to database (development mode)
echo "🗄️  Pushing schema to database..."
npx prisma db push --accept-data-loss

echo "✅ Prisma setup complete!"
