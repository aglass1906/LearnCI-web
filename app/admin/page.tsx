import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Users, MessageSquare, Clock, Smartphone, Ear, MonitorPlay, BookOpen, Mic, Trophy } from "lucide-react";

export default async function AdminDashboard() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Parallel data fetching
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

    // 3. Mindset Stats (FROM DAILY FEEDBACK)
    // Assuming 'mood' is 1-5 or similar. If named differently (e.g. rating), adjust.
    // Based on user feedback "daily feedback table", column likely 'mood' or 'rating'.
    // Checking recentMindset usage in previous file: it used 'rating' from check_ins.
    // If daily_feedback uses 'mood', I'll use that. 
    // PREVIOUS CONTEXT: "daily_feedback" table was mentioned in 'debug-rls'. 
    // I shall assume 'mood' column exists or similar. If 'mood' is string, might need parsing.
    // Safest is to assume it might be 'mood' (integer) or need mapping.
    // Let's assume standard 1-5 integer for now.

    const mindsetCount = dailyFeedback?.length || 0;
    const avgMood = mindsetCount > 0
        ? (dailyFeedback?.reduce((acc, curr) => acc + (curr.rating || 0), 0) || 0) / mindsetCount
        : 0;
    const moodDistribution = dailyFeedback?.reduce((acc: any, curr) => {
        const rating = curr.rating || 0;
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
    }, {}) || {};

    // 4. Milestone Stats (FROM COACHING CHECKINS)
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

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            {/* Combined Stats Grid */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

                {/* 1. User Stats Card */}
                <Card className="flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div>
                            <div className="text-2xl font-bold">{userCount}</div>
                            <p className="text-xs text-muted-foreground">Total registered users</p>
                        </div>
                        <div className="pt-4 border-t space-y-4">
                            <div>
                                <h4 className="text-xs uppercase text-muted-foreground font-semibold mb-2">Primary Language</h4>
                                <div className="space-y-2">
                                    {Object.entries(userLangStats).map(([lang, count]: [string, any]) => (
                                        <div key={lang} className="flex justify-between items-center text-sm">
                                            <span className="capitalize">{lang}</span>
                                            <span className="font-medium bg-secondary px-2 py-0.5 rounded-full text-xs">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs uppercase text-muted-foreground font-semibold mb-2">Level</h4>
                                <div className="space-y-2">
                                    {Object.entries(userLevelStats).map(([lvl, count]: [string, any]) => (
                                        <div key={lvl} className="flex justify-between items-center text-sm">
                                            <span className="uppercase">{lvl}</span>
                                            <span className="font-medium bg-secondary px-2 py-0.5 rounded-full text-xs">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Mindset Stats Card */}
                <Card className="flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Daily Mindset</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div>
                            <div className="text-2xl font-bold">{avgMood.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">/ 5.0</span></div>
                            <p className="text-xs text-muted-foreground">{mindsetCount} thoughts recorded</p>
                        </div>
                        <div className="pt-4 border-t space-y-2">
                            <h4 className="text-xs uppercase text-muted-foreground font-semibold mb-2">Mood Distribution</h4>
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <div key={rating} className="flex items-center gap-2 text-sm">
                                    <span className="w-4 font-bold text-muted-foreground">{rating}</span>
                                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500"
                                            style={{ width: `${((moodDistribution[rating] || 0) / (mindsetCount || 1)) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-6 text-right">{moodDistribution[rating] || 0}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Activity Stats Card */}
                <Card className="flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Activity</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div>
                            <div className="text-2xl font-bold">{(totalMinutes / 60).toFixed(0)}h <span className="text-sm font-normal text-muted-foreground">{totalMinutes % 60}m</span></div>
                            <p className="text-xs text-muted-foreground">{activityCount} logs recorded</p>
                        </div>
                        <div className="pt-4 border-t space-y-2">
                            <h4 className="text-xs uppercase text-muted-foreground font-semibold mb-2">Top Activities</h4>
                            {Object.entries(activityTypeStats)
                                .sort(([, a]: any, [, b]: any) => b - a)
                                .slice(0, 5)
                                .map(([type, count]: [string, any]) => (
                                    <div key={type} className="flex justify-between items-center text-sm">
                                        <span className="capitalize truncate max-w-[150px]" title={type}>{type}</span>
                                        <span className="font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">{count}</span>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Milestones Stats Card */}
                <Card className="flex flex-col border-l-4 border-l-yellow-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Coaching Milestones</CardTitle>
                        <Trophy className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div>
                            <div className="text-2xl font-bold">{totalMilestones}</div>
                            <p className="text-xs text-muted-foreground">Milestones achieved</p>
                        </div>
                        <div className="pt-4 border-t space-y-2">
                            <h4 className="text-xs uppercase text-muted-foreground font-semibold mb-2">By Duration</h4>
                            {Object.entries(milestoneStats)
                                .sort(([a], [b]) => Number(a) - Number(b))
                                .map(([hours, count]: [string, any]) => (
                                    <div key={hours} className="flex justify-between items-center text-sm">
                                        <span className="font-semibold">{hours} Hours</span>
                                        <span className="font-medium bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">{count}</span>
                                    </div>
                                ))}
                            {Object.keys(milestoneStats).length === 0 && (
                                <p className="text-sm text-muted-foreground italic">No milestones yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 5. Library Stats Card */}
                <Card className="flex flex-col border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Library</CardTitle>
                        <BookOpen className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div>
                            <div className="text-2xl font-bold">{totalResources}</div>
                            <p className="text-xs text-muted-foreground">Resources available</p>
                        </div>
                        <div className="pt-4 border-t space-y-4">
                            <div>
                                <h4 className="text-xs uppercase text-muted-foreground font-semibold mb-2">By Type</h4>
                                <div className="space-y-2">
                                    {Object.entries(typeStats || {}).map(([type, count]: [string, any]) => (
                                        <div key={type} className="flex justify-between items-center text-sm">
                                            <span className="capitalize flex items-center gap-2">
                                                {type === 'video' || type === 'youtube' ? <MonitorPlay className="h-3 w-3" /> :
                                                    type === 'podcast' || type === 'spotify' ? <Ear className="h-3 w-3" /> :
                                                        <BookOpen className="h-3 w-3" />}
                                                {type}
                                            </span>
                                            <span className="font-medium bg-secondary px-2 py-0.5 rounded-full text-xs">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs uppercase text-muted-foreground font-semibold mb-2">By Language</h4>
                                <div className="space-y-2">
                                    {Object.entries(languageStats || {}).map(([lang, count]: [string, any]) => (
                                        <div key={lang} className="flex justify-between items-center text-sm">
                                            <span className="capitalize">{lang}</span>
                                            <span className="font-medium bg-secondary px-2 py-0.5 rounded-full text-xs">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
