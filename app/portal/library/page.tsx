import { createClient } from "@/utils/supabase/server";
import LibraryClient from "./LibraryClient";
import { cookies } from "next/headers";

export default async function LibraryPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

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
