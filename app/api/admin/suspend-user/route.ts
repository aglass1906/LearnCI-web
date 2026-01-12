import { createClient, createAdminClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const supabase = await createClient();

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
        const { userId, action } = await request.json();

        if (!userId || !action) {
            return NextResponse.json({ error: "Missing userId or action" }, { status: 400 });
        }

        const adminSupabase = await createAdminClient();
        const updateParams: any = {};

        if (action === 'suspend') {
            // Ban for ~100 years
            updateParams.ban_duration = "876000h";
        } else if (action === 'unsuspend') {
            // Remove ban
            updateParams.ban_duration = "none";
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const { data, error } = await adminSupabase.auth.admin.updateUserById(
            userId,
            updateParams
        );

        if (error) throw error;

        return NextResponse.json({ success: true, user: data.user });

    } catch (error: any) {
        console.error("Error suspending user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
