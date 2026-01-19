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
    onSuccess?: () => void;
}

export function LogActivityForm({ userId, profile, onSuccess }: LogActivityFormProps) {
    const supabase = createClient();
    const router = useRouter();

    const [selectedActivity, setSelectedActivity] = useState("App Learning");
    const [minutes, setMinutes] = useState("");
    const [activityNote, setActivityNote] = useState("");
    const [activityStatus, setActivityStatus] = useState<string | null>(null);

    const handleActivitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        const formData = new FormData(e.target as HTMLFormElement);
        const dateVal = formData.get("activityDate") as string;
        const languageVal = formData.get("language") as string;

        const { error } = await supabase.from("user_activities").insert({
            user_id: userId,
            activity_type: selectedActivity,
            minutes: parseInt(minutes) || 0,
            comment: activityNote,
            language: languageVal || profile?.current_language || "Spanish",
            date: dateVal ? new Date(dateVal).toISOString() : new Date().toISOString()
        });

        if (error) {
            console.error("Activity Save Error:", error);
            setActivityStatus("Error saving.");
        } else {
            setActivityStatus("Activity logged! ⏱️");
            setMinutes("");
            setActivityNote("");
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
                    defaultValue={new Date().toISOString().slice(0, 16)}
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
                        defaultValue={profile?.current_language || "Spanish"}
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
                <Send className="h-5 w-5" /> Log Activity
            </Button>

            {activityStatus && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-lg text-center text-sm font-medium animate-in fade-in">
                    {activityStatus}
                </div>
            )}
        </form>
    );
}
