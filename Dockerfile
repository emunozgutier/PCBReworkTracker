# Use Node.js 20 LTS slim image as base
FROM node:20-slim

# Install system dependencies (needed for compiling sqlite3 if prebuilt binaries are missing)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy package configuration files
COPY package*.json ./

# Force native modules (sqlite3) to always compile from source
# This avoids prebuilt binary GLIBC version mismatches
ENV npm_config_build_from_source=true

# Install dependencies (including devDependencies for building the frontend)
RUN npm ci

# Copy the rest of the application files
COPY . .

# Set base path to / for Docker (GitHub Pages uses /Rework-Tracker/)
ENV BASE_PATH=/

# Build the React frontend
RUN npm run build

# Expose Vite preview port and Express backend port
EXPOSE 5001
EXPOSE 5002

# Run the static frontend with 'serve' and the Express API server concurrently
# Using 'serve' instead of 'vite preview' avoids gzip corruption issues through Docker port mapping
CMD ["npx", "concurrently", "npx tsx src/store/serverDataBase/server.ts", "npx serve dist --listen 5001"]

