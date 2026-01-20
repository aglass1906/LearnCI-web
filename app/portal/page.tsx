"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/utils/supabase/client";
import { LogOut, CloudRain, Cloud, CloudSun, Sun, Sparkles, ChevronRight, Trophy, Lock } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { InputRoadmap } from "@/components/InputRoadmap";
import { TodaysActivities } from "@/components/TodaysActivities";
import { LogActivityForm } from "@/components/LogActivityForm";
import { MindsetForm } from "@/components/MindsetForm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

export default function MobilePortal() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [nextMilestone, setNextMilestone] = useState<number>(25);
    const [currentHours, setCurrentHours] = useState<number>(0);

    const router = useRouter();
    const supabase = createClient();

    // Latest check-in state
    const [latestCheckIn, setLatestCheckIn] = useState<any>(null);
    const [todaysCheckIn, setTodaysCheckIn] = useState<any>(null);

    // UI State
    const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);
    const [isMindsetSheetOpen, setIsMindsetSheetOpen] = useState(false);
    const [activityRefreshTrigger, setActivityRefreshTrigger] = useState(0);

    const checkUser = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
            } else {
                setUser(session.user);
                // Fetch profile
                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("user_id", session.user.id)
                    .single();

                if (profileError) console.error("Profile fetch error:", profileError);
                setProfile(profileData);

                if (profileData) {
                    const totalMins = (profileData.total_minutes || 0) + ((profileData.starting_hours || 0) * 60);
                    const hrs = totalMins / 60;
                    setCurrentHours(hrs);
                    // Calculate next 25h milestone
                    const next = (Math.floor(hrs / 25) + 1) * 25;
                    setNextMilestone(next);
                }

                // Fetch latest check-in from daily_feedback
                const { data: checkInData, error: checkInError } = await supabase
                    .from("daily_feedback")
                    .select("*")
                    .eq("user_id", session.user.id)
                    .order("date", { ascending: false })
                    .limit(1)
                    .single();

                // Ignore PGRST116 (no rows)
                if (checkInError && checkInError.code !== 'PGRST116') {
                    console.error("Check-in fetch error:", checkInError);
                }

                setLatestCheckIn(checkInData);

                // Check if it's from today (local date check simplified)
                if (checkInData) {
                    // Assuming date is stored as ISO string in daily_feedback
                    const checkInDate = new Date(checkInData.date).toDateString();
                    const today = new Date().toDateString();
                    if (checkInDate === today) {
                        setTodaysCheckIn(checkInData);
                    } else {
                        setTodaysCheckIn(null);
                    }
                }
            }
        } catch (error) {
            console.error("Critical error in checkUser:", error);
        } finally {
            setLoading(false);
        }
    }, [supabase.auth, supabase, router]);

    useEffect(() => {
        checkUser();
    }, [checkUser]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const handleActivitySuccess = () => {
        setIsLogSheetOpen(false);
        setActivityRefreshTrigger(prev => prev + 1); // Trigger data refresh
        checkUser(); // Refresh hours
    };

    const handleMindsetSuccess = () => {
        setIsMindsetSheetOpen(false);
        checkUser(); // Refresh check-in status
    };

    const updateVoiceGender = async (gender: string) => {
        if (!user) return;
        setProfile((prev: any) => ({ ...prev, tts_voice_gender: gender }));
        const { error } = await supabase
            .from("profiles")
            .update({ tts_voice_gender: gender })
            .eq("user_id", user.id);
        
        if (error) {
            console.error("Error updating voice gender:", error);
            checkUser(); // Revert on error
        }
    };

    const getMoodIcon = (rating: number) => {
        if (rating === 1) return { label: "Bad", icon: CloudRain, color: "text-gray-500", bg: "bg-gray-100" };
        if (rating === 2) return { label: "Struggling", icon: Cloud, color: "text-blue-500", bg: "bg-blue-100" };
        if (rating === 3) return { label: "Good", icon: CloudSun, color: "text-orange-500", bg: "bg-orange-100" };
        if (rating === 4) return { label: "Great", icon: Sun, color: "text-yellow-500", bg: "bg-yellow-100" };
        if (rating === 5) return { label: "Amazing", icon: Sparkles, color: "text-yellow-400", bg: "bg-yellow-100" };
        return { label: "Unknown", icon: Cloud, color: "text-gray-400", bg: "bg-gray-100" };
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading portal...</div>;

    const hoursUntilMilestone = Math.max(0, nextMilestone - currentHours);
    const milestoneProgress = ((25 - hoursUntilMilestone) / 25) * 100;

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

                {/* Today's Activities */}
                <Card className="border-t-4 border-t-blue-500 shadow-xl shadow-blue-500/5 hover:shadow-blue-500/10 transition-shadow">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl">📅</span> Today&apos;s Activities
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

                {/* Milestone Progress */}
                <Card className="border-t-4 border-t-yellow-500 shadow-xl shadow-yellow-500/5 hover:shadow-yellow-500/10 transition-shadow">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-2xl">🎯</span> Next Coaching
                            </CardTitle>
                            <span className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                                {nextMilestone}h Milestone
                            </span>
                        </div>
                        <CardDescription>
                            Unlock your next coaching session in {hoursUntilMilestone.toFixed(1)} hours.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Progress value={Math.max(5, milestoneProgress)} className="h-3" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{Math.floor(currentHours)} hours</span>
                                <span>{nextMilestone} hours</span>
                            </div>
                            {hoursUntilMilestone <= 0 && (
                                <div className="mt-2 p-2 bg-green-100 text-green-700 text-sm font-bold rounded-lg text-center flex items-center justify-center gap-2 animate-pulse">
                                    <Lock className="h-4 w-4" /> Ready to Unlock!
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Coaching / Mindset Check */}
                {todaysCheckIn ? (
                    // IF LOGGED TODAY: Show Summary + Link to History
                    <Card
                        className="border-t-4 border-t-purple-500 shadow-xl shadow-purple-500/5 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer group"
                        onClick={() => router.push("/portal/check-in-history")}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <span className="text-2xl">🧠</span> Today&apos;s Mindset
                                </CardTitle>
                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </div>
                            <CardDescription>You&apos;ve checked in for today.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 bg-purple-50/50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100 dark:border-purple-900/50">
                                {(() => {
                                    const { icon: Icon, color, bg } = getMoodIcon(todaysCheckIn.rating);
                                    return (
                                        <div className={`p-3 rounded-full ${bg} ${color}`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                    );
                                })()}
                                <div>
                                    <div className="font-bold text-lg">{getMoodIcon(todaysCheckIn.rating).label}</div>
                                    {todaysCheckIn.note && (
                                        <div className="text-sm text-muted-foreground line-clamp-1 italic">
                                            &quot;{todaysCheckIn.note}&quot;
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-3 text-xs text-center text-muted-foreground font-medium">
                                Tap to view history &amp; edit
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    // IF NOT LOGGED: Show "Check In" Call to Action
                    <Card className="border-t-4 border-t-purple-500 shadow-xl shadow-purple-500/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-2xl">🧠</span> Mindset Check
                            </CardTitle>
                            <CardDescription>How are you feeling about your progress?</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={() => setIsMindsetSheetOpen(true)}
                                className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Start Daily Check-in <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                            <div className="mt-4 flex justify-between px-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" onClick={() => setIsMindsetSheetOpen(true)}>
                                {[CloudRain, Cloud, CloudSun, Sun, Sparkles].map((Icon, i) => (
                                    <Icon key={i} className="h-6 w-6" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ... previous content (Sheet components usually here, need to ensure they are preserved or re-added) */}
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

                {/* Mindset Sheet */}
                <Sheet open={isMindsetSheetOpen} onOpenChange={setIsMindsetSheetOpen}>
                    <SheetContent side="bottom" className="h-[90vh] rounded-t-[20px] sm:max-w-md sm:mx-auto">
                        <SheetHeader className="mb-6">
                            <SheetTitle className="flex items-center gap-2 text-2xl">
                                🧠 Daily Check-in
                            </SheetTitle>
                            <SheetDescription>
                                Log your mood and progress notes.
                            </SheetDescription>
                        </SheetHeader>
                        <MindsetForm
                            userId={user?.id}
                            onSuccess={handleMindsetSuccess}
                        />
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
