import { NextResponse } from "next/server";

import { admin } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  if (!admin.apps.length) {
    return NextResponse.json(
      { error: "Firebase Admin SDK not initialized." },
      { status: 500 }
    );
  }

  try {
    const { topic, title, message, priority, tags } = await request.json();

    if (!topic || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields: topic, title, message" },
        { status: 400 }
      );
    }

    const payload = {
      notification: {
        title,
        body: message,
      },
      data: {
        priority: priority || "3",
        tags: tags || "",
      },
      topic: topic,
    };

    const response = await admin.messaging().send(payload);

    return NextResponse.json(
      { message: "Notification sent successfully", response },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: error.message, details: error },
      { status: 500 }
    );
  }
}
