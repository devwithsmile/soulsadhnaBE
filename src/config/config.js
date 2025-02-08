import dotenv from 'dotenv'

dotenv.config()


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