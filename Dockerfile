# ── Stage 1: Build React client ──────────────────────────────────────────────
FROM node:20-alpine AS client-builder

WORKDIR /app/client

# Install client dependencies
COPY client/package*.json ./
RUN npm ci

# Copy client source and build
COPY client/ ./
RUN npm run build


# ── Stage 2: Production server ────────────────────────────────────────────────
FROM node:20-alpine AS production

# Install system dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy server source
COPY server/src/ ./src/

# Copy built client from Stage 1 into server's public directory
COPY --from=client-builder /app/client/dist ./public

# Copy uploads placeholder (for logo uploads etc.)
RUN mkdir -p uploads

# Expose the server port
EXPOSE 5000

# Environment defaults (override at runtime via -e or .env file)
ENV NODE_ENV=production \
    PORT=5000

# Start the server
CMD ["node", "src/index.js"]
