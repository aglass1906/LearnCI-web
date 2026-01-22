
import { createClient } from "@/utils/supabase/server";
import LibraryClient from "./LibraryClient";

export default async function LibraryPage() {
    const supabase = await createClient();

    // Fetch resources on the server
    const { data: resources, error } = await supabase
        .from("learning_resources")
        .select("*")
        .eq("status", "published")
        .order("is_featured", { ascending: false });

    if (error) {
        console.error("Server-side fetch error:", error);
    }

    return <LibraryClient initialResources={resources || []} />;
}
