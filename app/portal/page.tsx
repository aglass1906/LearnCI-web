"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { Send, LogOut, CloudRain, Cloud, CloudSun, Sun, Sparkles, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InputRoadmap } from "@/components/InputRoadmap";
import { TodaysActivities } from "@/components/TodaysActivities";
import { LogActivityForm } from "@/components/LogActivityForm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export default function MobilePortal() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const router = useRouter();
    const supabase = createClient();

    // Mindset state
    const [rating, setRating] = useState<number | null>(null);
    const [mindsetNote, setMindsetNote] = useState("");
    const [mindsetStatus, setMindsetStatus] = useState<string | null>(null);

    // Latest check-in state
    const [latestCheckIn, setLatestCheckIn] = useState<any>(null);
    const [todaysCheckInId, setTodaysCheckInId] = useState<string | null>(null);

    // Activity & UI State
    const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);
    const [activityRefreshTrigger, setActivityRefreshTrigger] = useState(0);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
            } else {
                setUser(session.user);
                // Fetch profile for language
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("user_id", session.user.id)
                    .single();
                setProfile(profileData);

                // Fetch latest check-in
                const { data: checkInData } = await supabase
                    .from("coaching_check_ins")
                    .select("*")
                    .eq("user_id", session.user.id)
                    .order("date", { ascending: false })
                    .limit(1)
                    .single();
                setLatestCheckIn(checkInData);

                // Check if it's from today
                if (checkInData) {
                    const checkInDate = new Date(checkInData.date).toDateString();
                    const today = new Date().toDateString();
                    if (checkInDate === today) {
                        setTodaysCheckInId(checkInData.id);

                        // Try to map sentiment back to rating
                        const reverseSentimentMap: { [key: string]: number } = {
                            "Struggling": 1,
                            "Need improvements": 2,
                            "Okay": 3,
                            "Good progress": 4,
                            "Feeling great!": 5
                        };

                        const savedRating = reverseSentimentMap[checkInData.progress_sentiment];
                        if (savedRating) {
                            setRating(savedRating);
                        } else {
                            // Custom note
                            setMindsetNote(checkInData.progress_sentiment || "");
                        }
                    }
                }
            }
            setLoading(false);
        };
        checkUser();
    }, [router, supabase.auth]);

    const handleMindsetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !profile) return;

        // Map web mood rating (1-5) to sentiment text
        const sentimentMap: { [key: number]: string } = {
            1: "Struggling",
            2: "Need improvements",
            3: "Okay",
            4: "Good progress",
            5: "Feeling great!"
        };

        const sentiment = (rating && sentimentMap[rating]) ? sentimentMap[rating] : mindsetNote || "No note";

        let error;

        if (todaysCheckInId) {
            // Update existing
            const { error: updateError } = await supabase
                .from("coaching_check_ins")
                .update({
                    progress_sentiment: sentiment,
                    hours_milestone: Math.floor((profile.total_minutes || 0) / 60),
                })
                .eq("id", todaysCheckInId);
            error = updateError;
        } else {
            // Create new
            const { error: insertError } = await supabase.from("coaching_check_ins").insert({
                id: crypto.randomUUID(),
                user_id: user.id,
                date: new Date().toISOString(),
                hours_milestone: Math.floor((profile.total_minutes || 0) / 60),
                activity_ratings: {},
                progress_sentiment: sentiment,
                next_cycle_plan: "Continue learning",
                notes: ""
            });
            error = insertError;
        }

        if (error) {
            console.error("Mindset save error:", error);
            setMindsetStatus("Error saving.");
        } else {
            setMindsetStatus(todaysCheckInId ? "Mindset updated! 🧠" : "Mindset saved! 🧠");
            if (!todaysCheckInId) setMindsetNote("");
        }
        setTimeout(() => setMindsetStatus(null), 3000);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const handleActivitySuccess = () => {
        setIsLogSheetOpen(false);
        setActivityRefreshTrigger(prev => prev + 1); // Trigger data refresh
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading portal...</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-4 pb-20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent -z-10" />

            <header className="flex items-center justify-between mb-8 pt-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Learner Portal</h1>
                    {profile ? (
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">
                                {profile.current_language || "Language"}
                            </span>
                            <span className="text-sm text-muted-foreground font-medium">
                                Level {profile.current_level || "N/A"}
                            </span>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground font-medium">Welcome back, learner.</p>
                    )}
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive transition-colors">
                    <LogOut className="h-5 w-5" />
                </Button>
            </header>

            <div className="space-y-6 max-w-md mx-auto relative z-10">

                {/* Latest Check-in Display */}
                {latestCheckIn && (() => {
                    // Map sentiment to mood icon
                    const getMoodFromSentiment = (sentiment: string) => {
                        if (!sentiment) return { label: "Unknown", icon: Cloud, color: "text-gray-400" };
                        const lowerSentiment = sentiment.toLowerCase();
                        if (lowerSentiment.includes("struggling") || lowerSentiment.includes("bad")) {
                            return { label: "Struggling", icon: CloudRain, color: "text-gray-500" };
                        } else if (lowerSentiment.includes("need improvement") || lowerSentiment.includes("okay")) {
                            return { label: "Need Improvement", icon: Cloud, color: "text-blue-500" };
                        } else if (lowerSentiment.includes("good") || lowerSentiment.includes("progress")) {
                            return { label: "Good Progress", icon: CloudSun, color: "text-orange-500" };
                        } else if (lowerSentiment.includes("great")) {
                            return { label: "Great", icon: Sun, color: "text-yellow-500" };
                        } else {
                            return { label: "Feeling Great", icon: Sparkles, color: "text-yellow-400" };
                        }
                    };

                    const mood = getMoodFromSentiment(latestCheckIn.progress_sentiment);
                    const MoodIcon = mood.icon;

                    return (
                        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-300 dark:border-indigo-700">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    📊 Latest Check-in
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Mood:</span>
                                    <div className="flex items-center gap-2">
                                        <MoodIcon className={`h-5 w-5 ${mood.color}`} />
                                        <span className="font-semibold">{mood.label}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Note:</span>
                                    <span className="font-semibold text-right max-w-[200px] truncate">{latestCheckIn.progress_sentiment}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Hours:</span>
                                    <span className="font-semibold">{latestCheckIn.hours_milestone}h</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Date:</span>
                                    <span className="font-semibold">{new Date(latestCheckIn.date).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })()}

                {/* Input Roadmap */}
                <Card className="border-t-4 border-t-green-500 shadow-xl shadow-green-500/5 hover:shadow-green-500/10 transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl">🗺️</span> Input Roadmap
                        </CardTitle>
                        <CardDescription>
                            {profile ? `${Math.floor(((profile.total_minutes || 0) + ((profile.starting_hours || 0) * 60)) / 60)}h Total Input` : "Track your listening hours"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <InputRoadmap totalMinutes={(profile?.total_minutes || 0) + ((profile?.starting_hours || 0) * 60)} />
                    </CardContent>
                </Card>

                {/* Today's Activities (New Component) */}
                <Card className="border-t-4 border-t-blue-500 shadow-xl shadow-blue-500/5 hover:shadow-blue-500/10 transition-shadow">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl">📅</span> Today's Activities
                        </CardTitle>
                        <CardDescription>Your daily immersion summary.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TodaysActivities
                            userId={user?.id}
                            onAddClick={() => setIsLogSheetOpen(true)}
                            refreshTrigger={activityRefreshTrigger}
                        />
                    </CardContent>
                </Card>

                {/* 1. Mindset Check */}
                <Card className="border-t-4 border-t-purple-500 shadow-xl shadow-purple-500/5 hover:shadow-purple-500/10 transition-shadow">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl">🧠</span> Mindset Check
                        </CardTitle>
                        <CardDescription>How are you feeling about your progress?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleMindsetSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-base font-semibold">Mood Rating</Label>
                                <div className="grid grid-cols-5 gap-2">
                                    {[
                                        { val: 1, label: "Bad", icon: CloudRain, color: "text-gray-500", active: "bg-gray-500 text-white ring-gray-500" },
                                        { val: 2, label: "Struggling", icon: Cloud, color: "text-blue-500", active: "bg-blue-500 text-white ring-blue-500" },
                                        { val: 3, label: "Good", icon: CloudSun, color: "text-orange-500", active: "bg-orange-500 text-white ring-orange-500" },
                                        { val: 4, label: "Great", icon: Sun, color: "text-yellow-500", active: "bg-yellow-500 text-white ring-yellow-500" },
                                        { val: 5, label: "Amazing", icon: Sparkles, color: "text-yellow-400", active: "bg-yellow-400 text-white ring-yellow-400" },
                                    ].map((mood) => (
                                        <button
                                            key={mood.val}
                                            type="button"
                                            onClick={() => setRating(mood.val)}
                                            className={`h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${rating === mood.val
                                                ? `${mood.active} scale-110 shadow-lg ring-2 ring-offset-2`
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105"
                                                }`}
                                        >
                                            <mood.icon className={`h-6 w-6 ${rating === mood.val ? "text-white" : mood.color}`} />
                                            <span className="text-[10px] font-bold uppercase tracking-wide">{mood.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-base font-semibold">Quick Thought</Label>
                                <Input
                                    placeholder="I feel confident because..."
                                    value={mindsetNote}
                                    onChange={(e) => setMindsetNote(e.target.value)}
                                    className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-purple-500"
                                />
                            </div>

                            <Button type="submit" className="w-full h-12 text-lg gap-2 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/25 transition-all rounded-xl">
                                <Send className="h-5 w-5" /> {todaysCheckInId ? "Update Mindset" : "Save Mindset"}
                            </Button>

                            {mindsetStatus && (
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-lg text-center text-sm font-medium animate-in fade-in">
                                    {mindsetStatus}
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Links */}
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        variant="outline"
                        className="h-32 flex-col gap-3 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
                        onClick={() => router.push("/leaderboard")}
                    >
                        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🏆</span>
                        <span className="font-semibold">Leaderboard</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="h-32 flex-col gap-3 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
                        onClick={() => router.push("/")}
                    >
                        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🏠</span>
                        <span className="font-semibold">Home</span>
                    </Button>
                </div>
            </div>

            {/* Log Activity Sheet */}
            <Sheet open={isLogSheetOpen} onOpenChange={setIsLogSheetOpen}>
                <SheetContent side="bottom" className="h-[90vh] rounded-t-[20px] sm:max-w-md sm:mx-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2 text-2xl">
                            ⏱️ Log Activity
                        </SheetTitle>
                        <SheetDescription>
                            What input did you get today?
                        </SheetDescription>
                    </SheetHeader>
                    <LogActivityForm
                        userId={user?.id}
                        profile={profile}
                        onSuccess={handleActivitySuccess}
                    />
                </SheetContent>
            </Sheet>
        </div>
    );
}
