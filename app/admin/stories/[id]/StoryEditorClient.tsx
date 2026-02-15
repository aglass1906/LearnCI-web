"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Upload, Download, Trash2, Save, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface Story {
    id: string;
    title: string;
    target_text: string;
    native_text: string | null;
    prompt: string;
    language: string;
    level: number;
    remote_cover_path: string | null;
    remote_audio_path: string | null;
    created_at: string;
    is_public: boolean;
    user_id: string;
}

export default function StoryEditorClient({ story: initialStory }: { story: Story }) {
    const [story, setStory] = useState(initialStory);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingAudio, setUploadingAudio] = useState(false);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();
    const router = useRouter();

    // Language options
    const languages = [
        { value: "spanish", label: "Spanish" },
        { value: "french", label: "French" },
        { value: "german", label: "German" },
        { value: "italian", label: "Italian" },
        { value: "portuguese", label: "Portuguese" },
        { value: "mandarin", label: "Mandarin" },
    ];

    // Get asset URLs
    const coverUrl = story.remote_cover_path
        ? supabase.storage.from("audio-stories").getPublicUrl(story.remote_cover_path).data.publicUrl
        : null;

    const audioUrl = story.remote_audio_path
        ? supabase.storage.from("audio-stories").getPublicUrl(story.remote_audio_path).data.publicUrl
        : null;

    // Save story metadata
    const saveStory = async () => {
        setIsSaving(true);

        const { error } = await supabase
            .from("stories")
            // @ts-ignore
            .update({
                title: story.title,
                target_text: story.target_text,
                native_text: story.native_text,
                language: story.language,
                level: story.level,
                is_public: story.is_public,
            })
            .eq("id", story.id);

        setIsSaving(false);

        if (error) {
            alert("Error saving story: " + error.message);
        } else {
            alert("Story saved successfully!");
        }
    };

    // Upload cover image
    const uploadCover = async (file: File) => {
        setUploadingCover(true);

        try {
            // Generate unique filename
            const fileExt = file.name.split(".").pop();
            const fileName = `${story.id}/cover_${Date.now()}.${fileExt}`;

            // Upload to storage
            const { error: uploadError } = await supabase.storage
                .from("audio-stories")
                .upload(fileName, file, {
                    contentType: file.type,
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            // Update database
            const { error: updateError } = await supabase
                .from("stories")
                // @ts-ignore
                .update({ remote_cover_path: fileName })
                .eq("id", story.id);

            if (updateError) throw updateError;

            setStory({ ...story, remote_cover_path: fileName });
            router.refresh();
        } catch (error: any) {
            alert("Error uploading cover: " + error.message);
        } finally {
            setUploadingCover(false);
        }
    };

    // Upload audio file
    const uploadAudio = async (file: File) => {
        setUploadingAudio(true);

        try {
            // Generate unique filename
            const fileExt = file.name.split(".").pop();
            const fileName = `${story.id}/audio_${Date.now()}.${fileExt}`;

            // Upload to storage
            const { error: uploadError } = await supabase.storage
                .from("audio-stories")
                .upload(fileName, file, {
                    contentType: file.type,
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            // Update database
            const { error: updateError } = await supabase
                .from("stories")
                // @ts-ignore
                .update({ remote_audio_path: fileName })
                .eq("id", story.id);

            if (updateError) throw updateError;

            setStory({ ...story, remote_audio_path: fileName });
            router.refresh();
        } catch (error: any) {
            alert("Error uploading audio: " + error.message);
        } finally {
            setUploadingAudio(false);
        }
    };

    // Delete cover
    const deleteCover = async () => {
        if (!confirm("Delete cover image?")) return;

        const { error } = await supabase
            .from("stories")
            // @ts-ignore
            .update({ remote_cover_path: null })
            .eq("id", story.id);

        if (!error) {
            setStory({ ...story, remote_cover_path: null });
        }
    };

    // Delete audio
    const deleteAudio = async () => {
        if (!confirm("Delete audio file?")) return;

        const { error } = await supabase
            .from("stories")
            // @ts-ignore
            .update({ remote_audio_path: null })
            .eq("id", story.id);

        if (!error) {
            setStory({ ...story, remote_audio_path: null });
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Link href="/admin/stories" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Stories
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Edit Story</h1>
                        <p className="text-muted-foreground">
                            Story ID: {story.id.slice(0, 8)}... •{" "}
                            {new Date(story.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={story.is_public ? "default" : "outline"}
                            onClick={() => setStory({ ...story, is_public: !story.is_public })}
                        >
                            {story.is_public ? (
                                <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Public
                                </>
                            ) : (
                                <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Private
                                </>
                            )}
                        </Button>
                        <Button onClick={saveStory} disabled={isSaving}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Cover Art */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cover Art</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {coverUrl ? (
                                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                                    <Image
                                        src={coverUrl}
                                        alt="Cover"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-64 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-6xl">📚</span>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) uploadCover(file);
                                    }}
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => coverInputRef.current?.click()}
                                    disabled={uploadingCover}
                                    className="flex-1"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {uploadingCover ? "Uploading..." : "Upload New"}
                                </Button>
                                {coverUrl && (
                                    <>
                                        <Button variant="outline" asChild>
                                            <a href={coverUrl} download>
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                        <Button variant="outline" onClick={deleteCover}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Audio */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Audio</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {audioUrl ? (
                                <audio controls className="w-full">
                                    <source src={audioUrl} type="audio/mpeg" />
                                </audio>
                            ) : (
                                <p className="text-muted-foreground text-sm">No audio file</p>
                            )}

                            <div className="flex gap-2">
                                <input
                                    ref={audioInputRef}
                                    type="file"
                                    accept="audio/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) uploadAudio(file);
                                    }}
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => audioInputRef.current?.click()}
                                    disabled={uploadingAudio}
                                    className="flex-1"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {uploadingAudio ? "Uploading..." : "Upload New"}
                                </Button>
                                {audioUrl && (
                                    <>
                                        <Button variant="outline" asChild>
                                            <a href={audioUrl} download>
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                        <Button variant="outline" onClick={deleteAudio}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Metadata */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Story Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={story.title}
                                    onChange={(e) => setStory({ ...story, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="language">Language</Label>
                                    <select
                                        id="language"
                                        value={story.language}
                                        onChange={(e) => setStory({ ...story, language: e.target.value })}
                                        className="w-full border rounded-md px-3 py-2 text-sm"
                                    >
                                        {languages.map(lang => (
                                            <option key={lang.value} value={lang.value}>
                                                {lang.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="level">Level</Label>
                                    <select
                                        id="level"
                                        value={story.level}
                                        onChange={(e) => setStory({ ...story, level: parseInt(e.target.value) })}
                                        className="w-full border rounded-md px-3 py-2 text-sm"
                                    >
                                        {[1, 2, 3, 4, 5, 6].map(lvl => (
                                            <option key={lvl} value={lvl}>
                                                Level {lvl}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <Label>Prompt (Read-only)</Label>
                                <p className="text-sm text-muted-foreground border rounded-md p-3 bg-muted/50">
                                    {story.prompt}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Text Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Story Text</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="target_text">Target Language Text</Label>
                                <Textarea
                                    id="target_text"
                                    value={story.target_text}
                                    onChange={(e) => setStory({ ...story, target_text: e.target.value })}
                                    rows={8}
                                    className="font-mono text-sm"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {story.target_text.length} characters
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="native_text">English Translation</Label>
                                <Textarea
                                    id="native_text"
                                    value={story.native_text || ""}
                                    onChange={(e) => setStory({ ...story, native_text: e.target.value })}
                                    rows={8}
                                    className="font-mono text-sm"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {(story.native_text || "").length} characters
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
