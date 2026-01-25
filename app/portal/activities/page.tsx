import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ActivityHistoryClient from "./ActivityHistoryClient";

export default async function ActivitiesPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect("/login");
    }

    const { data: activities, error } = await supabase
        .from("user_activities")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

    if (error) {
        console.error("Error fetching activities:", error);
        // We could render an error state here, but for now we'll pass empty array to avoid crash
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Activity History</h1>
            </div>

            <ActivityHistoryClient initialActivities={activities || []} userId={user.id} profile={profile} />
        </div>
    );
}
