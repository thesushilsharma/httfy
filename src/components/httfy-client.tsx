"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscribePanel } from "./subscribe-panel";
import { PublishForm } from "./publish-form";
import { BellRing, Send } from "lucide-react";
import { onMessage } from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import { toast } from "sonner";
import { useSubscribe } from "@/hooks/use-subscribe";
import { useUnsubscribe } from "@/hooks/use-unsubscribe";
import { usePublish } from "@/hooks/use-publish";

export default function HttfyClient() {
  const [notifications, setNotifications] = React.useState<
    NotificationPayload[]
  >([]);
  
  const { subscribeMutation, subscriptions, setSubscriptions } = useSubscribe();
  const { unsubscribeMutation } = useUnsubscribe(setSubscriptions);
  const { publishMutation } = usePublish();

  const addNotification = React.useCallback((payload: any) => {
    const { notification, data, from, collapseKey } = payload;
    if (notification) {
      // Try to extract topic from various sources
      let extractedTopic = "unknown";
      
      // Try to get topic from data field first
      if (data?.topic) {
        extractedTopic = data.topic;
      } else if (collapseKey) {
        // collapseKey often contains the topic
        extractedTopic = collapseKey;
      } else if (from) {
        // Remove '/topics/' prefix if present
        extractedTopic = from.replace('/topics/', '');
      }
      
      console.log("Extracted topic:", extractedTopic);
      
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

     setNotifications((prev) =>
        [newNotification, ...prev].filter(
          (n, i, self) => i === self.findIndex((t) => t.id === n.id)
        )
      );

      // Also show a toast for foreground messages
      toast.info(notification.title, {
        description: notification.body,
      });
    }
  }, []);

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
      console.log("Current subscriptions:", subscriptions);
      addNotification(event.data);
    };
    channel.addEventListener("message", listener);

    return () => {
      channel.removeEventListener("message", listener);
      channel.close();
    };
  }, [addNotification, subscriptions]);

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

  const filteredNotifications = subscriptions.length > 0
  ? notifications.filter((n) => {
      // Show notifications that match any of the current subscriptions
      // or show notifications with "unknown" topic when we have active subscriptions
      return (
        subscriptions.includes(n.topic) ||
        (n.topic === "unknown" && subscriptions.length > 0) ||
        // Also show notifications that might have been sent to any of our subscriptions
        // even if the topic field doesn't match exactly
        subscriptions.some(sub => n.topic.includes(sub))
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
          subscriptions={subscriptions}
          onSubscribe={(topic) => subscribeMutation.mutate(topic)}
          onUnsubscribe={(topic) => unsubscribeMutation.mutate(topic)}
          notifications={filteredNotifications}
          isSubscribing={subscribeMutation.isPending}
        />
      </TabsContent>
      <TabsContent value="publish">
        <PublishForm 
          onPublish={(data) => publishMutation.mutate(data)}
          isPublishing={publishMutation.isPending}
        />
      </TabsContent>
    </Tabs>
  );
}
