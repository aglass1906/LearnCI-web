import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
    LayoutDashboard, Users, MessageSquare, LogOut, ExternalLink, 
    BookOpen, GitBranch, Zap, Layers 
} from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-brandDark text-white relative overflow-hidden">
            {/* Atmospheric Background Glows for Admin Command Space */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(56,97,251,0.06)_0%,rgba(56,97,251,0)_70%)] blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(255,160,0,0.04)_0%,rgba(255,160,0)_70%)] blur-[120px]"></div>
            </div>

            {/* Sidebar */}
            <aside className="w-64 bg-brandSurface/45 backdrop-blur-lg border-r border-white/5 flex flex-col fixed inset-y-0 z-20">
                {/* Header Logo */}
                <div className="h-16 flex items-center px-6 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-primaryAccent/10 border border-primaryAccent/20">
                            <Layers className="h-4 w-4 text-primaryAccent" />
                        </span>
                        <span className="font-heading font-extrabold text-sm tracking-widest uppercase text-white">
                            Admin Console
                        </span>
                    </div>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 p-4 space-y-2 relative z-10 overflow-y-auto scrollbar-thin scrollbar-thumb-white/5">
                    <Link href="/admin">
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2.5 text-xs font-labels font-extrabold tracking-wider uppercase text-white/50 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 rounded-xl transition-all"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Overview
                        </Button>
                    </Link>
                    
                    <Link href="/admin/pipeline">
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2.5 text-xs font-labels font-extrabold tracking-wider uppercase text-white/50 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 rounded-xl transition-all"
                        >
                            <GitBranch className="h-4 w-4 text-accentTeal" />
                            Draft Pipeline
                        </Button>
                    </Link>

                    <Link href="/admin/stories">
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2.5 text-xs font-labels font-extrabold tracking-wider uppercase text-white/50 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 rounded-xl transition-all"
                        >
                            <BookOpen className="h-4 w-4 text-primaryAccent" />
                            Live Stories
                        </Button>
                    </Link>

                    <Link href="/admin/functions">
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2.5 text-xs font-labels font-extrabold tracking-wider uppercase text-white/50 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 rounded-xl transition-all"
                        >
                            <Zap className="h-4 w-4 text-purple-400" />
                            Edge Functions
                        </Button>
                    </Link>

                    <Link href="/admin/users">
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2.5 text-xs font-labels font-extrabold tracking-wider uppercase text-white/50 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 rounded-xl transition-all"
                        >
                            <Users className="h-4 w-4" />
                            Users
                        </Button>
                    </Link>

                    <Link href="/admin/feedback">
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2.5 text-xs font-labels font-extrabold tracking-wider uppercase text-white/50 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 rounded-xl transition-all"
                        >
                            <MessageSquare className="h-4 w-4" />
                            Feedback
                        </Button>
                    </Link>
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/5 space-y-2 relative z-10">
                    <Link href="/" target="_blank">
                        <Button 
                            variant="outline" 
                            className="w-full justify-start gap-2.5 text-xs font-labels font-extrabold tracking-wider uppercase bg-white/[0.02] border-white/10 hover:bg-white/5 hover:border-white/20 text-white/75 hover:text-white rounded-xl transition-all"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Public Site
                        </Button>
                    </Link>
                    <form action="/auth/signout" method="post">
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2.5 text-xs font-labels font-extrabold tracking-wider uppercase text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content Viewport */}
            <main className="flex-1 ml-64 p-8 min-h-screen relative z-10">
                {children}
            </main>
        </div>
    );
}
