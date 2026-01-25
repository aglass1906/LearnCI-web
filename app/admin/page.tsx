import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Users, MessageSquare, Clock, Smartphone, Ear, MonitorPlay, BookOpen, Mic } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getActivityConfig } from "@/utils/activity-types";

export default async function AdminDashboard() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Parallel data fetching
    const [
        { count: userCount },
        { count: mindsetCount },
        { count: activityCount },
        { data: recentMindset },
        { data: recentActivities }
    ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("coaching_check_ins").select("*", { count: "exact", head: true }),
        supabase.from("user_activities").select("*", { count: "exact", head: true }),
        supabase.from("coaching_check_ins").select("id, progress_sentiment, hours_milestone, date, user_id, profiles(name)").order("date", { ascending: false }).limit(5),
        supabase.from("user_activities").select("id, activity_type, minutes, comment, language, date, user_id, profiles(name)").order("date", { ascending: false }).limit(5)
    ]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userCount || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mindset Checks</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mindsetCount || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Activities Logged</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activityCount || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Recent Logs</h2>
                <Tabs defaultValue="activities" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                        <TabsTrigger value="activities">Activities ⏱️</TabsTrigger>
                        <TabsTrigger value="mindset">Mindset 🧠</TabsTrigger>
                    </TabsList>

                    <TabsContent value="activities" className="space-y-4 mt-4">
                        {recentActivities && recentActivities.length > 0 ? (
                            recentActivities.map((item: any) => {
                                const config = getActivityConfig(item.activity_type);
                                const Icon = config.icon;
                                return (
                                    <Card key={item.id} className="border-l-4 border-l-blue-500">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className={`p-3 rounded-full ${config.bg} ${config.color.replace('text-', 'text-opacity-100 ')}`}>
                                                <Icon className={`h-5 w-5 ${config.color}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <p className="font-semibold">{item.profiles?.name || "Anonymous"}</p>
                                                    <span className="text-sm font-bold text-blue-600">{item.minutes} min</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.activity_type} • {item.language || "Unknown"}
                                                </p>
                                                {item.comment && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">&quot;{item.comment}&quot;</p>}
                                            </div>
                                            <div className="text-xs text-muted-foreground self-start">
                                                {new Date(item.date).toLocaleDateString()}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center text-muted-foreground">
                                    No recent activities found.
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="mindset" className="space-y-4 mt-4">
                        {recentMindset && recentMindset.length > 0 ? (
                            recentMindset.map((item: any) => (
                                <Card key={item.id} className="border-l-4 border-l-purple-500">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{item.profiles?.name || "Anonymous"}</p>
                                            <p className="text-sm text-muted-foreground">{item.progress_sentiment || "No note"}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="font-bold text-lg text-purple-600">{item.hours_milestone}h</span>
                                            <span className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center text-muted-foreground">
                                    No recent mindset checks found.
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
