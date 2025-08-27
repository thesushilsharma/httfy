import { NextResponse } from "next/server";

import { admin } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  console.log("POST /api/subscribe")
  
  if (!admin.apps.length) {
    return NextResponse.json(
      { error: "Firebase Admin SDK not initialized." },
      { status: 500 }
    );
  }
  
  try {
    const { token, topic } = await request.json();

    if (!token || !topic) {
      return NextResponse.json(
        { error: "Missing required fields: token, topic" },
        { status: 400 }
      );
    }

    await admin.messaging().subscribeToTopic(token, topic);

    return NextResponse.json(
      { message: `Subscribed to topic: ${topic}` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error subscribing to topic:", error);
    return NextResponse.json(
      { error: error.message, details: error },
      { status: 500 }
    );
  }
}
