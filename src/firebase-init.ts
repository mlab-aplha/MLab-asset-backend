import * as admin from 'firebase-admin';

import serviceAccount from './serviceAccount.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: "https://assets-magement.firebaseio.com"
});

console.log(" Firebase initialized!");