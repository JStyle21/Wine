# Stage 1: Build the TypeScript application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
# Or if you use yarn: 
# COPY package.json yarn.lock ./

RUN npm ci
# Or if you use yarn:
# RUN yarn install --frozen-lockfile

COPY . .

RUN npm run build # This runs 'tsc' as per your package.json

# Stage 2: Run the application
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy package.json and package-lock.json to install only production dependencies
COPY package.json package-lock.json* ./
# Or if you use yarn: 
# COPY package.json yarn.lock ./

RUN npm ci --omit=dev
# Or if you use yarn:
# RUN yarn install --production --frozen-lockfile

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
# Your server.ts uses process.env.PORT || 5001
# We will set PORT in docker-compose.yml
EXPOSE 5001 

CMD ["node", "dist/server.js"] 