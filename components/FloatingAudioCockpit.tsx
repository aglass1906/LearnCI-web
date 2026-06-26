"use client";

import { useAudio } from "@/context/audio-context";
import { usePathname } from "next/navigation";
import { Play, Pause, X, RotateCcw, RotateCw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";

export function FloatingAudioCockpit() {
    const {
        track,
        isPlaying,
        currentTime,
        duration,
        playbackRate,
        play,
        pause,
        seek,
        setPlaybackRate,
        unloadTrack,
    } = useAudio();

    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !track) return null;

    // Do not render if the user is on the dedicated story detail player page or the podcast portal
    const isStoryPlayerPage = pathname?.includes("/portal/stories/") && pathname?.split("/").length > 3;
    const isPodcastPage = pathname === "/portal/podcasts";
    if (isStoryPlayerPage || isPodcastPage) return null;

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        seek(parseFloat(e.target.value));
    };

    const skipBackward = () => {
        seek(Math.max(0, currentTime - 10));
    };

    const skipForward = () => {
        seek(Math.min(duration, currentTime + 10));
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-2xl animate-in slide-in-from-bottom-8 duration-500">
            {/* Ambient shadow glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primaryAccent/10 to-accentTeal/10 rounded-2xl blur-xl opacity-80 pointer-events-none"></div>

            {/* Glassmorphic player body */}
            <div className="relative glass-card border border-white/10 rounded-2xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-md bg-brandDark/85 flex flex-col gap-2">
                
                {/* Main player controls row */}
                <div className="flex items-center justify-between gap-4">
                    {/* Left: Thumbnail & Metadata */}
                    <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial">
                        {track.coverUrl ? (
                            <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-lg overflow-hidden border border-white/10 shrink-0 shadow-md">
                                <Image
                                    src={track.coverUrl}
                                    alt={track.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-br from-primaryAccent/35 to-accentTeal/20 flex items-center justify-center shrink-0 border border-white/15 shadow-md">
                                <span className="text-xl">🎧</span>
                            </div>
                        )}
                        <div className="min-w-0 space-y-0.5">
                            <h4 className="font-heading font-extrabold text-white text-xs sm:text-sm truncate pr-1" title={track.title}>
                                {track.title}
                            </h4>
                            <p className="font-labels text-[9px] sm:text-[10px] text-white/50 tracking-wide uppercase font-bold truncate">
                                {track.subtitle || "Immersion Audio"}
                            </p>
                        </div>
                    </div>

                    {/* Center: Controls Cockpit */}
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        {/* Skip Back 10s */}
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={skipBackward}
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-white/5 text-white/60 hover:text-white"
                            title="Rewind 10s"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>

                        {/* Play / Pause Toggle */}
                        <Button
                            size="icon"
                            onClick={isPlaying ? pause : play}
                            className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-primaryAccent text-brandDark shadow-md shadow-primaryAccent/10 hover:shadow-primaryAccent/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            {isPlaying ? (
                                <Pause className="h-4.5 w-4.5 text-brandDark fill-brandDark" />
                            ) : (
                                <Play className="h-4.5 w-4.5 ml-0.5 text-brandDark fill-brandDark" />
                            )}
                        </Button>

                        {/* Skip Forward 10s */}
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={skipForward}
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-white/5 text-white/60 hover:text-white"
                            title="Fast Forward 10s"
                        >
                            <RotateCw className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Right: Controls & Actions */}
                    <div className="hidden sm:flex items-center gap-3 shrink-0">
                        {/* Speed selector */}
                        <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-lg px-2 py-1">
                            <Volume2 className="h-3.5 w-3.5 text-white/40" />
                            <select
                                value={playbackRate}
                                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                                className="bg-transparent border-none text-[10px] font-labels font-extrabold text-primaryAccent focus:outline-none focus:ring-0 pr-6 py-0.5 cursor-pointer"
                            >
                                <option value="0.5">0.5x</option>
                                <option value="0.75">0.75x</option>
                                <option value="1">1.0x</option>
                                <option value="1.25">1.25x</option>
                                <option value="1.5">1.5x</option>
                                <option value="2">2.0x</option>
                            </select>
                        </div>

                        <div className="h-6 w-[1px] bg-white/10"></div>

                        {/* Dismiss audio player */}
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={unloadTrack}
                            className="h-8 w-8 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 border border-transparent hover:border-red-500/20"
                            title="Close Player"
                        >
                            <X className="h-4.5 w-4.5" />
                        </Button>
                    </div>

                    {/* Mobile Only Dismiss Button */}
                    <div className="flex sm:hidden shrink-0">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={unloadTrack}
                            className="h-8 w-8 rounded-lg text-white/40 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Bottom Timeline Progress Bar */}
                <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="font-labels text-[9px] text-white/40 w-8 text-right font-semibold">
                        {formatTime(currentTime)}
                    </span>

                    <div className="flex-1 relative group py-2 flex items-center">
                        {/* Continuous Slider */}
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeekChange}
                            className="absolute inset-x-0 w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primaryAccent focus:outline-none z-25"
                            style={{
                                background: `linear-gradient(to right, var(--color-primaryAccent, #3861FB) ${progressPercent}%, rgba(255, 255, 255, 0.05) ${progressPercent}%)`
                            }}
                        />
                    </div>

                    <span className="font-labels text-[9px] text-white/40 w-8 font-semibold">
                        {formatTime(duration)}
                    </span>
                </div>
            </div>
        </div>
    );
}
