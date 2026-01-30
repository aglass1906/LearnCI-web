"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { Send, Clock } from "lucide-react";
import { useState } from "react";
import { ACTIVITY_TYPES } from "@/utils/activity-types";
import { useRouter } from "next/navigation";

interface LogActivityFormProps {
    userId: string;
    profile: any;
    initialData?: any; // Activity object to edit
    onSuccess?: () => void;
}

export function LogActivityForm({ userId, profile, initialData, onSuccess }: LogActivityFormProps) {
    const supabase = createClient();

    const [selectedActivity, setSelectedActivity] = useState(initialData?.activity_type || "App Learning");
    // Normalize minutes to string for input
    const [minutes, setMinutes] = useState(initialData?.minutes ? String(initialData.minutes) : "");
    const [activityNote, setActivityNote] = useState(initialData?.comment || "");
    const [activityStatus, setActivityStatus] = useState<string | null>(null);

    // Initial Date (YYYY-MM-DDTHH:mm) for datetime-local
    // Initial Date (YYYY-MM-DDTHH:mm) for datetime-local
    // We need to adjust for the local timezone offset to display the correct local time
    const toLocalISO = (date: Date) => {
        const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
        const localTime = new Date(date.getTime() - offset);
        return localTime.toISOString().slice(0, 16);
    };

    const defaultDate = initialData?.date
        ? toLocalISO(new Date(initialData.date))
        : toLocalISO(new Date());

    const handleActivitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        const formData = new FormData(e.target as HTMLFormElement);
        const dateVal = formData.get("activityDate") as string;
        const languageVal = formData.get("language") as string;

        const payload = {
            user_id: userId,
            activity_type: selectedActivity,
            minutes: parseInt(minutes) || 0,
            comment: activityNote,
            language: languageVal || profile?.current_language || "Spanish",
            date: dateVal ? new Date(dateVal).toISOString() : new Date().toISOString()
        };

        let error;

        if (initialData?.id) {
            // Update existing
            const { error: updateError } = await supabase
                .from("user_activities")
                // @ts-ignore
                // @ts-ignore
                .update(payload)
                .eq("id", initialData.id);
            error = updateError;
        } else {
            // Insert new
            const { error: insertError } = await supabase
                .from("user_activities")
                // @ts-ignore
                .insert(payload);
            error = insertError;
        }

        if (error) {
            console.error("Activity Save Error:", error);
            setActivityStatus("Error saving.");
        } else {
            setActivityStatus(initialData ? "Activity updated! ✅" : "Activity logged! ⏱️");
            if (!initialData) {
                // Only clear if creating new, keep data visible if editing until close
                setMinutes("");
                setActivityNote("");
            }
            if (onSuccess) {
                setTimeout(() => {
                    onSuccess();
                    setActivityStatus(null);
                }, 1000);
            }
        }
        setTimeout(() => setActivityStatus(null), 3000);
    };

    return (
        <form onSubmit={handleActivitySubmit} className="space-y-6">
            {/* Activity Type */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Activity Type</Label>
                <div className="relative">
                    <select
                        value={selectedActivity}
                        onChange={(e) => setSelectedActivity(e.target.value)}
                        className="w-full h-12 pl-4 pr-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    >
                        {ACTIVITY_TYPES.map((type) => (
                            <option key={type.id} value={type.id}>{type.id}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded">
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Date</Label>
                <Input
                    type="datetime-local"
                    className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 block w-full"
                    defaultValue={defaultDate}
                    name="activityDate"
                />
            </div>

            {/* Duration & Language */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <Label className="text-base font-semibold">Minutes</Label>
                    <Input
                        type="number"
                        placeholder="15"
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                        className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
                    />
                </div>
                <div className="space-y-3">
                    <Label className="text-base font-semibold">Language</Label>
                    <select
                        name="language"
                        defaultValue={initialData?.language || profile?.current_language || "Spanish"}
                        className="w-full h-12 pl-4 pr-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    >
                        <option value="Spanish">Spanish</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Korean">Korean</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Italian">Italian</option>
                        <option value="Chinese">Chinese</option>
                    </select>
                </div>
            </div>

            {/* Note */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Note (Optional)</Label>
                <Input
                    placeholder="Details..."
                    value={activityNote}
                    onChange={(e) => setActivityNote(e.target.value)}
                    className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
                />
            </div>

            <Button type="submit" className="w-full h-12 text-lg gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all rounded-xl">
                <Send className="h-5 w-5" /> {initialData ? "Update Activity" : "Log Activity"}
            </Button>

            {activityStatus && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-lg text-center text-sm font-medium animate-in fade-in">
                    {activityStatus}
                </div>
            )}
        </form>
    );
}
