import fs from 'fs'; // Import the 'fs' module
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to load environment variables with fallback
function loadEnv(paths) {
  for (const envPath of paths) {
    if (fs.existsSync(envPath)) { // Check if the file exists
      try {
        dotenv.config({ path: envPath, override: false });
        console.log(`Loaded environment variables from: ${envPath}`);
        return;
      } catch (error) {
        console.warn(`Failed to load environment variables from ${envPath}: ${error}`);
      }
    } else {
      console.log(`File not found: ${envPath}`);
    }
  }
  console.warn('No environment file loaded. Using system environment variables.');
}

// Define the order of preference for environment files
const envFiles = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '.env.development'),
  path.resolve(process.cwd(), '.env.test'),
  path.resolve(process.cwd(), '.env'),
];

// Load environment variables with fallback
loadEnv(envFiles);

console.log("env values " + process.env.ENVTEST);


// General Configuration
const GENERAL_CONFIG = {
  BASE_URL: process.env.BASE_URL,
  REDIRECT_URL: process.env.REDIRECT_URL,
  PORT: process.env.PORT || 3000,
  PLATFORM_NAME: process.env.PLATFORM_NAME,
}

const AWS_CONFIG = {
  EMAIL_CONFIG: {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL_ADDRESS,
  },
  AWS: {
    ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    REGION: process.env.AWS_REGION,
  },
};


export default {
  GENERAL_CONFIG,
  AWS_CONFIG,
}
