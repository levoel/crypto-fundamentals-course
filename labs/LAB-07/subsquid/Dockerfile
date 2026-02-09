FROM node:20-slim

WORKDIR /app

# Copy package files and install
COPY package.json package-lock.json* ./
RUN npm install

# Copy source and config
COPY tsconfig.json squid.yaml commands.json schema.graphql ./
COPY src/ ./src/

# Generate entity classes from schema.graphql
RUN npx squid-typeorm-codegen

# Build TypeScript
RUN npm run build

# Entrypoint: run migrations then start processor
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
