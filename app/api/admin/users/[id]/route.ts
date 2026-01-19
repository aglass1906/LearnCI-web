import { createClient, createAdminClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const userId = (await params).id;
    const supabase = await createClient();

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
        const adminSupabase = await createAdminClient();

        // 2. Fetch Profile Data
        const { data: profile, error: profileError } = await adminSupabase
            .from("profiles")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "No rows found"
            throw profileError;
        }

        // 3. Fetch Auth Data
        const { data: { user: authUser }, error: authError } = await adminSupabase.auth.admin.getUserById(userId);

        if (authError) throw authError;

        if (!authUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 4. Combine Data
        const userDetails = {
            profile: profile || null,
            auth: {
                id: authUser.id,
                email: authUser.email,
                phone: authUser.phone,
                created_at: authUser.created_at,
                last_sign_in_at: authUser.last_sign_in_at,
                banned_until: authUser.banned_until,
                user_metadata: authUser.user_metadata,
                app_metadata: authUser.app_metadata,
                identities: authUser.identities,
                factors: authUser.factors
            }
        };

        return NextResponse.json(userDetails);

    } catch (error: any) {
        console.error("Error fetching user details:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
