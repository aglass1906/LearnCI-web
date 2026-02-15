import { createClient } from "@/utils/supabase/server";
import StoryDetailClient from "./StoryDetailClient";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function StoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Next.js 15 requires awaiting params
    const { id } = await params;

    // Fetch story from database
    const { data: story, error } = await supabase
        .from("stories")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !story) {
        notFound();
    }

    return <StoryDetailClient story={story} />;
}
