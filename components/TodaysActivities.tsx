"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACTIVITY_TYPES } from "@/utils/activity-types";

interface TodaysActivitiesProps {
    userId: string;
    onAddClick: () => void;
    refreshTrigger?: number; // Prop to trigger refetch
}

export function TodaysActivities({ userId, onAddClick, refreshTrigger }: TodaysActivitiesProps) {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (userId) fetchActivities();
    }, [userId, refreshTrigger]);

    const fetchActivities = async () => {
        setLoading(true);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from("user_activities")
            .select("*")
            .eq("user_id", userId)
            .gte("date", today.toISOString())
            .order("date", { ascending: false });

        if (error) {
            console.error("Error fetching today's activities:", error);
        } else {
            setActivities(data || []);
        }
        setLoading(false);
    };

    // Aggregate data for chart
    const totalMinutes = activities.reduce((acc, curr) => acc + (curr.minutes || 0), 0);
    const byType: { [key: string]: number } = {};
    activities.forEach(act => {
        byType[act.activity_type] = (byType[act.activity_type] || 0) + act.minutes;
    });

    const chartData = Object.entries(byType)
        .sort(([, a], [, b]) => b - a)
        .map(([type, mins]) => {
            const config = ACTIVITY_TYPES.find(t => t.id === type);
            return {
                type,
                minutes: mins,
                percent: totalMinutes > 0 ? (mins / totalMinutes) * 100 : 0,
                Icon: config?.icon || Clock, // Use component reference
                color: config?.color || "text-gray-500"
            };
        });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">Total Input Today</p>
                </div>
                <Button onClick={onAddClick} size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1 rounded-full px-4">
                    <Plus className="h-4 w-4" /> Add
                </Button>
            </div>

            {/* Chart Area */}
            {chartData.length > 0 ? (
                <div className="space-y-3">
                    {chartData.map((item) => (
                        <div key={item.type} className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="flex items-center gap-1.5">
                                    <span className="text-base">
                                        <item.Icon className="h-4 w-4" />
                                    </span>
                                    {item.type}
                                </span>
                                <span>{item.minutes}m</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${item.color.replace("text-", "bg-")}`}
                                    style={{ width: `${item.percent}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-6 text-center text-sm text-muted-foreground bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                    No activities logged today yet.
                </div>
            )}

            {/* List Area */}
            <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Recent Logs</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {activities.map((act) => {
                        const typeConfig = ACTIVITY_TYPES.find(t => t.id === act.activity_type);
                        const TypeIcon = typeConfig?.icon || Clock;

                        return (
                            <div key={act.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-opacity-10 ${typeConfig?.color?.replace("text-", "bg-") || "bg-gray-100"}`}>
                                        <TypeIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm">{act.activity_type}</div>
                                        {act.comment && <div className="text-xs text-muted-foreground max-w-[150px] truncate">{act.comment}</div>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-sm">{act.minutes}m</div>
                                    <div className="text-[10px] text-muted-foreground">
                                        {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #cbd5e1;
                  border-radius: 4px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #334155;
                }
            `}</style>
        </div>
    );
}
