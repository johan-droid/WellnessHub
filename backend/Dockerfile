FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Development runtime variables for local Docker
ENV NODE_ENV=development
ENV PORT=8787

# Expose port
EXPOSE 8787

# Start local worker API server for Docker compose development
CMD ["npm", "run", "dev", "--", "--ip", "0.0.0.0", "--port", "8787", "--local"]
