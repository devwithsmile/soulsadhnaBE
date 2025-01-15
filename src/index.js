import app from './server.js';
import { connectDB } from './config/database.js';

const PORT = process.env.PORT || 3000;

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}); 