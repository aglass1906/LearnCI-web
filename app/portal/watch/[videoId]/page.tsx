"use client";

import { useEffect, useRef, useState, use } from "react";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, History } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface PageProps {
    params: Promise<{ videoId: string }>;
}

export default function WatchPage({ params }: PageProps) {
    const { videoId } = use(params);
    const [player, setPlayer] = useState<YouTubePlayer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sessionMinutes, setSessionMinutes] = useState(0);
    const [videoTitle, setVideoTitle] = useState("");
    const [channelTitle, setChannelTitle] = useState("");
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const accumulatedSecondsRef = useRef(0);
    const lastSaveRef = useRef(0); // Minutes saved so far
    const savePromiseRef = useRef<Promise<boolean> | null>(null); // Track in-flight save
    const [supabase] = useState(() => createClient());
    const router = useRouter();

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            // Attempt to save remaining time on unmount (best effort)
            // Note: Async calls on unmount are unreliable.
            // We rely on handleBack and handleStateChange for reliable saving.
            if (accumulatedSecondsRef.current > 0) {
                saveProgress(accumulatedSecondsRef.current, videoTitleRef.current, channelTitleRef.current, true);
            }
        };
    }, []);

    // Ref to keep latest info for cleanup effect
    const videoTitleRef = useRef("");
    const channelTitleRef = useRef("");
    useEffect(() => {
        videoTitleRef.current = videoTitle;
        channelTitleRef.current = channelTitle;
    }, [videoTitle, channelTitle]);

    const handleStateChange = (event: YouTubeEvent) => {
        const playerState = event.data;
        // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
        if (playerState === 1) {
            setIsPlaying(true);
            startTimer();
        } else {
            setIsPlaying(false);
            stopTimer();
            // Auto-save on pause/end
            saveProgress(accumulatedSecondsRef.current, videoTitle, channelTitle, false);
        }
    };

    const handleReady = (event: YouTubeEvent) => {
        setPlayer(event.target);
        const data = event.target.getVideoData();
        setVideoTitle(data.title);
        setChannelTitle(data.author);
    };

    const startTimer = () => {
        if (timerRef.current) return;
        timerRef.current = setInterval(() => {
            accumulatedSecondsRef.current += 1;
            // Update UI every minute roughly (or just keep seconds internally)
            if (accumulatedSecondsRef.current % 60 === 0) {
                setSessionMinutes(Math.floor(accumulatedSecondsRef.current / 60));
            }
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleBack = async () => {
        stopTimer();

        // Wait for any pending save (e.g. triggered by video ending)
        if (savePromiseRef.current) {
            await savePromiseRef.current;
        }

        // Try one final save just in case
        const didSave = await saveProgress(accumulatedSecondsRef.current, videoTitle, channelTitle, false);
        router.refresh();

        if (didSave) {
            // Wait a bit so user sees the "Saved" toast
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        router.back();
    };

    const saveProgress = async (totalSeconds: number, title: string, channel: string, isUnmount: boolean): Promise<boolean> => {
        // Round to nearest minute. If > 20 seconds, count as 1 minute to be generous.
        // If it's 0 minutes (e.g. 5 seconds), don't save.
        let minutesToLog = Math.round(totalSeconds / 60);
        if (totalSeconds > 20 && minutesToLog === 0) minutesToLog = 1;

        const minutesToSave = minutesToLog - lastSaveRef.current;

        if (minutesToSave <= 0) return false;

        // Reset tracking for next batch
        lastSaveRef.current = minutesToLog;

        const activityComment = channel ? `Watched: ${channel} - ${title}` : `Watched: ${title || "Unknown Video"}`;
        console.log(`Saving ${minutesToSave} minutes for "${title}"`);

        // Create the save promise
        const promise = (async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) return false;

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
                    activity_type: "YouTube",
                    minutes: minutesToSave,
                    comment: activityComment,
                    date: new Date().toISOString(),
                    language: currentLang
                } as any);

                if (error) throw error;

                if (!isUnmount) {
                    toast({
                        title: "Activity Updated ✅",
                        description: `Logged +${minutesToSave} mins for "${title}".`,
                        duration: 3000,
                    });
                }
                return true;
            } catch (err) {
                console.error("Failed to save progress:", err);
                return false; // Failed save
            }
        })();

        savePromiseRef.current = promise;

        // Attach cleanup to the promise
        // We don't return the result of finally chain to keep the type matching and avoid confusion
        promise.finally(() => {
            if (savePromiseRef.current === promise) {
                savePromiseRef.current = null;
            }
        });

        return promise;
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-5xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <Button variant="ghost" className="pl-0 gap-2" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full transition-all ${isPlaying ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20" : "text-muted-foreground bg-muted"
                    }`}>
                    <History className={`w-3 h-3 ${isPlaying ? "animate-pulse" : ""}`} />
                    <span>{isPlaying ? "Tracking" : "Paused"}: {sessionMinutes} min</span>
                </div>
            </div>

            {/* Video Player */}
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl bg-black border border-slate-800">
                <YouTube
                    videoId={videoId}
                    className="w-full h-full"
                    iframeClassName="w-full h-full"
                    onStateChange={handleStateChange}
                    onReady={handleReady}
                    opts={{
                        playerVars: {
                            autoplay: 1,
                            modestbranding: 1,
                            rel: 0,
                        },
                    }}
                />
            </div>

            {/* Title & Info */}
            <div className="mt-6">
                <h1 className="text-2xl font-bold tracking-tight mb-2">
                    {videoTitle || "Loading Video..."}
                </h1>
                <p className="text-muted-foreground">
                    Watch this video here to automatically track your listening time.
                    Time is saved when you pause or leave the page.
                </p>
            </div>
        </div>
    );
}
