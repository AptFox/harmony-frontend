# ---- Dependencies Stage ----
FROM node:20-alpine AS deps
# Add libc6-compat for sharp/node compatibility on Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set BACKEND API URL at build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
# Default to port 3000, override via ENV
ENV PORT=3000

# Create non-root users for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set permissions for Next.js cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy files from the build stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE $PORT

# Run via Node
CMD ["sh", "-c", "node server.js -p $PORT"]