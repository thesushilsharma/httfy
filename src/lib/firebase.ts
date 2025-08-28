import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDt2TOS7pYMa-Ghn9IZCtKOIaDqXeNq-r0",
  authDomain: "httfy-9fd3a.firebaseapp.com",
  projectId: "httfy-9fd3a",
  storageBucket: "httfy-9fd3a.firebasestorage.app",
  messagingSenderId: "847251267649",
  appId: "1:847251267649:web:bd3dd27c544f9643c7e6c0",
  measurementId: "G-BS60P6PWPP"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export const fetchToken = async () => {
  try {
    const fcmMessaging = await messaging();
    if (fcmMessaging) {
      const token = await getToken(fcmMessaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
      });
      return token;
    }
    return null;
  } catch (err) {
    console.error("An error occurred while fetching the token:", err);
    return null;
  }
};

export { app, messaging };
