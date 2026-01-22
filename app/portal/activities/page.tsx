"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { getActivityConfig } from "@/utils/activity-types";
import { useRouter } from "next/navigation";
import { Loader2, Calendar, Cloud, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ActivitiesPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);

    const fetchActivities = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }
            setUser(session.user);

            const { data, error } = await supabase
                .from("user_activities")
                .select("*")
                .eq("user_id", session.user.id)
                .order("date", { ascending: false });

            if (error) {
                console.error("Error fetching activities:", error);
            } else {
                setActivities(data || []);
            }
        } catch (error) {
            console.error("Critical error fetching activities:", error);
        } finally {
            setLoading(false);
        }
    }, [supabase, router]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    if (loading && !user) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Activity History</h1>
            </div>

            {activities.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-slate-100 dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-1">No activities logged yet</h3>
                    <p className="mb-4">Start tracking your immersion to see your history here.</p>
                    <Button onClick={() => router.push("/portal")}>
                        Go to Dashboard to Log
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {activities.map((item) => {
                        const config = getActivityConfig(item.activity_type);
                        const Icon = config.icon;

                        return (
                            <Card key={item.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: config.color.replace('text-', '').replace('-500', '').replace('-600', '') === 'teal' ? '#14b8a6' : undefined }}>
                                {/* Note: The border color logic above is a bit hacky due to dynamic classes. 
                                Ideally we'd use style attribute or a more robust mapping for borders if not using standard tailwind classes dynamically. 
                                For closely matching the existing design, we can rely on the classNames if they are safe-listed or use the config.border.
                            */}
                                <CardContent className="p-4 flex items-start gap-4">
                                    <div className={`p-3 rounded-full mt-1 shrink-0 ${config.bg}`}>
                                        <Icon className={`h-5 w-5 ${config.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-lg truncate pr-2">
                                                {item.activity_type}
                                            </h3>
                                            <span className="font-bold whitespace-nowrap text-primary/80 bg-primary/10 px-2 py-0.5 rounded-md text-sm">
                                                {item.minutes} min
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(item.date).toLocaleDateString(undefined, {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            {item.language && (
                                                <span className="uppercase tracking-wider font-medium px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                                    {item.language}
                                                </span>
                                            )}
                                        </div>

                                        {item.comment && (
                                            <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 italic">
                                                &quot;{item.comment}&quot;
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
