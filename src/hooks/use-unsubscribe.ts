import { apiCall } from "@/lib/api-call";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import useFcmToken from "./use-fcm-token";

export const useUnsubscribe = (setSubscriptions: React.Dispatch<React.SetStateAction<string[]>>) => {
  const { token: fcmToken } = useFcmToken();

  const unsubscribeMutation = useMutation({
    mutationFn: (topic: string) => {
      if (!fcmToken) throw new Error("FCM Token not available.");
      return apiCall({
        url: "/api/unsubscribe",
        method: "POST",
        body: { token: fcmToken, topic },
      });
    },
    onSuccess: (_, topic) => {
      setSubscriptions((prev) => prev.filter((t) => t !== topic));
      toast.success("Unsubscribed!", {
        description: `You will no longer receive notifications for: ${topic}`,
      });
    },
    onError: (error, topic) => {
      toast.error("Unsubscribe failed", {
        description: `Could not unsubscribe from topic: ${topic}. ${error.message}`,
      });
    },
  });

  return { unsubscribeMutation };
};