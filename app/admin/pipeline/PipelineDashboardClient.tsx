"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
    GitBranch, Search, Plus, Trash2, Edit3, ArrowRight, 
    CheckCircle2, AlertCircle, HelpCircle, Loader2 
} from "lucide-react";
import { 
    createPipelineDraft, 
    deletePipelineDraft 
} from "./actions";
import { 
    Dialog, DialogContent, DialogDescription, DialogFooter, 
    DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    AlertDialog, AlertDialogAction, AlertDialogCancel, 
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
    AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";

interface PipelineDashboardClientProps {
    initialDrafts: any[];
    error: string | null;
}

export default function PipelineDashboardClient({ initialDrafts, error }: PipelineDashboardClientProps) {
    const [drafts, setDrafts] = useState(initialDrafts);
    const [searchTerm, setSearchTerm] = useState("");
    const [languageFilter, setLanguageFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    
    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedDraft, setSelectedDraft] = useState<any | null>(null);
    
    // Form states
    const [newTitle, setNewTitle] = useState("");
    const [newLanguage, setNewLanguage] = useState("Spanish");
    const [newLevel, setNewLevel] = useState(0);
    
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const languageNames: Record<string, string> = {
        spanish: "Spanish",
        es: "Spanish",
        Spanish: "Spanish",
        french: "French",
        fr: "French",
        French: "French",
        german: "German",
        de: "German",
        German: "German",
        japanese: "Japanese",
        ja: "Japanese",
        Japanese: "Japanese",
        mandarin: "Mandarin",
        zh: "Mandarin",
        Mandarin: "Mandarin",
        italian: "Italian",
        it: "Italian",
        Italian: "Italian",
        portuguese: "Portuguese",
        pt: "Portuguese",
        Portuguese: "Portuguese"
    };

    const levelNames: Record<number, string> = {
        0: "A1 Super Beginner",
        1: "A2 Beginner",
        2: "B1 Intermediate",
        3: "B2 Advanced",
        4: "C1 Upper Advanced",
        5: "C2 Master"
    };

    const levelBadges: Record<number, string> = {
        0: "bg-green-500/10 text-green-400 border-green-500/20",
        1: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        2: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        3: "bg-[#FFA000]/10 text-[#FFA000] border-[#FFA000]/20",
        4: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        5: "bg-red-500/10 text-red-400 border-red-500/20"
    };

    // Filter drafts
    const filteredDrafts = drafts.filter(draft => {
        const matchesSearch = (draft.title || "").toLowerCase().includes(searchTerm.toLowerCase());
        
        // Normalize language strings
        const draftLang = (draft.language || "Spanish").toLowerCase();
        const filterLang = languageFilter.toLowerCase();
        const matchesLanguage = languageFilter === "all" || 
            draftLang === filterLang || 
            (filterLang === "spanish" && draftLang === "es") ||
            (filterLang === "japanese" && draftLang === "ja") ||
            (filterLang === "french" && draftLang === "fr") ||
            (filterLang === "german" && draftLang === "de") ||
            (filterLang === "mandarin" && draftLang === "zh") ||
            (filterLang === "italian" && draftLang === "it") ||
            (filterLang === "portuguese" && draftLang === "pt");
            
        const matchesStatus = statusFilter === "all" || (draft.pipeline_status || "draft") === statusFilter;
        return matchesSearch && matchesLanguage && matchesStatus;
    });

    const handleCreateDraft = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        
        setIsCreating(true);
        try {
            const newId = await createPipelineDraft(newTitle, newLanguage, newLevel);
            setCreateDialogOpen(false);
            setNewTitle("");
            router.push(`/admin/pipeline/${newId}`);
        } catch (err: any) {
            alert("Failed to create pipeline draft: " + err.message);
        } finally {
            setIsCreating(false);
        }
    };

    const confirmDelete = (draft: any) => {
        setSelectedDraft(draft);
        setDeleteDialogOpen(true);
    };

    const handleDeleteDraft = async () => {
        if (!selectedDraft) return;
        
        setIsDeleting(true);
        try {
            await deletePipelineDraft(selectedDraft.id);
            setDrafts(prev => prev.filter(d => d.id !== selectedDraft.id));
            setDeleteDialogOpen(false);
            setSelectedDraft(null);
        } catch (err: any) {
            alert("Failed to delete draft: " + err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-8 pb-12 relative z-10 max-w-7xl mx-auto">
            {/* Header Command Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-accentTeal animate-pulse"></span>
                        Creator Pipeline Workspace
                    </h1>
                    <p className="text-white/55 font-sans text-sm mt-1.5 max-w-xl">
                        Review, execute, and monitor in-progress AI-generated story drafts across 7 development phases.
                    </p>
                </div>
                <Button 
                    onClick={() => setCreateDialogOpen(true)} 
                    className="bg-[#FFA000] hover:bg-[#FFA000]/90 text-[#161925] font-bold font-labels tracking-wider uppercase rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-[#FFA000]/10 flex items-center gap-2 py-5 px-6"
                >
                    <Plus className="h-4 w-4" />
                    New Pipeline
                </Button>
            </div>

            {error && (
                <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 font-sans text-sm">
                    Error: {error}
                </div>
            )}

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 h-4 w-4" />
                    <input 
                        type="text"
                        placeholder="Search drafts by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-11 pr-4 py-2.5 font-sans text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00E5FF]/50 transition-all"
                    />
                </div>
                <div className="flex flex-wrap gap-3">
                    <select
                        value={languageFilter}
                        onChange={(e) => setLanguageFilter(e.target.value)}
                        className="bg-[#161925]/80 border border-white/5 text-white/80 rounded-xl px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-[#00E5FF]/50 transition-all cursor-pointer"
                    >
                        <option value="all">All Languages</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Mandarin">Mandarin</option>
                        <option value="Italian">Italian</option>
                        <option value="Portuguese">Portuguese</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-[#161925]/80 border border-white/5 text-white/80 rounded-xl px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-[#00E5FF]/50 transition-all cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        <option value="draft">In Progress (Draft)</option>
                        <option value="published">Published</option>
                        <option value="error">Failed (Error)</option>
                    </select>
                </div>
            </div>

            {/* Pipeline Bento Table */}
            <div className="glass-card border border-white/5 rounded-[24px] overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h2 className="font-heading text-lg font-extrabold text-white">Active Pipelines ({filteredDrafts.length})</h2>
                </div>
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                                <th className="px-6 py-4 font-labels text-[11px] tracking-wider text-white/40 uppercase font-extrabold">Draft Story</th>
                                <th className="px-6 py-4 font-labels text-[11px] tracking-wider text-white/40 uppercase font-extrabold">Language</th>
                                <th className="px-6 py-4 font-labels text-[11px] tracking-wider text-white/40 uppercase font-extrabold">Level</th>
                                <th className="px-6 py-4 font-labels text-[11px] tracking-wider text-white/40 uppercase font-extrabold">Pipeline Status</th>
                                <th className="px-6 py-4 font-labels text-[11px] tracking-wider text-white/40 uppercase font-extrabold">Created At</th>
                                <th className="px-6 py-4 font-labels text-[11px] tracking-wider text-white/40 uppercase font-extrabold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredDrafts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-white/40 font-sans">
                                        No active story pipelines found matching the filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredDrafts.map((draft) => (
                                    <tr 
                                        key={draft.id} 
                                        className="hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-white text-sm group-hover:text-[#00E5FF] transition-colors">
                                                    {draft.title || "Untitled Draft"}
                                                </span>
                                                <span className="text-[10px] text-white/30 font-mono mt-0.5">{draft.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/80 border border-white/10 text-[10px] font-bold tracking-wider uppercase">
                                                {languageNames[draft.language] || draft.language}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wider uppercase ${levelBadges[draft.level] || levelBadges[0]}`}>
                                                {levelNames[draft.level] || `Level ${draft.level}`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {draft.pipeline_status === "published" ? (
                                                <span className="px-2.5 py-1 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 w-fit">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Published
                                                </span>
                                            ) : draft.pipeline_status === "error" ? (
                                                <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 w-fit">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Failed
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full bg-white/5 text-[#FFA000] border border-[#FFA000]/20 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 w-fit animate-pulse">
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                    In Progress
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-white/50 text-xs">
                                            {new Date(draft.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <Link href={`/admin/pipeline/${draft.id}`}>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-9 w-9 text-[#00E5FF] hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 rounded-xl"
                                                        title="Enter Creator Workspace"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => confirmDelete(draft)}
                                                    className="h-9 w-9 text-red-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
                                                    title="Delete Pipeline"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <Link href={`/admin/pipeline/${draft.id}`}>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-9 px-3 gap-1 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl text-xs font-labels tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-all duration-300"
                                                    >
                                                        Console
                                                        <ArrowRight className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Draft Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="bg-[#1c1f2b] border border-white/10 text-white rounded-[24px] max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-xl font-extrabold text-white">Create New Generation Pipeline</DialogTitle>
                        <DialogDescription className="text-white/50 text-sm font-sans mt-1">
                            Set up a new story draft. This will initialize a workspace using our 7-Phase generator.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateDraft} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-white/60 font-labels text-[11px] uppercase tracking-wider">Story Idea / Working Title *</Label>
                            <Input 
                                id="title"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="e.g. Kipper the dog visits Berlin"
                                className="bg-white/5 border border-white/10 text-white rounded-xl py-5 focus:border-[#00E5FF]/50 focus:ring-0 placeholder:text-white/25 text-sm font-sans"
                                required
                                disabled={isCreating}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="language" className="text-white/60 font-labels text-[11px] uppercase tracking-wider">Target Language</Label>
                                <select
                                    id="language"
                                    value={newLanguage}
                                    onChange={(e) => setNewLanguage(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-2.5 text-sm font-sans focus:outline-none focus:border-[#00E5FF]/50 focus:ring-0"
                                    disabled={isCreating}
                                >
                                    <option value="Spanish">Spanish</option>
                                    <option value="French">French</option>
                                    <option value="German">German</option>
                                    <option value="Japanese">Japanese</option>
                                    <option value="Mandarin">Mandarin</option>
                                    <option value="Italian">Italian</option>
                                    <option value="Portuguese">Portuguese</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="level" className="text-white/60 font-labels text-[11px] uppercase tracking-wider">Target Level</Label>
                                <select
                                    id="level"
                                    value={newLevel}
                                    onChange={(e) => setNewLevel(Number(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-2.5 text-sm font-sans focus:outline-none focus:border-[#00E5FF]/50 focus:ring-0"
                                    disabled={isCreating}
                                >
                                    <option value={0}>A1 Super Beginner</option>
                                    <option value={1}>A2 Beginner</option>
                                    <option value={2}>B1 Intermediate</option>
                                    <option value={3}>B2 Advanced</option>
                                    <option value={4}>C1 Upper Advanced</option>
                                    <option value={5}>C2 Master</option>
                                </select>
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setCreateDialogOpen(false)}
                                className="text-white/60 hover:text-white hover:bg-white/5 rounded-xl text-xs font-labels uppercase tracking-wider"
                                disabled={isCreating}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                className="bg-[#FFA000] hover:bg-[#FFA000]/90 text-[#161925] font-bold font-labels uppercase tracking-wider rounded-xl py-5 px-6 flex items-center gap-2"
                                disabled={isCreating}
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Initialize Pipeline"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-[#1c1f2b] border border-white/10 text-white rounded-[24px] max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-heading text-xl font-extrabold text-white">Permanently Delete Pipeline?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/50 text-sm font-sans mt-1">
                            This will completely remove the generation workspace for 
                            <strong> {selectedDraft?.title || "this draft"}</strong>. 
                            Any generated outlines, audio prompts, or chapter text will be permanently erased. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel 
                            onClick={() => setDeleteDialogOpen(false)}
                            className="text-white/60 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl text-xs font-labels uppercase tracking-wider"
                            disabled={isDeleting}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteDraft}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold font-labels uppercase tracking-wider rounded-xl py-5 px-6 flex items-center gap-2"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Workspace"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
