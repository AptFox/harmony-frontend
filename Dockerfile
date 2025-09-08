# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Set BACKEND API URL at build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Install dependencies separately for caching
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Copy source code
COPY . .

# Build Next.js
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
# Default to port 3000, override via env
ENV PORT=3000

# Copy only what's needed for runtime
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/node_modules ./node_modules

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

EXPOSE $PORT

# Start Next.js (Heroku overrides $PORT automatically)
CMD ["sh", "-c", "npm run start -- -p $PORT -H 0.0.0.0"]
