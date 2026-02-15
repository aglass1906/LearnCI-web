"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

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
    const languages = Array.from(new Set(stories.map(s => s.language)));

    // Filter stories
    const filteredStories = stories.filter(story => {
        const languageMatch = selectedLanguage === "all" || story.language === selectedLanguage;
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
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">AI Stories</h1>
                <p className="text-muted-foreground">
                    Listen to AI-generated stories with audio and translations
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Language:</label>
                    <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="border rounded-md px-3 py-1.5 text-sm"
                    >
                        <option value="all">All Languages</option>
                        {languages.map(lang => (
                            <option key={lang} value={lang}>
                                {languageNames[lang] || lang}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Level:</label>
                    <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="border rounded-md px-3 py-1.5 text-sm"
                    >
                        <option value="all">All Levels</option>
                        {[1, 2, 3, 4, 5, 6].map(level => (
                            <option key={level} value={level.toString()}>
                                Level {level}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stories Grid */}
            {filteredStories.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No stories found matching your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStories.map((story) => {
                        const coverUrl = getCoverUrl(story.remote_cover_path);

                        return (
                            <Link key={story.id} href={`/portal/stories/${story.id}`}>
                                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                                    {/* Cover Image */}
                                    <div className="relative w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100">
                                        {coverUrl ? (
                                            <Image
                                                src={coverUrl}
                                                alt={story.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <span className="text-4xl">📚</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                                            {story.title}
                                        </h3>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline" className="text-xs">
                                                {languageNames[story.language] || story.language}
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs">
                                                Level {story.level}
                                            </Badge>
                                        </div>

                                        <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                                            {story.target_text}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
