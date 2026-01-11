"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setCurrentUserId(user.id);

            const { data: usersData, error } = await supabase
                .from("profiles")
                .select("*")
                .order("updated_at", { ascending: false });

            if (error) {
                console.error("Error fetching users:", error);
            } else {
                setUsers(usersData || []);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleAdminToggle = async (userId: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;

        // Optimistic update
        setUsers(prev => prev.map(u =>
            u.user_id === userId ? { ...u, is_admin: newStatus } : u
        ));

        try {
            const response = await fetch("/api/admin/toggle-admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, isAdmin: newStatus })
            });

            if (!response.ok) {
                const { error } = await response.json();
                alert(error || "Failed to update admin status");
                // Revert on error
                setUsers(prev => prev.map(u =>
                    u.user_id === userId ? { ...u, is_admin: currentStatus } : u
                ));
            }
        } catch (error) {
            console.error("Error toggling admin:", error);
            alert("Failed to update admin status");
            // Revert on error
            setUsers(prev => prev.map(u =>
                u.user_id === userId ? { ...u, is_admin: currentStatus } : u
            ));
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Users</h1>

            <Card>
                <CardHeader>
                    <CardTitle>All Users ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-50 dark:bg-zinc-800">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Language</th>
                                    <th className="px-6 py-3">Level</th>
                                    <th className="px-6 py-3">Total Hours</th>
                                    <th className="px-6 py-3">Public</th>
                                    <th className="px-6 py-3">Admin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="bg-white border-b dark:bg-zinc-900 dark:border-zinc-800">
                                        <td className="px-6 py-4 font-medium">
                                            {user.name || "N/A"}
                                            {user.is_admin && (
                                                <Badge variant="destructive" className="ml-2 text-xs">Admin</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">{user.current_language || "-"}</td>
                                        <td className="px-6 py-4">{user.current_level || "-"}</td>
                                        <td className="px-6 py-4">{(user.total_minutes / 60).toFixed(1)}</td>
                                        <td className="px-6 py-4">{user.is_public ? "Yes" : "No"}</td>
                                        <td className="px-6 py-4">
                                            <Switch
                                                checked={user.is_admin || false}
                                                onCheckedChange={() => handleAdminToggle(user.user_id, user.is_admin)}
                                                disabled={user.user_id === currentUserId}
                                            />
                                            {user.user_id === currentUserId && (
                                                <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
