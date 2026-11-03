# PULSE API – production image
FROM node:22-bookworm-slim

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm install tsx typescript @types/node @types/express --no-save

# App source (API only needs server/ + package metadata)
COPY server ./server
COPY tsconfig.json ./

# Default data dir inside container; mount a volume at /data in production
ENV NODE_ENV=production
ENV PORT=3001
ENV DATA_DIR=/data
ENV PULSE_SESSION_SECRET=change-me-in-production

RUN mkdir -p /data

EXPOSE 3001

# Auto-seeds on first boot if /data/pulse-db.json is missing
CMD ["npx", "tsx", "server/index.ts"]
