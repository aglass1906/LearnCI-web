import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import { Clock, GraduationCap, Languages, Trophy, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const decodedName = decodeURIComponent(username);
    const supabase = await createClient();

    // Fetch user profile by name (username)
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("name", decodedName)
        .single();

    if (error || !profile) {
        notFound();
    }

    // Check privacy
    if (!profile.is_public) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 rounded-full bg-zinc-100 p-6 dark:bg-zinc-800">
                    <User className="h-12 w-12 text-zinc-400" />
                </div>
                <h1 className="text-2xl font-bold">Private Profile</h1>
                <p className="mt-2 text-muted-foreground">This learner's profile is currently private.</p>
                <Link href="/" className="mt-6">
                    <Button variant="outline">Back to Home</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 dark:bg-zinc-950">
            {/* Header / Banner */}
            <div className="h-48 w-full bg-gradient-to-r from-blue-500 to-purple-600"></div>

            <div className="container mx-auto max-w-4xl px-4">
                {/* Profile Card */}
                <div className="relative -mt-24 mb-8">
                    <Card className="overflow-hidden border-none shadow-xl">
                        <CardContent className="p-6 sm:p-8">
                            <div className="flex flex-col items-center sm:flex-row sm:items-end sm:justify-between gap-4">
                                <div className="flex flex-col items-center sm:flex-row sm:items-end gap-6">
                                    <div className="h-32 w-32 shrink-0 rounded-full bg-white p-1 shadow-lg dark:bg-zinc-900">
                                        <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-100 text-4xl font-bold text-zinc-400 dark:bg-zinc-800">
                                            {profile.avatar_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={profile.avatar_url} alt={profile.name} className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                profile.name?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h1 className="text-3xl font-bold">{profile.name}</h1>
                                        <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                                            <GraduationCap className="h-4 w-4" /> Learner since {new Date(profile.updated_at).getFullYear()}
                                        </p>
                                    </div>
                                </div>
                                {/* Stats Badges */}
                                <div className="flex gap-2">
                                    <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 flex items-center gap-1">
                                        <Trophy className="h-3 w-3" /> Level {profile.current_level}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Core Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Total Input Time */}
                    <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Input</CardTitle>
                            <Clock className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(profile.total_minutes / 60).toFixed(1)} hrs</div>
                            <p className="text-xs text-muted-foreground">Across all activities</p>
                        </CardContent>
                    </Card>

                    {/* Current Language */}
                    <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Focus Language</CardTitle>
                            <Languages className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{profile.current_language || "N/A"}</div>
                            <p className="text-xs text-muted-foreground">{profile.current_level || "Beginner"}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
