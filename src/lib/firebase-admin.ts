import * as admin from "firebase-admin";

const serviceAccount: admin.ServiceAccount = {
  projectId: 'httfy-9fd3a',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error("Firebase Admin initialization error", error.stack);
  }
}

export { admin };