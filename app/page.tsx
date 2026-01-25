import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import { CheckCircle2, ChevronRight, Smartphone, Zap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/portal");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-6 md:pt-12 lg:pt-20">
          <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary/10 via-transparent to-secondary/10 opacity-60"></div>

          <div className="container grid gap-8 pb-8 pt-6 md:pb-12 md:pt-10 lg:grid-cols-2 lg:py-16 items-center">
            <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
              <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Master Languages via Comprehensible Input
              </h1>
              <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                Immerse yourself in content you understand. The most effective, natural way to achieve fluency without the grind.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link href={user ? "/portal" : "/login"}>
                  <Button size="lg" className="rounded-full h-12 px-8 text-lg gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                    {user ? "Go to your Portal" : "Start Learning Free"} <ChevronRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-lg">
                  How it Works
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-slate-200" />
                  ))}
                </div>
                <p>Join 10,000+ learners today</p>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-purple-600 opacity-20 blur-3xl rounded-full"></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-image.png"
                alt="Language Learning Illustration"
                className="relative w-full h-auto drop-shadow-2xl animate-float"
              />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container space-y-12 bg-slate-50/50 py-12 dark:bg-slate-900/20 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl font-bold">
              Why LearnCI Works
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Built on the scientific principles of Stephen Krashen&apos;s Input Hypothesis.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <Card className="bg-background/60 backdrop-blur-sm border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Mobile First Design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Designed for learning on the go. Track your progress anywhere, anytime, right from your pocket.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-sm border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automatically log your input hours. Visualize your journey to fluency with beautiful charts.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-sm border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Proven Method</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Focus purely on understanding messages (CI) rather than memorizing boring grammar rules.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2026 LearnCI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
