import { google } from 'googleapis';
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

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  access_token: process.env.GOOGLE_ACCESS_TOKEN,
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

export const calendar = google.calendar({
  version: 'v3',
  auth: oauth2Client
});