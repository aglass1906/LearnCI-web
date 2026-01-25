import { createClient } from "@/utils/supabase/server";
import LibraryManager from "./LibraryManager";
import { cookies } from "next/headers";

export default async function AdminLibraryPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: resources, error } = await supabase
        .from("learning_resources")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching library resources:", error);
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Library Management</h1>
            <LibraryManager initialResources={resources || []} />
        </div>
    );
}
