import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LayoutDashboard, Users, MessageSquare, LogOut, ExternalLink, BookOpen } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-slate-100 dark:bg-zinc-950">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-zinc-900 dark:text-zinc-50 border-r flex flex-col fixed inset-y-0">
                <div className="h-16 flex items-center px-6 border-b">
                    <span className="font-bold text-xl">Admin Panel</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Overview
                        </Button>
                    </Link>
                    <Link href="/admin/users">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Users className="h-4 w-4" />
                            Users
                        </Button>
                    </Link>
                    <Link href="/admin/feedback">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Feedback
                        </Button>
                    </Link>
                    <Link href="/admin/library">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <BookOpen className="h-4 w-4" />
                            Library
                        </Button>
                    </Link>
                    <Link href="/admin/stories">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <BookOpen className="h-4 w-4" />
                            Stories
                        </Button>
                    </Link>
                </nav>
                <div className="p-4 border-t space-y-2">
                    <Link href="/" target="_blank">
                        <Button variant="outline" className="w-full justify-start gap-2">
                            <ExternalLink className="h-4 w-4" />
                            Public Site
                        </Button>
                    </Link>
                    <form action="/auth/signout" method="post">
                        <Button variant="ghost" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50">
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
