# Use a more explicit platform definition
FROM --platform=$BUILDPLATFORM node:20.11.1-alpine3.19 AS builder

WORKDIR /app

# Install dotenvx globally
RUN npm install -g @dotenvx/dotenvx

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Run npm run dev with dotenvx
CMD ["dotenvx", "run", "--", "npm", "run", "dev"]