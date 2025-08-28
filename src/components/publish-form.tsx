
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowUpCircle, File, Rss, Send, Tags } from "lucide-react";

const formSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  priority: z.enum(["1", "2", "3", "4", "5"]),
  tags: z.string().optional(),
});

type PublishFormProps = {
  onPublish: (data: Omit<NotificationPayload, "id" | "timestamp">) => void;
  currentSubscription: string | null;
};

export function PublishForm({ onPublish, currentSubscription }: PublishFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: currentSubscription || "",
      title: "",
      message: "",
      priority: "3",
      tags: "",
    },
  });

  React.useEffect(() => {
    if (currentSubscription) {
      form.setValue("topic", currentSubscription);
    }
  }, [currentSubscription, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onPublish(values);
    form.reset({
      ...values,
      title: "",
      message: "",
      tags: ""
    });
  }
  
  const priorityMap = {
    "1": { label: "Min", icon: <ArrowUpCircle className="h-4 w-4 rotate-180" /> },
    "2": { label: "Low", icon: <ArrowUpCircle className="h-4 w-4 rotate-180" /> },
    "3": { label: "Default", icon: <ArrowUpCircle className="h-4 w-4" /> },
    "4": { label: "High", icon: <ArrowUpCircle className="h-4 w-4" /> },
    "5": { label: "Max", icon: <ArrowUpCircle className="h-4 w-4" /> },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Publish a Notification</CardTitle>
        <CardDescription>
        Send a message to any topic. If the topic doesn't exist, it will be created on the fly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                   <FormControl>
                    <div className="relative">
                      <Rss className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Enter a topic to publish to..." className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Backup complete" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the notification..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(priorityMap).map(([value, {label}]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags & Emojis</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Tags className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="e.g., tada, success, heavy_check_mark" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormItem>
                <FormLabel>Attachment</FormLabel>
                <FormControl>
                  <div className="relative">
                     <File className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="file" className="pl-10" disabled/>
                  </div>
                </FormControl>
                <p className="text-xs text-muted-foreground">File attachments are coming soon!</p>
              </FormItem>

            <Button type="submit" className="w-full md:w-auto">
              <Send className="mr-2 h-4 w-4" /> Send Notification
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
