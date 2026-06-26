"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Layers, RotateCcw, Volume2, Sparkles, 
    BookOpen, Check, HelpCircle, ArrowRight, Play
} from "lucide-react";

interface SrsCard {
    id: string;
    word: string;
    translation: string;
    type: string;
    definition: string;
    examples: { target: string; english: string }[];
    language: string;
    created_at: string;
    interval: number; // days
    repetition: number;
    ease_factor: number;
    next_review_date: string;
}

export default function ReviewPage() {
    const [cards, setCards] = useState<SrsCard[]>([]);
    const [isFlipped, setIsFlipped] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [completedCount, setCompletedCount] = useState(0);

    // Load cards from localStorage
    useEffect(() => {
        const loadCards = () => {
            const raw = localStorage.getItem('learnci_srs_cards');
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    setCards(parsed);
                } catch (e) {
                    console.error("Error loading SRS cards:", e);
                }
            }
            setLoading(false);
        };
        loadCards();
    }, []);

    // Filter due cards (next_review_date <= now)
    const dueCards = useMemo(() => {
        const now = new Date();
        return cards.filter(card => {
            const reviewDate = new Date(card.next_review_date);
            return reviewDate <= now;
        });
    }, [cards]);

    const activeCard = dueCards[currentIndex];

    // Format language name
    const languageNames: Record<string, string> = {
        spanish: "Spanish",
        french: "French",
        german: "German",
        italian: "Italian",
        portuguese: "Portuguese",
        mandarin: "Mandarin",
        japanese: "Japanese",
    };

    // Voice Pronunciation
    const playPronunciation = (word: string, language: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            const langLocales: Record<string, string> = {
                spanish: 'es-ES',
                french: 'fr-FR',
                german: 'de-DE',
                italian: 'it-IT',
                portuguese: 'pt-PT',
                japanese: 'ja-JP',
                mandarin: 'zh-CN'
            };
            utterance.lang = langLocales[language.toLowerCase()] || 'es-ES';
            window.speechSynthesis.speak(utterance);
        }
    };

    // SuperMemo-2 SRS Algorithm implementation
    const handleScoreCard = (quality: number) => {
        if (!activeCard) return;

        const updatedCards = cards.map(card => {
            if (card.id !== activeCard.id) return card;

            let repetition = card.repetition;
            let interval = card.interval;
            let easeFactor = card.ease_factor;

            if (quality >= 3) {
                // Correct response
                if (repetition === 0) {
                    interval = 1; // 1 day
                } else if (repetition === 1) {
                    interval = 6; // 6 days
                } else {
                    interval = Math.round(card.interval * easeFactor);
                }
                repetition += 1;
            } else {
                // Incorrect response
                repetition = 0;
                interval = 1; // reset to 1 day
            }

            // Adjust ease factor
            easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
            if (easeFactor < 1.3) easeFactor = 1.3;

            // Set next review date
            const nextReview = new Date();
            nextReview.setDate(nextReview.getDate() + interval);

            return {
                ...card,
                repetition,
                interval,
                ease_factor: easeFactor,
                next_review_date: nextReview.toISOString()
            };
        });

        // Save back to state and localStorage
        setCards(updatedCards);
        localStorage.setItem('learnci_srs_cards', JSON.stringify(updatedCards));

        // Animate review completion
        setIsFlipped(false);
        setCompletedCount(prev => prev + 1);

        // If we have more due cards, advance index (wait for flip animation to finish)
        setTimeout(() => {
            if (currentIndex >= dueCards.length - 1) {
                setCurrentIndex(0);
            }
        }, 300);
    };

    // Reset all review intervals for testing
    const handleResetDecks = () => {
        if (cards.length === 0) return;
        const reset = cards.map(c => ({
            ...c,
            interval: 1,
            repetition: 0,
            ease_factor: 2.5,
            next_review_date: new Date().toISOString()
        }));
        setCards(reset);
        localStorage.setItem('learnci_srs_cards', JSON.stringify(reset));
        setCurrentIndex(0);
        setCompletedCount(0);
        setIsFlipped(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="w-8 h-8 border-4 border-t-primaryAccent border-white/10 rounded-full animate-spin"></div>
                <p className="font-labels text-[10px] tracking-widest text-white/40 uppercase">Loading decks...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 relative z-10 max-w-3xl mx-auto">
            
            {/* Header / Deck Status */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight">
                        Spaced Repetition (SRS)
                    </h1>
                    <p className="text-white/45 font-sans text-sm mt-1">
                        Review cards scheduled for recall practice. SM-2 algorithm active.
                    </p>
                </div>
                
                {cards.length > 0 && (
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleResetDecks}
                        className="rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-labels tracking-wider uppercase font-extrabold flex items-center gap-1"
                    >
                        <RotateCcw className="h-3.5 w-3.5" /> Reset Deck
                    </Button>
                )}
            </header>

            {/* Deck Summary Stats Row */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="flex-1 glass-card rounded-2xl p-4 text-center border border-white/5">
                    <span className="block font-labels text-[8px] text-white/35 tracking-widest uppercase font-bold">Total Collection</span>
                    <span className="font-heading text-xl font-extrabold text-white mt-1 block">{cards.length} cards</span>
                </div>
                <div className="flex-1 glass-card rounded-2xl p-4 text-center border border-white/5">
                    <span className="block font-labels text-[8px] text-accentTeal tracking-widest uppercase font-bold">Due for Review</span>
                    <span className="font-heading text-xl font-extrabold text-accentTeal mt-1 block">{dueCards.length} cards</span>
                </div>
                <div className="flex-1 glass-card rounded-2xl p-4 text-center border border-white/5">
                    <span className="block font-labels text-[8px] text-purple-400 tracking-widest uppercase font-bold">Reviewed Today</span>
                    <span className="font-heading text-xl font-extrabold text-purple-400 mt-1 block">{completedCount} cards</span>
                </div>
            </div>

            {/* Main Interactive Deck Play Area */}
            {dueCards.length === 0 ? (
                <div className="glass-card rounded-[28px] p-12 border border-white/5 text-center flex flex-col items-center justify-center space-y-6 shadow-2xl">
                    <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Check className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-heading text-2xl font-extrabold text-white">Deck Fully Cleared!</h2>
                        <p className="text-white/50 font-sans text-sm max-w-sm mx-auto leading-relaxed">
                            Excellent work, operative. You have completed all due card reviews for today. Return tomorrow or read more stories to mine new vocabulary.
                        </p>
                    </div>
                    
                    <Link href="/portal/stories">
                        <Button className="bg-primaryAccent hover:scale-105 transition-all text-brandDark font-heading text-xs font-extrabold tracking-wider py-3.5 px-6 rounded-xl shadow-lg shadow-primaryAccent/10 flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4 fill-brandDark" /> BROWSE IMMERSIVE STORIES
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Progress tracking bar */}
                    <div className="flex justify-between items-center px-1 font-labels text-[9px] text-white/40 uppercase tracking-widest font-extrabold">
                        <span>Card {currentIndex + 1} of {dueCards.length}</span>
                        <span>{dueCards.length - currentIndex} cards remaining</span>
                    </div>

                    {/* 3D Flashcard Container */}
                    <div className={`flip-card w-full h-80 cursor-pointer ${isFlipped ? "flipped" : ""}`} onClick={() => setIsFlipped(!isFlipped)}>
                        <div className="flip-card-inner">
                            
                            {/* Card Front View (Target Word) */}
                            <div className="flip-card-front bg-brandSurface rounded-[28px] p-8 border border-white/10 shadow-2xl flex flex-col justify-between items-center text-center">
                                <div className="w-full flex justify-between items-start text-white/30 font-labels text-[8px] tracking-widest uppercase">
                                    <span>Front (Target)</span>
                                    <Badge className="bg-white/5 border border-white/10 text-white/60 font-labels text-[8px] tracking-wider uppercase font-bold">
                                        {languageNames[activeCard.language.toLowerCase()] || activeCard.language}
                                    </Badge>
                                </div>
                                
                                <div className="space-y-3 my-auto">
                                    <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                                        {activeCard.word}
                                    </h2>
                                    <span className="inline-block px-2.5 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-labels tracking-wider uppercase text-white/40 font-bold">
                                        {activeCard.type}
                                    </span>
                                </div>

                                <div className="w-full flex justify-between items-center text-white/40 font-labels text-[9px] tracking-wider uppercase font-bold">
                                    <span 
                                        onClick={(e) => { e.stopPropagation(); playPronunciation(activeCard.word, activeCard.language); }}
                                        className="flex items-center gap-1 text-primaryAccent hover:text-primaryAccent/80 transition-colors cursor-pointer animate-pulse"
                                        title="Hear Pronunciation"
                                    >
                                        <Volume2 className="h-4 w-4" /> Click speaker front
                                    </span>
                                    <span>Tap to reveal back</span>
                                </div>
                            </div>

                            {/* Card Back View (Definition & Examples) */}
                            <div className="flip-card-back bg-brandSurface rounded-[28px] p-8 border border-white/10 shadow-2xl flex flex-col justify-between items-center text-center">
                                <div className="w-full flex justify-between items-start text-white/30 font-labels text-[8px] tracking-widest uppercase border-b border-white/5 pb-2">
                                    <span>Back (Recall)</span>
                                    <span className="text-accentTeal font-semibold">{activeCard.translation}</span>
                                </div>
                                
                                <div className="space-y-4 my-auto w-full max-w-md">
                                    <div className="space-y-1">
                                        <h3 className="font-heading text-2xl font-bold text-accentTeal">
                                            {activeCard.word}
                                        </h3>
                                        <p className="text-xs text-white/50 font-sans font-semibold italic">({activeCard.type})</p>
                                    </div>
                                    
                                    {/* Scrollable content container to prevent overflow overlapping */}
                                    <div className="overflow-y-auto max-h-[150px] space-y-3 pr-1 text-center w-full">
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

                                <div className="w-full text-right text-white/30 font-labels text-[8px] tracking-widest uppercase">
                                    Tap to show front
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Spaced Repetition Grading Cockpit Controls */}
                    {isFlipped ? (
                        <div className="flex flex-col sm:flex-row w-full gap-3 animate-fade-in">
                            <Button 
                                onClick={(e) => { e.stopPropagation(); handleScoreCard(1); }}
                                className="flex-1 h-14 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 text-red-400 rounded-2xl font-labels text-[9px] font-extrabold tracking-widest uppercase flex flex-col justify-center items-center gap-1 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <span>AGAIN</span>
                                <span className="text-[7px] opacity-50">STUMBLED</span>
                            </Button>
                            <Button 
                                onClick={(e) => { e.stopPropagation(); handleScoreCard(2); }}
                                className="flex-1 h-14 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500 text-amber-400 rounded-2xl font-labels text-[9px] font-extrabold tracking-widest uppercase flex flex-col justify-center items-center gap-1 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <span>HARD</span>
                                <span className="text-[7px] opacity-50">STRUGGLED</span>
                            </Button>
                            <Button 
                                onClick={(e) => { e.stopPropagation(); handleScoreCard(4); }}
                                className="flex-1 h-14 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-2xl font-labels text-[9px] font-extrabold tracking-widest uppercase flex flex-col justify-center items-center gap-1 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <span>GOOD</span>
                                <span className="text-[7px] opacity-50">RECALLED</span>
                            </Button>
                            <Button 
                                onClick={(e) => { e.stopPropagation(); handleScoreCard(5); }}
                                className="flex-1 h-14 bg-accentTeal/10 hover:bg-accentTeal/20 border border-accentTeal/30 hover:border-accentTeal text-accentTeal rounded-2xl font-labels text-[9px] font-extrabold tracking-widest uppercase flex flex-col justify-center items-center gap-1 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <span>EASY</span>
                                <span className="text-[7px] opacity-50">INSTANT</span>
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
        </div>
    );
}
