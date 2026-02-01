"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, ExternalLink, Timer, Play, Pause, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function WebTrackerContent() {
    const searchParams = useSearchParams();
    const initialUrl = searchParams.get("url") || "";
    const initialTitle = searchParams.get("title") || "Web Resource";

    // Decode if needed, though get() usually handles it
    const url = initialUrl;
    const title = initialTitle;

    const [isPlaying, setIsPlaying] = useState(true); // Auto-start
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [hasOpened, setHasOpened] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [supabase] = useState(() => createClient());
    const router = useRouter();

    // Start timer on mount
    useEffect(() => {
        startTimer();

        // Auto-open? Maybe blocky. detailed UX: Let user click to open.
        // But invalidates "lazy" tracking.
        // Better: User clicked "Read" to get here, so we expect them to read.
        // We can try window.open, but popup blockers might catch it.
        // Let's rely on a manual "Open and Start" or just "Open" if timer running.

        return () => stopTimer();
    }, []);

    const startTimer = () => {
        if (timerRef.current) return;
        timerRef.current = setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);
        setIsPlaying(true);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsPlaying(false);
    };

    const toggleTimer = () => {
        if (isPlaying) stopTimer();
        else startTimer();
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}m ${s}s`;
    };

    const handleOpenUrl = () => {
        if (!url) return;
        window.open(url, "_blank");
        setHasOpened(true);
        if (!isPlaying) startTimer();
    };

    const handleSaveAndExit = async () => {
        stopTimer();

        // Round to nearest minute. If > 15 seconds, count as 1 minute to be generous.
        let minutesToSave = Math.round(elapsedSeconds / 60);
        if (elapsedSeconds > 15 && minutesToSave === 0) minutesToSave = 1;

        if (minutesToSave < 1) {
            toast({
                title: "Session too short",
                description: "Activities under 1 minute are not saved.",
            });
            // Just exit if insignificant time
            router.back();
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                router.back();
                return;
            }

            // Get profile for language
            const { data: profile } = await supabase
                .from("profiles")
                .select("current_language")
                .eq("id", session.user.id)
                .single();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const currentLang = (profile as any)?.current_language || "Spanish";

            const { error } = await supabase.from("user_activities").insert({
                user_id: session.user.id,
                activity_type: "Reading", // Default to reading for generic web
                minutes: minutesToSave,
                comment: `Read: ${title}`,
                date: new Date().toISOString(),
                language: currentLang
            } as any);

            if (error) throw error;

            toast({
                title: "Activity Saved 📚",
                description: `Logged +${minutesToSave} mins reading time.`,
            });
        } catch (err) {
            console.error("Failed to save activity:", err);
            toast({
                title: "Error",
                description: "Failed to save activity logged.",
                variant: "destructive"
            });
        }

        router.back();
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <Button variant="ghost" className="mb-6 pl-0 gap-2" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4" /> Back
            </Button>

            <Card className="border-2 shadow-lg">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl">{title}</CardTitle>
                    <CardDescription>Reading Session Tracker</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 flex flex-col items-center">

                    {/* Timer Display */}
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 rounded-full w-48 h-48 border-4 border-primary/20 shadow-inner">
                        <Timer className="w-8 h-8 text-primary mb-2 opacity-80" />
                        <span className="text-4xl font-mono font-bold tracking-wider">
                            {formatTime(elapsedSeconds)}
                        </span>
                        <span className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-medium">
                            {isPlaying ? "Tracking..." : "Paused"}
                        </span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4 w-full justify-center">
                        <Button
                            size="lg"
                            variant={isPlaying ? "outline" : "default"}
                            className="w-32 rounded-full"
                            onClick={toggleTimer}
                        >
                            {isPlaying ? (
                                <>
                                    <Pause className="w-4 h-4 mr-2" /> Pause
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-2" /> Resume
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="w-full h-px bg-border my-4" />

                    {/* Actions */}
                    <div className="w-full space-y-3">
                        <Button
                            variant="secondary"
                            className="w-full h-12 text-lg gap-2"
                            onClick={handleOpenUrl}
                        >
                            <ExternalLink className="w-5 h-5" />
                            {hasOpened ? "Open Page Again" : "Open Page to Read"}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground px-4">
                            Click to open the webpage in a new tab. Keep this tab open to track your time.
                        </p>
                    </div>

                    <Button
                        size="lg"
                        className="w-full h-14 text-lg font-bold shadow-md bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleSaveAndExit}
                    >
                        <Save className="w-5 h-5 mr-2" />
                        Finish & Save Session
                    </Button>

                </CardContent>
            </Card>
        </div>
    );
}

export default function WebTrackerPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center">Loading tracker...</div>}>
            <WebTrackerContent />
        </Suspense>
    );
}
