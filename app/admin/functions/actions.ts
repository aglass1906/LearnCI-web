"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// Helper to check if current user is admin and return their client
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
    
    return supabase;
}

/**
 * Triggers a Supabase Edge Function from the server side.
 * Relies on the user's active JWT session token for GoTrue authorization inside the function.
 */
export async function invokeEdgeFunction(functionName: string, payload: Record<string, any>) {
    const supabase = await checkAdmin();
    
    // Get active user's session token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) {
        throw new Error("No active session token found. Please log in again.");
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
        throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined in the environment.");
    }
    
    const functionUrl = `${supabaseUrl}/functions/v1/${functionName}`;
    
    try {
        const response = await fetch(functionUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            },
            body: JSON.stringify(payload)
        });
        
        const responseText = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = { message: responseText };
        }
        
        if (!response.ok) {
            throw new Error(responseData.error || responseData.message || `Edge function returned status ${response.status}`);
        }
        
        return responseData;
    } catch (error: any) {
        console.error(`Error invoking edge function ${functionName}:`, error);
        throw new Error(error.message || `Failed to invoke edge function: ${functionName}`);
    }
}
