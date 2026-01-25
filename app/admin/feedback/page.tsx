import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";

import { cookies } from "next/headers";

export default async function AdminFeedback() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: feedback } = await supabase
        .from("daily_feedback")
        .select("*, profiles(name)")
        .order("date", { ascending: false });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Feedback Logs</h1>

            <Card>
                <CardHeader>
                    <CardTitle>All Feedback ({feedback?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-50 dark:bg-zinc-800">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Rating</th>
                                    <th className="px-6 py-3">Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feedback?.map((item) => (
                                    <tr key={item.id} className="bg-white border-b dark:bg-zinc-900 dark:border-zinc-800">
                                        <td className="px-6 py-4">{new Date(item.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium">{item.profiles?.name || "Anonymous"}</td>
                                        <td className="px-6 py-4">{item.rating}/5</td>
                                        <td className="px-6 py-4 max-w-md truncate">{item.note}</td>
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
