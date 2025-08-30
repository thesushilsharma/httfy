"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BellRing, Loader2, Rss, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

const formSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
});

type SubscribePanelProps = {
  subscriptions: string[];
  onSubscribe: (topic: string) => void;
  onUnsubscribe: (topic: string) => void;
  notifications: NotificationPayload[];
  notificationError?: string | null;
  isSubscribing: boolean;
};

export function SubscribePanel({
  subscriptions,
  onSubscribe,
  onUnsubscribe,
  notifications,
  isSubscribing,
  notificationError,
}: SubscribePanelProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (subscriptions.includes(values.topic)) {
      form.setError("topic", { message: "Already subscribed to this topic." });
      return;
    }
    onSubscribe(values.topic);
    form.reset();
  }

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "5":
      case "4":
        return "border-red-500";
      case "1":
      case "2":
        return "border-blue-300";
      default:
        return "border-border";
    }
  };

  const hasSubscriptions = subscriptions.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Subscribe to Topics</CardTitle>
        <CardDescription>
          Receive instant notifications from any topic. If a topic doesn't
          exist, it will be created.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mb-6 flex items-start gap-4"
          >
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <div className="relative">
                      <Rss className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Enter a topic to subscribe..."
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="absolute" />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubscribing}>
              {isSubscribing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BellRing className="mr-2 h-4 w-4" />
              )}
              Subscribe
            </Button>
          </form>
        </Form>

        {hasSubscriptions && (
          <div className="mb-8">
            <h3 className="mb-3 font-headline text-lg font-medium">
              Current Subscriptions
            </h3>
            <div className="flex flex-wrap gap-2">
              {subscriptions.map((topic) => (
                <Badge key={topic} variant="secondary" className="pl-3 pr-1 text-sm">
                  {topic}
                  <button
                    onClick={() => onUnsubscribe(topic)}
                    className="ml-2 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                    aria-label={`Unsubscribe from ${topic}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {notificationError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h4 className="font-medium text-red-800">Notification Error</h4>
              <p className="text-sm text-red-600">{notificationError}</p>
            </div>
          )}
          <h3 className="font-headline text-lg font-medium">
            {hasSubscriptions ? `Listening for messages...` : "Awaiting subscription..."}
          </h3>
          {notifications.length > 0 ? (
            <div className="max-h-[400px] space-y-4 overflow-y-auto rounded-lg bg-muted/50 p-4">
              {notifications.map((n) => (
                <Card
                  key={n.id}
                  className={`border-l-4 ${getPriorityClass(n.priority)}`}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{n.topic}</Badge>
                      <CardTitle className="text-base">{n.title}</CardTitle>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(n.timestamp), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                   <CardDescription className="pt-2">
                      {n.message}
                    </CardDescription>
                  </CardHeader>
                  {n.tags && (
                    <CardContent className="p-4 pt-0">
                      <div className="flex flex-wrap gap-2">
                        {n.tags.split(/[ ,]+/).map((tag, i) => (
                          <Badge key={i} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed">
              <Rss className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                {hasSubscriptions
                  ? "Waiting for messages on subscribed topics..."
                  : "Subscribe to a topic to see messages here."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
