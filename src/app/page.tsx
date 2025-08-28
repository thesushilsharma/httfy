import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, File, Package, Zap } from "lucide-react";
import HttfyClient from "@/components/httfy-client";

export default function Home() {
  const features = [
    {
      icon: <CheckCircle2 className="h-8 w-8 text-primary" />,
      title: "Priorities & Actions",
      description: "Set priorities to map to different sounds and use action buttons to react to notifications directly.",
    },
    {
      icon: <Package className="h-8 w-8 text-primary" />,
      title: "Tags & Emojis",
      description: "Use tags and emojis to classify, personalize, and quickly identify your notifications at a glance.",
    },
    {
      icon: <File className="h-8 w-8 text-primary" />,
      title: "File Attachments",
      description: "Instantly send files like images, videos, and documents from your scripts to your devices.",
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Easy Integration",
      description: "With a simple HTTP request, you can integrate httfy with pretty much everything under the sun.",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 text-center md:py-24">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Instant Notifications, Your Way.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
            A simple HTTP-based pub-sub service. Send push notifications from your scripts, apps, and services to any device.
          </p>
        </section>

        <section className="container mx-auto max-w-5xl px-4">
          <HttfyClient />
        </section>

        <section className="container mx-auto px-4 py-16 md:py-24">
          <h2 className="font-headline mb-12 text-center text-3xl font-bold md:text-4xl">Everything you need to get notified</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
