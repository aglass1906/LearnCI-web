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
    const { email, name, password, isAdmin } = await request.json();

    if (!email || !name || !password) {
        return NextResponse.json({ error: "Missing required fields: email, name, password" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Validate password requirements
    if (password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    try {
        // Create user using Supabase Admin API
        const adminSupabase = await createAdminClient();
        const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email so user can log in immediately
            user_metadata: { name }
        });

        if (createError) {
            console.error("Error creating user:", createError);
            return NextResponse.json({ error: createError.message || "Failed to create user" }, { status: 500 });
        }

        if (!newUser.user) {
            return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
        }

        // Create or update profile entry
        const { error: profileError } = await adminSupabase
            .from("profiles")
            .upsert({
                user_id: newUser.user.id,
                name: name,
                is_admin: isAdmin || false,
                is_public: false,
                total_minutes: 0,
                current_language: null,
                current_level: null
            }, { onConflict: 'user_id' });

        if (profileError) {
            console.error("Error creating profile:", profileError);
            // User was created but profile failed - this is a partial failure
            return NextResponse.json({
                error: `Profile creation failed: ${profileError.message || JSON.stringify(profileError)}`,
                details: profileError,
                userId: newUser.user.id
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "User created successfully",
            user: {
                id: newUser.user.id,
                email: newUser.user.email,
                name: name
            }
        });

    } catch (error: any) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
    }
}
