import { Router } from 'express';
import assetRoutes from './assetRoutes';
import * as admin from 'firebase-admin';

const router = Router();

router.get('/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

 
router.get('/test/token', (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    
     
    const testUser = {
      uid: 'test-user-' + Date.now(),
      email: 'test@mlabs.com',
      name: 'Test User',
      role: 'admin'
    };
    
    
    const jwtSecret = process.env.JWT_SECRET || 'development-secret-key-change-in-production';
    
    const token = jwt.sign(
      testUser,
      jwtSecret,
      { expiresIn: '1h' }
    );
    
    res.json({
      success: true,
      message: 'Test token generated (valid for 1 hour)',
      token,
      user: testUser
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

 
router.post('/test/create-sample', async (req, res) => {
  try {
    const db = admin.firestore();
    
    const assetData = {
      name: 'Test Laptop',
      description: 'Test asset for development',
      category: 'Laptop',
      serialNumber: 'TEST' + Date.now(),
      purchaseDate: new Date().toISOString(),
      purchasePrice: 999.99,
      status: 'available',
      location: 'Test Lab',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'test-user'
    };
    
    const docRef = await db.collection('assets').add(assetData);
    
    res.json({
      success: true,
      message: 'Sample asset created',
      assetId: docRef.id
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
 
router.get('/test/assets', async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('assets').limit(10).get();
    
    const assets: any[] = [];
    snapshot.forEach((doc: any) => {
      assets.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: assets.length,
      data: assets
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

 
router.use('/assets', assetRoutes);

export default router;
