"use client";

import { useEffect, useRef, useState, use } from "react";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, History, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

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
                    activity_type: "Watching Videos",
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
        <div className="space-y-8 pb-16 relative z-10 max-w-5xl mx-auto px-4 sm:px-0">
            {/* Background glowing decorations */}
            <div className="absolute top-[10%] left-[-20%] w-[60%] h-[40%] bg-[radial-gradient(circle,rgba(0,229,255,0.04)_0%,rgba(0,229,255,0)_70%)] blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute bottom-[20%] right-[-20%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(255,160,0,0.02)_0%,rgba(255,160,0,0)_70%)] blur-3xl pointer-events-none -z-10"></div>

            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-white/5 pb-4">
                <button 
                    onClick={handleBack}
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-white/70 hover:text-white font-labels text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:bg-white/10 active:scale-95"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Catalog
                </button>

                <div className={`flex items-center gap-2 text-xs font-labels font-extrabold tracking-widest uppercase px-4 py-2 rounded-full transition-all duration-300 border ${
                    isPlaying 
                        ? "bg-accentTeal/10 border-accentTeal/30 text-accentTeal shadow-[0_0_15px_rgba(0,229,255,0.25)]" 
                        : "bg-amber-500/10 border-amber-500/20 text-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.05)]"
                }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isPlaying ? "bg-accentTeal animate-ping" : "bg-amber-500"}`} />
                    <History className={`w-3.5 h-3.5 ${isPlaying ? "text-accentTeal" : "text-amber-500"}`} />
                    <span>{isPlaying ? "IMMERSION TRACKING" : "TRACKING PAUSED"} : {sessionMinutes} {sessionMinutes === 1 ? "MIN" : "MINS"}</span>
                </div>
            </div>

            {/* Cinematic Video Player */}
            <div className="relative group/player rounded-2xl p-1 bg-gradient-to-tr from-accentTeal/30 via-white/5 to-white/10 shadow-[0_0_50px_rgba(0,229,255,0.12)] border border-white/10 backdrop-blur-md overflow-hidden">
                {/* Neon Teal Backlight glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-accentTeal to-blue-600 rounded-2xl blur opacity-20 group-hover/player:opacity-35 transition duration-1000 group-hover/player:duration-200 pointer-events-none"></div>
                <div className="relative aspect-video w-full rounded-[14px] overflow-hidden bg-black/90">
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
            </div>

            {/* Title & Info Glass Card */}
            <div className="glass-card rounded-[24px] p-8 border border-white/10 shadow-2xl bg-brandSurface/20 relative overflow-hidden">
                <div className="absolute top-[-50%] right-[-10%] w-[30%] h-[200%] bg-[radial-gradient(circle,rgba(0,229,255,0.03)_0%,rgba(0,229,255,0)_70%)] blur-md pointer-events-none"></div>
                
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="px-2.5 py-1 rounded bg-accentTeal/10 border border-accentTeal/20 text-accentTeal font-labels text-[9px] font-extrabold tracking-widest uppercase">
                            YOUTUBE IMMERSION
                        </span>
                        {channelTitle && (
                            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/5 text-white/50 font-labels text-[9px] font-extrabold tracking-widest uppercase">
                                {channelTitle}
                            </span>
                        )}
                    </div>

                    <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                        {videoTitle || "Loading Video..."}
                    </h1>

                    <div className="h-px bg-white/10 w-full"></div>

                    <div className="flex items-start gap-3 text-white/65 text-sm font-sans leading-relaxed">
                        <div className="mt-0.5 rounded-full p-1.5 bg-primaryAccent/10 border border-primaryAccent/20 text-primaryAccent">
                            <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-white/80">Active Listening Auto-Tracker</p>
                            <p className="text-xs text-white/50">
                                Simply play the video above. Our system automatically logs your immersion time in real-time. Pausing the video or navigating away will instantly sync and save your progress to your learner history database.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
