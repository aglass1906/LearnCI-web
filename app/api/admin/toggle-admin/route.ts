import { createClient, createAdminClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if current user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    const isEnvAdmin = user.email && (adminEmails.includes(user.email) || adminEmails.includes("*"));

    const { data: currentUserProfile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("user_id", user.id)
        .single();

    if (!isEnvAdmin && !currentUserProfile?.is_admin) {
        return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Get target user from request
    const { userId, isAdmin } = await request.json();

    if (!userId || typeof isAdmin !== "boolean") {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Prevent users from demoting themselves
    if (userId === user.id && !isAdmin) {
        return NextResponse.json({ error: "You cannot demote yourself" }, { status: 400 });
    }

    // Update the target user's admin status
    const adminSupabase = await createAdminClient();
    const { error } = await adminSupabase
        .from("profiles")
        .update({ is_admin: isAdmin })
        .eq("user_id", userId);

    if (error) {
        console.error("Error updating admin status:", error);
        return NextResponse.json({ error: "Failed to update admin status" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
