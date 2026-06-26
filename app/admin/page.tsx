import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { 
    Users, MessageSquare, Clock, MonitorPlay, BookOpen, Trophy, 
    GitBranch, Zap, ArrowRight 
} from "lucide-react";

export default async function AdminDashboard() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Parallel data fetching from Supabase
    const [
        { data: allProfiles },
        { data: allCheckIns }, // Milestones
        { data: dailyFeedback }, // Mindset/Mood
        { data: allActivities },
        { data: resources }
    ] = await Promise.all([
        supabase.from("profiles").select("id, current_language, current_level"),
        supabase.from("coaching_check_ins").select("id, hours_milestone"),
        supabase.from("daily_feedback").select("id, rating"),
        supabase.from("user_activities").select("id, activity_type, minutes, language, date"),
        supabase.from("learning_resources").select("id, type, language, status")
    ]);

    // --- Aggregation Logic ---

    // 1. User Stats
    const userCount = allProfiles?.length || 0;
    const userLangStats = allProfiles?.reduce((acc: any, curr) => {
        const lang = curr.current_language || 'Unknown';
        acc[lang] = (acc[lang] || 0) + 1;
        return acc;
    }, {}) || {};
    const userLevelStats = allProfiles?.reduce((acc: any, curr) => {
        const lvl = curr.current_level || 'Unknown';
        acc[lvl] = (acc[lvl] || 0) + 1;
        return acc;
    }, {}) || {};

    // 2. Activity Stats
    const activityCount = allActivities?.length || 0;
    const totalMinutes = allActivities?.reduce((acc, curr) => acc + (curr.minutes || 0), 0) || 0;
    const activityTypeStats = allActivities?.reduce((acc: any, curr) => {
        const type = curr.activity_type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {}) || {};

    // 3. Mindset Stats (Daily Feedback)
    const mindsetCount = dailyFeedback?.length || 0;
    const avgMood = mindsetCount > 0
        ? (dailyFeedback?.reduce((acc, curr) => acc + (curr.rating || 0), 0) || 0) / mindsetCount
        : 0;
    const moodDistribution = dailyFeedback?.reduce((acc: any, curr) => {
        const rating = curr.rating || 0;
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
    }, {}) || {};

    // 4. Milestone Stats (Coaching Check-ins)
    const milestoneCheckIns = allCheckIns?.filter(c => c.hours_milestone && c.hours_milestone > 0) || [];
    const totalMilestones = milestoneCheckIns.length;
    const milestoneStats = milestoneCheckIns.reduce((acc: any, curr) => {
        const milestone = curr.hours_milestone || 0;
        acc[milestone] = (acc[milestone] || 0) + 1;
        return acc;
    }, {}) || {};

    // 5. Library Stats
    const totalResources = resources?.length || 0;
    const typeStats = resources?.reduce((acc: any, curr) => {
        const type = curr.type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {}) || {};
    const languageStats = resources?.reduce((acc: any, curr) => {
        const lang = curr.language || 'Unknown';
        acc[lang] = (acc[lang] || 0) + 1;
        return acc;
    }, {}) || {};

    // Language display names
    const languageNames: Record<string, string> = {
        spanish: "Spanish",
        es: "Spanish",
        french: "French",
        fr: "French",
        german: "German",
        de: "German",
        italian: "Italian",
        it: "Italian",
        portuguese: "Portuguese",
        pt: "Portuguese",
        japanese: "Japanese",
        ja: "Japanese",
        mandarin: "Mandarin",
        zh: "Mandarin"
    };

    return (
        <div className="space-y-8 pb-12 relative z-10 max-w-7xl mx-auto">
            
            {/* 1. Header Command Area */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-primaryAccent animate-pulse"></span>
                        Overview Console
                    </h1>
                    <p className="text-white/55 font-sans text-sm mt-1.5 max-w-xl">
                        Monitor active learner statistics, pipeline processing states, and content library metrics in real-time.
                    </p>
                </div>
            </header>

            {/* 2. Admin Command Center Quick Actions */}
            <div className="space-y-3">
                <h2 className="font-labels text-[9px] tracking-widest text-white/40 uppercase font-extrabold">
                    Admin Command Center
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <Link href="/admin/pipeline" className="group">
                        <div className="glass-card p-5 border border-white/5 rounded-[24px] relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:bg-white/[0.01] hover:border-accentTeal/30 hover:shadow-lg hover:shadow-accentTeal/5 flex flex-col justify-between h-36">
                            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(0,229,255,0.05)_0%,rgba(0,229,255,0)_70%)] blur-[25px] pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity"></div>
                            <div className="flex justify-between items-start relative z-10">
                                <span className="p-2 rounded-xl bg-accentTeal/10 border border-accentTeal/20 text-accentTeal">
                                    <GitBranch className="h-5 w-5" />
                                </span>
                                <ArrowRight className="h-4 w-4 text-white/25 group-hover:text-accentTeal group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <div className="relative z-10 text-left">
                                <h3 className="font-heading text-sm font-extrabold text-white uppercase tracking-wider">Pipeline Workspace</h3>
                                <p className="text-[10px] text-white/40 font-sans mt-1 leading-relaxed">Review and edit AI-generated story drafts.</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/stories" className="group">
                        <div className="glass-card p-5 border border-white/5 rounded-[24px] relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:bg-white/[0.01] hover:border-primaryAccent/30 hover:shadow-lg hover:shadow-primaryAccent/5 flex flex-col justify-between h-36">
                            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(255,160,0,0.04)_0%,rgba(255,160,0)_70%)] blur-[25px] pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity"></div>
                            <div className="flex justify-between items-start relative z-10">
                                <span className="p-2 rounded-xl bg-primaryAccent/10 border border-primaryAccent/20 text-primaryAccent">
                                    <BookOpen className="h-5 w-5" />
                                </span>
                                <ArrowRight className="h-4 w-4 text-white/25 group-hover:text-primaryAccent group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <div className="relative z-10 text-left">
                                <h3 className="font-heading text-sm font-extrabold text-white uppercase tracking-wider">Live Stories Cockpit</h3>
                                <p className="text-[10px] text-white/40 font-sans mt-1 leading-relaxed">Modify live texts, translations, and notes.</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/functions" className="group">
                        <div className="glass-card p-5 border border-white/5 rounded-[24px] relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:bg-white/[0.01] hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 flex flex-col justify-between h-36">
                            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(168,85,247,0.05)_0%,rgba(168,85,247,0)_70%)] blur-[25px] pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity"></div>
                            <div className="flex justify-between items-start relative z-10">
                                <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                    <Zap className="h-5 w-5" />
                                </span>
                                <ArrowRight className="h-4 w-4 text-white/25 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <div className="relative z-10 text-left">
                                <h3 className="font-heading text-sm font-extrabold text-white uppercase tracking-wider">Edge Functions</h3>
                                <p className="text-[10px] text-white/40 font-sans mt-1 leading-relaxed">Monitor and trigger generation runs.</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/users" className="group">
                        <div className="glass-card p-5 border border-white/5 rounded-[24px] relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:bg-white/[0.01] hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 flex flex-col justify-between h-36">
                            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(59,130,246,0.05)_0%,rgba(59,130,246,0)_70%)] blur-[25px] pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity"></div>
                            <div className="flex justify-between items-start relative z-10">
                                <span className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                    <Users className="h-5 w-5" />
                                </span>
                                <ArrowRight className="h-4 w-4 text-white/25 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <div className="relative z-10 text-left">
                                <h3 className="font-heading text-sm font-extrabold text-white uppercase tracking-wider">User Console</h3>
                                <p className="text-[10px] text-white/40 font-sans mt-1 leading-relaxed">Manage registrations and check suspend states.</p>
                            </div>
                        </div>
                    </Link>

                </div>
            </div>

            {/* 3. Bento Stats Grid */}
            <div className="space-y-3 pt-4">
                <h2 className="font-labels text-[9px] tracking-widest text-white/40 uppercase font-extrabold">
                    System Analytics & Aggregations
                </h2>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">

                    {/* A. Learner Demographics Card */}
                    <div className="glass-card rounded-[28px] p-6 border border-white/5 relative overflow-hidden shadow-xl flex flex-col justify-between">
                        <div className="absolute top-[-25%] left-[-25%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(56,97,251,0.03)_0%,rgba(56,97,251,0)_70%)] blur-[40px] pointer-events-none"></div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-start border-b border-white/5 pb-4">
                                <div className="text-left">
                                    <span className="block font-labels text-[8px] text-white/35 tracking-widest uppercase font-extrabold">Learner Base</span>
                                    <span className="font-heading text-3xl font-extrabold text-white mt-1 block">
                                        {userCount} <span className="text-xs font-normal font-sans text-white/40">registered</span>
                                    </span>
                                </div>
                                <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50">
                                    <Users className="h-5 w-5" />
                                </span>
                            </div>

                            {/* Sub-distributions */}
                            <div className="space-y-4 pt-2 text-left">
                                <div>
                                    <h4 className="font-labels text-[8px] tracking-widest uppercase text-white/30 font-extrabold mb-2.5">Primary Language</h4>
                                    <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/5">
                                        {Object.entries(userLangStats).map(([lang, count]: [string, any]) => (
                                            <div key={lang} className="flex justify-between items-center text-xs font-sans font-semibold">
                                                <span className="text-white/60 capitalize">{languageNames[lang.toLowerCase()] || lang}</span>
                                                <span className="font-labels text-[9px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-white/70">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-labels text-[8px] tracking-widest uppercase text-white/30 font-extrabold mb-2.5">Comprehension Level</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(userLevelStats).map(([lvl, count]: [string, any]) => (
                                            <div key={lvl} className="bg-white/[0.01] border border-white/5 rounded-xl p-2.5 text-center">
                                                <span className="block text-[8px] font-labels tracking-widest uppercase text-white/40 font-extrabold">{lvl}</span>
                                                <span className="font-heading text-sm font-extrabold text-primaryAccent mt-1 block">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* B. Daily Mindset Card */}
                    <div className="glass-card rounded-[28px] p-6 border border-white/5 relative overflow-hidden shadow-xl flex flex-col justify-between">
                        <div className="absolute top-[-25%] left-[-25%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(168,85,247,0.03)_0%,rgba(168,85,247,0)_70%)] blur-[40px] pointer-events-none"></div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-start border-b border-white/5 pb-4">
                                <div className="text-left">
                                    <span className="block font-labels text-[8px] text-purple-400 tracking-widest uppercase font-extrabold">Mindset & Mood</span>
                                    <span className="font-heading text-3xl font-extrabold text-white mt-1 block">
                                        {avgMood.toFixed(1)} <span className="text-xs font-normal font-sans text-white/40">/ 5.0 avg</span>
                                    </span>
                                </div>
                                <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                    <MessageSquare className="h-5 w-5" />
                                </span>
                            </div>

                            <div className="space-y-2.5 pt-2 text-left">
                                <h4 className="font-labels text-[8px] tracking-widest uppercase text-white/30 font-extrabold mb-1">{mindsetCount} Thoughts Logged</h4>
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <div key={rating} className="flex items-center gap-3 text-xs">
                                        <span className="w-3 font-bold text-white/40 text-center">{rating}</span>
                                        <div className="flex-1 h-1.5 bg-white/5 border border-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                                                style={{ width: `${((moodDistribution[rating] || 0) / (mindsetCount || 1)) * 100}%` }}
                                            />
                                        </div>
                                        <span className="font-labels text-[9px] text-white/50 w-6 text-right font-extrabold">{moodDistribution[rating] || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* C. Learning Activity Card */}
                    <div className="glass-card rounded-[28px] p-6 border border-white/5 relative overflow-hidden shadow-xl flex flex-col justify-between">
                        <div className="absolute top-[-25%] left-[-25%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(56,97,251,0.03)_0%,rgba(56,97,251,0)_70%)] blur-[40px] pointer-events-none"></div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-start border-b border-white/5 pb-4">
                                <div className="text-left">
                                    <span className="block font-labels text-[8px] text-white/35 tracking-widest uppercase font-extrabold">Active Study Time</span>
                                    <span className="font-heading text-3xl font-extrabold text-white mt-1 block">
                                        {(totalMinutes / 60).toFixed(0)}h <span className="text-xs font-normal font-sans text-white/40">{totalMinutes % 60}m logged</span>
                                    </span>
                                </div>
                                <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50">
                                    <Clock className="h-5 w-5" />
                                </span>
                            </div>

                            <div className="space-y-3.5 pt-2 text-left">
                                <h4 className="font-labels text-[8px] tracking-widest uppercase text-white/30 font-extrabold mb-1">{activityCount} total entries</h4>
                                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/5">
                                    {Object.entries(activityTypeStats)
                                        .sort(([, a]: any, [, b]: any) => b - a)
                                        .slice(0, 5)
                                        .map(([type, count]: [string, any]) => (
                                            <div key={type} className="flex justify-between items-center text-xs font-sans font-semibold">
                                                <span className="text-white/60 capitalize truncate max-w-[150px]">{type}</span>
                                                <span className="font-labels text-[9px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-white/70">{count} logs</span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* D. Coaching Milestones Card */}
                    <div className="glass-card rounded-[28px] p-6 border border-white/5 relative overflow-hidden shadow-xl flex flex-col justify-between">
                        <div className="absolute top-[-25%] left-[-25%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(255,160,0,0.03)_0%,rgba(255,160,0)_70%)] blur-[40px] pointer-events-none"></div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-start border-b border-white/5 pb-4">
                                <div className="text-left">
                                    <span className="block font-labels text-[8px] text-primaryAccent tracking-widest uppercase font-extrabold">Coaching Achievements</span>
                                    <span className="font-heading text-3xl font-extrabold text-white mt-1 block">
                                        {totalMilestones} <span className="text-xs font-normal font-sans text-white/40">milestones reached</span>
                                    </span>
                                </div>
                                <span className="p-2 rounded-xl bg-primaryAccent/10 border border-primaryAccent/20 text-primaryAccent">
                                    <Trophy className="h-5 w-5" />
                                </span>
                            </div>

                            <div className="space-y-2.5 pt-2 text-left">
                                <h4 className="font-labels text-[8px] tracking-widest uppercase text-white/30 font-extrabold mb-1">By Hour Milestone</h4>
                                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/5">
                                    {Object.entries(milestoneStats)
                                        .sort(([a], [b]) => Number(a) - Number(b))
                                        .map(([hours, count]: [string, any]) => (
                                            <div key={hours} className="flex justify-between items-center text-xs font-sans font-semibold">
                                                <span className="text-white/60">{hours} Hours</span>
                                                <span className="font-labels text-[9px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-white/70">{count} learners</span>
                                            </div>
                                        ))}
                                    {Object.keys(milestoneStats).length === 0 && (
                                        <div className="text-xs text-white/40 italic py-4 text-center">
                                            No milestones logged in the system.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* E. Library Catalog Card */}
                    <div className="glass-card rounded-[28px] p-6 border border-white/5 relative overflow-hidden shadow-xl flex flex-col justify-between md:col-span-2">
                        <div className="absolute top-[-25%] left-[-25%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(56,97,251,0.03)_0%,rgba(56,97,251,0)_70%)] blur-[40px] pointer-events-none"></div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-start border-b border-white/5 pb-4">
                                <div className="text-left">
                                    <span className="block font-labels text-[8px] text-white/35 tracking-widest uppercase font-extrabold">Media Library Catalog</span>
                                    <span className="font-heading text-3xl font-extrabold text-white mt-1 block">
                                        {totalResources} <span className="text-xs font-normal font-sans text-white/40">active immersion assets</span>
                                    </span>
                                </div>
                                <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50">
                                    <BookOpen className="h-5 w-5" />
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 text-left">
                                <div>
                                    <h4 className="font-labels text-[8px] tracking-widest uppercase text-white/30 font-extrabold mb-2.5">By Asset Type</h4>
                                    <div className="space-y-2">
                                        {Object.entries(typeStats || {}).map(([type, count]: [string, any]) => (
                                            <div key={type} className="flex justify-between items-center text-xs font-sans font-semibold">
                                                <span className="text-white/60 capitalize flex items-center gap-1.5">
                                                    {type === 'video' || type === 'youtube' ? <MonitorPlay className="h-3.5 w-3.5 text-accentTeal" /> :
                                                     <BookOpen className="h-3.5 w-3.5 text-primaryAccent" />}
                                                    {type}
                                                </span>
                                                <span className="font-labels text-[9px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-white/70">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-labels text-[8px] tracking-widest uppercase text-white/30 font-extrabold mb-2.5">By Language</h4>
                                    <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/5">
                                        {Object.entries(languageStats || {}).map(([lang, count]: [string, any]) => (
                                            <div key={lang} className="flex justify-between items-center text-xs font-sans font-semibold">
                                                <span className="text-white/60 capitalize">{languageNames[lang.toLowerCase()] || lang}</span>
                                                <span className="font-labels text-[9px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-white/70">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}
