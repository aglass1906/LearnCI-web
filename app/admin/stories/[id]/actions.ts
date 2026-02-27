"use server";

import { createAdminClient } from "@/utils/supabase/server";

/**
 * Update a single field on a story using the service-role key (bypasses RLS).
 * Used by the admin editor for writes that would otherwise be blocked.
 */
export async function adminUpdateStory(
    storyId: string,
    updates: Record<string, unknown>
) {
    const supabase = await createAdminClient();
    const { error } = await supabase
        .from("stories")
        .update(updates)
        .eq("id", storyId);

    if (error) {
        throw new Error(error.message);
    }
}
