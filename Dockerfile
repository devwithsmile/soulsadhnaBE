FROM node:20.11.1-alpine3.19

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN npm install

# Expose the port the app runs on
EXPOSE 3000

# Command to run the development server
CMD ["npm", "run", "dev"]