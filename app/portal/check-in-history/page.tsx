"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MindsetForm } from "@/components/MindsetForm";
import { ArrowLeft, Plus, Pencil, Trash2, Calendar, CloudRain, Cloud, CloudSun, Sun, Sparkles, Loader2, Trophy, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CoachingHistoryPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);

    // Data
    const [dailyFeedback, setDailyFeedback] = useState<any[]>([]);
    const [milestones, setMilestones] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);

    // Sheet State
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null); // null = new mode

    // Delete State
    const [deleteItem, setDeleteItem] = useState<any>(null);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }
            setUser(session.user);

            // Fetch Daily Feedback
            const { data: feedbackData, error: feedbackError } = await supabase
                .from("daily_feedback")
                .select("*")
                .eq("user_id", session.user.id)
                .order("date", { ascending: false });

            if (feedbackError) console.error("Feedback fetch error:", feedbackError);
            if (feedbackData) setDailyFeedback(feedbackData);

            // Fetch Milestones
            const { data: milestoneData, error: milestoneError } = await supabase
                .from("coaching_check_ins")
                .select("*")
                .eq("user_id", session.user.id)
                .order("date", { ascending: false });

            if (milestoneError) console.error("Milestone fetch error:", milestoneError);
            if (milestoneData) setMilestones(milestoneData);
        } catch (error) {
            console.error("Critical error in fetchHistory:", error);
        } finally {
            setLoading(false);
        }
    }, [supabase, router]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setIsSheetOpen(true);
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setIsSheetOpen(true);
    };

    const handleSuccess = () => {
        setIsSheetOpen(false);
        fetchHistory(); // Refresh list
    };

    const handleDelete = async () => {
        if (!deleteItem) return;
        await supabase.from("daily_feedback").delete().eq("id", deleteItem.id);
        setDeleteItem(null);
        fetchHistory();
    };

    // Helper for mood icon with numeric rating
    const getMoodIcon = (rating: number) => {
        if (rating === 1) return { icon: CloudRain, color: "text-gray-500", bg: "bg-gray-100", label: "Bad" };
        if (rating === 2) return { icon: Cloud, color: "text-blue-500", bg: "bg-blue-100", label: "Struggling" };
        if (rating === 3) return { icon: CloudSun, color: "text-orange-500", bg: "bg-orange-100", label: "Good" };
        if (rating === 4) return { icon: Sun, color: "text-yellow-500", bg: "bg-yellow-100", label: "Great" };
        if (rating === 5) return { icon: Sparkles, color: "text-yellow-400", bg: "bg-yellow-100", label: "Amazing" };
        return { icon: Cloud, color: "text-gray-400", bg: "bg-gray-100", label: "Unknown" };
    };

    if (loading && !user) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-4 pb-20">
            <div className="max-w-md mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">History</h1>
                    <div className="w-10"></div> {/* Spacer for alignment or actions */}
                </div>

                <Tabs defaultValue="mindset" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="mindset">Mindset</TabsTrigger>
                        <TabsTrigger value="milestones">Milestones</TabsTrigger>
                    </TabsList>

                    {/* Mindset Tab */}
                    <TabsContent value="mindset" className="space-y-4">
                        <div className="flex justify-end mb-2">
                            <Button size="sm" onClick={handleAddNew} className="rounded-full gap-1">
                                <Plus className="h-4 w-4" /> Log New
                            </Button>
                        </div>

                        {dailyFeedback.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground bg-slate-100 dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800">
                                <CloudSun className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                <p>No check-ins yet.</p>
                                <p className="text-xs mt-1">Log your first daily mindset!</p>
                            </div>
                        ) : (
                            dailyFeedback.map((item) => {
                                const { icon: MoodIcon, color, bg, label } = getMoodIcon(item.rating);
                                return (
                                    <Card key={item.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: color.includes("gray") ? "#6b7280" : color.includes("blue") ? "#3b82f6" : color.includes("orange") ? "#f97316" : "#eab308" }}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl ${bg} dark:bg-opacity-10`}>
                                                        <MoodIcon className={`h-6 w-6 ${color}`} />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-lg">{label}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEdit(item)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteItem(item)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {item.note && (
                                                <div className="mt-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                                    &quot;{item.note}&quot;
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </TabsContent>

                    {/* Milestones Tab */}
                    <TabsContent value="milestones" className="space-y-4">
                        {milestones.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground bg-slate-100 dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800">
                                <Trophy className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                <p>No milestones reached yet.</p>
                                <p className="text-xs mt-1">Keep learning to hit your first 25h!</p>
                            </div>
                        ) : (
                            milestones.map((item) => (
                                <Card key={item.id} className="border-l-4 border-l-purple-500">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                                    {item.hours_milestone} Hours Reached
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1 mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(item.date).toLocaleDateString()}
                                                </CardDescription>
                                            </div>
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {item.progress_sentiment && (
                                                <div className="text-sm font-medium">
                                                    Sentiment: <span className="font-normal text-muted-foreground">{item.progress_sentiment}</span>
                                                </div>
                                            )}
                                            {item.next_cycle_plan && (
                                                <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg text-sm border border-purple-100 dark:border-purple-900/30">
                                                    <strong>Next Cycle:</strong> {item.next_cycle_plan}
                                                </div>
                                            )}
                                            {item.notes && (
                                                <div className="text-sm text-muted-foreground italic border-t pt-2 mt-2">
                                                    &quot;{item.notes}&quot;
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Edit/Add Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="bottom" className="h-[90vh] rounded-t-[20px] sm:max-w-md sm:mx-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="flex items-center gap-2 text-2xl">
                            {editingItem ? "✏️ Edit Mindset" : "🧠 New Mindset"}
                        </SheetTitle>
                        <SheetDescription>
                            Reflect on your progress.
                        </SheetDescription>
                    </SheetHeader>
                    {user && (
                        <MindsetForm
                            userId={user.id}
                            checkIn={editingItem}
                            onSuccess={handleSuccess}
                        />
                    )}
                </SheetContent>
            </Sheet>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
                <AlertDialogContent className="max-w-[90%] rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Mindset Log?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
