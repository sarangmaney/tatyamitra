
import * as admin from 'firebase-admin';

// Ensure this path is correct and your service account JSON key is stored securely
// For local development, you might point to a local file path.
// For deployment, use environment variables.
const serviceAccountJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;

if (!admin.apps.length) {
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // Optionally, specify databaseURL if needed, though often inferred
        // databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      });
      console.log("Firebase Admin SDK initialized successfully.");
    } catch (error) {
      console.error("Error parsing Firebase Admin service account JSON:", error);
      console.error("Failed to initialize Firebase Admin SDK. Ensure FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON is set correctly.");
    }
  } else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
    // Alternative initialization using individual environment variables
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log("Firebase Admin SDK initialized successfully using individual env vars.");
  } else {
    console.warn(
      'Firebase Admin SDK not initialized. Missing FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON or individual FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY environment variables.'
    );
  }
}

export const db = admin.apps.length ? admin.firestore() : null;
export const auth = admin.apps.length ? admin.auth() : null;
// Add other admin services if needed, e.g., admin.storage()

// Example of how to get GeoPoint if you need it server-side
export const { GeoPoint } = admin.firestore;
