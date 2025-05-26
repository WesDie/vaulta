#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up Vaulta environment...${NC}"

# Check if .env already exists
if [ -f .env ]; then
    echo -e "${YELLOW}Warning: .env file already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [[ ! $overwrite =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env file"
        exit 0
    fi
fi

# Copy from template
if [ -f env.example ]; then
    cp env.example .env
    echo -e "${GREEN}Created .env file from env.example${NC}"
else
    echo -e "${RED}Error: env.example file not found${NC}"
    exit 1
fi

# Create data directories
echo "Creating data directories..."
mkdir -p data/originals data/thumbs data/db

echo -e "${GREEN}Environment setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review and update the .env file if needed"
echo "2. Run: ./dev.sh setup"
echo "3. Run: ./dev.sh dev" 