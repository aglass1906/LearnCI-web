"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Edit, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface Story {
    id: string;
    title: string;
    language: string;
    level: number;
    remote_cover_path: string | null;
    created_at: string;
    is_public: boolean;
    user_id: string;
}

export default function StoriesAdminClient({ initialStories }: { initialStories: Story[] }) {
    const [stories, setStories] = useState(initialStories);
    const [filter, setFilter] = useState("");
    const [languageFilter, setLanguageFilter] = useState("all");
    const supabase = createClient();
    const router = useRouter();

    // Language display names
    const languageNames: Record<string, string> = {
        spanish: "Spanish",
        french: "French",
        german: "German",
        italian: "Italian",
        portuguese: "Portuguese",
        mandarin: "Mandarin",
    };

    // Get unique languages
    const languages = Array.from(new Set(stories.map(s => s.language)));

    // Filter stories
    const filteredStories = stories.filter(story => {
        const matchesSearch = story.title.toLowerCase().includes(filter.toLowerCase());
        const matchesLanguage = languageFilter === "all" || story.language === languageFilter;
        return matchesSearch && matchesLanguage;
    });

    // Get cover URL
    const getCoverUrl = (path: string | null) => {
        if (!path) return null;
        const { data } = supabase.storage
            .from("audio-stories")
            .getPublicUrl(path);
        return data.publicUrl;
    };

    // Toggle public/private
    const togglePublic = async (storyId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from("stories")
            // @ts-ignore
            .update({ is_public: !currentStatus })
            .eq("id", storyId);

        if (!error) {
            setStories(stories.map(s =>
                s.id === storyId ? { ...s, is_public: !currentStatus } : s
            ));
        }
    };

    // Delete story
    const deleteStory = async (storyId: string) => {
        if (!confirm("Are you sure you want to delete this story?")) return;

        const { error } = await supabase
            .from("stories")
            .delete()
            .eq("id", storyId);

        if (!error) {
            setStories(stories.filter(s => s.id !== storyId));
        }
    };

    return (
        <div className="space-y-8 pb-12 relative z-10 max-w-7xl mx-auto">
            {/* Header Command Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-primaryAccent animate-pulse"></span>
                        Live Stories Catalog
                    </h1>
                    <p className="text-white/55 font-sans text-sm mt-1.5 max-w-xl">
                        Monitor, modify, edit metadata, parallel translations, or toggle visibility of all published learning stories.
                    </p>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search stories by title..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-4 pr-4 py-2.5 font-sans text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00E5FF]/50 transition-all"
                    />
                </div>
                <div>
                    <select
                        value={languageFilter}
                        onChange={(e) => setLanguageFilter(e.target.value)}
                        className="bg-[#161925]/80 border border-white/5 text-white/80 rounded-xl px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-[#00E5FF]/50 transition-all cursor-pointer"
                    >
                        <option value="all">All Languages</option>
                        {languages.map(lang => (
                            <option key={lang} value={lang}>
                                {languageNames[lang] || lang}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stories Bento Table */}
            <div className="glass-card border border-white/5 rounded-[24px] overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h2 className="font-heading text-lg font-extrabold text-white">Published Stories ({filteredStories.length})</h2>
                </div>
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                                <th className="px-6 py-4 font-labels text-[11px] tracking-wider text-white/40 uppercase font-extrabold w-[100px]">Cover</th>
                                <th className="px-6 py-4 font-labels text-[11px] tracking-wider text-white/40 uppercase font-extrabold">Title</th>
                                <th className="px-6 py-4 font-labels text-[11px] tracking-wider text-white/40 uppercase font-extrabold">Language</th>
                                <th className="px-6 py-4 font-labels text-[11px] tracking-wider text-white/40 uppercase font-extrabold w-[120px]">Level</th>
                                <th className="px-6 py-4 font-labels text-[11px] tracking-wider text-white/40 uppercase font-extrabold">Created At</th>
                                <th className="px-6 py-4 font-labels text-[11px] tracking-wider text-white/40 uppercase font-extrabold w-[140px]">Visibility</th>
                                <th className="px-6 py-4 font-labels text-[11px] tracking-wider text-white/40 uppercase font-extrabold text-right w-[120px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredStories.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-white/40 font-sans">
                                        No stories found matching the search filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredStories.map((story) => {
                                    const coverUrl = getCoverUrl(story.remote_cover_path);
                                    
                                    const levelText = 
                                        story.level === 0 ? "A1 Super Beginner" :
                                        story.level === 1 ? "A2 Beginner" :
                                        story.level === 2 ? "B1 Intermediate" :
                                        story.level === 3 ? "B2 Advanced" :
                                        story.level === 4 ? "C1 Upper Advanced" :
                                        story.level === 5 ? "C2 Master" : `Level ${story.level}`;

                                    const levelClass = 
                                        story.level === 0 ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                        story.level === 1 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                        story.level === 2 ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                        story.level === 3 ? "bg-[#FFA000]/10 text-[#FFA000] border-[#FFA000]/20" :
                                        story.level === 4 ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                        "bg-red-500/10 text-red-400 border-red-500/20";

                                    return (
                                        <tr key={story.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="relative w-14 h-14 bg-white/5 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center">
                                                    {coverUrl ? (
                                                        <Image
                                                            src={coverUrl}
                                                            alt={story.title}
                                                            fill
                                                            sizes="56px"
                                                            className="object-cover group-hover:scale-105 transition-all duration-300"
                                                        />
                                                    ) : (
                                                        <span className="text-xl">📚</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-white text-sm group-hover:text-[#00E5FF] transition-all">
                                                        {story.title}
                                                    </span>
                                                    <span className="text-[10px] text-white/35 font-mono mt-0.5 max-w-[150px] truncate" title={story.id}>
                                                        {story.id}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/80 border border-white/10 text-[10px] font-bold tracking-wider uppercase">
                                                    {languageNames[story.language] || story.language}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wider uppercase ${levelClass}`}>
                                                    {levelText}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-white/50 text-xs">
                                                {new Date(story.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => togglePublic(story.id, story.is_public)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-labels uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                                                        story.is_public 
                                                            ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 hover:bg-[#00E5FF]/20" 
                                                            : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                                                    }`}
                                                >
                                                    {story.is_public ? (
                                                        <>
                                                            <Eye className="h-3.5 w-3.5" />
                                                            Public
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff className="h-3.5 w-3.5" />
                                                            Private
                                                        </>
                                                    )}
                                                </Button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/stories/${story.id}`}>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            className="h-9 w-9 text-[#00E5FF] hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 rounded-xl"
                                                            title="Edit Story prose/media"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => deleteStory(story.id)}
                                                        className="h-9 w-9 text-red-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
                                                        title="Delete Story"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
