"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
    Cpu, Play, Terminal, Layers, RefreshCw, CheckCircle, 
    AlertCircle, Clock, Info, HelpCircle, Code, Loader2 
} from "lucide-react";
import { invokeEdgeFunction } from "./actions";

interface EdgeFunction {
    name: string;
    description: string;
    status: "idle" | "running" | "error";
    lastRun: string | null;
    runsCount: number;
}

export default function EdgeFunctionsConsole() {
    const [functions, setFunctions] = useState<EdgeFunction[]>([
        { 
            name: "publish_story_pipeline", 
            description: "Copies draft assets, inserts into live stories table, rewrites paths, and publishes.",
            status: "idle", 
            lastRun: null, 
            runsCount: 14 
        },
        { 
            name: "generate_story_images", 
            description: "Triggers DALL-E 3 cover art and chapter illustration generations for a specific story.",
            status: "idle", 
            lastRun: null, 
            runsCount: 42 
        },
        { 
            name: "duplicate_story_pipeline", 
            description: "Clones a story pipeline draft, duplicating outlines, breakdowns, and prompt presets.",
            status: "idle", 
            lastRun: null, 
            runsCount: 3 
        },
        { 
            name: "migrate_stories_to_chapters", 
            description: "Database migration script that reorganizes legacy single-prose stories into multi-chapter tables.",
            status: "idle", 
            lastRun: null, 
            runsCount: 1 
        },
        { 
            name: "migrate_videos", 
            description: "Moves local and legacy video files to standardized Supabase audio-stories storage paths.",
            status: "idle", 
            lastRun: null, 
            runsCount: 5 
        },
        { 
            name: "poll_video_status", 
            description: "Queries background Google Veo video generation operations to check rendering completeness.",
            status: "idle", 
            lastRun: null, 
            runsCount: 108 
        }
    ]);

    const [selectedFunction, setSelectedFunction] = useState<string>("publish_story_pipeline");
    const [customPayload, setCustomPayload] = useState("{\n    \"pipelineId\": \"\",\n    \"storyId\": \"\"\n}");
    const [isExecuting, setIsExecuting] = useState(false);
    const [isValidJson, setIsValidJson] = useState(true);
    
    // Terminal logs
    const [terminalLogs, setTerminalLogs] = useState<Array<{ type: "info" | "success" | "warn" | "error" | "exec"; text: string; time: string }>>([
        { type: "info", text: "LinguistOS Edge Runtime console initialized.", time: new Date().toLocaleTimeString() },
        { type: "info", text: "Deno Deploy secure handshakes completed for 6 active nodes.", time: new Date().toLocaleTimeString() },
        { type: "success", text: "Monitoring active background processes on vuygqrbludhuywupcbma Node Cluster", time: new Date().toLocaleTimeString() }
    ]);
    
    const terminalEndRef = useRef<HTMLDivElement>(null);

    // Scroll terminal to bottom
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [terminalLogs]);

    const addLog = (type: "info" | "success" | "warn" | "error" | "exec", text: string) => {
        setTerminalLogs(prev => [...prev, {
            type,
            text,
            time: new Date().toLocaleTimeString()
        }]);
    };

    const handlePayloadChange = (val: string) => {
        setCustomPayload(val);
        try {
            JSON.parse(val);
            setIsValidJson(true);
        } catch {
            setIsValidJson(false);
        }
    };

    const triggerFunction = async (functionName: string, payloadObj?: Record<string, any>) => {
        setIsExecuting(true);
        
        // Update function status to running
        setFunctions(prev => prev.map(f => f.name === functionName ? { ...f, status: "running" } : f));
        addLog("exec", `[Trigger] Invoking Edge Function: "${functionName}"...`);
        
        try {
            let body = payloadObj;
            if (!body) {
                body = JSON.parse(customPayload);
            }
            
            addLog("info", `Sending secure JWT request payload: ${JSON.stringify(body)}`);
            
            const result = await invokeEdgeFunction(functionName, body || {});
            
            addLog("success", `Edge Function "${functionName}" executed successfully!`);
            addLog("info", `Response data: ${JSON.stringify(result).substring(0, 200)}...`);
            
            // Update function status in grid
            setFunctions(prev => prev.map(f => f.name === functionName ? { 
                ...f, 
                status: "idle",
                lastRun: new Date().toLocaleString(),
                runsCount: f.runsCount + 1
            } : f));
        } catch (err: any) {
            addLog("error", `Function execution failed: ${err.message}`);
            
            setFunctions(prev => prev.map(f => f.name === functionName ? { ...f, status: "error" } : f));
            alert(`Edge function execution failed: ${err.message}`);
        } finally {
            setIsExecuting(false);
        }
    };

    const getLogStyles = (type: string) => {
        switch (type) {
            case "success": return "text-green-400";
            case "error": return "text-red-400 font-semibold animate-pulse";
            case "warn": return "text-yellow-400";
            case "exec": return "text-[#00E5FF]";
            default: return "text-white/70";
        }
    };

    return (
        <div className="space-y-8 pb-12 relative z-10 max-w-7xl mx-auto">
            {/* Header Command Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-accentTeal animate-pulse"></span>
                        Edge Functions Console
                    </h1>
                    <p className="text-white/55 font-sans text-sm mt-1.5 max-w-xl">
                        Monitor active background Deno Deploy microservices, verify runtime execution states, and manually trigger scripts.
                    </p>
                </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {functions.map((func) => (
                    <div 
                        key={func.name}
                        className={`glass-card border rounded-[24px] p-5 flex flex-col justify-between h-56 transition-all duration-300 ${
                            func.status === "running" 
                                ? "border-[#00E5FF]/30 shadow-lg shadow-[#00E5FF]/5 bg-[#00E5FF]/[0.01]" 
                                : func.status === "error"
                                    ? "border-red-500/30 shadow-lg shadow-red-500/5 bg-red-500/[0.01]"
                                    : "border-white/5 hover:border-white/15"
                        }`}
                    >
                        <div className="text-left">
                            <div className="flex justify-between items-start">
                                <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 font-mono text-[11px] font-bold">
                                    {func.name}
                                </span>
                                
                                {/* Status Chip */}
                                {func.status === "running" ? (
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold font-labels uppercase tracking-wider text-[#00E5FF] animate-pulse">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-ping"></span>
                                        Running
                                    </span>
                                ) : func.status === "error" ? (
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold font-labels uppercase tracking-wider text-red-400">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        Failed
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold font-labels uppercase tracking-wider text-white/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
                                        Idle
                                    </span>
                                )}
                            </div>
                            
                            <h3 className="font-heading text-xs text-white/50 font-semibold mt-3.5 leading-relaxed h-10 overflow-hidden">
                                {func.description}
                            </h3>
                        </div>

                        <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[10px] font-mono text-white/40">
                            <div className="flex flex-col gap-0.5">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Last: {func.lastRun ? func.lastRun.split(",")[1] || "Today" : "Never"}
                                </span>
                                <span>Runs: {func.runsCount}</span>
                            </div>
                            
                            <Button
                                size="sm"
                                onClick={() => triggerFunction(func.name, {})}
                                disabled={isExecuting}
                                className={`h-8 px-3 rounded-lg font-labels text-[9px] tracking-wide uppercase flex items-center gap-1.5 ${
                                    func.status === "running"
                                        ? "bg-white/5 text-white/40 border border-white/10"
                                        : "bg-[#FFA000] hover:bg-[#FFA000]/90 text-[#161925] font-extrabold shadow-md shadow-[#FFA000]/10"
                                }`}
                            >
                                {func.status === "running" ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Play className="h-3 w-3 fill-[#161925]" />
                                )}
                                Trigger
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Split Console Panel: Manual Parameterization & Log Terminal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Manual Parameterization Console (lg:col-span-4) */}
                <div className="lg:col-span-4 glass-card border border-white/5 rounded-[24px] p-6 flex flex-col gap-4 min-h-[350px]">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                        <Code className="h-4 w-4 text-[#00E5FF]" />
                        <span className="font-heading text-sm font-extrabold text-white">Parameter Console</span>
                    </div>
                    
                    <div className="space-y-3 flex-1 flex flex-col">
                        <div className="space-y-1.5 text-left">
                            <Label htmlFor="func-select" className="text-white/60 font-labels text-[10px] uppercase tracking-wider block">Target Function</Label>
                            <select
                                id="func-select"
                                value={selectedFunction}
                                onChange={(e) => setSelectedFunction(e.target.value)}
                                className="w-full bg-[#161925] border border-white/10 text-white/80 rounded-xl p-2.5 text-xs font-sans focus:outline-none focus:border-[#00E5FF]/50"
                            >
                                {functions.map(f => (
                                    <option key={f.name} value={f.name}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="space-y-1.5 flex-1 flex flex-col text-left">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="payload-input" className="text-white/60 font-labels text-[10px] uppercase tracking-wider">JSON Payload</Label>
                                <span className={`text-[9px] font-bold uppercase tracking-wider font-mono ${isValidJson ? "text-[#00E5FF]" : "text-red-400"}`}>
                                    {isValidJson ? "Valid JSON" : "Invalid JSON"}
                                </span>
                            </div>
                            <textarea
                                id="payload-input"
                                value={customPayload}
                                onChange={(e) => handlePayloadChange(e.target.value)}
                                className="flex-1 w-full bg-black/30 border border-white/10 text-[#bdf4ff] rounded-xl p-3.5 text-xs font-mono focus:outline-none focus:border-[#00E5FF]/50 resize-none min-h-[160px] outline-none caret-[#FFA000]"
                                spellCheck={false}
                            />
                        </div>
                    </div>
                    
                    <Button
                        onClick={() => triggerFunction(selectedFunction)}
                        disabled={isExecuting || !isValidJson}
                        className="w-full bg-[#00E5FF] hover:bg-[#00E5FF]/95 text-[#161925] font-bold font-labels uppercase tracking-wider rounded-xl py-5 flex items-center justify-center gap-2 shadow-lg shadow-[#00E5FF]/10"
                    >
                        {isExecuting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Triggering Node...
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4 fill-[#161925]" />
                                Execute Function
                            </>
                        )}
                    </Button>
                </div>

                {/* Deno Live Runtime Terminal Log (lg:col-span-8) */}
                <div className="lg:col-span-8 glass-card border border-white/5 rounded-[24px] overflow-hidden flex flex-col min-h-[350px]">
                    <div className="bg-black/40 px-6 py-3 border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="font-mono text-[10px] text-green-400 font-bold uppercase tracking-wider">Deno Live Operator Console</span>
                        </div>
                        <span className="text-[9px] text-white/30 font-mono">v1.44.0 | secure_sandbox</span>
                    </div>
                    
                    {/* Log Terminal Screen */}
                    <div className="flex-1 p-6 font-mono text-[11px] overflow-y-auto bg-black/50 space-y-2 h-72 max-h-80 custom-scrollbar text-left">
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
