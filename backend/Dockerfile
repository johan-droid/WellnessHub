FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Cloudflare Workers run on the edge, so Docker is mainly for local dev/CI.
# We'll use wrangler dev to run the backend in a containerized environment if needed.
EXPOSE 8787

# Use --ip 0.0.0.0 to allow access from outside the container
CMD ["npm", "run", "dev", "--", "--ip", "0.0.0.0"]
