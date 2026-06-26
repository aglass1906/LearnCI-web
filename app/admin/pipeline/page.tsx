import { getPipelineDrafts } from "./actions";
import PipelineDashboardClient from "./PipelineDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminPipelinePage() {
    let initialDrafts: any[] = [];
    let fetchError = null;

    try {
        initialDrafts = await getPipelineDrafts();
    } catch (error: any) {
        console.error("Failed to fetch initial pipeline drafts:", error);
        fetchError = error.message || "Failed to load pipeline drafts";
    }

    return <PipelineDashboardClient initialDrafts={initialDrafts} error={fetchError} />;
}
