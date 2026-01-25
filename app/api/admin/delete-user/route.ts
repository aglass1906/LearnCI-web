import { createClient, createAdminClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Authorization Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    const isEnvAdmin = user.email && (adminEmails.includes(user.email) || adminEmails.includes("*"));

    const { data: currentUserProfile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("user_id", user.id)
        .single();

    if (!isEnvAdmin && !currentUserProfile?.is_admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        // Prevent self-deletion
        if (userId === user.id) {
            return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
        }

        const adminSupabase = await createAdminClient();

        // 1. Delete Profile (Manual cleanup since FK cascade might not exist)
        const { error: profileError } = await adminSupabase
            .from("profiles")
            .delete()
            .eq("user_id", userId);

        if (profileError) {
            console.error("Error deleting profile:", profileError);
            // Continue to try deleting auth user, or stop? 
            // Better to stop if profile deletion fails to avoid localized inconsistency, 
            // BUT if profile doesn't exist it might error? No, delete matches 0 rows is success.
            // Only error is if DB error.
            return NextResponse.json({ error: "Failed to delete user profile" }, { status: 500 });
        }

        // 2. Delete Auth User
        const { error: authError } = await adminSupabase.auth.admin.deleteUser(userId);

        if (authError) {
            // Re-creating the profile is hard here if we needed to rollback. 
            // In a real transaciton this would be atomic.
            // Supabase client doesn't support cross-schema transactions easily.
            // We report the error.
            console.error("Error deleting auth user:", authError);
            return NextResponse.json({ error: "Profile deleted but failed to delete auth user: " + authError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
