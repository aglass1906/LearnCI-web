import { createClient } from "@/utils/supabase/server";
import StoriesAdminClient from "./StoriesAdminClient";
import { cookies } from "next/headers";

export default async function AdminStoriesPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Fetch all stories without user profile join (causing PGRST200 error)
    const { data: stories, error } = await supabase
        .from("stories")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching stories:", error);
    }

    return <StoriesAdminClient initialStories={stories || []} />;
}
