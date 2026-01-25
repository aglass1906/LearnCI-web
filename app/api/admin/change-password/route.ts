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

    // Get request body
    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
        return NextResponse.json({ error: "Missing userId or newPassword" }, { status: 400 });
    }

    // Validate password requirements
    if (newPassword.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Update user's password using Supabase Admin API
    const adminSupabase = await createAdminClient();
    const { data, error } = await adminSupabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
    );

    if (error) {
        console.error("Error updating password:", error);
        return NextResponse.json({ error: error.message || "Failed to update password" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Password updated successfully" });
}
