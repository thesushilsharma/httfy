import { apiCall } from "@/lib/api-call";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import useFcmToken from "./use-fcm-token";
import { useState } from "react";

export const useSubscribe = () => {
  const { token: fcmToken } = useFcmToken();
  const [subscriptions, setSubscriptions] = useState<string[]>([]);

  const subscribeMutation = useMutation({
    mutationFn: (topic: string) => {
      if (!fcmToken) throw new Error("FCM Token not available.");
      return apiCall({
        url: "/api/subscribe",
        method: "POST",
        body: { token: fcmToken, topic },
      });
    },
    onSuccess: (_, topic) => {
      setSubscriptions((prev) => [...prev, topic]);
      toast.success("Subscribed!", {
        description: `You will now receive notifications for topic: ${topic}`,
      });
    },
    onError: (error, topic) => {
      toast.error("Subscription failed", {
        description: `Could not subscribe to topic: ${topic}. ${error.message}`,
      });
    },
  });

  return { subscribeMutation, subscriptions, setSubscriptions };
};