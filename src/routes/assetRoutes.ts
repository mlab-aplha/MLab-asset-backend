import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import * as admin from 'firebase-admin';

const router = Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const db = admin.firestore();
    const { page = 1, limit = 10, category, status } = req.query;
    
    let query: any = db.collection('assets');
    
    if (category) query = query.where('category', '==', category);
    if (status) query = query.where('status', '==', status);
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    
    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(limitNum)
      .get();
    
    const assets: any[] = [];
    snapshot.forEach((doc: any) => {
      assets.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;
    
    res.json({
      success: true,
      data: assets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error fetching assets:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch assets',
    });
  }
});

 
router.get('/:id', async (req, res) => {
  try {
    const db = admin.firestore();
    const { id } = req.params;
    
    const doc = await db.collection('assets').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }
    
    const asset = {
      id: doc.id,
      ...doc.data()
    };
    
    res.json({
      success: true,
      data: asset,
    });
  } catch (error: any) {
    console.error('Error fetching asset:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch asset',
    });
  }
});

 
router.post('/', authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const db = admin.firestore();
    const user = (req as any).user;
    const assetData = req.body;
    
    const assetWithMeta = {
      ...assetData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.uid,
    };
    
    const docRef = await db.collection('assets').add(assetWithMeta);
    
    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: {
        id: docRef.id,
        ...assetWithMeta,
      },
    });
  } catch (error: any) {
    console.error('Error creating asset:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create asset',
    });
  }
});

 
router.put('/:id', async (req, res) => {
  try {
    const db = admin.firestore();
    const { id } = req.params;
    const updateData = req.body;
    const user = (req as any).user;
    
    const doc = await db.collection('assets').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }
    
    const asset = doc.data();
    
    if (user.role !== 'admin' && user.role !== 'manager' && asset?.assignedTo !== user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this asset',
      });
    }
    
    await db.collection('assets').doc(id).update({
      ...updateData,
      updatedAt: new Date().toISOString(),
      updatedBy: user.uid,
    });
    
    const updatedDoc = await db.collection('assets').doc(id).get();
    const updatedAsset = {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };
    
    res.json({
      success: true,
      message: 'Asset updated successfully',
      data: updatedAsset,
    });
  } catch (error: any) {
    console.error('Error updating asset:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update asset',
    });
  }
});

// Delete asset (admin only)
router.delete('/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    const db = admin.firestore();
    const { id } = req.params;
    
    await db.collection('assets').doc(id).delete();
    
    res.json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting asset:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete asset',
    });
  }
});

export default router;
