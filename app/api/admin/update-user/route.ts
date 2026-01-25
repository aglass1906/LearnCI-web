import { createClient, createAdminClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Authorization Check
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
        const { userId, email, name } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const adminSupabase = await createAdminClient();

        // 2. Update Supabase Auth (Email & User Metadata)
        const updateAttributes: any = {
            user_metadata: { name }
        };
        if (email) {
            updateAttributes.email = email;
            updateAttributes.email_confirm = true; // Auto-confirm email change
        }

        const { error: authError } = await adminSupabase.auth.admin.updateUserById(
            userId,
            updateAttributes
        );

        if (authError) {
            console.error("Auth update error:", authError);
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        // 3. Update Profiles Table (Name)
        const { error: profileError } = await adminSupabase
            .from("profiles")
            .update({ name })
            .eq("user_id", userId);

        if (profileError) {
            console.error("Profile update error:", profileError);
            // If auth succeeded but profile failed, we have a sync issue.
            // But we shouldn't fail the whole request to the client if the critical auth part worked.
            // However, name is mainly in profile.
            return NextResponse.json({ error: "User updated but profile sync failed: " + profileError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
