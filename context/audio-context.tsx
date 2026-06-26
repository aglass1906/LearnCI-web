"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";

export interface Track {
    id: string;
    title: string;
    subtitle?: string;
    coverUrl?: string;
    audioUrl: string;
    type: "story" | "podcast";
    metadata?: any;
}

interface AudioContextType {
    track: Track | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    playbackRate: number;
    play: () => void;
    pause: () => void;
    seek: (time: number) => void;
    setPlaybackRate: (rate: number) => void;
    playTrack: (track: Track) => void;
    unloadTrack: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [track, setTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Synchronize HTML5 audio element events
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };
        const handleDurationChange = () => {
            setDuration(audio.duration);
        };
        const handleEnded = () => {
            setIsPlaying(false);
            // Dispatch a custom browser event so other components can react
            window.dispatchEvent(
                new CustomEvent("learnci-audio-ended", {
                    detail: { track },
                })
            );
        };
        const handlePlay = () => {
            setIsPlaying(true);
        };
        const handlePause = () => {
            setIsPlaying(false);
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("durationchange", handleDurationChange);
        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("durationchange", handleDurationChange);
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("pause", handlePause);
        };
    }, [track]);

    // Handle track loading and playing changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (track) {
            // Only change src and load if it's a different audio URL
            if (audio.src !== track.audioUrl) {
                audio.src = track.audioUrl;
                audio.load();
            }
            audio.playbackRate = playbackRate;
            if (isPlaying) {
                audio.play().catch((err) => {
                    console.error("[AudioContext] Playback failed:", err);
                    setIsPlaying(false);
                });
            }
        } else {
            audio.pause();
            audio.src = "";
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
        }
    }, [track, isPlaying]);

    const play = () => {
        if (track) {
            setIsPlaying(true);
        }
    };

    const pause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setIsPlaying(false);
    };

    const seek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const changePlaybackRate = (rate: number) => {
        setPlaybackRate(rate);
        if (audioRef.current) {
            audioRef.current.playbackRate = rate;
        }
    };

    const playTrack = (newTrack: Track) => {
        setTrack(newTrack);
        setIsPlaying(true);
    };

    const unloadTrack = () => {
        setTrack(null);
    };

    return (
        <AudioContext.Provider
            value={{
                track,
                isPlaying,
                currentTime,
                duration,
                playbackRate,
                play,
                pause,
                seek,
                setPlaybackRate: changePlaybackRate,
                playTrack,
                unloadTrack,
            }}
        >
            {children}
            <audio ref={audioRef} style={{ display: "none" }} preload="metadata" />
        </AudioContext.Provider>
    );
}

export function useAudio() {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error("useAudio must be used within an AudioProvider");
    }
    return context;
}
