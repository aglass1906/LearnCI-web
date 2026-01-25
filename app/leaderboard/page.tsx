import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import { Trophy, Medal, Crown } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

export default async function Leaderboard() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: leaders } = await supabase
        .from("profiles")
        .select("name, total_minutes, current_language, is_public, avatar_url")
        .order("total_minutes", { ascending: false })
        .limit(50);

    return (
        <div className="container py-12 max-w-4xl mx-auto">
            <div className="mb-10 text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent inline-block pb-1">
                    Global Rankings
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Top learners dedicated to fluency through comprehensible input.
                </p>
            </div>

            <Card className="border-none shadow-2xl shadow-primary/5 bg-background/50 backdrop-blur-xl">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-border/50">
                    <div className="grid grid-cols-12 gap-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                        <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                        <div className="col-span-6 md:col-span-7">Learner</div>
                        <div className="col-span-4 md:col-span-4 text-right">Hours</div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {leaders?.map((leader, index) => {
                        const isTop3 = index < 3;
                        // Only link to profile if it's public
                        const Wrapper = leader.is_public ? Link : "div";

                        return (
                            <Wrapper
                                key={index}
                                href={leader.is_public ? `/u/${leader.name}` : "#"}
                                className={`grid grid-cols-12 gap-4 p-4 items-center border-b border-border/50 last:border-0 hover:bg-primary/5 transition-all group ${!leader.is_public ? "cursor-default" : "cursor-pointer"
                                    } ${isTop3 ? "bg-primary/[0.02]" : ""}`}
                            >
                                {/* Rank */}
                                <div className="col-span-2 md:col-span-1 flex justify-center">
                                    {index === 0 && <Trophy className="h-6 w-6 text-yellow-500 drop-shadow-md group-hover:scale-110 transition-transform" />}
                                    {index === 1 && <Medal className="h-6 w-6 text-slate-400 group-hover:scale-110 transition-transform" />}
                                    {index === 2 && <Medal className="h-6 w-6 text-amber-600 group-hover:scale-110 transition-transform" />}
                                    {index > 2 && <span className="font-bold text-muted-foreground/70">#{index + 1}</span>}
                                </div>

                                {/* Name */}
                                <div className="col-span-6 md:col-span-7 flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ring-2 ring-offset-2 ring-transparent transition-all group-hover:ring-primary/20 ${isTop3 ? "bg-gradient-to-br from-yellow-100 to-orange-100 text-orange-700 dark:from-yellow-900 dark:to-orange-950 dark:text-orange-100" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                        }`}>
                                        {leader.avatar_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={leader.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                                        ) : (
                                            leader.name?.charAt(0).toUpperCase() || "?"
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`font-semibold ${isTop3 ? "text-lg text-primary" : "text-foreground group-hover:text-primary transition-colors"}`}>
                                            {leader.name || "Anonymous"}
                                        </span>
                                        {leader.current_language && (
                                            <span className="text-xs text-muted-foreground hidden sm:inline-block">
                                                Learning <span className="font-medium text-foreground/80">{leader.current_language}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="col-span-4 md:col-span-4 text-right font-mono font-bold text-lg text-foreground/80">
                                    {(leader.total_minutes / 60).toFixed(1)} <span className="text-sm font-medium text-muted-foreground ml-1">h</span>
                                </div>
                            </Wrapper>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
