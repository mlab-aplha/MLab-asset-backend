import express, { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Import routes
import routes from './routes';

// Load environment variables
dotenv.config();

console.log(' Starting MLab Asset Management Backend...');

// Load Firebase key
const keyPath = path.join(__dirname, '../config/firebase-admin.json');
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
console.log(' Firebase project:', serviceAccount.project_id);

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://assets-magement.firebaseio.com"
});

console.log(' Firebase Admin initialized');

// Get Firebase services
const db = admin.firestore();
const auth = admin.auth();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Basic routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'mLabs Asset Management API',
    version: '1.0.0',
    status: 'active',
    services: {
      firebase: 'connected',
      firestore: 'ready',
      auth: 'ready'
    }
  });
});

app.get('/health', async (req: Request, res: Response) => {
  try {
    // Test Firestore connection
    await db.collection('test').doc('ping').set({
      timestamp: new Date().toISOString(),
      message: 'Health check'
    });
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        firestore: 'connected',
        server: 'running'
      }
    });
  } catch (error: unknown) {
    let errorMessage = 'Unknown error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      status: 'unhealthy',
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

// Use API routes
app.use('/api', routes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(` API Docs: http://localhost:${PORT}/`);
  console.log(` API Base: http://localhost:${PORT}/api`);
});
