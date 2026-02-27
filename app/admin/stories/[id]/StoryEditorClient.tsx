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
import { ChevronLeft, Upload, Download, Trash2, Save, Eye, EyeOff, Video, HelpCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { adminUpdateStory } from "./actions";
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
    comprehension_questions_json: string | null;
    video_gen_prompt: string | null;
    video_style: string | null;
    remote_video_path: string | null;
    created_at: string;
    is_public: boolean;
    user_id: string;
}

export default function StoryEditorClient({ story: initialStory }: { story: Story }) {
    const [story, setStory] = useState(initialStory);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingAudio, setUploadingAudio] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
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

    // Derive video URL from storage path, or use legacy full URL as-is
    const videoUrl = story.remote_video_path
        ? story.remote_video_path.startsWith("https://")
            ? story.remote_video_path  // Legacy: already a full public URL
            : supabase.storage.from("story_videos").getPublicUrl(story.remote_video_path).data.publicUrl
        : null;

    // Save story metadata — uses server action (service-role) to bypass RLS
    const saveStory = async () => {
        setIsSaving(true);

        try {
            await adminUpdateStory(story.id, {
                title: story.title,
                target_text: story.target_text,
                native_text: story.native_text,
                language: story.language,
                level: story.level,
                is_public: story.is_public,
                video_gen_prompt: story.video_gen_prompt,
                video_style: story.video_style,
                comprehension_questions_json: story.comprehension_questions_json,
            });
            alert("Story saved successfully!");
        } catch (error: any) {
            alert("Error saving story: " + error.message);
        } finally {
            setIsSaving(false);
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

    // Upload video file
    const uploadVideo = async (file: File) => {
        setUploadingVideo(true);

        try {
            // Get storage path (not public URL) — standard format: {storyID}/{timestamp}_{style}.mp4
            const fileExt = file.name.split(".").pop();
            const storagePath = `${story.id}/${Date.now()}_upload.${fileExt}`;

            // Upload to storage
            const { error: uploadError } = await supabase.storage
                .from("story_videos")
                .upload(storagePath, file, {
                    contentType: file.type,
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            // Store the storage PATH in the DB via server action (bypasses RLS)
            await adminUpdateStory(story.id, { remote_video_path: storagePath });

            setStory({ ...story, remote_video_path: storagePath });
            router.refresh();
        } catch (error: any) {
            alert("Error uploading video: " + error.message);
        } finally {
            setUploadingVideo(false);
        }
    };

    // Delete video
    const deleteVideo = async () => {
        if (!confirm("Delete video? This will remove it from storage and clear the reference.")) return;

        const currentPath = story.remote_video_path;

        // Clear local state first so the video player unmounts before losing its src
        setStory({ ...story, remote_video_path: null });

        try {
            // 1. Clear the DB reference via server action (bypasses RLS)
            await adminUpdateStory(story.id, { remote_video_path: null });

            // 2. Delete the file from storage if we have a path (not a legacy URL)
            if (currentPath && !currentPath.startsWith("https://")) {
                await supabase.storage
                    .from("story_videos")
                    .remove([currentPath]);
            }

            router.refresh();
        } catch (error: any) {
            alert("Error deleting video: " + error.message);
            // Restore on failure
            setStory({ ...story, remote_video_path: currentPath });
        }
    };

    // Parse comprehension questions
    let quizQuestions: any[] = [];
    try {
        if (story.comprehension_questions_json) {
            const parsed = JSON.parse(story.comprehension_questions_json);
            if (Array.isArray(parsed)) {
                quizQuestions = parsed;
            } else if (parsed && typeof parsed === 'object' && (parsed as any).questions) {
                quizQuestions = (parsed as any).questions;
            }
        }
    } catch (e) {
        console.error("Error parsing quiz questions:", e);
    }

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
                                <div className="relative w-full h-64 rounded-lg overflow-hidden border bg-muted/20">
                                    <Image
                                        src={coverUrl}
                                        alt="Cover"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-64 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center border">
                                    <span className="text-6xl text-white/50">📚</span>
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
                                    className="flex-1 text-xs"
                                >
                                    <Upload className="h-3.5 w-3.5 mr-2" />
                                    {uploadingCover ? "Uploading..." : "Upload New"}
                                </Button>
                                {coverUrl && (
                                    <>
                                        <Button variant="outline" size="icon" asChild>
                                            <a href={coverUrl} download>
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={deleteCover}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>

                            <div className="pt-4 border-t border-dashed">
                                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Storage Debug</h4>
                                <div className="space-y-1 text-[9px] font-mono bg-muted/30 p-2 rounded border text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>Bucket:</span>
                                        <span className="text-foreground font-semibold">audio-stories</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span>Path:</span>
                                        <span className="text-foreground break-all select-all leading-tight">
                                            {story.remote_cover_path || "None"}
                                        </span>
                                    </div>
                                </div>
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

                    {/* Video */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Video className="h-5 w-5" />
                                Video
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {videoUrl ? (
                                <div className="space-y-4">
                                    <video
                                        key={videoUrl}
                                        controls
                                        className="w-full rounded-lg bg-black aspect-video border shadow-inner"
                                    >
                                        <source key={videoUrl} src={videoUrl} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            ) : (
                                <div className="w-full aspect-video bg-muted/20 rounded-lg flex items-center justify-center border border-dashed">
                                    <p className="text-muted-foreground text-xs flex items-center gap-2">
                                        <Video className="h-4 w-4 opacity-50" />
                                        No video file
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    ref={videoInputRef}
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) uploadVideo(file);
                                        // Reset so the same file can be re-selected after a delete
                                        e.target.value = "";
                                    }}
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => videoInputRef.current?.click()}
                                    disabled={uploadingVideo}
                                    className="flex-1 text-xs"
                                >
                                    <Upload className="h-3.5 w-3.5 mr-2" />
                                    {uploadingVideo ? "Uploading..." : "Upload Video"}
                                </Button>
                                {story.remote_video_path && (
                                    <>
                                        <Button variant="outline" size="icon" asChild>
                                            <a href={videoUrl || story.remote_video_path} download target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={deleteVideo}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>

                            <div className="pt-4 border-t border-dashed">
                                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Storage Debug</h4>
                                <div className="space-y-1 text-[9px] font-mono bg-muted/30 p-2 rounded border text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>Bucket:</span>
                                        <span className="text-foreground font-semibold">story_videos</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span>Full Path/URL:</span>
                                        <span className="text-foreground break-all select-all leading-tight">
                                            {story.remote_video_path || "None"}
                                        </span>
                                    </div>
                                </div>
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
                                <Label htmlFor="video_style">Video Style</Label>
                                <Input
                                    id="video_style"
                                    value={story.video_style || ""}
                                    placeholder="e.g. Pixar 3D"
                                    onChange={(e) => setStory({ ...story, video_style: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label htmlFor="video_prompt">Video Generation Prompt</Label>
                                <Textarea
                                    id="video_prompt"
                                    value={story.video_gen_prompt || ""}
                                    placeholder="Visual prompt for AI video generation..."
                                    onChange={(e) => setStory({ ...story, video_gen_prompt: e.target.value })}
                                    rows={3}
                                    className="text-sm"
                                />
                            </div>

                            <div>
                                <Label>Main Text Prompt (Read-only)</Label>
                                <p className="text-sm text-muted-foreground border rounded-md p-3 bg-muted/50">
                                    {story.prompt}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quiz Questions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HelpCircle className="h-5 w-5" />
                                Quiz Questions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {quizQuestions.length > 0 ? (
                                <div className="space-y-6">
                                    {quizQuestions.map((q, idx) => (
                                        <div key={idx} className="space-y-2 border-b pb-4 last:border-0">
                                            <p className="font-medium text-sm">
                                                {idx + 1}. {q.question}
                                            </p>
                                            <div className="grid grid-cols-1 gap-2 pl-4">
                                                {q.choices.map((choice: string, cIdx: number) => (
                                                    <div
                                                        key={cIdx}
                                                        className={`text-xs p-2 rounded border ${cIdx === q.correctIndex ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : 'bg-muted/30'}`}
                                                    >
                                                        {choice}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-muted/20 rounded-lg">
                                    <p className="text-sm text-muted-foreground">No quiz questions generated yet.</p>
                                    <Button variant="link" size="sm" onClick={() => {
                                        const example = JSON.stringify([
                                            { question: "Example question?", choices: ["A", "B", "C", "D"], correctIndex: 0 }
                                        ]);
                                        setStory({ ...story, comprehension_questions_json: example });
                                    }}>
                                        Add Example Structure
                                    </Button>
                                </div>
                            )}

                            <div className="pt-2">
                                <Label htmlFor="quiz_json">Raw JSON</Label>
                                <Textarea
                                    id="quiz_json"
                                    value={story.comprehension_questions_json || ""}
                                    onChange={(e) => setStory({ ...story, comprehension_questions_json: e.target.value })}
                                    rows={5}
                                    className="font-mono text-xs"
                                    placeholder='[{"question": "...", "choices": ["...", "..."], "correctIndex": 0}]'
                                />
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
