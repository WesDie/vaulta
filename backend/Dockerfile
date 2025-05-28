FROM node:18-alpine

# Install system dependencies for image processing
RUN apk add --no-cache \
    vips-dev \
    exiftool \
    imagemagick \
    build-base \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies for build
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Prune dev dependencies after build
RUN npm ci --only=production

# Create data directories
RUN mkdir -p /app/data/originals /app/data/thumbs

# Expose port
EXPOSE 8000

# Start the application
CMD ["npm", "start"] 