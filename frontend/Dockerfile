# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json package-lock.json* ./
# Or if you use yarn: 
# COPY package.json yarn.lock ./

# Install dependencies
RUN npm ci
# Or if you use yarn:
# RUN yarn install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Set the API URL for the build (can be overridden at build time)
ARG REACT_APP_API_URL=http://localhost:5001/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:1.25-alpine

# Copy the build output from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy a custom Nginx configuration file
# This will be created in the next step
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 