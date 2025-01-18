import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUI from 'swagger-ui-express';
import { specs } from './config/swagger.js';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import adminRoutes from './routes/admin.routes.js';
// import paymentRoutes from './routes/payment.routes.js'; // commented out
import { errorHandler } from './middleware/error.middleware.js';
import helmet from 'helmet';
import { requestLogger } from './middleware/logger.middleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Increase event emitter limit
process.setMaxListeners(20);

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(requestLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Documentation
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/payments', paymentRoutes); // commented out


app.get('/', (req, res) => {
    console.log('Application working fine');
    res.status(200).send('Application working fine');
});



// Error Handler
app.use(errorHandler);

// Instead of starting the server here, export the app
export default app;