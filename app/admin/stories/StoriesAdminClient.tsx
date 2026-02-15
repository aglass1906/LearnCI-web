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
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Manage Stories</h1>
                <p className="text-muted-foreground">
                    View, edit, and manage all AI-generated stories
                </p>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <input
                                type="text"
                                placeholder="Search by title..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full border rounded-md px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <select
                                value={languageFilter}
                                onChange={(e) => setLanguageFilter(e.target.value)}
                                className="border rounded-md px-3 py-2 text-sm"
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
                </CardContent>
            </Card>

            {/* Stories Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Cover</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Language</TableHead>
                                <TableHead className="w-[80px]">Level</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="w-[100px]">Status</TableHead>
                                <TableHead className="w-[150px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No stories found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStories.map((story) => {
                                    const coverUrl = getCoverUrl(story.remote_cover_path);

                                    return (
                                        <TableRow key={story.id}>
                                            <TableCell>
                                                <div className="relative w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded overflow-hidden">
                                                    {coverUrl ? (
                                                        <Image
                                                            src={coverUrl}
                                                            alt={story.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-2xl">
                                                            📚
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {story.title}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {languageNames[story.language] || story.language}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {story.level}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                    {story.user_id}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(story.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => togglePublic(story.id, story.is_public)}
                                                    className="w-full"
                                                >
                                                    {story.is_public ? (
                                                        <>
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Public
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff className="h-4 w-4 mr-1" />
                                                            Private
                                                        </>
                                                    )}
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/admin/stories/${story.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => deleteStory(story.id)}
                                                        className="text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
