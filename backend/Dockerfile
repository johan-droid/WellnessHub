FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
# Install dependencies; use production-only install when building for production
ARG NODE_ENV=development
RUN if [ "$NODE_ENV" = "production" ]; then npm ci --omit=dev --prefer-offline --no-audit --progress=false; else npm ci --prefer-offline --no-audit --progress=false; fi

# Copy source code
COPY . .

# Development runtime variables for local Docker
ENV NODE_ENV=development
ENV PORT=8787

# Expose port
EXPOSE 8787

# Start local worker API server for Docker compose development
CMD ["npm", "run", "dev", "--", "--ip", "0.0.0.0", "--port", "8787", "--local"]
