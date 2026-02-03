#!/bin/bash
# Railway startup script

# Run database migrations
npx prisma migrate deploy

# Start the server
npm start
