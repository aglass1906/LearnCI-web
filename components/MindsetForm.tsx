"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { Send, CloudRain, Cloud, CloudSun, Sun, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface MindsetFormProps {
    userId: string;
    // profile: any; // Not strictly needed for daily_feedback if we don't store minutes there, but good for context if needed later
    checkIn?: any; // If provided, we are in edit mode
    onSuccess?: () => void;
}

export function MindsetForm({ userId, checkIn, onSuccess }: MindsetFormProps) {
    const supabase = createClient();

    const [rating, setRating] = useState<number | null>(3);
    const [mindsetNote, setMindsetNote] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkInDate, setCheckInDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD

    // Helper map for display logic (if needed elsewhere)
    // 1: Struggling, 2: Need improvements, 3: Okay, 4: Good progress, 5: Feeling great!

    useEffect(() => {
        if (checkIn) {
            // Edit Mode
            setMindsetNote(checkIn.note || "");
            setRating(checkIn.rating || 3);
            setCheckInDate(new Date(checkIn.date).toISOString().slice(0, 10));
        } else {
            // New Mode - validation: default date today
            setCheckInDate(new Date().toISOString().slice(0, 10));
            setRating(null); // Force user to pick
            setMindsetNote("");
        }
    }, [checkIn]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        setIsSubmitting(true);

        // Handle Date timezone issue: set to Noon Local Time to avoid day shift
        const [y, m, d] = checkInDate.split("-").map(Number);
        const dateObj = new Date(y, m - 1, d, 12, 0, 0);

        // Construct payload for daily_feedback
        const payload = {
            rating: rating || 3,
            note: mindsetNote,
            date: dateObj.toISOString()
        };

        let error;

        if (checkIn?.id) {
            // Update
            const { error: updateError } = await supabase
                .from("daily_feedback")
                // @ts-ignore
                .update(payload)
                .eq("id", checkIn.id);
            error = updateError;
        } else {
            // Insert
            const { error: insertError } = await supabase
                .from("daily_feedback")
                // @ts-ignore
                .insert({
                    id: crypto.randomUUID(),
                    user_id: userId,
                    activity_type: "daily_mindset", // Optional tag
                    ...payload
                });
            error = insertError;
        }

        setIsSubmitting(false);

        if (error) {
            console.error("Mindset save error:", error);
            setStatus("Error saving.");
        } else {
            setStatus("Check-in saved! 🧠");
            if (onSuccess) {
                setTimeout(() => {
                    onSuccess();
                    setStatus(null);
                }, 1000);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
                <Label className="text-base font-semibold">Date</Label>
                <Input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
            </div>

            <div className="space-y-3">
                <Label className="text-base font-semibold">How do you feel?</Label>
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
                            <span className="text-[10px] font-bold uppercase tracking-wide hidden sm:block">{mood.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <Label className="text-base font-semibold">Notes</Label>
                <Textarea
                    placeholder="Any thoughts on your progress?"
                    value={mindsetNote}
                    onChange={(e) => setMindsetNote(e.target.value)}
                    className="min-h-[100px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-purple-500 resize-none rounded-xl p-4"
                />
            </div>

            <Button disabled={isSubmitting || !rating} type="submit" className="w-full h-12 text-lg gap-2 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/25 transition-all rounded-xl">
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                {checkIn ? "Update Check-in" : "Save Check-in"}
            </Button>

            {status && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-lg text-center text-sm font-medium animate-in fade-in">
                    {status}
                </div>
            )}
        </form>
    );
}
