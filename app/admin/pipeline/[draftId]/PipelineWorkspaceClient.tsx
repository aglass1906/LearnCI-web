"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
    ChevronLeft, Save, Code, Play, Terminal, Database, 
    Cpu, Sliders, Check, AlertTriangle, Loader2, RefreshCw 
} from "lucide-react";
import { updatePipelineDraft } from "../actions";
import { invokeEdgeFunction } from "../../functions/actions";

interface PipelineWorkspaceClientProps {
    initialDraft: any;
}

export default function PipelineWorkspaceClient({ initialDraft }: PipelineWorkspaceClientProps) {
    const [draft, setDraft] = useState(initialDraft);
    const [activePhase, setActivePhase] = useState(1);
    
    // Column editor states
    const [selectedColumn, setSelectedColumn] = useState("outline_json");
    const [jsonText, setJsonText] = useState("");
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [isValidJson, setIsValidJson] = useState(true);
    const [isSavingJson, setIsSavingJson] = useState(false);

    // Prompt console states
    const [selectedPromptType, setSelectedPromptType] = useState("text"); // text, image, video
    const [textPrompt, setTextPrompt] = useState(draft.text_gen_prompt || "");
    const [imagePrompt, setImagePrompt] = useState(draft.image_gen_prompt || "");
    const [videoPrompt, setVideoPrompt] = useState(draft.video_gen_prompt || "");
    const [userPrompt, setUserPrompt] = useState(draft.prompt || "");
    const [selectedModel, setSelectedModel] = useState("gemini-1.5-pro");
    const [temperature, setTemperature] = useState(0.7);
    const [isSavingPrompts, setIsSavingPrompts] = useState(false);

    // Terminal log states
    const [terminalLogs, setTerminalLogs] = useState<Array<{ type: "info" | "success" | "warn" | "error" | "exec"; text: string; time: string }>>([
        { type: "info", text: "Initializing workspace pipeline environment...", time: new Date().toLocaleTimeString() },
        { type: "info", text: `Loaded draft pipeline: "${draft.title}"`, time: new Date().toLocaleTimeString() },
        { type: "success", text: "Postgres Core Database connection established", time: new Date().toLocaleTimeString() }
    ]);
    const [isExecutingFunction, setIsExecutingFunction] = useState<string | null>(null);
    const terminalEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const phases = [
        { num: 1, name: "Idea", desc: "Outline & Concepts", col: "outline_json" },
        { num: 2, name: "Script", desc: "Prose & Breakdown", col: "scene_breakdown_json" },
        { num: 3, name: "Arts Forge", desc: "Image Generation", col: "generation_prompts_json" },
        { num: 4, name: "Optimizer", desc: "CI Analysis", col: "ci_analysis_json" },
        { num: 5, name: "Layout", desc: "Chapters & Audio", col: "chapters" },
        { num: 6, name: "Post-Prod", desc: "Veo Video Style", col: "asset_forge_json" },
        { num: 7, name: "Publish", desc: "Sync to Library", col: "pipeline_timestamps_json" }
    ];

    const jsonColumns = [
        { value: "outline_json", label: "outline_json (Phase 1)" },
        { value: "scene_breakdown_json", label: "scene_breakdown_json (Phase 2)" },
        { value: "generation_prompts_json", label: "generation_prompts_json (Phase 3)" },
        { value: "ci_analysis_json", label: "ci_analysis_json (Phase 4)" },
        { value: "chapters", label: "chapters (Phase 5)" },
        { value: "asset_forge_json", label: "asset_forge_json (Phase 6)" },
        { value: "word_timings_json", label: "word_timings_json" },
        { value: "preferences_json", label: "preferences_json" },
        { value: "parameters_json", label: "parameters_json" },
        { value: "pipeline_timestamps_json", label: "pipeline_timestamps_json" }
    ];

    // Scroll terminal to bottom
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [terminalLogs]);

    // Handle phase change -> automatically select default JSON column
    const handlePhaseChange = (phaseNum: number) => {
        setActivePhase(phaseNum);
        const targetPhase = phases.find(p => p.num === phaseNum);
        if (targetPhase) {
            setSelectedColumn(targetPhase.col);
        }
    };

    // Load JSON text when selected column changes
    useEffect(() => {
        const value = draft[selectedColumn];
        const formatted = value ? JSON.stringify(value, null, 4) : "{\n    \n}";
        setJsonText(formatted);
        setJsonError(null);
        setIsValidJson(true);
    }, [selectedColumn, draft]);

    // Validate JSON on the fly
    const handleJsonChange = (val: string) => {
        setJsonText(val);
        if (!val.trim()) {
            setIsValidJson(true);
            setJsonError(null);
            return;
        }
        try {
            JSON.parse(val);
            setIsValidJson(true);
            setJsonError(null);
        } catch (err: any) {
            setIsValidJson(false);
            setJsonError(err.message);
        }
    };

    // Format JSON
    const handleFormatJson = () => {
        try {
            const parsed = JSON.parse(jsonText);
            setJsonText(JSON.stringify(parsed, null, 4));
            setIsValidJson(true);
            setJsonError(null);
        } catch (err: any) {
            setJsonError("Format failed: " + err.message);
        }
    };

    // Save JSON column
    const handleSaveJson = async () => {
        if (!isValidJson) return;
        setIsSavingJson(true);
        addLog("exec", `Commit requested for column "${selectedColumn}"...`);
        
        try {
            const parsed = JSON.parse(jsonText);
            await updatePipelineDraft(draft.id, { [selectedColumn]: parsed });
            
            // Update local state
            setDraft((prev: any) => ({ ...prev, [selectedColumn]: parsed }));
            addLog("success", `Successfully updated database column "${selectedColumn}"`);
        } catch (err: any) {
            addLog("error", `Database commit failed: ${err.message}`);
            alert("Failed to save JSON: " + err.message);
        } finally {
            setIsSavingJson(false);
        }
    };

    // Save Prompts Console
    const handleSavePrompts = async () => {
        setIsSavingPrompts(true);
        addLog("exec", "Updating generation prompts console variables...");
        
        try {
            const updates = {
                prompt: userPrompt,
                text_gen_prompt: textPrompt,
                image_gen_prompt: imagePrompt,
                video_gen_prompt: videoPrompt
            };
            await updatePipelineDraft(draft.id, updates);
            
            setDraft((prev: any) => ({ ...prev, ...updates }));
            addLog("success", "Successfully updated prompts and system instructions");
        } catch (err: any) {
            addLog("error", `Failed to save prompts: ${err.message}`);
            alert("Failed to save prompts: " + err.message);
        } finally {
            setIsSavingPrompts(false);
        }
    };

    // Helper to add log line
    const addLog = (type: "info" | "success" | "warn" | "error" | "exec", text: string) => {
        setTerminalLogs((prev: any) => [...prev, {
            type,
            text,
            time: new Date().toLocaleTimeString()
        }]);
    };

    // Trigger Edge Function Action
    const handleTriggerFunction = async (functionName: string) => {
        setIsExecutingFunction(functionName);
        addLog("exec", `[Trigger] Invoking Edge Function: "${functionName}"...`);
        addLog("info", `Sending authentication JWT & payload for draft ID: ${draft.id}`);
        
        try {
            // Setup parameters
            const payload = {
                pipelineId: draft.id,
                storyId: draft.id
            };
            
            const result = await invokeEdgeFunction(functionName, payload);
            
            addLog("success", `Edge function "${functionName}" executed successfully!`);
            if (result.publishedStoryId) {
                addLog("success", `Story live library sync complete. Published ID: ${result.publishedStoryId}`);
                // Update local draft to show published link
                setDraft((prev: any) => ({ 
                    ...prev, 
                    published_story_id: result.publishedStoryId,
                    pipeline_status: "published"
                }));
            }
            
            // If the function returned updated draft data, we refresh the page or update state
            addLog("info", `Response: ${JSON.stringify(result).substring(0, 150)}...`);
        } catch (err: any) {
            addLog("error", `Execution failed: ${err.message}`);
            alert(`Edge function execution failed: ${err.message}`);
        } finally {
            setIsExecutingFunction(null);
        }
    };

    const getLogStyles = (type: string) => {
        switch (type) {
            case "success": return "text-green-400";
            case "error": return "text-red-400 font-semibold";
            case "warn": return "text-yellow-400";
            case "exec": return "text-[#00E5FF]";
            default: return "text-white/70";
        }
    };

    return (
        <div className="space-y-8 pb-12 relative z-10 max-w-7xl mx-auto">
            {/* Top Toolbar / Breadcrumbs */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/pipeline">
                        <Button variant="ghost" className="h-10 px-3 text-white/60 hover:text-white hover:bg-white/5 rounded-xl flex items-center gap-1.5 text-xs font-labels uppercase tracking-wider">
                            <ChevronLeft className="h-4 w-4" />
                            Back to Pipelines
                        </Button>
                    </Link>
                    <div className="h-5 w-[1px] bg-white/10"></div>
                    <div className="text-left">
                        <h2 className="font-heading text-lg font-extrabold text-white leading-tight">
                            {draft.title || "Untitled Draft"}
                        </h2>
                        <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase tracking-wider">
                            ID: {draft.id} | Status: <span className={draft.pipeline_status === "published" ? "text-[#00E5FF]" : "text-[#FFA000]"}>{draft.pipeline_status || "draft"}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* 7-Phase Timeline step tracker */}
            <div className="glass-card border border-white/5 rounded-[24px] p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-labels text-[10px] tracking-widest text-white/40 uppercase font-extrabold flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF]"></span>
                        Story Pipeline Progress (7 Phases)
                    </h3>
                    <span className="text-xs font-mono text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/20 px-2.5 py-0.5 rounded-full uppercase">
                        Phase {activePhase}: {phases[activePhase-1].name}
                    </span>
                </div>
                
                {/* Steps Bar */}
                <div className="relative">
                    {/* Background Progress Line */}
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2 z-0"></div>
                    {/* Active Progress Line */}
                    <div 
                        className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-[#00E5FF] to-[#FFA000] -translate-y-1/2 z-0 transition-all duration-500"
                        style={{ width: `${((activePhase - 1) / 6) * 100}%` }}
                    ></div>
                    
                    {/* Step Nodes */}
                    <div className="relative z-10 flex justify-between items-center">
                        {phases.map((phase) => {
                            const isCompleted = phase.num < activePhase;
                            const isActive = phase.num === activePhase;
                            
                            return (
                                <button 
                                    key={phase.num}
                                    onClick={() => handlePhaseChange(phase.num)}
                                    className="flex flex-col items-center focus:outline-none group cursor-pointer"
                                >
                                    {/* Indicator Circle */}
                                    <div 
                                        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                                            isActive 
                                                ? "bg-black border-[#00E5FF] text-[#00E5FF] shadow-lg shadow-[#00E5FF]/20 scale-110 ring-4 ring-[#00E5FF]/10" 
                                                : isCompleted 
                                                    ? "bg-[#00E5FF] border-[#00E5FF] text-[#161925]" 
                                                    : "bg-[#161925] border-white/10 text-white/40 group-hover:border-white/30 group-hover:text-white"
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <span className="text-xs font-bold font-mono">✓</span>
                                        ) : (
                                            <span className="text-xs font-bold font-labels">{phase.num}</span>
                                        )}
                                    </div>
                                    {/* Labels */}
                                    <span className={`text-[11px] font-bold font-labels mt-2.5 tracking-wide uppercase transition-colors ${
                                        isActive ? "text-[#00E5FF]" : isCompleted ? "text-white/85" : "text-white/30 group-hover:text-white/50"
                                    }`}>
                                        {phase.name}
                                    </span>
                                    <span className="text-[9px] text-white/20 mt-0.5 font-sans hidden md:block max-w-[90px] text-center leading-none">
                                        {phase.desc}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Split Pane Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Left Pane: JSON Editor (lg:col-span-7) */}
                <div className="lg:col-span-7 flex flex-col glass-card border border-white/5 rounded-[24px] overflow-hidden min-h-[500px]">
                    <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Code className="h-4 w-4 text-[#00E5FF]" />
                            <span className="font-heading text-sm font-extrabold text-white">JSON Document Editor</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={selectedColumn}
                                onChange={(e) => setSelectedColumn(e.target.value)}
                                className="bg-[#161925] border border-white/10 text-white/80 rounded-xl px-3 py-1.5 text-xs font-sans focus:outline-none focus:border-[#00E5FF]/50 transition-all cursor-pointer"
                            >
                                {jsonColumns.map(col => (
                                    <option key={col.value} value={col.value}>{col.label}</option>
                                ))}
                            </select>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-labels tracking-wider uppercase ${
                                isValidJson ? "bg-green-500/10 text-green-400 border border-green-500/25" : "bg-red-500/10 text-red-400 border border-red-500/25"
                            }`}>
                                {isValidJson ? "Valid JSON" : "Malformed"}
                            </span>
                        </div>
                    </div>
                    
                    {/* JSON Textarea Container */}
                    <div className="flex-1 relative font-mono text-xs bg-black/30 flex p-4">
                        {/* Line numbers dummy */}
                        <div className="text-white/20 select-none text-right pr-4 border-r border-white/5 font-mono leading-relaxed h-full pt-1">
                            {Array.from({ length: Math.max(jsonText.split("\n").length, 15) }).map((_, i) => (
                                <div key={i}>{i + 1}</div>
                            ))}
                        </div>
                        {/* Actual textarea */}
                        <textarea
                            value={jsonText}
                            onChange={(e) => handleJsonChange(e.target.value)}
                            className="flex-1 w-full bg-transparent border-0 resize-none focus:outline-none focus:ring-0 text-[#bdf4ff] leading-relaxed font-mono pl-4 pt-1 h-full min-h-[400px] outline-none caret-[#FFA000]"
                            spellCheck={false}
                        />
                    </div>
                    
                    {/* JSON Editor footer */}
                    <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
                        <div className="text-[10px] text-white/30 font-mono">
                            {jsonError ? (
                                <span className="text-red-400 flex items-center gap-1">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    {jsonError.substring(0, 45)}...
                                </span>
                            ) : (
                                <span className="text-white/40">UTF-8 Encoding</span>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                onClick={handleFormatJson}
                                className="text-white/60 hover:text-white hover:bg-white/5 rounded-xl text-xs font-labels uppercase tracking-wider"
                            >
                                Format JSON
                            </Button>
                            <Button
                                onClick={handleSaveJson}
                                disabled={!isValidJson || isSavingJson}
                                className="bg-[#00E5FF] hover:bg-[#00E5FF]/95 text-[#161925] font-bold font-labels uppercase tracking-wider rounded-xl py-2 px-5 flex items-center gap-1.5"
                            >
                                {isSavingJson ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Database className="h-3.5 w-3.5" />
                                        Commit Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Pane: GenAI Prompt Console (lg:col-span-5) */}
                <div className="lg:col-span-5 flex flex-col glass-card border border-white/5 rounded-[24px] overflow-hidden min-h-[500px]">
                    <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-[#FFA000]" />
                            <span className="font-heading text-sm font-extrabold text-white">GenAI Prompt Console</span>
                        </div>
                        <div className="flex border border-white/10 rounded-lg p-0.5 bg-black/20 text-[10px] font-labels uppercase tracking-wider">
                            <button 
                                onClick={() => setSelectedPromptType("text")}
                                className={`px-2.5 py-1 rounded-md transition-all ${selectedPromptType === "text" ? "bg-[#FFA000] text-[#161925] font-bold" : "text-white/40 hover:text-white"}`}
                            >
                                Script
                            </button>
                            <button 
                                onClick={() => setSelectedPromptType("image")}
                                className={`px-2.5 py-1 rounded-md transition-all ${selectedPromptType === "image" ? "bg-[#FFA000] text-[#161925] font-bold" : "text-white/40 hover:text-white"}`}
                            >
                                Image
                            </button>
                            <button 
                                onClick={() => setSelectedPromptType("video")}
                                className={`px-2.5 py-1 rounded-md transition-all ${selectedPromptType === "video" ? "bg-[#FFA000] text-[#161925] font-bold" : "text-white/40 hover:text-white"}`}
                            >
                                Video
                            </button>
                        </div>
                    </div>

                    {/* Prompt Console Body */}
                    <div className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto">
                        
                        {/* Selected Prompt System Instruction */}
                        <div className="space-y-2 flex-1 flex flex-col">
                            <Label className="text-white/60 font-labels text-[10px] uppercase tracking-wider block">
                                {selectedPromptType === "text" ? "Linguistic Engine System Prompt" : selectedPromptType === "image" ? "Illustration Art Forge Prompt" : "Veo Video Subtitle Generation Prompt"}
                            </Label>
                            
                            {selectedPromptType === "text" && (
                                <textarea
                                    value={textPrompt}
                                    onChange={(e) => setTextPrompt(e.target.value)}
                                    placeholder="Enter system prompts for story prose script generation..."
                                    className="flex-1 w-full bg-white/5 border border-white/10 text-white rounded-xl p-3.5 text-xs font-mono focus:outline-none focus:border-[#FFA000]/50 resize-none min-h-[140px]"
                                />
                            )}
                            
                            {selectedPromptType === "image" && (
                                <textarea
                                    value={imagePrompt}
                                    onChange={(e) => setImagePrompt(e.target.value)}
                                    placeholder="Enter instructions for midjourney cover art & chapter illustration generator..."
                                    className="flex-1 w-full bg-white/5 border border-white/10 text-white rounded-xl p-3.5 text-xs font-mono focus:outline-none focus:border-[#FFA000]/50 resize-none min-h-[140px]"
                                />
                            )}
                            
                            {selectedPromptType === "video" && (
                                <textarea
                                    value={videoPrompt}
                                    onChange={(e) => setVideoPrompt(e.target.value)}
                                    placeholder="Enter directions for subtitle extraction, scene syncing, or Veo video generation..."
                                    className="flex-1 w-full bg-white/5 border border-white/10 text-white rounded-xl p-3.5 text-xs font-mono focus:outline-none focus:border-[#FFA000]/50 resize-none min-h-[140px]"
                                />
                            )}
                        </div>

                        {/* Core User Draft Prompt */}
                        <div className="space-y-2">
                            <Label className="text-white/60 font-labels text-[10px] uppercase tracking-wider block">Core Idea / User Prompt</Label>
                            <textarea
                                value={userPrompt}
                                onChange={(e) => setUserPrompt(e.target.value)}
                                placeholder="Enter the core story seed concept that guides the generator..."
                                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3.5 text-xs font-mono focus:outline-none focus:border-[#FFA000]/50 resize-none h-20"
                            />
                        </div>

                        {/* LLM Parameters Grid */}
                        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                            <div className="space-y-2">
                                <Label className="text-white/50 text-[10px] font-labels uppercase tracking-wider flex items-center gap-1">
                                    <Sliders className="h-3 w-3" /> Model
                                </Label>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full bg-[#161925] border border-white/10 text-white/80 rounded-xl p-2 text-xs font-sans focus:outline-none focus:border-[#FFA000]/50"
                                >
                                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                    <option value="gpt-4o">GPT-4o</option>
                                    <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-white/50 text-[10px] font-labels uppercase tracking-wider">Temp</Label>
                                    <span className="text-xs font-mono text-[#FFA000]">{temperature}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1.5"
                                    step="0.1"
                                    value={temperature}
                                    onChange={(e) => setTemperature(Number(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FFA000]"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Prompt Console Footer */}
                    <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01] flex justify-end items-center">
                        <Button
                            onClick={handleSavePrompts}
                            disabled={isSavingPrompts}
                            className="bg-[#FFA000] hover:bg-[#FFA000]/90 text-[#161925] font-bold font-labels uppercase tracking-wider rounded-xl py-2.5 px-6 flex items-center gap-1.5"
                        >
                            {isSavingPrompts ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-3.5 w-3.5" />
                                    Save Prompts
                                </>
                            )}
                        </Button>
                    </div>
                </div>

            </div>

            {/* Bottom Row: Trigger Cockpit & Deno Live Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Edge Function Trigger Cockpit (lg:col-span-4) */}
                <div className="lg:col-span-4 glass-card border border-white/5 rounded-[24px] p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                        <Cpu className="h-4 w-4 text-[#FFA000] animate-pulse" />
                        <span className="font-heading text-sm font-extrabold text-white">Edge Function Cockpit</span>
                    </div>
                    <p className="text-white/40 text-xs font-sans leading-relaxed">
                        Manually execute background Deno Edge deployment scripts to populate or publish this pipeline.
                    </p>
                    
                    <div className="flex-1 flex flex-col gap-3 justify-center">
                        <Button 
                            onClick={() => handleTriggerFunction("duplicate_story_pipeline")}
                            disabled={!!isExecutingFunction}
                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold font-labels tracking-wide uppercase rounded-xl py-5 flex items-center justify-between px-5 transition-all text-xs"
                        >
                            <span>Trigger Generation Step</span>
                            {isExecutingFunction === "duplicate_story_pipeline" ? (
                                <Loader2 className="h-4 w-4 animate-spin text-[#00E5FF]" />
                            ) : (
                                <Play className="h-4 w-4 text-[#FFA000]" />
                            )}
                        </Button>

                        <Button 
                            onClick={() => handleTriggerFunction("generate_story_images")}
                            disabled={!!isExecutingFunction}
                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold font-labels tracking-wide uppercase rounded-xl py-5 flex items-center justify-between px-5 transition-all text-xs"
                        >
                            <span>Forge Illustrations</span>
                            {isExecutingFunction === "generate_story_images" ? (
                                <Loader2 className="h-4 w-4 animate-spin text-[#00E5FF]" />
                            ) : (
                                <Play className="h-4 w-4 text-[#FFA000]" />
                            )}
                        </Button>

                        <Button 
                            onClick={() => handleTriggerFunction("publish_story_pipeline")}
                            disabled={!!isExecutingFunction}
                            className="w-full bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/30 text-[#00E5FF] font-bold font-labels tracking-wide uppercase rounded-xl py-5 flex items-center justify-between px-5 transition-all text-xs shadow-lg shadow-[#00E5FF]/5"
                        >
                            <span>Publish Live Library</span>
                            {isExecutingFunction === "publish_story_pipeline" ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Play className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Deno Live Runtime Terminal Log (lg:col-span-8) */}
                <div className="lg:col-span-8 glass-card border border-white/5 rounded-[24px] overflow-hidden flex flex-col min-h-[260px]">
                    <div className="bg-black/40 px-6 py-3 border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="font-mono text-[10px] text-green-400 font-bold uppercase tracking-wider">Deno Live Operator Console</span>
                        </div>
                        <span className="text-[9px] text-white/30 font-mono">v1.44.0 | secure_sandbox</span>
                    </div>
                    
                    {/* Log Terminal Screen */}
                    <div className="flex-1 p-6 font-mono text-[11px] overflow-y-auto bg-black/50 space-y-1.5 h-48 max-h-56 custom-scrollbar text-left">
                        {terminalLogs.map((log, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <span className="text-white/20 select-none text-[9px] pt-0.5">{log.time}</span>
                                <span className="text-white/35 font-semibold select-none">&gt;&gt;</span>
                                <span className={getLogStyles(log.type)}>
                                    {log.text}
                                </span>
                            </div>
                        ))}
                        <div ref={terminalEndRef} />
                    </div>
                </div>

            </div>

        </div>
    );
}
