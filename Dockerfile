FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage for MongoDB installation
FROM node:18-alpine as mongodb-installer

# Install MongoDB Community
RUN apk add --no-cache mongodb

# Final stage
FROM node:18-alpine


WORKDIR /app

# Copy MongoDB binaries from mongodb-installer stage
COPY --from=mongodb-installer /usr/bin/mongo* /usr/bin/
COPY --from=mongodb-installer /usr/bin/mongod /usr/bin/

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist
COPY .env.example .env

# Create directory for MongoDB data
RUN mkdir -p /data/db && \
    chown -R node:node /data/db

# Expose ports for Node.js and MongoDB
EXPOSE 3000 27017

# Switch to non-root user
USER node

# Create a script to start both MongoDB and Node.js application
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]