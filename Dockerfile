# Use a more explicit platform definition
FROM --platform=$BUILDPLATFORM node:20.11.1-alpine3.19 AS builder

WORKDIR /app

# Install dotenvx
RUN curl -sfS https://dotenvx.sh/install.sh | sh

COPY package*.json ./

COPY . .

# Install dependencies
RUN npm install

# Expose the port the app runs on
EXPOSE 3000

# Run npm run dev with dotenvx
CMD ["dotenvx", "run", "--", "npm", "run", "dev"]
 