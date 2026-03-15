# Base image
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Exposure
EXPOSE 8787

# Command for local development
CMD ["npm", "run", "dev"]
