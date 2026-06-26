"use client";

import { Button } from "@/components/ui/button";
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

export default function MobilePortal() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [nextMilestone, setNextMilestone] = useState<number>(25);
    const [currentHours, setCurrentHours] = useState<number>(0);

    const router = useRouter();
    const [supabase] = useState(() => createClient());

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

                if (profileError) {
                    if (profileError.code === 'PGRST116') {
                        console.log("No profile found. Creating defaults...");
                        const { data: newProfile, error: createError } = await supabase
                            .from("profiles")
                            .insert({
                                id: session.user.id,
                                user_id: session.user.id,
                                total_minutes: 0,
                                current_level: 'A1',
                                updated_at: new Date().toISOString()
                            } as any)
                            .select()
                            .single();

                        if (createError) {
                            console.error("Failed to auto-create profile:", createError);
                        } else {
                            console.log("Profile auto-created:", newProfile);
                            setProfile(newProfile as any);
                            setCurrentHours(0);
                            setNextMilestone(25);
                        }
                    } else {
                        console.error("Profile fetch error:", profileError);
                    }
                } else {
                    setProfile(profileData as any);

                    if (profileData) {
                        const data = profileData as any;
                        const totalMins = (data.total_minutes || 0) + ((data.starting_hours || 0) * 60);
                        const hrs = totalMins / 60;
                        setCurrentHours(hrs);
                        const next = (Math.floor(hrs / 25) + 1) * 25;
                        setNextMilestone(next);
                    }
                }

                // Fetch latest check-in from daily_feedback
                const { data: checkInData, error: checkInError } = await supabase
                    .from("daily_feedback")
                    .select("*")
                    .eq("user_id", session.user.id)
                    .order("date", { ascending: false })
                    .limit(1)
                    .single();

                if (checkInError && checkInError.code !== 'PGRST116') {
                    console.error("Check-in fetch error:", checkInError);
                }

                setLatestCheckIn(checkInData);

                if (checkInData) {
                    const data = checkInData as any;
                    // @ts-ignore
                    const checkInDate = new Date(data.date).toDateString();
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
    }, [supabase, router]);

    useEffect(() => {
        checkUser();
    }, [checkUser]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const handleActivitySuccess = () => {
        setIsLogSheetOpen(false);
        setActivityRefreshTrigger(prev => prev + 1);
        checkUser();
    };

    const handleMindsetSuccess = () => {
        setIsMindsetSheetOpen(false);
        checkUser();
    };

    const getMoodIcon = (rating: number) => {
        if (rating === 1) return { label: "Bad", icon: CloudRain, color: "text-blue-400", bg: "bg-blue-950/40" };
        if (rating === 2) return { label: "Struggling", icon: Cloud, color: "text-purple-400", bg: "bg-purple-950/40" };
        if (rating === 3) return { label: "Good", icon: CloudSun, color: "text-amber-500", bg: "bg-amber-950/40" };
        if (rating === 4) return { label: "Great", icon: Sun, color: "text-amber-400", bg: "bg-amber-950/40" };
        if (rating === 5) return { label: "Amazing", icon: Sparkles, color: "text-primaryAccent", bg: "bg-primaryAccent/10" };
        return { label: "Unknown", icon: Cloud, color: "text-white/40", bg: "bg-white/5" };
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="w-8 h-8 border-4 border-t-primaryAccent border-white/10 rounded-full animate-spin"></div>
                <p className="font-labels text-[10px] tracking-widest text-white/40 uppercase">Loading session...</p>
            </div>
        );
    }

    const hoursUntilMilestone = Math.max(0, nextMilestone - currentHours);
    const milestoneProgress = ((25 - hoursUntilMilestone) / 25) * 100;

    return (
        <div className="space-y-8 pb-16 relative z-10 max-w-5xl mx-auto px-4 sm:px-0">
            {/* Background glowing decorations */}
            <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[40%] bg-[radial-gradient(circle,rgba(56,97,251,0.04)_0%,rgba(56,97,251,0)_70%)] blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute bottom-[20%] right-[-20%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(0,229,255,0.03)_0%,rgba(0,229,255,0)_70%)] blur-3xl pointer-events-none -z-10"></div>

            {/* Header / Command Center Welcome */}
            <header className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="space-y-1.5">
                    <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                        Learner Dashboard
                    </h1>
                    {profile ? (
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-accentTeal/10 border border-accentTeal/20 text-accentTeal font-labels text-[9px] font-extrabold uppercase tracking-widest shadow-sm shadow-accentTeal/5">
                                {profile.current_language || "Language"}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-white/50 font-labels text-[9px] font-extrabold uppercase tracking-widest">
                                LEVEL {profile.current_level || "N/A"}
                            </span>
                        </div>
                    ) : (
                        <p className="text-white/40 font-sans text-sm mt-1">Welcome back, operative.</p>
                    )}
                </div>
                <button 
                    onClick={handleLogout} 
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/20 text-white/50 hover:text-red-400 font-labels text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:bg-red-500/10 active:scale-95"
                >
                    <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    <span>Sign Out</span>
                </button>
            </header>

            {/* Main Interactive Bento Grid */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">

                {/* 1. Input Roadmap Card */}
                <div className="glass-card glass-card-hover rounded-[28px] p-6 sm:p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-[-20%] right-[-10%] w-[30%] h-[150%] bg-[radial-gradient(circle,rgba(56,97,251,0.03)_0%,rgba(56,97,251,0)_70%)] blur-xl pointer-events-none"></div>
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-heading text-lg font-extrabold text-white flex items-center gap-2">
                                <span className="text-xl group-hover:scale-110 transition-transform duration-300">🗺️</span> Input Roadmap
                            </h3>
                            <span className="font-labels text-[8px] text-white/30 uppercase tracking-widest font-extrabold">
                                PROGRESS CHART
                            </span>
                        </div>
                        <p className="text-white/50 font-sans text-xs leading-relaxed mb-6">
                            {profile 
                                ? `You have accumulated ${Math.floor(((profile.total_minutes || 0) + ((profile.starting_hours || 0) * 60)) / 60)} hours of tracked comprehensible input. Keep adding hours to advance your level.` 
                                : "Track your listening hours to unlock native-level fluency."
                            }
                        </p>
                    </div>
                    <div className="bg-brandDark/40 border border-white/5 rounded-2xl p-4 shadow-inner">
                        <InputRoadmap totalMinutes={(profile?.total_minutes || 0) + ((profile?.starting_hours || 0) * 60)} />
                    </div>
                </div>

                {/* 2. Today's Activities Card */}
                <div className="glass-card glass-card-hover rounded-[28px] p-6 sm:p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-[-20%] right-[-10%] w-[30%] h-[150%] bg-[radial-gradient(circle,rgba(0,229,255,0.03)_0%,rgba(0,229,255,0)_70%)] blur-xl pointer-events-none"></div>
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-heading text-lg font-extrabold text-white flex items-center gap-2">
                                <span className="text-xl group-hover:scale-110 transition-transform duration-300">📅</span> Today&apos;s Activities
                            </h3>
                            <span className="font-labels text-[8px] text-white/30 uppercase tracking-widest font-extrabold">
                                IMMERSION LOG
                            </span>
                        </div>
                        <p className="text-white/50 font-sans text-xs leading-relaxed mb-6">
                            Track the details of your daily reading, audio podcasts, and YouTube immersion sessions to record your learning history.
                        </p>
                    </div>
                    <div className="bg-brandDark/40 border border-white/5 rounded-2xl p-4 shadow-inner">
                        <TodaysActivities
                            userId={user?.id}
                            onAddClick={() => setIsLogSheetOpen(true)}
                            refreshTrigger={activityRefreshTrigger}
                        />
                    </div>
                </div>

                {/* 3. Milestone Progress Card */}
                <div className="glass-card glass-card-hover rounded-[28px] p-6 sm:p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-[-20%] left-[-10%] w-[30%] h-[150%] bg-[radial-gradient(circle,rgba(255,160,0,0.03)_0%,rgba(255,160,0,0)_70%)] blur-xl pointer-events-none"></div>
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-heading text-lg font-extrabold text-white flex items-center gap-2">
                                <span className="text-xl group-hover:scale-110 transition-transform duration-300">🎯</span> Next Coaching
                            </h3>
                            <span className="px-3 py-1 rounded-full bg-primaryAccent/10 border border-primaryAccent/20 text-primaryAccent font-labels text-[8px] font-extrabold tracking-widest uppercase shadow-sm shadow-primaryAccent/5">
                                {nextMilestone}H MILESTONE
                            </span>
                        </div>
                        <p className="text-white/50 font-sans text-xs leading-relaxed mb-6">
                            Unlock your next personal language coaching session and progress audit in <span className="text-primaryAccent font-bold">{hoursUntilMilestone.toFixed(1)}</span> hours of input.
                        </p>
                    </div>
                    <div className="space-y-4 bg-brandDark/40 border border-white/5 rounded-2xl p-5 shadow-inner">
                        <Progress 
                            value={Math.max(5, milestoneProgress)} 
                            className="h-3 bg-white/5 border border-white/5 rounded-full overflow-hidden [&>div]:bg-gradient-to-r [&>div]:from-primaryAccent [&>div]:to-amber-500 [&>div]:shadow-[0_0_12px_rgba(255,160,0,0.3)] shadow-inner transition-all duration-500" 
                        />
                        <div className="flex justify-between font-labels text-[9px] text-white/40 uppercase tracking-widest font-extrabold">
                            <span>{Math.floor(currentHours)} Hours</span>
                            <span>{nextMilestone} Hours</span>
                        </div>
                        {hoursUntilMilestone <= 0 && (
                            <div className="mt-2 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-extrabold rounded-xl text-center flex items-center justify-center gap-2 animate-pulse font-labels tracking-widest uppercase">
                                <Trophy className="h-4 w-4 text-emerald-400" /> COACHING UNLOCKED
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Coaching / Mindset Check */}
                <div className="glass-card glass-card-hover rounded-[28px] p-6 sm:p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-[-20%] left-[-10%] w-[30%] h-[150%] bg-[radial-gradient(circle,rgba(168,85,247,0.03)_0%,rgba(168,85,247,0)_70%)] blur-xl pointer-events-none"></div>
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-heading text-lg font-extrabold text-white flex items-center gap-2">
                                <span className="text-xl group-hover:scale-110 transition-transform duration-300">🧠</span> Mindset &amp; Feedback
                            </h3>
                            <span className="font-labels text-[8px] text-white/30 uppercase tracking-widest font-extrabold">
                                MENTAL CHECK
                            </span>
                        </div>
                        <p className="text-white/50 font-sans text-xs leading-relaxed mb-6">
                            Language acquisition is a marathon. Check in daily to log your mood, track frustrations, and align your study mindset.
                        </p>
                    </div>
                    
                    {todaysCheckIn ? (
                        <div 
                            className="flex items-center gap-4 bg-brandDark/40 border border-white/5 hover:border-purple-500/30 p-4 rounded-2xl transition-all duration-300 cursor-pointer group hover:bg-purple-500/[0.02]"
                            onClick={() => router.push("/portal/check-in-history")}
                        >
                            {(() => {
                                const { icon: Icon, color, bg } = getMoodIcon(todaysCheckIn.rating);
                                return (
                                    <div className={`p-3 rounded-xl border border-white/5 shadow-md shadow-black/25 ${bg} ${color}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                );
                            })()}
                            <div className="flex-1 min-w-0">
                                <div className="font-heading font-bold text-white text-base">
                                    Today&apos;s Mindset: <span className="text-purple-400">{getMoodIcon(todaysCheckIn.rating).label}</span>
                                </div>
                                {todaysCheckIn.note ? (
                                    <p className="text-xs text-white/40 truncate italic mt-0.5">
                                        &quot;{todaysCheckIn.note}&quot;
                                    </p>
                                ) : (
                                    <p className="text-xs text-white/35 mt-0.5 font-sans">Click to view check-in history.</p>
                                )}
                            </div>
                            <ChevronRight className="h-5 w-5 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <button
                                onClick={() => setIsMindsetSheetOpen(true)}
                                className="w-full h-12 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:scale-[1.02] active:scale-[0.98] text-white shadow-[0_0_20px_rgba(124,58,237,0.25)] rounded-xl transition-all font-labels font-extrabold tracking-widest uppercase flex items-center justify-center gap-1.5"
                            >
                                Start Daily Check-in <ChevronRight className="h-4 w-4" />
                            </button>
                            <div className="flex justify-between px-6 py-2.5 border border-white/5 bg-brandDark/40 rounded-xl opacity-50 hover:opacity-100 transition-all duration-300 cursor-pointer" onClick={() => setIsMindsetSheetOpen(true)}>
                                {[CloudRain, Cloud, CloudSun, Sun, Sparkles].map((Icon, i) => (
                                    <Icon key={i} className="h-4 w-4 text-white/40 hover:text-purple-400 hover:scale-110 transition-all duration-200" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Sheets / Drawer Modals */}
            
            {/* Log Activity Sheet */}
            <Sheet open={isLogSheetOpen} onOpenChange={setIsLogSheetOpen}>
                <SheetContent side="bottom" className="h-[90vh] rounded-t-[32px] bg-brandDark/90 border-t border-white/10 text-white sm:max-w-md sm:mx-auto px-6 py-8 shadow-2xl backdrop-blur-xl">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2 text-2xl font-heading font-extrabold text-primaryAccent">
                            ⏱️ Log Activity
                        </SheetTitle>
                        <SheetDescription className="text-white/50 font-sans text-xs">
                            What comprehensible input did you immerse yourself in today?
                        </SheetDescription>
                    </SheetHeader>
                    <div className="overflow-y-auto max-h-[70vh] pr-1">
                        <LogActivityForm
                            userId={user?.id}
                            profile={profile}
                            onSuccess={handleActivitySuccess}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Mindset Sheet */}
            <Sheet open={isMindsetSheetOpen} onOpenChange={setIsMindsetSheetOpen}>
                <SheetContent side="bottom" className="h-[90vh] rounded-t-[32px] bg-brandDark/90 border-t border-white/10 text-white sm:max-w-md sm:mx-auto px-6 py-8 shadow-2xl backdrop-blur-xl">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2 text-2xl font-heading font-extrabold text-purple-400">
                            🧠 Daily Check-in
                        </SheetTitle>
                        <SheetDescription className="text-white/50 font-sans text-xs">
                            Log your emotional state, blockers, and mindset parameters.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="overflow-y-auto max-h-[70vh] pr-1">
                        <MindsetForm
                            userId={user?.id}
                            onSuccess={handleMindsetSuccess}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
