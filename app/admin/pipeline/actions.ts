"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Helper to check if current user is admin
async function checkAdmin() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    const isEnvAdmin = user.email && (adminEmails.includes(user.email) || adminEmails.includes("*"));
    
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("user_id", user.id)
        .single();
        
    if (!isEnvAdmin && !profile?.is_admin) {
        throw new Error("Forbidden");
    }
    
    return user;
}

export async function getPipelineDrafts() {
    await checkAdmin();
    const adminSupabase = await createAdminClient();
    const { data, error } = await adminSupabase
        .from("story_pipeline")
        .select("id, title, language, level, pipeline_status, created_at, updated_at")
        .order("created_at", { ascending: false });
        
    if (error) throw new Error(error.message);
    return data;
}

export async function getPipelineDraft(draftId: string) {
    await checkAdmin();
    const adminSupabase = await createAdminClient();
    const { data, error } = await adminSupabase
        .from("story_pipeline")
        .select("*")
        .eq("id", draftId)
        .single();
        
    if (error) throw new Error(error.message);
    return data;
}

export async function createPipelineDraft(title: string, language: string, level: number) {
    const user = await checkAdmin();
    const adminSupabase = await createAdminClient();
    
    const newDraft = {
        user_id: user.id,
        title,
        language,
        level,
        pipeline_status: "draft",
        preferences_json: {},
        parameters_json: {},
        story_type_profile_json: {},
        ci_profile_json: {},
        chapters: [],
        outline_json: {},
        bible_json: {},
        treatment_json: {},
        scene_breakdown_json: {},
        prompts_json: {},
        ci_analysis_json: {},
        asset_forge_json: {},
        generation_prompts_json: {},
        pipeline_timestamps_json: { created: new Date().toISOString() }
    };
    
    const { data, error } = await adminSupabase
        .from("story_pipeline")
        .insert(newDraft)
        .select("id")
        .single();
        
    if (error) throw new Error(error.message);
    
    revalidatePath("/admin/pipeline");
    return data.id;
}

export async function updatePipelineDraft(draftId: string, updates: Record<string, any>) {
    await checkAdmin();
    const adminSupabase = await createAdminClient();
    
    const { error } = await adminSupabase
        .from("story_pipeline")
        .update(updates)
        .eq("id", draftId);
        
    if (error) throw new Error(error.message);
    
    revalidatePath(`/admin/pipeline/${draftId}`);
    revalidatePath("/admin/pipeline");
}

export async function deletePipelineDraft(draftId: string) {
    await checkAdmin();
    const adminSupabase = await createAdminClient();
    
    const { error } = await adminSupabase
        .from("story_pipeline")
        .delete()
        .eq("id", draftId);
        
    if (error) throw new Error(error.message);
    
    revalidatePath("/admin/pipeline");
}
