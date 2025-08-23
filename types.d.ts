type NotificationPayload = {
  id: string;
  topic: string;
  title: string;
  message: string;
  priority: string;
  tags?: string;
  timestamp: Date;
};
