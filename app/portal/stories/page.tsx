import { createClient } from "@/utils/supabase/server";
import StoriesClient from "./StoriesClient";
import { cookies } from "next/headers";

export default async function StoriesPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Fetch public stories on the server
    const { data: stories, error } = await supabase
        .from("stories")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Server-side fetch error:", error);
    }

    return <StoriesClient initialStories={stories || []} />;
}
