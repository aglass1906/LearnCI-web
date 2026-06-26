"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { BookOpen, Sparkles, SlidersHorizontal, ArrowRight } from "lucide-react";

interface Story {
    id: string;
    title: string;
    target_text: string;
    native_text: string | null;
    language: string;
    level: number;
    remote_cover_path: string | null;
    created_at: string;
}

export default function StoriesClient({ initialStories }: { initialStories: Story[] }) {
    const [stories] = useState(initialStories);
    const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
    const [selectedLevel, setSelectedLevel] = useState<string>("all");
    const supabase = createClient();

    // Get unique languages from stories
    const languages = Array.from(new Set(stories.map(s => s.language.toLowerCase())));

    // Filter stories
    const filteredStories = stories.filter(story => {
        const languageMatch = selectedLanguage === "all" || story.language.toLowerCase() === selectedLanguage;
        const levelMatch = selectedLevel === "all" || story.level.toString() === selectedLevel;
        return languageMatch && levelMatch;
    });

    // Get cover image URL
    const getCoverUrl = (path: string | null) => {
        if (!path) return null;
        const { data } = supabase.storage
            .from("audio-stories")
            .getPublicUrl(path);
        return data.publicUrl;
    };

    // Language display names
    const languageNames: Record<string, string> = {
        spanish: "Spanish",
        french: "French",
        german: "German",
        italian: "Italian",
        portuguese: "Portuguese",
        mandarin: "Mandarin",
        japanese: "Japanese",
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12 relative z-10">
            {/* Header / Intro section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                        AI Stories Library
                    </h1>
                    <p className="text-white/45 font-sans text-sm mt-1">
                        Select a dramatized story to acquire vocabulary organically in your target language.
                    </p>
                </div>
                
                {/* Global Total count badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5 font-labels text-[9px] font-extrabold tracking-wider text-primaryAccent uppercase">
                    <Sparkles className="h-3.5 w-3.5" /> {stories.length} stories cataloged
                </div>
            </header>

            {/* Premium Filter Toolbar */}
            <div className="glass-card rounded-[20px] p-4 flex flex-col md:flex-row gap-4 items-center justify-between border border-white/5">
                <div className="flex items-center gap-2 text-white/50 font-labels text-[10px] font-bold uppercase tracking-wider">
                    <SlidersHorizontal className="h-4.5 w-4.5 text-primaryAccent" />
                    <span>Immersion Parameters</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {/* Language select wrapper */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="font-labels text-[9px] text-white/40 uppercase font-bold whitespace-nowrap">Target Language:</span>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primaryAccent focus:ring-0 cursor-pointer w-full sm:w-40"
                        >
                            <option value="all" className="bg-brandDark text-white font-sans">All Languages</option>
                            {languages.map(lang => (
                                <option key={lang} value={lang} className="bg-brandDark text-white font-sans">
                                    {languageNames[lang] || lang.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Level select wrapper */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="font-labels text-[9px] text-white/40 uppercase font-bold whitespace-nowrap">Comprehension Level:</span>
                        <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-primaryAccent focus:ring-0 cursor-pointer w-full sm:w-32"
                        >
                            <option value="all" className="bg-brandDark text-white font-sans">All Levels</option>
                            {[0, 1, 2, 3, 4, 5, 6].map(level => (
                                <option key={level} value={level.toString()} className="bg-brandDark text-white font-sans">
                                    Level {level}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Stories Grid */}
            {filteredStories.length === 0 ? (
                <div className="glass-card rounded-[24px] p-12 text-center border border-white/5 flex flex-col items-center justify-center space-y-3">
                    <BookOpen className="h-10 w-10 text-white/20" />
                    <p className="text-white/40 font-sans text-sm">
                        No stories found matching the selected filters. Change your language or difficulty settings.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStories.map((story) => {
                        const coverUrl = getCoverUrl(story.remote_cover_path);

                        return (
                            <Link key={story.id} href={`/portal/stories/${story.id}`}>
                                <div className="glass-card rounded-[24px] overflow-hidden hover:border-white/15 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col justify-between group">
                                    {/* Cover Image */}
                                    <div className="relative w-full h-48 bg-gradient-to-br from-brandSurface to-brandDark border-b border-white/5 overflow-hidden">
                                        {coverUrl ? (
                                            <Image
                                                src={coverUrl}
                                                alt={story.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-white/10 group-hover:scale-110 transition-transform duration-500">
                                                <BookOpen className="h-12 w-12" />
                                            </div>
                                        )}
                                        {/* Level Badge Overlay */}
                                        <div className="absolute top-4 right-4 z-10">
                                            <Badge className="bg-primaryAccent text-brandDark font-labels text-[8px] font-extrabold tracking-widest uppercase border-none px-2 py-0.5 shadow">
                                                Level {story.level}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Content Card Body */}
                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-labels text-[9px] text-accentTeal tracking-wider font-extrabold uppercase">
                                                    {languageNames[story.language.toLowerCase()] || story.language}
                                                </span>
                                                <span className="font-labels text-[8px] text-white/30 font-bold uppercase">
                                                    {new Date(story.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <h3 className="font-heading text-lg font-bold text-white group-hover:text-primaryAccent transition-colors line-clamp-1">
                                                {story.title}
                                            </h3>
                                            <p className="text-white/50 text-xs font-sans leading-relaxed line-clamp-3">
                                                {story.target_text}
                                            </p>
                                        </div>

                                        <div className="pt-2 flex items-center justify-between border-t border-white/5">
                                            <span className="font-labels text-[8px] text-white/35 tracking-widest uppercase font-bold group-hover:text-white transition-colors">
                                                Initialize Reading
                                            </span>
                                            <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-primaryAccent group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
