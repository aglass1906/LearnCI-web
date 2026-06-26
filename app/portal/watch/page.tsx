"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
    Play, Youtube, Globe, Award, Sparkles, 
    Link as LinkIcon, Search, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface CuratedVideo {
    id: string;
    videoId: string;
    title: string;
    channel: string;
    level: "Beginner" | "Intermediate" | "Advanced";
    language: string;
}

export default function WatchCatalogPage() {
    const router = useRouter();
    const [videoUrl, setVideoUrl] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState("all");

    // Curated gallery of high-quality Comprehensible Input videos
    const curatedVideos: CuratedVideo[] = [
        {
            id: "1",
            videoId: "eap_R16jY10",
            title: "Learn Spanish naturally: How to speak Spanish fluently?",
            channel: "Español con Juan",
            level: "Intermediate",
            language: "Spanish",
        },
        {
            id: "2",
            videoId: "37k-0gR6P50",
            title: "Super Beginner Spanish Story - Comprehensible Input",
            channel: "Dreaming Spanish",
            level: "Beginner",
            language: "Spanish",
        },
        {
            id: "3",
            videoId: "hX1pB2Z_v0U",
            title: "Comprehensible French Listening Practice for Beginners",
            channel: "French Mornings with Elisa",
            level: "Beginner",
            language: "French",
        },
        {
            id: "4",
            videoId: "q_H7T91901Q",
            title: "Le vilain petit canard - French Story Practice",
            channel: "Alice Ayel",
            level: "Beginner",
            language: "French",
        },
        {
            id: "5",
            videoId: "4-e_S-v8m0k",
            title: "Comprehensible German Storytelling - A Day in Berlin",
            channel: "Natürlich German",
            level: "Intermediate",
            language: "German",
        },
        {
            id: "6",
            videoId: "vN4JcWvY_yU",
            title: "Comprehensible Japanese - Easy Daily Life Story",
            channel: "Comprehensible Japanese",
            level: "Beginner",
            language: "Japanese",
        }
    ];

    // Extraction helper for YouTube Video ID from any URL
    const extractYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleStartTracking = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedUrl = videoUrl.trim();
        if (!trimmedUrl) return;

        const videoId = extractYouTubeId(trimmedUrl);
        if (videoId) {
            toast({
                description: "YouTube ID parsed successfully. Loading cinematic focus player...",
            });
            router.push(`/portal/watch/${videoId}`);
        } else {
            toast({
                title: "Invalid Link",
                description: "Could not extract YouTube Video ID. Please check the URL and try again.",
                variant: "destructive",
            });
        }
    };

    // Filtered videos list
    const filteredVideos = selectedLanguage === "all" 
        ? curatedVideos 
        : curatedVideos.filter(v => v.language.toLowerCase() === selectedLanguage.toLowerCase());

    return (
        <div className="space-y-8 pb-16 relative z-10 max-w-5xl mx-auto">
            
            {/* Header Section */}
            <header className="relative overflow-hidden rounded-[28px] bg-brandSurface/20 border border-white/5 p-8 flex flex-col sm:flex-row items-center gap-6 shadow-2xl">
                <div className="absolute top-[-20%] left-[-10%] w-[30%] h-[150%] bg-[radial-gradient(circle,rgba(0,229,255,0.06)_0%,rgba(0,229,255,0)_70%)] blur-xl pointer-events-none"></div>
                
                <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-accentTeal to-blue-500 flex items-center justify-center border-2 border-white/10 text-brandDark shadow-lg shadow-accentTeal/10">
                        <Youtube className="h-10 w-10 text-brandDark" />
                    </div>
                </div>

                <div className="text-center sm:text-left space-y-1 flex-1">
                    <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight">
                        YouTube Immersion Center
                    </h1>
                    <p className="text-white/45 font-sans text-sm">
                        Convert passive listening into tracked comprehensible input. Paste any video link to start counting minutes.
                    </p>
                </div>
            </header>

            {/* Instant URL Tracker Console (Glass Card) */}
            <div className="glass-card rounded-[28px] p-8 border border-white/10 shadow-2xl bg-brandSurface/20 relative overflow-hidden">
                <div className="absolute top-[-50%] right-[-10%] w-[30%] h-[200%] bg-[radial-gradient(circle,rgba(255,160,0,0.04)_0%,rgba(255,160,0,0)_70%)] blur-md pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-md">
                        <h2 className="font-heading text-lg font-extrabold text-white flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primaryAccent" /> Track Any YouTube Video
                        </h2>
                        <p className="text-white/50 text-xs font-sans leading-relaxed">
                            Acquire language using your favorite YouTube creators. Paste any video URL (e.g. lectures, stories, interviews) to watch it in our cinematic focus player.
                        </p>
                    </div>

                    <form onSubmit={handleStartTracking} className="flex-1 w-full flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <LinkIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-white/30" />
                            <Input
                                type="text"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                className="h-11 pl-10 bg-brandSurface/60 border-white/10 rounded-xl text-sm focus:border-primaryAccent transition-all text-white placeholder-white/20"
                                placeholder="Paste YouTube link here... (e.g. https://www.youtube.com/watch?v=...)"
                                required
                            />
                        </div>
                        <Button 
                            type="submit"
                            className="bg-gradient-to-r from-primaryAccent to-amber-500 hover:from-primaryAccent hover:to-amber-600 hover:scale-[1.02] active:scale-95 transition-all text-brandDark shadow-lg shadow-primaryAccent/10 rounded-xl font-heading text-xs font-extrabold tracking-wider py-3.5 px-6 flex items-center justify-center gap-1.5"
                        >
                            <Play className="h-4 w-4 fill-brandDark text-brandDark" />
                            IMMERSE NOW
                        </Button>
                    </form>
                </div>
            </div>

            {/* Curated Catalog Section */}
            <div className="space-y-6">
                
                {/* Category Navigation Rails */}
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/5 pb-4">
                    <h3 className="font-heading text-lg font-extrabold text-white">Curated Immersion Catalog</h3>
                    
                    <div className="flex flex-wrap gap-2">
                        {["all", "spanish", "french", "german", "japanese"].map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setSelectedLanguage(lang)}
                                className={`px-4 py-1.5 rounded-full font-labels text-[9px] font-extrabold tracking-widest uppercase border transition-all ${
                                    selectedLanguage === lang 
                                        ? "bg-accentTeal/10 border-accentTeal text-accentTeal shadow-sm shadow-accentTeal/10" 
                                        : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                {lang === "all" ? "SHOW ALL" : lang}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Videos Grid */}
                {filteredVideos.length === 0 ? (
                    <div className="glass-card rounded-[28px] p-12 border border-white/5 text-center flex flex-col items-center justify-center space-y-4 shadow-2xl">
                        <AlertCircle className="h-10 w-10 text-white/30" />
                        <p className="text-white/45 font-sans text-sm">No curated videos found for this language filter.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredVideos.map((video) => (
                            <div 
                                key={video.id}
                                onClick={() => router.push(`/portal/watch/${video.videoId}`)}
                                className="glass-card rounded-2xl border border-white/5 overflow-hidden shadow-xl hover:border-white/15 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer bg-brandSurface/10 flex flex-col group"
                            >
                                {/* Thumbnail Box */}
                                <div className="relative aspect-video w-full overflow-hidden bg-black border-b border-white/5">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                                        alt={video.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="h-10 w-10 rounded-full bg-primaryAccent flex items-center justify-center shadow-lg text-brandDark scale-75 group-hover:scale-100 transition-transform">
                                            <Play className="h-5 w-5 fill-brandDark text-brandDark ml-0.5" />
                                        </div>
                                    </div>
                                    
                                    {/* Difficulty Badge */}
                                    <Badge className={`absolute top-3 right-3 border font-labels text-[8px] tracking-wider uppercase font-extrabold ${
                                        video.level === "Beginner" 
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                            : video.level === "Intermediate"
                                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                            : "bg-red-500/10 border-red-500/20 text-red-400"
                                    }`}>
                                        {video.level}
                                    </Badge>
                                </div>

                                {/* Detail Text Box */}
                                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                    <div className="space-y-1.5">
                                        <h4 className="font-heading text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-primaryAccent transition-colors">
                                            {video.title}
                                        </h4>
                                        <span className="block font-sans text-xs text-white/40">{video.channel}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center pt-2 border-t border-white/5 font-labels text-[8px] tracking-wider text-white/30 uppercase font-bold">
                                        <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> {video.language}</span>
                                        <span className="group-hover:text-primaryAccent transition-colors flex items-center gap-0.5">WATCH NOW <Play className="h-2.5 w-2.5 fill-current" /></span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
