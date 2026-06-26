import { getPipelineDraft } from "../actions";
import PipelineWorkspaceClient from "./PipelineWorkspaceClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface AdminPipelineDetailPageProps {
    params: Promise<{ draftId: string }>;
}

export default async function AdminPipelineDetailPage({ params }: AdminPipelineDetailPageProps) {
    // Next.js 15 requires awaiting params
    const { draftId } = await params;
    
    let draft = null;
    try {
        draft = await getPipelineDraft(draftId);
    } catch (error) {
        console.error(`Failed to fetch pipeline draft ${draftId}:`, error);
        notFound();
    }

    if (!draft) {
        notFound();
    }

    return <PipelineWorkspaceClient initialDraft={draft} />;
}
