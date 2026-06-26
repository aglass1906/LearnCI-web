"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Layers, RotateCcw, Volume2, Sparkles, 
    BookOpen, Check, HelpCircle, ArrowRight, Play, Award, Clock, Flame,
    Search, Trash2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface SrsCard {
    id: string;
    word: string;
    translation: string;
    type: string;
    definition: string;
    examples: { target: string; english: string }[];
    language: string;
    created_at: string;
    sourceTitle: string;
}

export default function ReviewPage() {
    const supabase = createClient();

    // Authentication & Database State
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [dbWords, setDbWords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [activeFilter, setActiveFilter] = useState("All Decks");

    // Active Study Session State
    const [sessionActive, setSessionActive] = useState(false);
    const [activeQueue, setActiveQueue] = useState<SrsCard[]>([]);
    const [initialSessionSize, setInitialSessionSize] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [reviewsCount, setReviewsCount] = useState(0);
    
    // Performance Scoring metrics
    const [againCount, setAgainCount] = useState(0);
    const [easyCount, setEasyCount] = useState(0);

    // Timing
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
    const [sessionEndTime, setSessionEndTime] = useState<number | null>(null);
    
    // Setup controls
    const [selectedSessionLimit, setSelectedSessionLimit] = useState<number | "all">(10);
    const [isFlipped, setIsFlipped] = useState(false);

    // Browse & Search State
    const [viewMode, setViewMode] = useState<"study" | "browse">("study");
    const [searchQuery, setSearchQuery] = useState("");

    // 1. Fetch User Session & Saved Study Words on Mount
    useEffect(() => {
        const fetchSessionAndWords = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUserId(session.user.id);
                    setUserEmail(session.user.email || "No Email");
                    await fetchSavedWords(session.user.id);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error loading session:", err);
                setLoading(false);
            }
        };
        fetchSessionAndWords();
    }, []);

    // 2. Load Saved Study Words from Supabase
    const fetchSavedWords = async (uid: string) => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from("saved_study_words") as any)
                .select("*")
                .eq("user_id", uid);

            if (error) throw error;
            setDbWords(data || []);
        } catch (err) {
            console.error("Failed to load saved study words:", err);
        } finally {
            setLoading(false);
        }
    };

    // 3. Map Database Records to SrsCard Structure
    const mappedCards = useMemo<SrsCard[]>(() => {
        return dbWords.map(w => ({
            id: w.id,
            word: w.word,
            translation: w.translation || "No translation",
            type: w.part_of_speech || w.verb_tense || "Vocabulary",
            definition: w.grammar_notes || w.lemma || `Saved vocabulary word from "${w.source_title}".`,
            examples: w.sentence_target ? [{ target: w.sentence_target, english: w.sentence_native || "" }] : [],
            language: w.language_code || "spanish",
            created_at: w.created_at,
            sourceTitle: w.source_title || "Other Decks"
        }));
    }, [dbWords]);

    // 4. Extract Unique Decks (by Story Source) and Card Counts
    const deckCategories = useMemo(() => {
        const counts: Record<string, number> = {};
        mappedCards.forEach(card => {
            counts[card.sourceTitle] = (counts[card.sourceTitle] || 0) + 1;
        });

        const sortedDecks = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
        return [
            { name: "All Decks", count: mappedCards.length },
            ...sortedDecks.map(name => ({ name, count: counts[name] }))
        ];
    }, [mappedCards]);

    // 5. Apply Active Deck Filters
    const filteredCards = useMemo(() => {
        return mappedCards.filter(card => 
            activeFilter === "All Decks" || card.sourceTitle === activeFilter
        );
    }, [mappedCards, activeFilter]);

    const activeCard = activeQueue[0];

    // Language locale code mapper for Web Speech synthesis
    const languageNames: Record<string, string> = {
        spanish: "Spanish",
        es: "Spanish",
        french: "French",
        fr: "French",
        german: "German",
        de: "German",
        italian: "Italian",
        it: "Italian",
        portuguese: "Portuguese",
        pt: "Portuguese",
        mandarin: "Mandarin",
        zh: "Mandarin",
        japanese: "Japanese",
        ja: "Japanese",
    };

    // Audio Voice Pronunciation using Web Speech API
    const playPronunciation = (word: string, langCode: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            const langLocales: Record<string, string> = {
                spanish: 'es-ES',
                es: 'es-ES',
                french: 'fr-FR',
                fr: 'fr-FR',
                german: 'de-DE',
                de: 'de-DE',
                italian: 'it-IT',
                it: 'it-IT',
                portuguese: 'pt-PT',
                pt: 'pt-PT',
                japanese: 'ja-JP',
                ja: 'ja-JP',
                mandarin: 'zh-CN',
                zh: 'zh-CN'
            };
            utterance.lang = langLocales[langCode.toLowerCase()] || 'es-ES';
            window.speechSynthesis.speak(utterance);
        }
    };

    // 6. Start the Active Smart Queue Session
    const handleStartSession = () => {
        if (filteredCards.length === 0) return;

        // Shuffle cards for this session
        const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
        
        // Apply session size limit
        const limit = selectedSessionLimit === "all" ? shuffled.length : Math.min(selectedSessionLimit, shuffled.length);
        const sessionPool = shuffled.slice(0, limit);

        setActiveQueue(sessionPool);
        setInitialSessionSize(sessionPool.length);
        setCompletedCount(0);
        setReviewsCount(0);
        setAgainCount(0);
        setEasyCount(0);
        setIsFlipped(false);
        setSessionStartTime(Date.now());
        setSessionEndTime(null);
        setSessionActive(true);
    };

    // 7. Core Intra-Session Smart Queue Re-queuing Engine
    const handleScoreCard = (confidence: "again" | "hard" | "good" | "easy") => {
        if (!activeCard) return;

        setReviewsCount(prev => prev + 1);
        setIsFlipped(false);

        const currentWord = activeCard;
        const remainingQueue = activeQueue.slice(1);

        if (confidence === "easy") {
            setEasyCount(prev => prev + 1);
            setCompletedCount(prev => prev + 1);
            
            // If the queue is now empty, end the session
            if (remainingQueue.length === 0) {
                setSessionActive(false);
                setSessionEndTime(Date.now());
                setActiveQueue([]);
                return;
            }
            setActiveQueue(remainingQueue);
        } else {
            let insertIndex = 0;
            const size = remainingQueue.length;

            if (confidence === "again") {
                setAgainCount(prev => prev + 1);
                // Re-queue near the front: 25% of the remaining deck
                insertIndex = Math.max(1, Math.floor(size * 0.25));
            } else if (confidence === "hard") {
                // Re-queue in the middle: 50% of the remaining deck
                insertIndex = Math.max(1, Math.floor(size * 0.5));
            } else if (confidence === "good") {
                // Re-queue at the end: 100% of the remaining deck
                insertIndex = size;
            }

            // Insert card back into queue at the calculated index
            const newQueue = [
                ...remainingQueue.slice(0, insertIndex),
                currentWord,
                ...remainingQueue.slice(insertIndex)
            ];

            // Animate transition delay slightly so the card doesn't visually glitch during flips
            setTimeout(() => {
                setActiveQueue(newQueue);
            }, 100);
        }
    };

    // Cancel / Exit active session
    const handleExitSession = () => {
        setSessionActive(false);
        setSessionStartTime(null);
        setSessionEndTime(null);
        setActiveQueue([]);
    };

    // Reset stats to setup another deck
    const handleReturnToDecks = () => {
        setSessionEndTime(null);
        setSessionStartTime(null);
        setCompletedCount(0);
        setReviewsCount(0);
    };

    // Format duration helper
    const formatSessionTime = () => {
        if (!sessionStartTime || !sessionEndTime) return "0s";
        const diffMs = sessionEndTime - sessionStartTime;
        const totalSecs = Math.floor(diffMs / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        if (mins > 0) return `${mins}m ${secs}s`;
        return `${secs}s`;
    };

    // Dynamic session progress percentage
    const progressPercent = initialSessionSize > 0 
        ? (completedCount / initialSessionSize) * 100 
        : 0;

    // Filter by search query
    const searchedCards = useMemo(() => {
        return filteredCards.filter(card => 
            card.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
            card.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            card.definition.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [filteredCards, searchQuery]);

    // Delete bookmark word
    const handleDeleteWord = async (cardId: string) => {
        try {
            const { error } = await supabase
                .from("saved_study_words")
                .delete()
                .eq("id", cardId);
            
            if (error) throw error;
            
            // Remove from state
            setDbWords(prev => prev.filter(w => w.id !== cardId));
        } catch (err) {
            console.error("Failed to delete word:", err);
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="h-10 w-10 border-4 border-t-primaryAccent border-white/10 rounded-full animate-spin"></div>
                <p className="font-labels text-[10px] tracking-widest text-white/40 uppercase font-bold">Synchronizing decks...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 relative z-10 max-w-4xl mx-auto px-4">
            
            {/* Top Navigation / Header */}
            {!sessionActive && !sessionEndTime && (
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-primaryAccent/10 border border-primaryAccent/20">
                                <Layers className="h-4 w-4 text-primaryAccent" />
                            </span>
                            <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight">
                                Vocabulary Review Center
                            </h1>
                        </div>
                        <p className="text-white/55 font-sans text-sm mt-1.5 max-w-2xl">
                            Master your saved words in real-time. This page synchronizes with the <strong className="text-white/85">saved_study_words</strong> database table, matching the active vocabulary bookmarked in your iOS and web clients.
                        </p>
                    </div>
                </header>
            )}

            {/* 1. SETUP STATE: Deck Selection & Size Limits */}
            {!sessionActive && !sessionEndTime && (
                <div className="space-y-8 animate-fade-in">
                    
                    {/* Collection Summary Bento Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="glass-card rounded-2xl p-5 text-center border border-white/5 relative overflow-hidden shadow-lg">
                            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(56,97,251,0.05)_0%,rgba(56,97,251,0)_70%)] blur-[30px] pointer-events-none"></div>
                            <span className="block font-labels text-[8px] text-white/35 tracking-widest uppercase font-extrabold">Total Saved Collection</span>
                            <span className="font-heading text-2xl font-extrabold text-white mt-1.5 block">{mappedCards.length} words</span>
                        </div>
                        
                        <div className="glass-card rounded-2xl p-5 text-center border border-white/5 relative overflow-hidden shadow-lg">
                            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(0,229,255,0.05)_0%,rgba(0,229,255,0)_70%)] blur-[30px] pointer-events-none"></div>
                            <span className="block font-labels text-[8px] text-accentTeal tracking-widest uppercase font-extrabold">Active Filter Size</span>
                            <span className="font-heading text-2xl font-extrabold text-accentTeal mt-1.5 block">{filteredCards.length} words</span>
                        </div>

                        <div className="glass-card rounded-2xl p-5 text-center border border-white/5 relative overflow-hidden shadow-lg">
                            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(255,160,0,0.05)_0%,rgba(255,160,0)_70%)] blur-[30px] pointer-events-none"></div>
                            <span className="block font-labels text-[8px] text-primaryAccent tracking-widest uppercase font-extrabold">Device Sync Status</span>
                            <span className="font-heading text-xs font-bold text-emerald-400 mt-2 flex items-center justify-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                DB Connected ({userEmail})
                            </span>
                        </div>
                    </div>

                    {dbWords.length === 0 ? (
                        /* Empty Collection Welcome Card */
                        <div className="glass-card rounded-[28px] border border-white/5 p-12 text-center flex flex-col items-center justify-center min-h-[350px] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(56,97,251,0.06)_0%,rgba(56,97,251,0)_70%)] blur-[80px] pointer-events-none"></div>
                            
                            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mb-6">
                                <Flame className="h-7 w-7" />
                            </div>
                            
                            <h2 className="font-heading text-xl md:text-2xl font-extrabold text-white tracking-tight">
                                Your Study Deck is Empty
                            </h2>
                            <p className="text-white/50 text-xs md:text-sm font-sans mt-2.5 max-w-sm leading-relaxed">
                                You haven't bookmarked any vocabulary words yet. Read immersive stories, listen to podcasts, or watch tracked YouTube videos to mine new words!
                            </p>
                            
                            <Link href="/portal/stories" className="mt-6">
                                <Button className="bg-primaryAccent hover:scale-[1.02] active:scale-[0.98] transition-all text-brandDark font-heading text-xs font-extrabold tracking-wider py-3.5 px-6 rounded-xl shadow-lg shadow-primaryAccent/10 flex items-center gap-1.5">
                                    <BookOpen className="h-4 w-4 fill-brandDark" /> Browse Immersive Stories
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* View Mode Tabs */}
                            <div className="flex border-b border-white/5 pb-px gap-6 max-w-xs">
                                <button
                                    onClick={() => setViewMode("study")}
                                    className={`pb-3 font-heading text-xs font-extrabold tracking-wider uppercase border-b-2 transition-all relative ${
                                        viewMode === "study"
                                            ? "text-primaryAccent border-primaryAccent"
                                            : "text-white/45 border-transparent hover:text-white/80"
                                    }`}
                                >
                                    Study Mode
                                </button>
                                <button
                                    onClick={() => setViewMode("browse")}
                                    className={`pb-3 font-heading text-xs font-extrabold tracking-wider uppercase border-b-2 transition-all relative ${
                                        viewMode === "browse"
                                            ? "text-primaryAccent border-primaryAccent"
                                            : "text-white/45 border-transparent hover:text-white/80"
                                    }`}
                                >
                                    Browse Collection ({dbWords.length})
                                </button>
                            </div>

                            {/* Scrollable category filter chips (Visible on both modes for unified filtering) */}
                            <div className="space-y-3 pt-2">
                                <h3 className="font-labels text-[9px] tracking-widest text-white/40 uppercase font-extrabold">
                                    Filter Deck (Source Story)
                                </h3>
                                <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-white/10 custom-scrollbar pr-2">
                                    {deckCategories.map(deck => (
                                        <button
                                            key={deck.name}
                                            onClick={() => setActiveFilter(deck.name)}
                                            className={`px-4 py-2 rounded-xl text-xs font-labels font-extrabold tracking-wide uppercase border transition-all shrink-0 select-none ${
                                                activeFilter === deck.name
                                                    ? "bg-primaryAccent text-brandDark border-primaryAccent shadow-md shadow-primaryAccent/10"
                                                    : "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border-white/5"
                                            }`}
                                        >
                                            {deck.name} ({deck.count})
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {viewMode === "study" ? (
                                /* Interactive Deck & Limit Setup Screen */
                                <div className="glass-card rounded-[28px] p-6 md:p-8 border border-white/5 space-y-8 shadow-2xl relative overflow-hidden">
                                    
                                    {/* Session limit selector controls */}
                                    <div className="space-y-4">
                                        <h3 className="font-labels text-[9px] tracking-widest text-white/40 uppercase font-extrabold">
                                            Select Session Review Size
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {[5, 10, 20, 30].map(limit => (
                                                <button
                                                    key={limit}
                                                    disabled={filteredCards.length < limit}
                                                    onClick={() => setSelectedSessionLimit(limit)}
                                                    className={`flex-1 min-w-[70px] py-2.5 rounded-xl text-xs font-labels font-extrabold tracking-wider uppercase border transition-all ${
                                                        selectedSessionLimit === limit
                                                            ? "bg-white/10 text-primaryAccent border-primaryAccent/30 shadow-inner"
                                                            : "bg-white/[0.02] hover:bg-white/5 text-white/50 hover:text-white border-white/5 disabled:opacity-30 disabled:hover:bg-white/[0.02]"
                                                    }`}
                                                >
                                                    {limit} Cards
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setSelectedSessionLimit("all")}
                                                className={`flex-2 min-w-[100px] py-2.5 rounded-xl text-xs font-labels font-extrabold tracking-wider uppercase border transition-all ${
                                                    selectedSessionLimit === "all"
                                                        ? "bg-white/10 text-primaryAccent border-primaryAccent/30 shadow-inner"
                                                        : "bg-white/[0.02] hover:bg-white/5 text-white/50 hover:text-white border-white/5"
                                                }`}
                                            >
                                                All Cards ({filteredCards.length})
                                            </button>
                                        </div>
                                    </div>

                                    {/* Large Start Session Call-to-Action */}
                                    <div className="pt-4 border-t border-white/5">
                                        <Button
                                            onClick={handleStartSession}
                                            disabled={filteredCards.length === 0}
                                            className="w-full h-14 bg-gradient-to-r from-primaryAccent to-amber-500 hover:from-primaryAccent hover:to-amber-600 hover:scale-[1.01] active:scale-95 transition-all text-brandDark shadow-lg shadow-primaryAccent/15 rounded-2xl font-heading text-sm font-extrabold tracking-wider flex items-center justify-center gap-2"
                                        >
                                            <Play className="h-4.5 w-4.5 fill-brandDark text-brandDark" />
                                            START INTRA-SESSION SMART QUEUE REVIEW
                                        </Button>
                                        <p className="text-[10px] text-white/30 font-sans text-center mt-2.5 leading-relaxed">
                                            Smart Queue logic dynamically schedules cards during review. Session completes only when all cards are fully mastered.
                                        </p>
                                    </div>

                                </div>
                            ) : (
                                /* Interactive Browse Screen */
                                <div className="space-y-6 animate-fade-in">
                                    
                                    {/* Search input bar */}
                                    <div className="relative w-full md:max-w-md">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                        <input
                                            type="text"
                                            placeholder="Search spelling, translation, or notes..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/[0.02] border border-white/5 focus:border-primaryAccent/30 text-white font-sans text-xs focus:outline-none placeholder:text-white/20 transition-all focus:ring-1 focus:ring-primaryAccent/20"
                                        />
                                    </div>

                                    {/* Words Grid list */}
                                    {searchedCards.length === 0 ? (
                                        <div className="glass-card rounded-[24px] border border-white/5 p-12 text-center text-white/40 font-sans text-sm">
                                            No matching words found in this deck.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {searchedCards.map((card) => (
                                                <div 
                                                    key={card.id} 
                                                    className="glass-card rounded-[24px] p-6 border border-white/5 relative overflow-hidden group hover:bg-white/[0.01] transition-all flex flex-col justify-between gap-4 shadow-xl"
                                                >
                                                    <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(56,97,251,0.02)_0%,rgba(56,97,251,0)_70%)] blur-[35px] pointer-events-none group-hover:opacity-100 transition-opacity opacity-0"></div>
                                                    
                                                    {/* Card Header Info */}
                                                    <div className="flex justify-between items-start gap-4 relative z-10">
                                                        <div className="space-y-1 text-left flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h4 className="font-heading text-xl font-extrabold text-white tracking-tight break-all">
                                                                    {card.word}
                                                                </h4>
                                                                <Badge className="bg-white/5 border border-white/10 text-white/60 font-labels text-[8px] tracking-wider uppercase font-bold px-2 py-0.5 shrink-0">
                                                                    {languageNames[card.language.toLowerCase()] || card.language}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="inline-block text-[8px] font-labels tracking-widest uppercase text-white/35 font-extrabold">
                                                                    {card.type}
                                                                </span>
                                                                <span className="text-white/20 text-[8px]">•</span>
                                                                <span className="text-[8px] font-labels tracking-widest uppercase text-white/25 truncate font-extrabold" title={card.sourceTitle}>
                                                                    {card.sourceTitle}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            <button 
                                                                onClick={() => playPronunciation(card.word, card.language)}
                                                                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-primaryAccent hover:text-primaryAccent/90 transition-all hover:scale-105"
                                                                title="Hear Pronunciation"
                                                            >
                                                                <Volume2 className="h-4 w-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteWord(card.id)}
                                                                className="h-8 w-8 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 flex items-center justify-center text-red-400 hover:text-red-300 transition-all hover:scale-105"
                                                                title="Unbookmark Word"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Card Content Details */}
                                                    <div className="space-y-2.5 text-left border-t border-white/5 pt-3.5 relative z-10">
                                                        <div className="space-y-0.5">
                                                            <span className="block font-labels text-[7px] text-white/30 tracking-widest uppercase font-extrabold">Translation</span>
                                                            <p className="text-xs text-accentTeal font-semibold font-sans">{card.translation}</p>
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <span className="block font-labels text-[7px] text-white/30 tracking-widest uppercase font-extrabold">Definition & Grammar Notes</span>
                                                            <p className="text-xs text-white/65 font-sans leading-relaxed">{card.definition}</p>
                                                        </div>
                                                        
                                                        {card.examples.length > 0 && (
                                                            <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3 space-y-1 mt-1.5">
                                                                <span className="block font-labels text-[6px] text-white/30 tracking-widest uppercase font-extrabold">Context Sentence</span>
                                                                <p className="text-xs text-primaryAccent font-sans italic">{card.examples[0].target}</p>
                                                                {card.examples[0].english && (
                                                                    <p className="text-[10px] text-white/40 font-sans">{card.examples[0].english}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* 2. ACTIVE REVIEW STATE: Flip Card & Cockpit */}
            {sessionActive && activeQueue.length > 0 && activeCard && (
                <div className="space-y-6 animate-fade-in relative z-10">
                    
                    {/* Session HUD Status Bar */}
                    <div className="glass-card p-4 border border-white/5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
                        
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={handleExitSession}
                                className="h-8 rounded-lg px-2.5 border border-red-500/15 text-red-400 hover:bg-red-500/10 text-[9px] font-labels tracking-wider uppercase font-extrabold"
                            >
                                Abort
                            </Button>
                            
                            <div className="text-left font-labels font-extrabold tracking-wider text-[9px] uppercase text-white/40">
                                Session Deck: <strong className="text-white">{activeFilter}</strong>
                            </div>
                        </div>

                        {/* Progress bar tracker */}
                        <div className="flex-1 max-w-md w-full flex items-center gap-3">
                            <div className="flex-1 h-2 rounded-full bg-white/5 border border-white/5 overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-primaryAccent to-accentTeal transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            <span className="font-labels text-[9px] font-extrabold tracking-widest text-accentTeal uppercase w-10 text-right shrink-0">
                                {Math.round(progressPercent)}%
                            </span>
                        </div>

                        {/* Smart Queue Metrics */}
                        <div className="flex items-center gap-4 shrink-0 font-labels font-extrabold tracking-widest text-[9px] uppercase text-white/40">
                            <span>Mastered: <strong className="text-emerald-400">{completedCount}</strong></span>
                            <span>Queue: <strong className="text-primaryAccent">{activeQueue.length}</strong></span>
                        </div>

                    </div>

                    {/* 3D Flashcard */}
                    <div 
                        className={`flip-card w-full h-80 cursor-pointer ${isFlipped ? "flipped" : ""}`} 
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        <div className="flip-card-inner">
                            
                            {/* CARD FRONT VIEW (Target Word) */}
                            <div className="flip-card-front bg-brandSurface rounded-[28px] p-6 md:p-8 border border-white/10 shadow-2xl flex flex-col justify-between items-center text-center relative">
                                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[radial-gradient(circle,rgba(56,97,251,0.03)_0%,rgba(56,97,251,0)_70%)] blur-[25px] pointer-events-none"></div>
                                
                                <div className="w-full flex justify-between items-start text-white/30 font-labels text-[8px] tracking-widest uppercase relative z-10">
                                    <span>Front (Target)</span>
                                    <Badge className="bg-white/5 border border-white/10 text-white/60 font-labels text-[8px] tracking-wider uppercase font-bold px-2 py-0.5">
                                        {languageNames[activeCard.language.toLowerCase()] || activeCard.language}
                                    </Badge>
                                </div>
                                
                                <div className="space-y-4 my-auto relative z-10 w-full px-4">
                                    <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white tracking-tight break-words">
                                        {activeCard.word}
                                    </h2>
                                    <span className="inline-block px-3 py-1 rounded-xl bg-white/5 border border-white/5 text-[9px] font-labels tracking-widest uppercase text-white/40 font-extrabold">
                                        {activeCard.type}
                                    </span>
                                </div>

                                <div className="w-full flex justify-between items-center text-white/40 font-labels text-[9px] tracking-wider uppercase font-bold relative z-10">
                                    <span 
                                        onClick={(e) => { e.stopPropagation(); playPronunciation(activeCard.word, activeCard.language); }}
                                        className="flex items-center gap-1.5 text-primaryAccent hover:text-primaryAccent/85 transition-colors cursor-pointer"
                                        title="Hear Pronunciation"
                                    >
                                        <Volume2 className="h-4 w-4" /> Pronounce
                                    </span>
                                    <span>Tap Card to Flip</span>
                                </div>
                            </div>

                            {/* CARD BACK VIEW (Recall definition) */}
                            <div className="flip-card-back bg-brandSurface rounded-[28px] p-6 md:p-8 border border-white/10 shadow-2xl flex flex-col justify-between items-center text-center relative">
                                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[radial-gradient(circle,rgba(0,229,255,0.03)_0%,rgba(0,229,255,0)_70%)] blur-[25px] pointer-events-none"></div>
                                
                                <div className="w-full flex justify-between items-start text-white/30 font-labels text-[8px] tracking-widest uppercase border-b border-white/5 pb-2.5 relative z-10">
                                    <span>Back (Recall translation)</span>
                                    <span className="text-accentTeal font-extrabold tracking-wide">{activeCard.translation}</span>
                                </div>
                                
                                <div className="space-y-4 my-auto w-full max-w-md relative z-10">
                                    <div className="space-y-1">
                                        <h3 className="font-heading text-2xl font-bold text-accentTeal break-words">
                                            {activeCard.word}
                                        </h3>
                                        <p className="text-xs text-white/50 font-sans font-semibold italic">({activeCard.type})</p>
                                    </div>
                                    
                                    {/* Scrollable content container to prevent text overflows */}
                                    <div className="overflow-y-auto max-h-[120px] space-y-3 pr-1 text-center w-full scrollbar-thin scrollbar-thumb-white/5">
                                        <p className="text-xs text-white/80 font-sans leading-relaxed px-4">
                                            {activeCard.definition}
                                        </p>

                                        {activeCard.examples.length > 0 && (
                                            <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3 text-left space-y-1 mx-4">
                                                <p className="font-labels text-[7px] text-white/30 tracking-widest uppercase font-extrabold">Context Example</p>
                                                <p className="text-xs text-primaryAccent font-sans italic">{activeCard.examples[0].target}</p>
                                                {activeCard.examples[0].english && (
                                                    <p className="text-[10px] text-white/40 font-sans">{activeCard.examples[0].english}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full text-right text-white/30 font-labels text-[8px] tracking-widest uppercase relative z-10">
                                    Tap Card to Flip Front
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Spaced Repetition Grading Cockpit Controls */}
                    {isFlipped ? (
                        <div className="flex flex-col sm:flex-row w-full gap-3 animate-fade-in relative z-20">
                            <Button 
                                onClick={(e) => { e.stopPropagation(); handleScoreCard("again"); }}
                                className="flex-1 h-14 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 text-red-400 rounded-2xl font-labels text-[9px] font-extrabold tracking-widest uppercase flex flex-col justify-center items-center gap-1 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <span>AGAIN</span>
                                <span className="text-[7px] opacity-50 font-sans">STUMBLED (Re-queue 25%)</span>
                            </Button>
                            
                            <Button 
                                onClick={(e) => { e.stopPropagation(); handleScoreCard("hard"); }}
                                className="flex-1 h-14 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500 text-amber-400 rounded-2xl font-labels text-[9px] font-extrabold tracking-widest uppercase flex flex-col justify-center items-center gap-1 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <span>HARD</span>
                                <span className="text-[7px] opacity-50 font-sans">STRUGGLED (Re-queue 50%)</span>
                            </Button>
                            
                            <Button 
                                onClick={(e) => { e.stopPropagation(); handleScoreCard("good"); }}
                                className="flex-1 h-14 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-2xl font-labels text-[9px] font-extrabold tracking-widest uppercase flex flex-col justify-center items-center gap-1 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <span>GOOD</span>
                                <span className="text-[7px] opacity-50 font-sans">RECALLED (Re-queue 100%)</span>
                            </Button>
                            
                            <Button 
                                onClick={(e) => { e.stopPropagation(); handleScoreCard("easy"); }}
                                className="flex-1 h-14 bg-accentTeal/10 hover:bg-accentTeal/20 border border-accentTeal/30 hover:border-accentTeal text-accentTeal rounded-2xl font-labels text-[9px] font-extrabold tracking-widest uppercase flex flex-col justify-center items-center gap-1 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <span>EASY</span>
                                <span className="text-[7px] opacity-50 font-sans">INSTANT (Mastered)</span>
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={() => setIsFlipped(true)}
                            className="w-full h-14 bg-gradient-to-r from-primaryAccent to-amber-500 hover:from-primaryAccent hover:to-amber-600 hover:scale-[1.01] active:scale-95 transition-all text-brandDark shadow-lg shadow-primaryAccent/10 rounded-2xl font-heading text-sm font-extrabold tracking-wider flex items-center justify-center gap-1"
                        >
                            <span>FLIP TO REVEAL KEY DETAILS</span>
                            <Play className="h-4 w-4 fill-brandDark text-brandDark" />
                        </Button>
                    )}

                </div>
            )}

            {/* 3. COMPLETED STATE: Session Stats Bento Card */}
            {!sessionActive && sessionEndTime && (
                <div className="glass-card rounded-[28px] p-8 md:p-12 border border-white/5 text-center flex flex-col items-center justify-center space-y-8 shadow-2xl relative overflow-hidden animate-fade-in max-w-2xl mx-auto">
                    <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(56,97,251,0.07)_0%,rgba(56,97,251,0)_70%)] blur-[80px] pointer-events-none"></div>
                    
                    <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Check className="h-8 w-8" />
                    </div>
                    
                    <div className="space-y-2">
                        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white">Smart Queue Cleared!</h2>
                        <p className="text-white/50 font-sans text-sm max-w-sm mx-auto leading-relaxed">
                            Excellent work, operative. You have successfully committed all <strong className="text-white">{initialSessionSize}</strong> cards to your active vocabulary.
                        </p>
                    </div>

                    {/* Session Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-4 border-t border-white/5">
                        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                            <span className="block font-labels text-[7px] text-white/30 tracking-widest uppercase font-extrabold mb-1">Cards Mastered</span>
                            <span className="font-heading text-lg font-extrabold text-emerald-400">{initialSessionSize}</span>
                        </div>
                        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                            <span className="block font-labels text-[7px] text-white/30 tracking-widest uppercase font-extrabold mb-1">Total Reviews</span>
                            <span className="font-heading text-lg font-extrabold text-primaryAccent">{reviewsCount}</span>
                        </div>
                        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                            <span className="block font-labels text-[7px] text-white/30 tracking-widest uppercase font-extrabold mb-1">Time Elapsed</span>
                            <span className="font-heading text-lg font-extrabold text-purple-400">{formatSessionTime()}</span>
                        </div>
                        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                            <span className="block font-labels text-[7px] text-white/30 tracking-widest uppercase font-extrabold mb-1">Self-Correction</span>
                            <span className="font-heading text-lg font-extrabold text-accentTeal">
                                {reviewsCount > 0 ? Math.round((easyCount / reviewsCount) * 100) : 100}%
                            </span>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
                        <Button 
                            onClick={handleReturnToDecks}
                            className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-heading text-xs font-extrabold tracking-wider uppercase"
                        >
                            Select Another Deck
                        </Button>
                        <Button 
                            onClick={handleStartSession}
                            className="flex-1 h-12 bg-primaryAccent text-brandDark hover:scale-[1.01] active:scale-95 transition-all font-heading text-xs font-extrabold tracking-wider uppercase shadow-lg shadow-primaryAccent/15"
                        >
                            Study Again
                        </Button>
                    </div>
                </div>
            )}

        </div>
    );
}
