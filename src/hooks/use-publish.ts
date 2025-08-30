import { apiCall } from "@/lib/api-call";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";  

export const usePublish = () => {
  const publishMutation = useMutation({
    mutationFn: (data: Omit<NotificationPayload, "id" | "timestamp">) =>
      apiCall({ url: "/api/send-notification", method: "POST", body: data }),
    onSuccess: (_, data) => {
      toast.success("Notification Sent!", {
        description: `Message published to topic: ${data.topic}`,
      });
    },
    onError: (error, data) => {
      toast.error("Failed to Send", {
        description: `Could not publish to topic: ${data.topic}. ${error.message}`,
      });
    },
  });

  return { publishMutation };
};