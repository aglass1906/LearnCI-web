"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function updateResource(id: string, data: any) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Remove id from data if present to avoid "Modifying the identity column" errors
    const { id: _, ...updateData } = data;

    console.log(`[updateResource] Updating resource ${id} with data:`, updateData);

    const { error } = await supabase
        .from("learning_resources")
        .update(updateData)
        .eq("id", id);

    if (error) {
        console.error(`[updateResource] Error updating resource ${id}:`, error);
        return { error: error.message };
    }

    console.log(`[updateResource] Successfully updated resource ${id}`);
    revalidatePath("/admin/library");
    revalidatePath("/portal/library");
    return { success: true };
}

export async function createResource(data: any) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    console.log("[createResource] Creating resource with data:", data);

    const { error } = await supabase
        .from("learning_resources")
        .insert(data);

    if (error) {
        console.error("[createResource] Error creating resource:", error);
        return { error: error.message };
    }

    console.log("[createResource] Successfully created resource");
    revalidatePath("/admin/library");
    revalidatePath("/portal/library");
    return { success: true };
}


export async function deleteResource(id: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
        .from("learning_resources")
        .delete()
        .eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/library");
    revalidatePath("/portal/library");
    return { success: true };
}
