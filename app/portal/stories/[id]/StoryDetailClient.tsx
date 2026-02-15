"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Play, Pause, Volume2, Download } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Story {
    id: string;
    title: string;
    target_text: string;
    native_text: string | null;
    language: string;
    level: number;
    remote_cover_path: string | null;
    remote_audio_path: string | null;
    created_at: string;
}

type DisplayLanguage = "target" | "native";

export default function StoryDetailClient({ story }: { story: Story }) {
    const [selectedLanguage, setSelectedLanguage] = useState<DisplayLanguage>("target");
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const audioRef = useRef<HTMLAudioElement>(null);
    const supabase = createClient();

    // Get URLs from Supabase Storage
    const coverUrl = story.remote_cover_path
        ? supabase.storage.from("audio-stories").getPublicUrl(story.remote_cover_path).data.publicUrl
        : null;

    const audioUrl = story.remote_audio_path
        ? supabase.storage.from("audio-stories").getPublicUrl(story.remote_audio_path).data.publicUrl
        : null;

    // Language display name
    const languageNames: Record<string, string> = {
        spanish: "Spanish",
        french: "French",
        german: "German",
        italian: "Italian",
        portuguese: "Portuguese",
        mandarin: "Mandarin",
    };

    const languageName = languageNames[story.language] || story.language;

    // Audio event handlers
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleDurationChange = () => setDuration(audio.duration);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("durationchange", handleDurationChange);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("durationchange", handleDurationChange);
            audio.removeEventListener("ended", handleEnded);
        };
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    };

    const changePlaybackRate = (rate: number) => {
        setPlaybackRate(rate);
        if (audioRef.current) {
            audioRef.current.playbackRate = rate;
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8">
            {/* Back Button */}
            <Link href="/portal/stories" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Stories
            </Link>

            {/* Cover Art */}
            {coverUrl && (
                <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden shadow-lg">
                    <Image
                        src={coverUrl}
                        alt={story.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}

            {/* Title and Metadata */}
            <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">{story.title}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{languageName}</Badge>
                    <Badge variant="secondary">Level {story.level}</Badge>
                </div>
            </div>

            {/* Language Toggle */}
            {story.native_text && (
                <div className="flex items-center gap-2 mb-6">
                    <div className="inline-flex rounded-lg border p-1">
                        <button
                            onClick={() => setSelectedLanguage("target")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedLanguage === "target"
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                                }`}
                        >
                            {languageName}
                        </button>
                        <button
                            onClick={() => setSelectedLanguage("native")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedLanguage === "native"
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                                }`}
                        >
                            English
                        </button>
                    </div>
                </div>
            )}

            {/* Story Text */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="prose prose-lg max-w-none">
                        <p className="whitespace-pre-wrap leading-relaxed">
                            {selectedLanguage === "target" ? story.target_text : story.native_text}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Audio Player */}
            {audioUrl && (
                <Card>
                    <CardContent className="p-6">
                        <audio ref={audioRef} src={audioUrl} preload="metadata" />

                        {/* Audio Controls */}
                        <div className="flex items-center gap-4">
                            {/* Play/Pause Button */}
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={togglePlay}
                                className="h-10 w-10 flex-shrink-0 border-2"
                            >
                                {isPlaying ? (
                                    <Pause className="h-5 w-5" />
                                ) : (
                                    <Play className="h-5 w-5 ml-0.5" />
                                )}
                            </Button>

                            {/* Time Display */}
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {formatTime(currentTime)}
                            </span>

                            {/* Seek Bar */}
                            <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                value={currentTime}
                                onChange={handleSeek}
                                className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />

                            {/* Duration */}
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {formatTime(duration)}
                            </span>

                            {/* Playback Speed */}
                            <select
                                value={playbackRate}
                                onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                                className="border rounded px-2 py-1 text-sm bg-background"
                            >
                                <option value="0.5">0.5x</option>
                                <option value="0.75">0.75x</option>
                                <option value="1">1x</option>
                                <option value="1.25">1.25x</option>
                                <option value="1.5">1.5x</option>
                                <option value="2">2x</option>
                            </select>

                            {/* Download Button */}
                            <Button
                                size="icon"
                                variant="ghost"
                                asChild
                                className="flex-shrink-0"
                            >
                                <a href={audioUrl} download>
                                    <Download className="h-5 w-5" />
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
