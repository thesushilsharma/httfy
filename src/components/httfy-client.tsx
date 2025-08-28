"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscribePanel } from "./subscribe-panel";
import { PublishForm } from "./publish-form";
import { BellRing, Send } from "lucide-react";
import { onMessage } from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import { toast } from "sonner";
import useFcmToken from "@/hooks/use-fcm-token";

export default function HttfyClient() {
  const { token: fcmToken, error: notificationError } = useFcmToken();
  const [notifications, setNotifications] = React.useState<
    NotificationPayload[]
  >([]);
  const [subscription, setSubscription] = React.useState<string | null>(null);

  const addNotification = React.useCallback((payload: any) => {
    const { notification, data, from: topic } = payload;
    if (notification) {
      // Try to extract topic from various sources
      let extractedTopic = topic;
      
      // If topic is not available from 'from' field, try to get it from data
      if (!extractedTopic || extractedTopic === "847251267649") {
        extractedTopic = data?.topic || subscription || "unknown";
      }
      
      const newNotification: NotificationPayload = {
        id: payload.messageId || Date.now().toString(),
        topic: extractedTopic,
        title: notification.title || "New Notification",
        message: notification.body || "",
        priority: data?.priority || "3",
        tags: data?.tags,
        timestamp: new Date(),
      };

      console.log("Adding notification:", newNotification);

      setNotifications((prev) => [
        newNotification,
        ...prev.filter((n) => n.id !== newNotification.id),
      ]);

      // Also show a toast for foreground messages
      toast.info(notification.title, {
        description: notification.body,
      });
    }
  }, [subscription]);

  React.useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registration successful, scope is:",
            registration.scope
          );
        })
        .catch((err) => {
          console.log("Service Worker registration failed, error:", err);
        });
    }
    // Listen for messages from the service worker
    const channel = new BroadcastChannel("notifications");
    const listener = (event: MessageEvent) => {
      console.log("Broadcast channel message received:", event.data);
      console.log("Current subscription:", subscription);
      addNotification(event.data);
    };
    channel.addEventListener("message", listener);

    return () => {
      channel.removeEventListener("message", listener);
      channel.close();
    };
  }, [addNotification, subscription]);

  React.useEffect(() => {
    const setupListener = async () => {
      const m = await messaging();
      if (m) {
        // This onMessage is for foreground messages.
        const unsubscribe = onMessage(m, (payload) => {
          console.log("Foreground message received. ", payload);
          addNotification(payload);
        });
        return unsubscribe;
      }
    };

    let unsubscribe: (() => void) | undefined;
    setupListener().then((unsub) => {
      if (unsub) {
        unsubscribe = unsub;
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [addNotification]);

  const handlePublish = async (
    data: Omit<NotificationPayload, "id" | "timestamp">
  ) => {
    // if (!subscription) {
    //   toast.error("Not Subscribed", {
    //     description: "Please subscribe to a topic before publishing.",
    //   });
    //   return;
    // }

    const payload = {
      topic: data.topic,
      title: data.title,
      message: data.message,
      priority: data.priority,
      tags: data.tags || "",
    };

    try {
      const response = await fetch(`/api/send-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Notification Sent!", {
          description: `Message published to topic: ${data.topic}`,
        });
      } else {
        const errorData = await response.json();
        console.error("API Send Error:", errorData);
        toast.error("Failed to Send", {
          description:
            errorData.error || `Could not publish to topic: ${data.topic}.`,
        });
      }
    } catch (e) {
      console.error("API Send Exception:", e);
      toast.error("Failed to Send", {
        description: `Could not publish to topic: ${data.topic}. Check console for details.`,
      });
    }
  };

  const handleUnsubscribe = async (topic: string) => {
    if (!fcmToken) return;
    try {
      await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: fcmToken, topic }),
      });
    } catch (error) {
      console.error("Failed to unsubscribe from topic:", topic, error);
    }
  };

  const handleSubscribe = async (topic: string) => {
    if (!fcmToken) {
      toast.error("FCM Token not available", {
        description:
          "Could not get FCM token. Please ensure notifications are enabled.",
      });
      return;
    }

    if (subscription && subscription !== topic) {
      await handleUnsubscribe(subscription);
    }

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: fcmToken, topic }),
      });

      if (response.ok) {
        setSubscription(topic);
        toast.success("Subscribed!", {
          description: `You will now receive notifications for topic: ${topic}`,
        });
      } else {
        const error = await response.json();
        console.error("Subscription error", error);
        toast.error("Subscription failed", {
          description:
            "Could not subscribe to topic. Check console for details.",
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Subscription Error", {
        description: "An error occurred while subscribing. Check the console.",
      });
    }
  };

  const filteredNotifications = subscription
    ? notifications.filter((n) => {
        // Show notifications that match the current subscription
        // or show notifications with "unknown" topic when we have an active subscription
        // (this handles cases where FCM doesn't provide the topic in the payload)
        return (
          n.topic === subscription ||
          (n.topic === "unknown" && subscription) ||
          // Also show notifications that might have been sent to the current subscription
          // even if the topic field doesn't match exactly
          (subscription && n.topic !== "unknown" && n.topic.includes(subscription))
        );
      })
    : [];

  return (
    <Tabs defaultValue="subscribe" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="subscribe">
          <BellRing className="mr-2" />
          Subscribe & Receive
        </TabsTrigger>
        <TabsTrigger value="publish">
          <Send className="mr-2" />
          Publish Message
        </TabsTrigger>
      </TabsList>
      <TabsContent value="subscribe">
        <SubscribePanel
          onSubscribe={handleSubscribe}
          notifications={filteredNotifications}
          currentSubscription={subscription}
          notificationError={notificationError}
        />
      </TabsContent>
      <TabsContent value="publish">
        <PublishForm
          onPublish={handlePublish}
          currentSubscription={subscription}
        />
      </TabsContent>
    </Tabs>
  );
}
