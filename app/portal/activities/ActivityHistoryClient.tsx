"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getActivityConfig } from "@/utils/activity-types";
import { Calendar, Filter, BarChart3, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MoreVertical, Pencil, Trash, X } from "lucide-react";
import { LogActivityForm } from "@/components/LogActivityForm";
import { createClient } from "@/utils/supabase/client";

interface Activity {
    id: string;
    activity_type: string;
    minutes: number;
    date: string;
    language: string;
    comment?: string;
}

interface ActivityHistoryClientProps {
    initialActivities: Activity[];
    userId: string;
    profile: any;
}

export default function ActivityHistoryClient({ initialActivities, userId, profile }: ActivityHistoryClientProps) {
    const supabase = createClient();
    const [activities, setActivities] = useState(initialActivities); // Local state for immediate updates
    const [timeRange, setTimeRange] = useState("today"); // today, 7d, 30d, all
    const [typeFilter, setTypeFilter] = useState("all");

    // Edit Sheet State
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

    const handleDelete = async (id: string) => {
        // Optimistic update
        setActivities(prev => prev.filter(a => a.id !== id));

        const { error } = await supabase.from("user_activities").delete().eq("id", id);
        if (error) {
            console.error("Delete failed:", error);
            // Revert if needed, but for now assuming success or minor glitch
            // Ideally we'd re-fetch or use SWR/React Query
        }
    };

    const handleEditSuccess = () => {
        setIsEditSheetOpen(false);
        setEditingActivity(null);
        // In a real app with SWR/swr-subscription, this would auto-update.
        // For now, we'll refresh the page to fetch latest data to prevent stale state issues
        // or we could optimistically update local state if we had the new object.
        location.reload();
    };

    // --- Filter Logic ---
    const filteredActivities = useMemo(() => {
        let filtered = [...activities];

        // 1. Date Filter
        const now = new Date();
        const past = new Date();

        // Normalize 'now' to start of day for consistent lookback? 
        // Actually, just ensuring 'past' is start of day is enough to capture the full window.

        if (timeRange === "today") {
            past.setHours(0, 0, 0, 0); // Start of today
            filtered = filtered.filter(a => new Date(a.date) >= past);
        } else if (timeRange === "7d") {
            past.setDate(now.getDate() - 6); // Today + 6 previous days = 7 days
            past.setHours(0, 0, 0, 0);
            filtered = filtered.filter(a => new Date(a.date) >= past);
        } else if (timeRange === "30d") {
            past.setDate(now.getDate() - 29); // Today + 29 previous days = 30 days
            past.setHours(0, 0, 0, 0);
            filtered = filtered.filter(a => new Date(a.date) >= past);
        }

        // 2. Type Filter (Only affects list, usually chart communicates ALL types unless filtered, but user expects filter to apply. Let's make filter apply to chart too for consistency)
        if (typeFilter !== "all") {
            filtered = filtered.filter(a => a.activity_type === typeFilter);
        }

        return filtered;
    }, [activities, timeRange, typeFilter]);

    // --- Summary Stats ---
    const totalMinutes = filteredActivities.reduce((acc, curr) => acc + (curr.minutes || 0), 0);

    // --- Aggregated Data for List View (Dashboard Style) ---
    const aggregatedData = useMemo(() => {
        if (timeRange === "all" && filteredActivities.length === 0) return [];

        const byType: { [key: string]: number } = {};
        filteredActivities.forEach(act => {
            byType[act.activity_type] = (byType[act.activity_type] || 0) + act.minutes;
        });

        return Object.entries(byType)
            .sort(([, a], [, b]) => b - a)
            .map(([type, mins]) => {
                const config = getActivityConfig(type);
                return {
                    type,
                    minutes: mins,
                    percent: totalMinutes > 0 ? (mins / totalMinutes) * 100 : 0,
                    Icon: config?.icon || Clock,
                    color: config?.color || "text-gray-500"
                };
            });
    }, [filteredActivities, totalMinutes, timeRange]);

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <Tabs value={timeRange} onValueChange={setTimeRange} className="w-full sm:w-auto">
                    <TabsList>
                        <TabsTrigger value="today">Today</TabsTrigger>
                        <TabsTrigger value="7d">7 Days</TabsTrigger>
                        <TabsTrigger value="30d">30 Days</TabsTrigger>
                        <TabsTrigger value="all">All Time</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="All Activities" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Activities</SelectItem>
                            <SelectItem value="Listening">Listening</SelectItem>
                            <SelectItem value="Reading">Reading</SelectItem>
                            <SelectItem value="Speaking">Speaking</SelectItem>
                            <SelectItem value="Watch">Watch</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    onClick={() => {
                        setEditingActivity(null);
                        setIsEditSheetOpen(true);
                    }}
                    className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                    <Clock className="h-4 w-4" />
                    Log Activity
                </Button>
            </div>

            {/* Summary Graphic (List with Progress Bars) */}
            {
                timeRange !== "all" && (
                    <div className="w-full rounded-xl shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-muted-foreground font-medium mb-1">
                                        Total Time
                                        <span className="ml-2 text-sm font-normal text-muted-foreground/70">
                                            {timeRange === 'today'
                                                ? new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                                : `${new Date(new Date().setDate(new Date().getDate() - (timeRange === '7d' ? 6 : 29))).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                                            }
                                        </span>
                                    </p>
                                    <h2 className="text-4xl font-bold flex items-baseline gap-2 text-foreground">
                                        {(totalMinutes / 60).toFixed(1)} <span className="text-lg font-normal text-muted-foreground">hrs</span>
                                    </h2>
                                </div>
                                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                                    <Clock className="h-6 w-6 text-primary" />
                                </div>
                            </div>

                            {/* Chart List Area */}
                            {aggregatedData.length > 0 ? (
                                <div className="space-y-4">
                                    {aggregatedData.map((item) => (
                                        <div key={item.type} className="space-y-1">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span className="flex items-center gap-2">
                                                    <span className={`p-1 rounded-md bg-opacity-10 ${item.color.replace("text-", "bg-")}`}>
                                                        <item.Icon className={`h-4 w-4 ${item.color}`} />
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
                                <div className="py-8 text-center text-muted-foreground">
                                    No activities found for this period.
                                </div>
                            )}
                        </div>
                    </div>
                )
            }



            {/* List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-muted-foreground uppercase tracking-wider text-xs px-1">
                    {filteredActivities.length} Sessions
                </h3>
                {filteredActivities.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No activities found for this period.</p>
                    </div>
                ) : (
                    filteredActivities.map((item) => {
                        const config = getActivityConfig(item.activity_type);
                        const Icon = config.icon;
                        return (
                            <Card key={item.id} className="group overflow-hidden border-l-4 hover:shadow-md transition-shadow relative"
                                style={{ borderLeftColor: config.color.replace('text-', '').replace('-500', '').replace('-600', '') === 'teal' ? '#14b8a6' : undefined }}>
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={`p-3 rounded-full shrink-0 ${config.bg}`}>
                                        <Icon className={`h-5 w-5 ${config.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-8">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="font-semibold text-base truncate">
                                                {item.activity_type}
                                            </h3>
                                            <span className="font-bold text-primary/80 bg-primary/10 px-2 py-0.5 rounded text-sm">
                                                {item.minutes} min
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(item.date).toLocaleString(undefined, {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            {item.language && (
                                                <span className="uppercase font-medium text-xs border px-1 rounded">
                                                    {item.language}
                                                </span>
                                            )}
                                        </div>
                                        {item.comment && (
                                            <p className="text-sm text-slate-500 mt-2 line-clamp-1 italic">
                                                &quot;{item.comment}&quot;
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Menu */}
                                    <div className="absolute top-4 right-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => {
                                                    setEditingActivity(item);
                                                    setIsEditSheetOpen(true);
                                                }}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(item.id)}>
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Edit Sheet */}
            <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
                <SheetContent side="bottom" className="h-[90vh] rounded-t-[20px] sm:max-w-md sm:mx-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2 text-2xl">
                            {editingActivity ? "✏️ Edit Activity" : "⏱️ Log Activity"}
                        </SheetTitle>
                    </SheetHeader>
                    {(isEditSheetOpen) && (
                        <LogActivityForm
                            userId={userId}
                            profile={profile}
                            initialData={editingActivity}
                            onSuccess={handleEditSuccess}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div >
    );
}
