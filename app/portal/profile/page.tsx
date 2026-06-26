"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
    Loader2, User, Mail, Globe, Award, Volume2, 
    Clock, Sparkles, Check, Copy, Shield 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Profile {
    id: string;
    user_id: string | null;
    username: string | null;
    current_language: string | null;
    current_level: string | null;
    tts_voice_gender: string | null;
    starting_hours: number | null;
    total_minutes: number | null;
    mindset: string | null;
    avatar_url: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export default function ProfilePage() {
    const [supabase] = useState(() => createClient());
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [email, setEmail] = useState("");
    const [copiedId, setCopiedId] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);

    const [formData, setFormData] = useState({
        username: "",
        current_language: "spanish",
        current_level: "A1",
        tts_voice_gender: "female",
        starting_hours: 0,
        mindset: "",
    });

    const fetchProfile = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            setEmail(session.user.email || "");

            const { data, error } = await (supabase.from("profiles") as any)
                .select("*")
                .eq("user_id", session.user.id)
                .single();

            if (error) {
                console.error("Error fetching profile:", error);
            } else if (data) {
                const profileData = data as any;
                setProfile(profileData as Profile);
                setFormData({
                    username: profileData.username || "",
                    current_language: profileData.current_language || "spanish",
                    current_level: profileData.current_level || "A1",
                    tts_voice_gender: profileData.tts_voice_gender || "female",
                    starting_hours: profileData.starting_hours || 0,
                    mindset: profileData.mindset || "",
                });
            }
        } catch (error) {
            console.error("Error in fetchProfile:", error);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { error } = await (supabase.from("profiles") as any)
                .update({
                    username: formData.username.trim(),
                    current_language: formData.current_language,
                    current_level: formData.current_level,
                    tts_voice_gender: formData.tts_voice_gender,
                    starting_hours: Number(formData.starting_hours) || 0,
                    mindset: formData.mindset.trim(),
                    updated_at: new Date().toISOString(),
                })
                .eq("user_id", session.user.id);

            if (error) throw error;

            toast({
                title: "Profile updated",
                description: "Your language preferences and settings have been saved.",
            });
            fetchProfile();
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: "Error",
                description: "Failed to update settings. Please try again.",
                variant: "destructive",
            });
        } finally {
            setUpdating(false);
        }
    };

    const copyUserId = () => {
        if (profile?.user_id) {
            navigator.clipboard.writeText(profile.user_id);
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2000);
            toast({
                description: "User ID copied to clipboard.",
            });
        }
    };

    // Calculate total hours
    const totalMinutes = profile?.total_minutes || 0;
    const startingHours = profile?.starting_hours || 0;
    const totalHours = Math.round((totalMinutes / 60 + startingHours) * 10) / 10;

    const languageDisplayNames: Record<string, string> = {
        spanish: "Spanish",
        french: "French",
        german: "German",
        italian: "Italian",
        portuguese: "Portuguese",
        mandarin: "Mandarin",
        japanese: "Japanese",
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="w-8 h-8 border-4 border-t-primaryAccent border-white/10 rounded-full animate-spin"></div>
                <p className="font-labels text-[10px] tracking-widest text-white/40 uppercase">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-16 relative z-10 max-w-5xl mx-auto">
            
            {/* Header Section */}
            <header className="relative overflow-hidden rounded-[28px] bg-brandSurface/20 border border-white/5 p-8 flex flex-col sm:flex-row items-center gap-6 shadow-2xl">
                <div className="absolute top-[-20%] left-[-10%] w-[30%] h-[150%] bg-[radial-gradient(circle,rgba(255,160,0,0.06)_0%,rgba(255,160,0,0)_70%)] blur-xl pointer-events-none"></div>
                
                <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-primaryAccent to-amber-500 flex items-center justify-center border-2 border-white/10 text-brandDark shadow-lg shadow-primaryAccent/10">
                        <User className="h-10 w-10" />
                    </div>
                </div>

                <div className="text-center sm:text-left space-y-1 flex-1">
                    <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight">
                        Learner Profile
                    </h1>
                    <p className="text-white/45 font-sans text-sm">
                        Manage your linguistic preferences, comprehension goals, and account credentials.
                    </p>
                </div>
            </header>

            {/* Main Layout Grid */}
            <div className="grid gap-8 md:grid-cols-5">
                
                {/* Left Panel: Preferences Form (3 cols) */}
                <form onSubmit={handleUpdate} className="md:col-span-3 space-y-6">
                    <div className="glass-card rounded-[28px] p-8 border border-white/10 shadow-2xl bg-brandSurface/20 space-y-6 relative overflow-hidden">
                        
                        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-2">
                            <span className="font-labels text-[10px] tracking-widest text-white/40 uppercase font-bold">Linguistic Preferences</span>
                            <Globe className="h-4 w-4 text-white/30" />
                        </div>

                        {/* Username */}
                        <div className="space-y-2">
                            <Label htmlFor="username" className="font-labels text-[9px] text-white/55 tracking-wider uppercase font-bold">Username</Label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-white/30" />
                                <Input
                                    id="username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="h-11 pl-10 bg-brandSurface/60 border-white/10 rounded-xl text-sm focus:border-primaryAccent transition-all text-white placeholder-white/20"
                                    placeholder="yourusername"
                                    required
                                />
                            </div>
                        </div>

                        {/* Target Language and Comprehension Level (Row) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            {/* Target Language */}
                            <div className="space-y-2">
                                <Label htmlFor="language" className="font-labels text-[9px] text-white/55 tracking-wider uppercase font-bold">Target Language</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-white/30 pointer-events-none" />
                                    <select
                                        id="language"
                                        value={formData.current_language}
                                        onChange={(e) => setFormData({ ...formData, current_language: e.target.value })}
                                        className="w-full h-11 bg-brandSurface/60 border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent transition-all cursor-pointer"
                                    >
                                        <option value="spanish">Spanish (Español)</option>
                                        <option value="french">French (Français)</option>
                                        <option value="german">German (Deutsch)</option>
                                        <option value="italian">Italian (Italiano)</option>
                                        <option value="portuguese">Portuguese (Português)</option>
                                        <option value="mandarin">Mandarin (中文)</option>
                                        <option value="japanese">Japanese (日本語)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Comprehension Level */}
                            <div className="space-y-2">
                                <Label htmlFor="level" className="font-labels text-[9px] text-white/55 tracking-wider uppercase font-bold">Comprehension Level</Label>
                                <div className="relative">
                                    <Award className="absolute left-3.5 top-3.5 h-4 w-4 text-white/30 pointer-events-none" />
                                    <select
                                        id="level"
                                        value={formData.current_level}
                                        onChange={(e) => setFormData({ ...formData, current_level: e.target.value })}
                                        className="w-full h-11 bg-brandSurface/60 border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent transition-all cursor-pointer"
                                    >
                                        <option value="A1">A1 - Absolute Beginner</option>
                                        <option value="A2">A2 - High Beginner</option>
                                        <option value="B1">B1 - Intermediate</option>
                                        <option value="B2">B2 - High Intermediate</option>
                                        <option value="C1">C1 - Advanced</option>
                                        <option value="C2">C2 - Mastery / Native</option>
                                    </select>
                                </div>
                            </div>

                        </div>

                        {/* TTS Voice Gender and Starting Hours (Row) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            {/* TTS Voice Gender */}
                            <div className="space-y-2">
                                <Label htmlFor="ttsGender" className="font-labels text-[9px] text-white/55 tracking-wider uppercase font-bold">Preferred Narrator Voice</Label>
                                <div className="relative">
                                    <Volume2 className="absolute left-3.5 top-3.5 h-4 w-4 text-white/30 pointer-events-none" />
                                    <select
                                        id="ttsGender"
                                        value={formData.tts_voice_gender}
                                        onChange={(e) => setFormData({ ...formData, tts_voice_gender: e.target.value })}
                                        className="w-full h-11 bg-brandSurface/60 border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent transition-all cursor-pointer"
                                    >
                                        <option value="female">Female Narrator Voice</option>
                                        <option value="male">Male Narrator Voice</option>
                                    </select>
                                </div>
                            </div>

                            {/* Starting Hours */}
                            <div className="space-y-2">
                                <Label htmlFor="startingHours" className="font-labels text-[9px] text-white/55 tracking-wider uppercase font-bold">Offset Starting Hours</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3.5 top-3.5 h-4 w-4 text-white/30 pointer-events-none" />
                                    <Input
                                        id="startingHours"
                                        type="number"
                                        min="0"
                                        max="10000"
                                        value={formData.starting_hours || ""}
                                        onChange={(e) => setFormData({ ...formData, starting_hours: Number(e.target.value) || 0 })}
                                        className="h-11 pl-10 bg-brandSurface/60 border-white/10 rounded-xl text-sm focus:border-primaryAccent transition-all text-white placeholder-white/20"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Mindset / Learning Goal */}
                        <div className="space-y-2">
                            <Label htmlFor="mindset" className="font-labels text-[9px] text-white/55 tracking-wider uppercase font-bold">Learning Mindset & Goal</Label>
                            <div className="relative">
                                <Sparkles className="absolute left-3.5 top-3.5 h-4 w-4 text-white/30" />
                                <textarea
                                    id="mindset"
                                    rows={3}
                                    value={formData.mindset}
                                    onChange={(e) => setFormData({ ...formData, mindset: e.target.value })}
                                    className="w-full bg-brandSurface/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent transition-all placeholder-white/20"
                                    placeholder="Explain your language acquisition goals (e.g. want to read Spanish novels, preparing for travel, acquiring French fluently...)"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button 
                                type="submit" 
                                disabled={updating}
                                className="w-full sm:w-auto bg-gradient-to-r from-primaryAccent to-amber-500 hover:from-primaryAccent hover:to-amber-600 hover:scale-[1.02] active:scale-95 transition-all text-brandDark shadow-lg shadow-primaryAccent/10 rounded-xl font-heading text-xs font-extrabold tracking-wider py-3.5 px-6 flex items-center justify-center gap-1.5"
                            >
                                {updating ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-brandDark" />
                                ) : (
                                    <Check className="h-4 w-4 stroke-[3]" />
                                )}
                                SAVE PROFILE CHANGES
                            </Button>
                        </div>

                    </div>
                </form>

                {/* Right Panel: Stats & Credentials (2 cols) */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* Learning Stats Card */}
                    <div className="glass-card rounded-[28px] p-8 border border-white/10 shadow-2xl bg-brandSurface/20 space-y-6 relative overflow-hidden">
                        
                        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-2">
                            <span className="font-labels text-[10px] tracking-widest text-accentTeal uppercase font-bold">Linguistic Status</span>
                            <Award className="h-4 w-4 text-accentTeal" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-brandSurface/40 border border-white/5 rounded-2xl p-4 space-y-1 shadow-inner">
                                <span className="block font-labels text-[8px] text-white/35 tracking-widest uppercase font-bold">Active Minutes</span>
                                <span className="font-heading text-2xl font-extrabold text-white block">{totalMinutes} min</span>
                            </div>
                            <div className="bg-brandSurface/40 border border-white/5 rounded-2xl p-4 space-y-1 shadow-inner">
                                <span className="block font-labels text-[8px] text-white/35 tracking-widest uppercase font-bold">Accumulated Hours</span>
                                <span className="font-heading text-2xl font-extrabold text-white block">{totalHours} hrs</span>
                            </div>
                            <div className="bg-brandSurface/40 border border-white/5 rounded-2xl p-4 space-y-1 shadow-inner col-span-2">
                                <span className="block font-labels text-[8px] text-accentTeal tracking-widest uppercase font-bold">Current Target Language</span>
                                <span className="font-heading text-lg font-extrabold text-accentTeal block">
                                    {languageDisplayNames[formData.current_language.toLowerCase()] || formData.current_language} ({formData.current_level})
                                </span>
                            </div>
                        </div>

                        {/* Motivator Quote */}
                        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-2 relative overflow-hidden">
                            <div className="absolute top-[-50%] right-[-10%] w-[30%] h-[200%] bg-[radial-gradient(circle,rgba(0,229,255,0.04)_0%,rgba(0,229,255,0)_70%)] blur-md pointer-events-none"></div>
                            <p className="font-labels text-[7px] text-white/30 tracking-widest uppercase font-extrabold flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-accentTeal" /> Comprehensible Input
                            </p>
                            <p className="text-[11px] text-white/60 font-sans leading-relaxed italic">
                                "We acquire language when we understand what we hear and read. LearnCI provides compelling, story-driven input targeted exactly at your level."
                            </p>
                        </div>

                    </div>

                    {/* Account Security & Info Card */}
                    <div className="glass-card rounded-[28px] p-8 border border-white/10 shadow-2xl bg-brandSurface/20 space-y-6">
                        
                        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-2">
                            <span className="font-labels text-[10px] tracking-widest text-white/40 uppercase font-bold">Credentials & Identity</span>
                            <Shield className="h-4 w-4 text-white/30" />
                        </div>

                        {/* Email (Read Only) */}
                        <div className="space-y-1">
                            <span className="block font-labels text-[8px] text-white/35 tracking-widest uppercase font-bold">Registered Email</span>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 h-3.5 w-3.5 text-white/30" />
                                <div className="w-full h-11 bg-brandSurface/40 border border-white/5 rounded-xl pl-9 pr-4 py-3 text-xs text-white/45 font-sans select-all truncate">
                                    {email || "Not authenticated"}
                                </div>
                            </div>
                        </div>

                        {/* User ID (Read Only, Copyable) */}
                        <div className="space-y-1">
                            <span className="block font-labels text-[8px] text-white/35 tracking-widest uppercase font-bold">Database User ID</span>
                            <div className="relative flex gap-2">
                                <div className="relative flex-1 min-w-0">
                                    <Shield className="absolute left-3 top-3.5 h-3.5 w-3.5 text-white/30" />
                                    <div className="w-full h-11 bg-brandSurface/40 border border-white/5 rounded-xl pl-9 pr-4 py-3 text-[10px] text-white/45 font-sans select-all truncate">
                                        {profile?.user_id || ""}
                                    </div>
                                </div>
                                <Button 
                                    type="button"
                                    onClick={copyUserId}
                                    variant="ghost"
                                    className="h-11 w-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white flex items-center justify-center p-0"
                                    title="Copy User ID"
                                    disabled={!profile?.user_id}
                                >
                                    {copiedId ? (
                                        <Check className="h-4 w-4 text-emerald-400 stroke-[3]" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}
