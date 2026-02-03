const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Load Firebase config
const keyPath = path.join(__dirname, 'config/firebase-admin.json');
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function createTestUser() {
  try {
    const userRecord = await admin.auth().createUser({
      email: 'test@mlabs.com',
      password: 'Test@12345',
      displayName: 'Test User',
      disabled: false,
    });

    console.log('✅ Test user created in Firebase Auth:');
    console.log('   UID:', userRecord.uid);
    console.log('   Email:', userRecord.email);
    
    // Also add to Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      name: 'Test User',
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
    
    console.log('✅ User added to Firestore');
    console.log('\nUse this UID in your test tokens:', userRecord.uid);
    
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('⚠️  User already exists');
      // Get existing user
      const userRecord = await admin.auth().getUserByEmail('test@mlabs.com');
      console.log('Existing UID:', userRecord.uid);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

createTestUser();
