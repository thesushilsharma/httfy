// Scripts for firebase and firebase messaging
importScripts(
  "https://www.gstatic.com/firebasejs/12.2.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.2.0/firebase-messaging-compat.js"
);

// Close any existing service worker
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker activating...');
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('[firebase-messaging-sw.js] Service Worker activated and claimed clients');
    })
  );
});

const firebaseConfig = {
  apiKey: "AIzaSyDt2TOS7pYMa-Ghn9IZCtKOIaDqXeNq-r0",
  authDomain: "httfy-9fd3a.firebaseapp.com",
  projectId: "httfy-9fd3a",
  storageBucket: "httfy-9fd3a.firebasestorage.app",
  messagingSenderId: "847251267649",
  appId: "1:847251267649:web:bd3dd27c544f9643c7e6c0",
  measurementId: "G-BS60P6PWPP"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
const channel = new BroadcastChannel("notifications");

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || "/favicon.ico",
  };

  channel.postMessage(payload);

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification click received.");
  event.notification.close();

  const link = event.notification.data?.link;
  if (link) {
    event.waitUntil(clients.openWindow(link));
  } else {
    // If no specific link, focus the last focused or open a new window
    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clientList) => {
          if (clientList.length > 0) {
            let client = clientList[0];
            for (let i = 0; i < clientList.length; i++) {
              if (clientList[i].focused) {
                client = clientList[i];
              }
            }
            return client.focus();
          }
          return clients.openWindow("/");
        })
    );
  }
});