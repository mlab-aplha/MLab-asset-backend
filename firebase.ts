import * as admin from 'firebase-admin';
import * as serviceAccount from './serviceAccount.json';

console.log(' Starting Firebase initialization...');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: "https://assets-magement.firebaseio.com"
  });
  
  console.log('Firebase initialized successfully!');
  
  const db = admin.firestore();
  console.log(' Firestore is ready');
  
  const auth = admin.auth();
  console.log(' Auth is ready');
  
  console.log(' Everything works!');
  
} catch (error: any) {
  console.error(' Error initializing Firebase:', error.message);
  console.error('Full error:', error);
}
