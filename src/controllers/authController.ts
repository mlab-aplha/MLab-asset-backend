import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const auth = admin.auth();
const db = admin.firestore();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role = 'user' } = req.body;

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

     
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const token = jwt.sign(
      { uid: userRecord.uid, email, role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        uid: userRecord.uid,
        email,
        name,
        role,
      },
      token,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

 
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const userDoc = usersSnapshot.docs[0];
    const user = userDoc.data();

    const token = jwt.sign(
      { uid: user.uid, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
};

 
export const getProfile = async (req: Request, res: Response) => {
  try {
    const { uid } = (req as any).user; 
    
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = userDoc.data();
    
    const { password, ...userData } = user as any;

    res.json({
      success: true,
      user: userData,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get profile',
    });
  }
};
