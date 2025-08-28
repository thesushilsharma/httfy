"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { onMessage, Unsubscribe } from "firebase/messaging";
import { fetchToken, messaging } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

async function getNotificationPermissionAndToken() {
  // Step 1: Check if Notifications are supported in the browser.
  if (!("Notification" in window)) {
    console.error("This browser does not support desktop notification");
    return null;
  }

  console.log("Current notification permission:", Notification.permission);

  // Step 2: Check if permission is already granted.
  if (Notification.permission === "granted") {
    console.log("Notification permission already granted, fetching token...");
    return await fetchToken();
  }

  // Step 3: If permission is not denied, request permission from the user.
  if (Notification.permission !== "denied") {
    console.log("Requesting notification permission...");
    const permission = await Notification.requestPermission();
    console.log("Permission result:", permission);
    if (permission === "granted") {
      return await fetchToken();
    }
  }

  console.error("Notification permission not granted. Current status:", Notification.permission);
  return null;
}

const useFcmToken = () => {
  const router = useRouter(); // Initialize the router for navigation.
  const [notificationPermissionStatus, setNotificationPermissionStatus] =
    useState<NotificationPermission | null>(null); // State to store the notification permission status.
  const [token, setToken] = useState<string | null>(null); // State to store the FCM token.
  const [error, setError] = useState<string | null>(null); // State to store error messages
  const retryLoadToken = useRef(0); // Ref to keep track of retry attempts.
  const isLoading = useRef(false); // Ref to keep track if a token fetch is currently in progress.

  const loadToken = useCallback(async () => {
    // Step 4: Prevent multiple fetches if already fetched or in progress.
    if (isLoading.current) return;

    isLoading.current = true; // Mark loading as in progress.
    setError(null); // Clear previous errors
    
    try {
      const token = await getNotificationPermissionAndToken(); // Fetch the token.

      // Step 5: Handle the case where permission is denied.
      if (Notification.permission === "denied") {
        setNotificationPermissionStatus("denied");
        setError("Notification permission denied. Please enable notifications in your browser settings.");
        console.error(
          "%cPush Notifications issue - permission denied",
          "color: red; background: #c7c7c7; padding: 8px; font-size: 20px"
        );
        isLoading.current = false;
        return;
      }

      // Step 6: Retry fetching the token if necessary. (up to 2 times)
      // This step is typical initially as the service worker may not be ready/installed yet.
      if (!token) {
        if (retryLoadToken.current >= 2) {
          const errorMsg = "Unable to load FCM token after 2 retries. Please check your VAPID key configuration.";
          setError(errorMsg);
          console.error(
            `%c${errorMsg}`,
            "color: red; background: #c7c7c7; padding: 8px; font-size: 16px"
          );
          isLoading.current = false;
          return;
        }

        retryLoadToken.current += 1;
        console.warn(`Token fetch failed. Retry attempt ${retryLoadToken.current}/2...`);
        isLoading.current = false;
        // Wait a bit before retrying
        setTimeout(() => loadToken(), 2000);
        return;
      }

      // Step 7: Set the fetched token and mark as fetched.
      setNotificationPermissionStatus(Notification.permission);
      setToken(token);
      console.log("FCM Token successfully obtained:", token.substring(0, 20) + "...");
    } catch (error) {
      const errorMsg = `Error in loadToken: ${error}`;
      setError(errorMsg);
      console.error(errorMsg);
    } finally {
      isLoading.current = false;
    }
  }, []);

  useEffect(() => {
    // Step 8: Initialize token loading when the component mounts.
    if ("Notification" in window) {
      loadToken();
    } else {
      setError("This browser does not support notifications");
    }
  }, [loadToken]);

  useEffect(() => {
    const setupListener = async () => {
      if (!token) return; // Exit if no token is available.

      console.log(`onMessage registered with token ${token}`);
      const m = await messaging();
      if (!m) {
        setError("Firebase messaging not supported in this browser");
        return;
      }

      // Step 9: Register a listener for incoming FCM messages.
      const unsubscribe = onMessage(m, (payload) => {
        if (Notification.permission !== "granted") {
          console.warn("Notification permission not granted, skipping notification");
          return;
        }

        console.log("Foreground push notification received:", payload);
        const link = payload.fcmOptions?.link || payload.data?.link;

        if (link) {
          toast.info(
            `${payload.notification?.title}: ${payload.notification?.body}`,
            {
              action: {
                label: "Visit",
                onClick: () => {
                  const link = payload.fcmOptions?.link || payload.data?.link;
                  if (link) {
                    router.push(link);
                  }
                },
              },
            }
          );
        } else {
          toast.info(
            `${payload.notification?.title}: ${payload.notification?.body}`
          );
        }

        // --------------------------------------------
        // Disable this if you only want toast notifications.
        try {
          const n = new Notification(
            payload.notification?.title || "New message",
            {
              body: payload.notification?.body || "This is a new message",
              data: link ? { url: link } : undefined,
              icon: payload.notification?.icon || "/favicon.ico",
              badge: "/favicon.ico",
              tag: "httfy-notification",
              requireInteraction: false,
            }
          );

          // Step 10: Handle notification click event to navigate to a link if present.
          n.onclick = (event) => {
            event.preventDefault();
            const link = (event.target as any)?.data?.url;
            if (link) {
              router.push(link);
            } else {
              console.log("No link found in the notification payload");
            }
            n.close();
          };

          // Auto-close notification after 5 seconds
          setTimeout(() => {
            n.close();
          }, 5000);
        } catch (notificationError) {
          console.error("Error creating notification:", notificationError);
          setError(`Failed to create notification: ${notificationError}`);
        }
        // --------------------------------------------
      });

      return unsubscribe;
    };

    let unsubscribe: Unsubscribe | null = null;

    setupListener().then((unsub) => {
      if (unsub) {
        unsubscribe = unsub;
      }
    });

    // Step 11: Cleanup the listener when the component unmounts.
    return () => unsubscribe?.();
  }, [token, router]);

  return { token, notificationPermissionStatus, error }; // Return the token, permission status, and error
};

export default useFcmToken;
