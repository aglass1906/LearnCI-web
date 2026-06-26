"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Story, StoryChapter } from "@/types/stories";
import { ChevronLeft, Upload, Download, Trash2, Save, Eye, EyeOff, Video, HelpCircle, Plus, FileText, Music, Layout, ArrowUp, ArrowDown, Sliders } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { adminUpdateStory } from "./actions";
import { useRouter } from "next/navigation";

interface StoryEditorProps {
    story: any; // Using any for flexibility with database JSON
}

export default function StoryEditorClient({ story: initialStory }: StoryEditorProps) {
    const [story, setStory] = useState(initialStory);
    const [chapters, setChapters] = useState<StoryChapter[]>(
        Array.isArray(initialStory.chapters) ? initialStory.chapters : []
    );
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingAudio, setUploadingAudio] = useState(false);
    const [uploadingChapterAudio, setUploadingChapterAudio] = useState<number | null>(null);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const chapterAudioInputRef = useRef<HTMLInputElement>(null);
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
            : supabase.storage.from("audio-stories").getPublicUrl(story.remote_video_path).data.publicUrl
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
                chapters: chapters, // Save chapters
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
            const fileName = `${story.user_id}/${story.id}/covers/${Date.now()}.${fileExt}`;

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
            const fileName = `${story.user_id}/${story.id}/audio/${Date.now()}.${fileExt}`;

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

    // Chapter Management
    const addChapter = () => {
        const newChapter: StoryChapter = {
            chapter_number: chapters.length + 1,
            title_target_language: `Chapter ${chapters.length + 1}`,
            title_english: `Chapter ${chapters.length + 1}`,
            text_target_language: "",
            text_english: "",
            word_timings: [],
        };
        setChapters([...chapters, newChapter]);
    };

    const removeChapter = (index: number) => {
        if (!confirm("Remove this chapter?")) return;
        const newChapters = chapters.filter((_, i) => i !== index);
        // Re-number chapters
        const renumbered = newChapters.map((ch, i) => ({
            ...ch,
            chapter_number: i + 1,
        }));
        setChapters(renumbered);
    };

    const updateChapter = (index: number, updates: Partial<StoryChapter>) => {
        const newChapters = [...chapters];
        newChapters[index] = { ...newChapters[index], ...updates };
        setChapters(newChapters);
    };

    const moveChapter = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === chapters.length - 1) return;

        const newChapters = [...chapters];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newChapters[index], newChapters[targetIndex]] = [newChapters[targetIndex], newChapters[index]];

        // Re-number
        const renumbered = newChapters.map((ch, i) => ({
            ...ch,
            chapter_number: i + 1,
        }));
        setChapters(renumbered);
    };

    const uploadChapterAudio = async (index: number, file: File) => {
        setUploadingChapterAudio(index);

        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${story.user_id}/${story.id}/audio/chapter_${(index + 1).toString().padStart(2, '0')}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("audio-stories")
                .upload(fileName, file, {
                    contentType: file.type,
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            updateChapter(index, { audio_url: fileName });
        } catch (error: any) {
            alert("Error uploading chapter audio: " + error.message);
        } finally {
            setUploadingChapterAudio(null);
        }
    };

    // Upload video file
    const uploadVideo = async (file: File) => {
        setUploadingVideo(true);

        try {
            // Get storage path (not public URL) — standard format: {storyID}/{timestamp}_{style}.mp4
            const fileExt = file.name.split(".").pop();
            const storagePath = `${story.user_id}/${story.id}/videos/${Date.now()}_upload.${fileExt}`;

            // Upload to storage
            const { error: uploadError } = await supabase.storage
                .from("audio-stories")
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
                    .from("audio-stories")
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
        <div className="space-y-8 pb-12 relative z-10 max-w-6xl mx-auto text-white font-sans">
            {/* Header / Breadcrumbs */}
            <div>
                <Link 
                    href="/admin/stories" 
                    className="inline-flex items-center text-xs text-white/40 hover:text-[#00E5FF] mb-4 transition-colors font-labels uppercase tracking-widest font-extrabold"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Stories
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
                    <div>
                        <h1 className="font-heading text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-primaryAccent animate-pulse"></span>
                            Edit Story
                        </h1>
                        <p className="text-white/55 font-sans text-sm mt-1.5">
                            Story ID: <span className="font-mono text-[#00E5FF] select-all">{story.id}</span> • Created on {new Date(story.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setStory({ ...story, is_public: !story.is_public })}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold font-labels uppercase tracking-wider border flex items-center gap-2 transition-all cursor-pointer ${
                                story.is_public
                                    ? "bg-[#00E5FF]/10 border-[#00E5FF]/35 text-[#00E5FF] shadow-lg shadow-[#00E5FF]/5"
                                    : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
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
                        </button>
                        <button 
                            onClick={saveStory} 
                            disabled={isSaving}
                            className="bg-[#FFA000] hover:bg-[#FFA000]/90 disabled:opacity-50 text-[#161925] font-extrabold font-labels uppercase tracking-wider rounded-xl py-2.5 px-5 flex items-center gap-2 transition-all shadow-lg shadow-[#FFA000]/10 cursor-pointer"
                        >
                            {isSaving ? (
                                <>
                                    <span className="h-3.5 w-3.5 border-2 border-[#161925] border-t-transparent rounded-full animate-spin"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-3.5 w-3.5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Media assets (lg:col-span-5) */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Cover Art */}
                    <div className="glass-card border border-white/5 rounded-[24px] overflow-hidden p-6 space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                            <span className="text-[#00E5FF]"><FileText className="h-4.5 w-4.5" /></span>
                            <h2 className="font-heading text-base font-extrabold text-white">Cover Art</h2>
                        </div>
                        
                        {coverUrl ? (
                            <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-white/10 bg-black/40 group">
                                <Image
                                    src={coverUrl}
                                    alt="Cover"
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                    <span className="text-xs text-white/80 font-sans">Active Cover Image</span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-64 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl flex flex-col items-center justify-center border border-dashed border-white/10">
                                <span className="text-5xl mb-3">📚</span>
                                <span className="text-xs text-white/35 font-sans">No cover image uploaded</span>
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
                            <button
                                onClick={() => coverInputRef.current?.click()}
                                disabled={uploadingCover}
                                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-white font-labels text-xs uppercase tracking-wider font-bold rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                                <Upload className="h-3.5 w-3.5 text-[#00E5FF]" />
                                {uploadingCover ? "Uploading..." : "Upload New"}
                            </button>
                            {coverUrl && (
                                <>
                                    <a 
                                        href={coverUrl} 
                                        download
                                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl p-2.5 flex items-center justify-center transition-all cursor-pointer"
                                        title="Download Cover"
                                    >
                                        <Download className="h-4 w-4" />
                                    </a>
                                    <button 
                                        onClick={deleteCover}
                                        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl p-2.5 flex items-center justify-center transition-all cursor-pointer"
                                        title="Delete Cover"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 mb-2 font-labels">Storage Debug</h4>
                            <div className="space-y-1.5 text-[10px] font-mono bg-black/30 p-3 rounded-xl border border-white/5 text-white/50">
                                <div className="flex justify-between">
                                    <span>Bucket:</span>
                                    <span className="text-white font-semibold">audio-stories</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span>Path:</span>
                                    <span className="text-[#00E5FF] break-all select-all leading-tight">
                                        {story.remote_cover_path || "None"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Audio */}
                    <div className="glass-card border border-white/5 rounded-[24px] overflow-hidden p-6 space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                            <span className="text-[#00E5FF]"><Music className="h-4.5 w-4.5" /></span>
                            <h2 className="font-heading text-base font-extrabold text-white">Audio Stream</h2>
                        </div>
                        
                        {audioUrl ? (
                            <div className="bg-black/25 border border-white/5 rounded-xl p-3.5">
                                <audio controls className="w-full">
                                    <source src={audioUrl} type="audio/mpeg" />
                                </audio>
                            </div>
                        ) : (
                            <div className="py-8 px-4 bg-white/[0.01] border border-dashed border-white/10 rounded-xl text-center">
                                <p className="text-white/40 text-xs">No audio file uploaded for single-file mode</p>
                            </div>
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
                            <button
                                onClick={() => audioInputRef.current?.click()}
                                disabled={uploadingAudio}
                                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-white font-labels text-xs uppercase tracking-wider font-bold rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                                <Upload className="h-3.5 w-3.5 text-[#00E5FF]" />
                                {uploadingAudio ? "Uploading..." : "Upload New"}
                            </button>
                            {audioUrl && (
                                <>
                                    <a 
                                        href={audioUrl} 
                                        download
                                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl p-2.5 flex items-center justify-center transition-all cursor-pointer"
                                        title="Download Audio"
                                    >
                                        <Download className="h-4 w-4" />
                                    </a>
                                    <button 
                                        onClick={deleteAudio}
                                        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl p-2.5 flex items-center justify-center transition-all cursor-pointer"
                                        title="Delete Audio"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Video */}
                    <div className="glass-card border border-white/5 rounded-[24px] overflow-hidden p-6 space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                            <span className="text-[#00E5FF]"><Video className="h-4.5 w-4.5" /></span>
                            <h2 className="font-heading text-base font-extrabold text-white">Cinematic Video</h2>
                        </div>
                        
                        {videoUrl ? (
                            <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-white/10 shadow-inner group">
                                <video
                                    key={videoUrl}
                                    controls
                                    className="w-full h-full object-contain"
                                >
                                    <source src={videoUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        ) : (
                            <div className="w-full aspect-video bg-white/[0.01] rounded-xl flex flex-col items-center justify-center border border-dashed border-white/10">
                                <Video className="h-8 w-8 text-white/20 mb-2 animate-pulse" />
                                <p className="text-white/35 text-xs">No cinematic video file uploaded</p>
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
                                    e.target.value = "";
                                }}
                            />
                            <button
                                onClick={() => videoInputRef.current?.click()}
                                disabled={uploadingVideo}
                                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-white font-labels text-xs uppercase tracking-wider font-bold rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                                <Upload className="h-3.5 w-3.5 text-[#00E5FF]" />
                                {uploadingVideo ? "Uploading..." : "Upload Video"}
                            </button>
                            {story.remote_video_path && (
                                <>
                                    <a 
                                        href={videoUrl || story.remote_video_path} 
                                        download 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl p-2.5 flex items-center justify-center transition-all cursor-pointer"
                                        title="Download Video"
                                    >
                                        <Download className="h-4 w-4" />
                                    </a>
                                    <button 
                                        onClick={deleteVideo}
                                        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl p-2.5 flex items-center justify-center transition-all cursor-pointer"
                                        title="Delete Video"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 mb-2 font-labels">Storage Debug</h4>
                            <div className="space-y-1.5 text-[10px] font-mono bg-black/30 p-3 rounded-xl border border-white/5 text-white/50">
                                <div className="flex justify-between">
                                    <span>Bucket:</span>
                                    <span className="text-white font-semibold">audio-stories</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span>Full Path/URL:</span>
                                    <span className="text-[#00E5FF] break-all select-all leading-tight">
                                        {story.remote_video_path || "None"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details & Content (lg:col-span-7) */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Metadata Details */}
                    <div className="glass-card border border-white/5 rounded-[24px] overflow-hidden p-6 space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                            <span className="text-[#00E5FF]"><Sliders className="h-4.5 w-4.5" /></span>
                            <h2 className="font-heading text-base font-extrabold text-white">Story Metadata</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/50 mb-2 block font-labels">Title</label>
                                <input
                                    type="text"
                                    value={story.title}
                                    onChange={(e) => setStory({ ...story, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm placeholder:text-white/30 focus:outline-none focus:border-[#00E5FF]/50 transition-all font-sans"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/50 mb-2 block font-labels">Language</label>
                                    <select
                                        id="language"
                                        value={story.language}
                                        onChange={(e) => setStory({ ...story, language: e.target.value })}
                                        className="w-full bg-[#161925]/80 border border-white/10 text-white/80 rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-[#00E5FF]/50 transition-all cursor-pointer"
                                    >
                                        {languages.map(lang => (
                                            <option key={lang.value} value={lang.value} className="bg-[#161925]">
                                                {lang.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/50 mb-2 block font-labels">Level</label>
                                    <select
                                        id="level"
                                        value={story.level}
                                        onChange={(e) => setStory({ ...story, level: parseInt(e.target.value) })}
                                        className="w-full bg-[#161925]/80 border border-white/10 text-white/80 rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-[#00E5FF]/50 transition-all cursor-pointer"
                                    >
                                        {[1, 2, 3, 4, 5, 6].map(lvl => (
                                            <option key={lvl} value={lvl} className="bg-[#161925]">
                                                Level {lvl}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/50 mb-2 block font-labels">Video Style</label>
                                <input
                                    type="text"
                                    value={story.video_style || ""}
                                    placeholder="e.g. Pixar 3D"
                                    onChange={(e) => setStory({ ...story, video_style: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm placeholder:text-white/30 focus:outline-none focus:border-[#00E5FF]/50 transition-all font-sans"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/50 mb-2 block font-labels">Video Generation Prompt</label>
                                <textarea
                                    value={story.video_gen_prompt || ""}
                                    placeholder="Visual prompt for AI video generation..."
                                    onChange={(e) => setStory({ ...story, video_gen_prompt: e.target.value })}
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3.5 text-xs placeholder:text-white/30 focus:outline-none focus:border-[#00E5FF]/50 transition-all font-mono resize-y"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/50 mb-2 block font-labels">Main Text Prompt (Read-only)</label>
                                <p className="text-xs text-white/60 border border-white/5 rounded-xl p-4 bg-white/[0.02] leading-relaxed whitespace-pre-wrap font-sans">
                                    {story.prompt}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quiz Questions */}
                    <div className="glass-card border border-white/5 rounded-[24px] overflow-hidden p-6 space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                            <span className="text-[#FFA000]"><HelpCircle className="h-4.5 w-4.5" /></span>
                            <h2 className="font-heading text-base font-extrabold text-white">Comprehension Quiz</h2>
                        </div>
                        
                        <div className="space-y-4">
                            {quizQuestions.length > 0 ? (
                                <div className="space-y-6">
                                    {quizQuestions.map((q, idx) => (
                                        <div key={idx} className="space-y-3 border-b border-white/5 pb-4 last:border-0">
                                            <p className="font-heading font-semibold text-sm text-white/90">
                                                {idx + 1}. {q.question}
                                            </p>
                                            <div className="grid grid-cols-1 gap-2 pl-2">
                                                {q.choices.map((choice: string, cIdx: number) => (
                                                    <div
                                                        key={cIdx}
                                                        className={`text-xs px-3.5 py-2.5 rounded-xl border transition-all ${
                                                            cIdx === q.correctIndex
                                                                ? 'bg-green-500/10 border-green-500/30 text-green-400 font-semibold shadow-sm'
                                                                : 'bg-white/5 border-white/5 text-white/60'
                                                        }`}
                                                    >
                                                        <span className="mr-1.5 opacity-50 font-mono">
                                                            {String.fromCharCode(65 + cIdx)}.
                                                        </span>
                                                        {choice}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-white/[0.01] border border-dashed border-white/10 rounded-xl">
                                    <p className="text-sm text-white/40 font-sans mb-3">No quiz questions generated yet.</p>
                                    <button
                                        onClick={() => {
                                            const example = JSON.stringify([
                                                { question: "Example question?", choices: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 0 }
                                            ], null, 4);
                                            setStory({ ...story, comprehension_questions_json: example });
                                        }}
                                        className="text-xs text-[#00E5FF] hover:underline font-labels uppercase tracking-wider font-extrabold cursor-pointer"
                                    >
                                        Add Example Structure
                                    </button>
                                </div>
                            )}

                            <div className="pt-4 border-t border-white/5">
                                <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/50 mb-2 block font-labels">Raw JSON Schema</label>
                                <textarea
                                    value={story.comprehension_questions_json || ""}
                                    onChange={(e) => setStory({ ...story, comprehension_questions_json: e.target.value })}
                                    rows={5}
                                    className="w-full bg-black/30 border border-white/15 text-[#bdf4ff] rounded-xl p-3.5 text-xs font-mono focus:outline-none focus:border-[#00E5FF]/50 transition-all resize-y"
                                    placeholder='[{"question": "...", "choices": ["...", "..."], "correctIndex": 0}]'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Chapters Management */}
                    <div className="glass-card border border-white/5 rounded-[24px] overflow-hidden p-6 space-y-6">
                        <div className="flex flex-row items-center justify-between pb-4 border-b border-white/5 gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[#00E5FF]"><Layout className="h-4.5 w-4.5" /></span>
                                <h2 className="font-heading text-base font-extrabold text-white">Chapters ({chapters.length})</h2>
                            </div>
                            <button
                                onClick={addChapter}
                                className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#161925] font-extrabold font-labels uppercase tracking-wider rounded-xl text-[10px] py-2 px-4 flex items-center gap-1.5 transition-all shadow-lg shadow-[#00E5FF]/10 cursor-pointer"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Chapter
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {chapters.length === 0 ? (
                                <div className="text-center py-12 bg-white/[0.01] border border-dashed border-white/10 rounded-xl">
                                    <p className="text-sm text-white/40 font-sans">No chapters defined. This story uses single-file mode.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {chapters.map((chapter, index) => (
                                        <div key={index} className="border border-white/5 rounded-2xl p-4 bg-white/[0.02] space-y-4 relative hover:bg-white/[0.03] transition-all">
                                            <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/20">
                                                        Chapter {chapter.chapter_number}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <button 
                                                            onClick={() => moveChapter(index, 'up')} 
                                                            disabled={index === 0}
                                                            className="p-1 text-white/40 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                                                            title="Move Up"
                                                        >
                                                            <ArrowUp className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => moveChapter(index, 'down')} 
                                                            disabled={index === chapters.length - 1}
                                                            className="p-1 text-white/40 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                                                            title="Move Down"
                                                        >
                                                            <ArrowDown className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => removeChapter(index)}
                                                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                                    title="Remove Chapter"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] uppercase text-white/50 font-bold font-labels tracking-wider block">Title (Spanish/Target)</label>
                                                    <input
                                                        type="text"
                                                        value={chapter.title_target_language}
                                                        onChange={(e) => updateChapter(index, { title_target_language: e.target.value })}
                                                        placeholder="Chapter Title"
                                                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00E5FF]/50 transition-all font-sans"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] uppercase text-white/50 font-bold font-labels tracking-wider block">Title (English)</label>
                                                    <input
                                                        type="text"
                                                        value={chapter.title_english}
                                                        onChange={(e) => updateChapter(index, { title_english: e.target.value })}
                                                        placeholder="English Title"
                                                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00E5FF]/50 transition-all font-sans"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[9px] uppercase text-white/50 font-bold font-labels tracking-wider block">Chapter Text</label>
                                                <textarea
                                                    value={chapter.text_target_language}
                                                    onChange={(e) => updateChapter(index, { text_target_language: e.target.value })}
                                                    rows={4}
                                                    className="w-full bg-white/5 border border-white/10 text-[#bdf4ff] rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-[#00E5FF]/50 transition-all resize-y"
                                                    placeholder="Spanish/Target language text..."
                                                />
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-white/5">
                                                <div className="flex-1">
                                                    <label className="text-[9px] uppercase text-white/50 font-bold font-labels tracking-wider block mb-1">Audio File</label>
                                                    {chapter.audio_url ? (
                                                        <div className="flex items-center gap-2 bg-black/20 border border-white/5 rounded-xl px-3 py-1.5">
                                                            <div className="flex-1 text-[10px] truncate text-white/60 font-mono">
                                                                {chapter.audio_url}
                                                            </div>
                                                            <button 
                                                                onClick={() => updateChapter(index, { audio_url: undefined })}
                                                                className="text-red-400 hover:text-red-300 transition-colors p-1 cursor-pointer"
                                                                title="Delete Audio"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-[10px] text-white/30 italic bg-white/[0.01] border border-dashed border-white/5 rounded-xl px-3 py-2">
                                                            No audio file linked
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-end">
                                                    <input
                                                        type="file"
                                                        accept="audio/*"
                                                        className="hidden"
                                                        id={`chapter-audio-${index}`}
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) uploadChapterAudio(index, file);
                                                        }}
                                                    />
                                                    <button
                                                        disabled={uploadingChapterAudio === index}
                                                        onClick={() => document.getElementById(`chapter-audio-${index}`)?.click()}
                                                        className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-white font-labels text-xs uppercase tracking-wider font-bold rounded-xl py-2 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer"
                                                    >
                                                        <Music className="h-3.5 w-3.5 text-[#00E5FF]" />
                                                        {uploadingChapterAudio === index ? "Uploading..." : "Upload Audio"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="glass-card border border-white/5 rounded-[24px] overflow-hidden p-6 space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                            <span className="text-[#00E5FF]"><FileText className="h-4.5 w-4.5" /></span>
                            <h2 className="font-heading text-base font-extrabold text-white">Full Story Text (Single File Mode)</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/50 mb-2 block font-labels">Target Language Text</label>
                                <textarea
                                    id="target_text"
                                    value={story.target_text}
                                    onChange={(e) => setStory({ ...story, target_text: e.target.value })}
                                    rows={8}
                                    className="w-full bg-white/5 border border-white/10 text-[#bdf4ff] rounded-xl p-3.5 text-sm placeholder:text-white/30 focus:outline-none focus:border-[#00E5FF]/50 transition-all font-mono resize-y"
                                />
                                <p className="text-[10px] font-mono text-white/30 mt-1.5 text-right">
                                    {story.target_text.length} characters
                                </p>
                            </div>

                            <div>
                                <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/50 mb-2 block font-labels">English Translation</label>
                                <textarea
                                    id="native_text"
                                    value={story.native_text || ""}
                                    onChange={(e) => setStory({ ...story, native_text: e.target.value })}
                                    rows={8}
                                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3.5 text-sm placeholder:text-white/30 focus:outline-none focus:border-[#00E5FF]/50 transition-all font-mono resize-y"
                                />
                                <p className="text-[10px] font-mono text-white/30 mt-1.5 text-right">
                                    {(story.native_text || "").length} characters
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
