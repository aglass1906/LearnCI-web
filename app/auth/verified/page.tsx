import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function VerifiedPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4">
            <Card className="w-full max-w-md text-center border-none shadow-lg">
                <CardHeader>
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
                        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
                    <CardDescription className="text-base mt-2">
                        Your account has been successfully verified.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pb-8">
                    <p className="text-muted-foreground">
                        You can now return to the app and sign in to start your journey.
                    </p>

                    <div className="space-y-3">
                        <Button className="w-full h-11 text-base font-medium" size="lg" asChild>
                            <a href="learnci://">Open App</a>
                        </Button>

                        <Button variant="outline" className="w-full h-11" asChild>
                            <Link href="/login">Go to Web Portal</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
