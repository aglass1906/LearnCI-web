"use client";

import { cn } from "@/utils/cn";

interface InputRoadmapProps {
    totalMinutes: number;
    className?: string;
}

interface Level {
    id: number;
    range: [number, number]; // [start, end]
    color: string;
    bg: string;
    text: string;
}

export function InputRoadmap({ totalMinutes, className }: InputRoadmapProps) {
    const totalHours = totalMinutes / 60;

    const levels: Level[] = [
        { id: 1, range: [0, 50], color: "bg-teal-500", bg: "bg-teal-500/30", text: "text-teal-600" },
        { id: 2, range: [50, 150], color: "bg-green-500", bg: "bg-green-500/30", text: "text-green-600" },
        { id: 3, range: [150, 300], color: "bg-blue-500", bg: "bg-blue-500/30", text: "text-blue-600" },
        { id: 4, range: [300, 600], color: "bg-orange-500", bg: "bg-orange-500/30", text: "text-orange-600" },
        { id: 5, range: [600, 1000], color: "bg-purple-500", bg: "bg-purple-500/30", text: "text-purple-600" },
        { id: 6, range: [1000, 1500], color: "bg-pink-500", bg: "bg-pink-500/30", text: "text-pink-600" },
    ];

    const MAX_HOURS = 1500;
    const MAX_LEVEL_DURATION = 500; // Level 6 duration

    return (
        <div className={cn("w-full space-y-2", className)}>
            <div className="relative h-24 w-full flex items-end gap-[1px]">
                {/* Background Tracks & User Progress */}
                {levels.map((level) => {
                    const duration = level.range[1] - level.range[0];
                    const widthRatio = (duration / MAX_HOURS) * 100;
                    const heightRatio = 0.2 + (0.8 * (duration / MAX_LEVEL_DURATION));

                    // Progress Calculation
                    const hoursInLevel = Math.max(0, Math.min(totalHours - level.range[0], duration));
                    const fillRatio = (hoursInLevel / duration) * 100;

                    return (
                        <div
                            key={level.id}
                            className="relative flex flex-col justify-end rounded-t-sm"
                            style={{
                                width: `${widthRatio}%`,
                                height: `${heightRatio * 100}%`
                            }}
                        >
                            {/* Background Container */}
                            <div className={cn("absolute inset-0 w-full h-full rounded-t-sm", level.bg)}></div>

                            {/* Label */}
                            <div className="absolute inset-x-0 bottom-1 text-center z-10">
                                <span className={cn("text-[9px] font-bold opacity-80", level.text)}>
                                    L{level.id}
                                </span>
                            </div>

                            {/* Foreground Fill */}
                            <div
                                className={cn("absolute bottom-0 left-0 w-full rounded-t-sm transition-all duration-1000 ease-out", level.color)}
                                style={{ height: `${Math.min(fillRatio, 100)}%` }}
                            ></div>
                        </div>
                    );
                })}

                {/* Current Position Marker (Global) */}
                {totalHours > 0 && totalHours < MAX_HOURS && (
                    <div
                        className="absolute h-full w-0.5 bg-slate-900 dark:bg-white shadow-sm z-20 top-0 pointer-events-none transition-all duration-1000 ease-out"
                        style={{ left: `${(totalHours / MAX_HOURS) * 100}%` }}
                    >
                        <div className="absolute -top-1 -left-[3px] w-2 h-2 bg-slate-900 dark:bg-white rounded-full" />
                    </div>
                )}
            </div>

            {/* Legend / X-Axis */}
            <div className="relative h-4 w-full text-[9px] text-muted-foreground font-medium">
                {levels.map((level) => (
                    <div
                        key={level.id}
                        className="absolute -translate-x-1/2"
                        style={{ left: `${(level.range[1] / MAX_HOURS) * 100}%` }}
                    >
                        {level.range[1]}h
                    </div>
                ))}
            </div>
        </div>
    );
}
