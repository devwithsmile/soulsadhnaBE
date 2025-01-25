# Use a more explicit platform definition
FROM --platform=$BUILDPLATFORM node:20.11.1-alpine3.19 AS builder

WORKDIR /app

COPY . .

# Install dependencies
RUN npm install

# Expose the port the app runs on
EXPOSE 3000

# Command to run the development server
CMD ["npm", "run", "dev"]