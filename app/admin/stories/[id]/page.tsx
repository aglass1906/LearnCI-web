import { createClient } from "@/utils/supabase/server";
import StoryEditorClient from "./StoryEditorClient";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function AdminStoryEditPage({ params }: { params: Promise<{ id: string }> }) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Next.js 15 requires awaiting params
    const { id } = await params;

    // Fetch story without user profile (causes PGRST200 error)
    const { data: story, error } = await supabase
        .from("stories")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !story) {
        notFound();
    }

    return <StoryEditorClient story={story} />;
}
