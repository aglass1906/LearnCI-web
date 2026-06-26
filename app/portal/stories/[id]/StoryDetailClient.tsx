"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { 
    ChevronLeft, Play, Pause, Volume2, Download, 
    SkipBack, SkipForward, BookOpen, Layers, 
    Sparkles, HelpCircle, Check, BookmarkPlus, BookmarkCheck
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Types for timing and vocabulary
interface WordTiming {
    word: string;
    start: number;
    end: number;
}

interface StoryChapter {
    id?: string;
    chapter_number: number;
    title_target_language: string;
    title_english: string;
    text_target_language: string;
    text_english: string;
    native_audio_url?: string;
    chapter_intro_text?: string;
    chapter_intro_text_english?: string;
    chapter_intro_audio_url?: string;
    chapter_intro_word_timings?: WordTiming[];
    native_word_timings?: WordTiming[];
    vocabulary_note?: string;
    script_target_language?: string;
    script_english?: string;
}

const cleanScriptText = (text: string | null | undefined) => {
    if (!text) return "";
    // Remove speaker tags like [NARRATOR] and emotion tags like (neutral)
    return text.replace(/\[.*?\]\s*(\(.*?\))?\s*/g, "");
};

interface DictionaryEntry {
    word: string;
    translation: string;
    type: string;
    definition: string;
    examples: { target: string; english: string }[];
}

type DisplayLanguage = "target" | "native" | "dual";
type PresenterMode = "prose" | "dialogue" | "vocab";

export default function StoryDetailClient({ story }: { story: any }) {
    const [selectedLanguage, setSelectedLanguage] = useState<DisplayLanguage>("target");
    const [presenterMode, setPresenterMode] = useState<PresenterMode>("prose");
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
    
    // Vocab Lookup State
    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [lookupData, setLookupData] = useState<DictionaryEntry | null>(null);
    const [savedWords, setSavedWords] = useState<string[]>([]);
    
    // Playback segment state: "intro" or "content"
    const [activeSegment, setActiveSegment] = useState<"intro" | "content">("content");
    
    const audioRef = useRef<HTMLAudioElement>(null);
    const textContainerRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Parse chapters and reading matter pages
    const chapters: StoryChapter[] = Array.isArray(story.chapters) ? story.chapters : [];
    const readingMatterPages = Array.isArray(story.reading_matter_pages_json)
        ? story.reading_matter_pages_json
        : [];

    const beforePages = useMemo(() => readingMatterPages.filter((p: any) => p.placement === 'beforeChapters' || p.placement === 'before'), [readingMatterPages]);
    const afterPages = useMemo(() => readingMatterPages.filter((p: any) => p.placement === 'afterChapters' || p.placement === 'after' || !p.placement), [readingMatterPages]);

    const deck = useMemo(() => {
        const items: Array<
            | { type: 'reading_matter'; id: string; titleTarget: string; titleNative: string; bodyTarget: string; bodyNative: string; audioUrl?: string; wordTimings?: any[] }
            | { type: 'chapter'; id: string; chapter: StoryChapter; index: number }
        > = [];

        beforePages.forEach((p: any) => {
            items.push({
                type: 'reading_matter',
                id: p.id || `before-${p.placement}-${Math.random()}`,
                titleTarget: p.titleTarget || p.title_target || 'About the Story',
                titleNative: p.titleNative || p.title_native || 'About the Story',
                bodyTarget: p.bodyTarget || p.body_target || '',
                bodyNative: p.bodyNative || p.body_native || '',
                audioUrl: p.audioUrl || p.audio_url,
                wordTimings: p.wordTimings || p.word_timings
            });
        });

        chapters.forEach((ch: StoryChapter, i: number) => {
            items.push({
                type: 'chapter',
                id: ch.id || `chapter-${i}`,
                chapter: ch,
                index: i
            });
        });

        afterPages.forEach((p: any) => {
            items.push({
                type: 'reading_matter',
                id: p.id || `after-${p.placement}-${Math.random()}`,
                titleTarget: p.titleTarget || p.title_target || 'Appendix',
                titleNative: p.titleNative || p.title_native || 'Appendix',
                bodyTarget: p.bodyTarget || p.body_target || '',
                bodyNative: p.bodyNative || p.body_native || '',
                audioUrl: p.audioUrl || p.audio_url,
                wordTimings: p.wordTimings || p.word_timings
            });
        });

        return items;
    }, [chapters, beforePages, afterPages]);

    const currentItem = deck[currentDeckIndex] || { type: 'chapter', chapter: chapters[0], index: 0 };
    const currentChapter = currentItem.type === 'chapter' ? currentItem.chapter : null;
    const currentChapterIndex = currentItem.type === 'chapter' ? currentItem.index : -1;
    
    const hasChapters = chapters.length > 0;
    const hasMultiplePages = deck.length > 1;

    const prevChapter = () => {
        if (currentDeckIndex > 0) {
            const prevItem = deck[currentDeckIndex - 1];
            setCurrentDeckIndex(currentDeckIndex - 1);
            setActiveSegment(prevItem.type === 'chapter' ? "intro" : "content");
            setCurrentTime(0);
            setIsPlaying(false);
        }
    };

    const nextChapter = () => {
        if (currentDeckIndex < deck.length - 1) {
            const nextItem = deck[currentDeckIndex + 1];
            setCurrentDeckIndex(currentDeckIndex + 1);
            setActiveSegment(nextItem.type === 'chapter' ? "intro" : "content");
            setCurrentTime(0);
            setIsPlaying(false);
        }
    };

    // Load saved words from localStorage to check bookmark states
    useEffect(() => {
        const loadSavedWords = () => {
            const raw = localStorage.getItem('learnci_srs_cards');
            if (raw) {
                try {
                    const cards = JSON.parse(raw);
                    setSavedWords(cards.map((c: any) => c.word.toLowerCase()));
                } catch (e) {
                    console.error(e);
                }
            }
        };
        loadSavedWords();
    }, []);

    // Parse vocabulary note for the current chapter
    const dictionary = useMemo(() => {
        const dict: Record<string, DictionaryEntry> = {};
        const note = currentChapter?.vocabulary_note || story.vocabulary_note;
        if (!note) return dict;

        // Split by lines and parse entries
        const lines = note.split('\n');
        let currentEntry: DictionaryEntry | null = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            if (line.includes('—') || line.includes(' - ')) {
                const delimiter = line.includes('—') ? '—' : '-';
                const cleanLine = line.replace('📝', '').replace(/^\d+\.\s*/, '').trim();
                const parts = cleanLine.split(delimiter);
                
                if (parts.length >= 2) {
                    let wordWithDetails = parts[0].trim();
                    const translation = parts[1].trim();
                    
                    let word = wordWithDetails;
                    let type = "Vocabulary";
                    
                    // Extract type in parentheses/brackets
                    const typeMatch = wordWithDetails.match(/[\(\[](.*?)[\)\]]/);
                    if (typeMatch) {
                        type = typeMatch[1];
                        word = wordWithDetails.replace(typeMatch[0], '').trim();
                    }

                    const key = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'¡¿]/g, "").trim();
                    
                    currentEntry = {
                        word,
                        translation,
                        type,
                        definition: `Key vocabulary word from this chapter. Means "${translation}".`,
                        examples: []
                    };
                    dict[key] = currentEntry;
                }
            } else if (line.startsWith('↳') || /^\d+\./.test(line)) {
                if (currentEntry) {
                    if (/^\d+\./.test(line)) {
                        const targetEx = line.replace(/^\d+\.\s*/, '').trim();
                        let englishEx = "";
                        
                        // Check if next line is a translation
                        if (i + 1 < lines.length && lines[i + 1].trim().startsWith('↳')) {
                            englishEx = lines[i + 1].trim().replace(/^↳\s*/, '').trim();
                            i++;
                        }
                        currentEntry.examples.push({
                            target: targetEx,
                            english: englishEx
                        });
                    }
                }
            }
        }
        return dict;
    }, [currentChapter, story.vocabulary_note]);

    // Format Cover Art URL
    const coverUrl = story.remote_cover_path
        ? supabase.storage.from("audio-stories").getPublicUrl(story.remote_cover_path).data.publicUrl
        : null;

    // Get current Audio Source URL
    const getAudioUrl = () => {
        const userId = (story.user_id || "").toLowerCase();
        const storyId = (story.id || "").toLowerCase();

        if (currentItem.type === 'reading_matter' && currentItem.audioUrl) {
            if (currentItem.audioUrl.startsWith('http')) return currentItem.audioUrl;
            
            const path = currentItem.audioUrl.includes('/')
                ? currentItem.audioUrl
                : `${userId}/${storyId}/audio/${currentItem.audioUrl}`;
            return supabase.storage.from("audio-stories").getPublicUrl(path).data.publicUrl;
        }

        if (currentChapter) {
            if (activeSegment === "intro" && currentChapter.chapter_intro_audio_url) {
                if (currentChapter.chapter_intro_audio_url.startsWith('http')) return currentChapter.chapter_intro_audio_url;
                
                const path = currentChapter.chapter_intro_audio_url.includes('/')
                    ? currentChapter.chapter_intro_audio_url
                    : `${userId}/${storyId}/audio/${currentChapter.chapter_intro_audio_url}`;
                return supabase.storage.from("audio-stories").getPublicUrl(path).data.publicUrl;
            }

            // Standard chapter content audio: fall back to chapter_XX.mp3 if native_audio_url is null
            const chNum = String(currentChapter.chapter_number).padStart(2, '0');
            const chapterAudioPath = currentChapter.native_audio_url || `${userId}/${storyId}/audio/chapter_${chNum}.mp3`;
            
            if (chapterAudioPath.startsWith('http')) return chapterAudioPath;
            return supabase.storage.from("audio-stories").getPublicUrl(chapterAudioPath).data.publicUrl;
        }

        if (story.remote_audio_path) {
            if (story.remote_audio_path.startsWith('http')) return story.remote_audio_path;
            return supabase.storage.from("audio-stories").getPublicUrl(story.remote_audio_path).data.publicUrl;
        }

        return null;
    };

    const audioUrl = getAudioUrl();

    // Map language names
    const languageNames: Record<string, string> = {
        spanish: "Spanish",
        french: "French",
        german: "German",
        italian: "Italian",
        portuguese: "Portuguese",
        mandarin: "Mandarin",
        japanese: "Japanese",
    };
    const languageName = languageNames[story.language.toLowerCase()] || story.language;

    // Audio Event Handlers
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleDurationChange = () => setDuration(audio.duration);
        const handleEnded = () => {
            if (activeSegment === "intro") {
                // Intro ended, transition to main content automatically
                setActiveSegment("content");
                setCurrentTime(0);
                setIsPlaying(false);
            } else if (currentDeckIndex < deck.length - 1) {
                // Main content ended, advance to next page in the deck
                const nextItem = deck[currentDeckIndex + 1];
                setCurrentDeckIndex(prev => prev + 1);
                setActiveSegment(nextItem.type === 'chapter' ? "intro" : "content");
                setCurrentTime(0);
                setIsPlaying(false);
            } else {
                setIsPlaying(false);
            }
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("durationchange", handleDurationChange);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("durationchange", handleDurationChange);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [deck, currentDeckIndex, activeSegment]);

    // Handle segment/page swaps
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.load();
            if (isPlaying) {
                audio.play().catch(console.error);
            }
        }
    }, [currentDeckIndex, activeSegment, audioUrl]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(console.error);
            setIsPlaying(true);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    };

    const changePlaybackRate = (rate: number) => {
        setPlaybackRate(rate);
        if (audioRef.current) {
            audioRef.current.playbackRate = rate;
        }
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Dictionary Lookup Handler
    const handleWordClick = async (wordText: string, element: HTMLElement) => {
        const clean = wordText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'¡¿]/g, "").trim();
        setSelectedWord(wordText);
        
        // Remove previous ring highlights
        if (textContainerRef.current) {
            textContainerRef.current.querySelectorAll('.word-span').forEach(w => {
                w.classList.remove('ring-2', 'ring-accentTeal/80', 'bg-accentTeal/10');
            });
        }
        // Add highlight to clicked element
        element.classList.add('ring-2', 'ring-accentTeal/80', 'bg-accentTeal/10');

        // Look up in our parsed dictionary
        if (dictionary[clean]) {
            setLookupData(dictionary[clean]);
        } else {
            // Set temporary loading state
            const cleanedWord = wordText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'¡¿]/g, "");
            setLookupData({
                word: cleanedWord,
                translation: "Translating...",
                type: "Looking up...",
                definition: `Fetching translation for "${clean}"...`,
                examples: []
            });

            // Perform translation fetch via MyMemory API
            try {
                const langCodes: Record<string, string> = {
                    spanish: 'es',
                    french: 'fr',
                    german: 'de',
                    italian: 'it',
                    portuguese: 'pt',
                    mandarin: 'zh',
                    japanese: 'ja'
                };
                const sourceLang = langCodes[story.language.toLowerCase()] || 'es';
                const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=${sourceLang}|en`);
                if (!res.ok) throw new Error("Translation request failed");
                const data = await res.json();
                const translation = data.responseData?.translatedText || "Translation not found";

                setLookupData({
                    word: cleanedWord,
                    translation: translation,
                    type: "Translation",
                    definition: `Auto-translated "${clean}" from ${languageName} to English. Click "Add to SRS Deck" to save it to your spaced repetition study deck.`,
                    examples: []
                });
            } catch (error) {
                console.error("Translation error:", error);
                setLookupData({
                    word: cleanedWord,
                    translation: "Context Translation",
                    type: "Word",
                    definition: `Could not reach translation service for "${clean}". Acquire this word in context or add it to your Spaced Repetition deck to customize its definition.`,
                    examples: []
                });
            }
        }
    };

    // Voice Pronunciation (TTS fallback)
    const playVoicePronunciation = (word: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            // Match language locale
            const langLocales: Record<string, string> = {
                spanish: 'es-ES',
                french: 'fr-FR',
                german: 'de-DE',
                italian: 'it-IT',
                portuguese: 'pt-PT',
                japanese: 'ja-JP',
                mandarin: 'zh-CN'
            };
            utterance.lang = langLocales[story.language.toLowerCase()] || 'es-ES';
            window.speechSynthesis.speak(utterance);
        }
    };

    // Add Word to Local Spaced Repetition (SRS) Deck
    const handleAddWordToSRS = (entry: DictionaryEntry) => {
        const wordKey = entry.word.toLowerCase();
        
        const raw = localStorage.getItem('learnci_srs_cards');
        let cards = [];
        if (raw) {
            try { cards = JSON.parse(raw); } catch (e) { console.error(e); }
        }

        const exists = cards.some((c: any) => c.word.toLowerCase() === wordKey && c.language === story.language);
        if (exists) return;

        const newCard = {
            id: Math.random().toString(36).substring(2, 9),
            word: entry.word,
            translation: entry.translation,
            type: entry.type,
            definition: entry.definition,
            examples: entry.examples,
            language: story.language,
            created_at: new Date().toISOString(),
            // SuperMemo-2 algorithm parameters
            interval: 1,
            repetition: 0,
            ease_factor: 2.5,
            next_review_date: new Date().toISOString()
        };

        cards.push(newCard);
        localStorage.setItem('learnci_srs_cards', JSON.stringify(cards));
        setSavedWords(prev => [...prev, wordKey]);
    };

    // Extract active chapter timings
    const activeTimings = useMemo(() => {
        if (currentItem.type === 'reading_matter') {
            return currentItem.wordTimings || [];
        }
        if (activeSegment === "intro") {
            return currentChapter?.chapter_intro_word_timings || [];
        }
        
        // Return chapter timings or parse root word timings
        if (currentChapter?.native_word_timings && currentChapter.native_word_timings.length > 0) {
            return currentChapter.native_word_timings;
        }

        // Parse root-level word timings
        if (story.word_timings_json) {
            try {
                const timings = typeof story.word_timings_json === 'string' 
                    ? JSON.parse(story.word_timings_json) 
                    : story.word_timings_json;
                if (Array.isArray(timings)) return timings;
            } catch (e) {
                console.error("Error parsing root word timings:", e);
            }
        }
        return [];
    }, [activeSegment, currentChapter, story.word_timings_json, currentItem]);

    // Active Word Index in timings array
    const activeWordIndex = useMemo(() => {
        return activeTimings.findIndex(t => currentTime >= t.start && currentTime <= t.end);
    }, [activeTimings, currentTime]);

    // Align text and timings
    const richTextWords = useMemo(() => {
        const text = currentItem.type === 'reading_matter'
            ? (currentItem.bodyTarget || "")
            : activeSegment === "intro"
                ? (currentChapter?.chapter_intro_text || "")
                : (currentChapter?.text_target_language || cleanScriptText(currentChapter?.script_target_language) || story.target_text || "");

        if (!text) return [];

        // Split text by whitespace, preserving whitespace elements in the array
        const rawTokens = text.split(/(\s+)/);
        let timingIndex = 0;

        return rawTokens.map((token: string) => {
            if (/^\s+$/.test(token)) {
                return { text: token, isWhitespace: true, cleanText: "", timing: null };
            }
            
            const clean = token.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'¡¿]/g, "").trim();
            
            // Sequential mapping: find next timing matching token
            let matchedTiming = null;
            if (timingIndex < activeTimings.length) {
                matchedTiming = activeTimings[timingIndex];
                timingIndex++;
            }

            return {
                text: token,
                isWhitespace: false,
                cleanText: clean,
                timing: matchedTiming
            };
        });
    }, [activeSegment, currentChapter, story.target_text, activeTimings, currentItem]);

    // Jump audio playhead to word timestamp
    const handleWordTimingJump = (start: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = start;
            setCurrentTime(start);
            if (!isPlaying) {
                audioRef.current.play().catch(console.error);
                setIsPlaying(true);
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Top Navigation Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                <Link 
                    href="/portal/stories" 
                    className="inline-flex items-center text-xs font-labels font-extrabold tracking-widest uppercase text-white/50 hover:text-white transition-colors"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Library
                </Link>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {/* Presenter Mode Selectors */}
                    <div className="inline-flex rounded-xl bg-white/5 p-1 border border-white/5 text-[10px] font-labels font-bold tracking-wider">
                        <button
                            onClick={() => setPresenterMode("prose")}
                            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                                presenterMode === "prose" ? "bg-primaryAccent text-brandDark" : "text-white/60 hover:text-white"
                            }`}
                        >
                            <BookOpen className="h-3.5 w-3.5" /> PROSE PLAYER
                        </button>
                        <button
                            onClick={() => setPresenterMode("vocab")}
                            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                                presenterMode === "vocab" ? "bg-primaryAccent text-brandDark" : "text-white/60 hover:text-white"
                            }`}
                        >
                            <Layers className="h-3.5 w-3.5" /> VOCAB LIST
                        </button>
                    </div>
                </div>
            </div>

            {/* Layout Split: Media Content and Vocabulary Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left Columns (Story Player Area) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Cover Banner Card */}
                    <div className="glass-card rounded-[28px] overflow-hidden relative border border-white/5 group shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-t from-brandDark via-brandDark/40 to-transparent z-10"></div>
                        {coverUrl ? (
                            <div className="relative w-full h-48 md:h-64">
                                <Image
                                    src={coverUrl}
                                    alt={story.title}
                                    fill
                                    className="object-cover group-hover:scale-[1.01] transition-transform duration-700"
                                    priority
                                />
                            </div>
                        ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-primaryAccent/20 to-purple-600/20 flex items-center justify-center">
                                <span className="text-6xl">📚</span>
                            </div>
                        )}
                        
                        {/* Core Details Overlaid on Cover */}
                        <div className="absolute bottom-6 left-6 right-6 z-20 space-y-2">
                            <div className="flex gap-2">
                                <Badge className="bg-primaryAccent text-brandDark font-labels text-[9px] font-extrabold uppercase tracking-widest border-none">
                                    {languageName}
                                </Badge>
                                <Badge className="bg-white/10 text-white font-labels text-[9px] font-bold tracking-widest uppercase border border-white/15">
                                    LEVEL {story.level}
                                </Badge>
                            </div>
                            <h1 className="font-heading text-2xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                                {story.title}
                            </h1>
                        </div>
                    </div>

                    {/* Chapter & Translation Controls */}
                    <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border border-white/5">
                        {/* Chapter selector */}
                        {hasMultiplePages && (
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={prevChapter} 
                                    disabled={currentDeckIndex === 0}
                                    className="rounded-lg text-white/60 hover:text-white hover:bg-white/5 border border-white/5"
                                >
                                    <SkipBack className="h-4 w-4" />
                                </Button>
                                <div className="text-center font-heading text-sm font-bold truncate max-w-[200px]" title={currentItem.type === 'reading_matter' ? currentItem.titleTarget : `Chapter ${currentChapterIndex + 1} of ${chapters.length}`}>
                                    {currentItem.type === 'reading_matter' 
                                        ? currentItem.titleTarget 
                                        : `Chapter ${currentChapterIndex + 1} of ${chapters.length}`
                                    }
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={nextChapter} 
                                    disabled={currentDeckIndex === deck.length - 1}
                                    className="rounded-lg text-white/60 hover:text-white hover:bg-white/5 border border-white/5"
                                >
                                    <SkipForward className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {/* Translation toggle tabs */}
                        <div className="flex rounded-xl bg-white/5 p-1 border border-white/5 text-[10px] font-labels font-bold tracking-wider w-full sm:w-auto">
                            <button
                                onClick={() => setSelectedLanguage("target")}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
                                    selectedLanguage === "target" ? "bg-white/10 text-primaryAccent" : "text-white/60 hover:text-white"
                                }`}
                            >
                                {languageName.toUpperCase()}
                            </button>
                            <button
                                onClick={() => setSelectedLanguage("native")}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
                                    selectedLanguage === "native" ? "bg-white/10 text-primaryAccent" : "text-white/60 hover:text-white"
                                }`}
                            >
                                ENGLISH
                            </button>
                            <button
                                onClick={() => setSelectedLanguage("dual")}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
                                    selectedLanguage === "dual" ? "bg-white/10 text-primaryAccent" : "text-white/60 hover:text-white"
                                }`}
                            >
                                PARALLEL
                            </button>
                        </div>
                    </div>

                    {/* Presenter Views */}
                    {presenterMode === "prose" ? (
                        <div className="space-y-6">
                            {/* Chapter Intro Header Block */}
                            {currentChapter?.chapter_intro_text && (
                                <div className="glass-card rounded-2xl p-6 border-l-4 border-l-primaryAccent bg-primaryAccent/[0.02] space-y-3 relative overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-labels text-[9px] font-extrabold tracking-widest text-primaryAccent uppercase flex items-center gap-1.5">
                                            <Sparkles className="h-3.5 w-3.5 text-primaryAccent" /> CHAPTER OVERVIEW
                                        </h4>
                                        
                                        {/* Intro Audio Trigger */}
                                        {currentChapter.chapter_intro_audio_url && (
                                            <button
                                                onClick={() => {
                                                    setActiveSegment(activeSegment === "intro" ? "content" : "intro");
                                                    setCurrentTime(0);
                                                }}
                                                className={`text-[9px] font-labels font-extrabold tracking-wider px-2.5 py-1 rounded-md border transition-all flex items-center gap-1 ${
                                                    activeSegment === "intro" 
                                                        ? "bg-primaryAccent text-brandDark border-primaryAccent" 
                                                        : "text-white/50 border-white/10 hover:text-white"
                                                }`}
                                            >
                                                <Volume2 className="h-3 w-3" /> 
                                                {activeSegment === "intro" ? "LISTENING INTRO" : "PLAY INTRO AUDIO"}
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-white/70 font-sans italic text-sm leading-relaxed whitespace-pre-wrap">
                                        {selectedLanguage === "native" 
                                            ? currentChapter.chapter_intro_text_english 
                                            : currentChapter.chapter_intro_text
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Main Interactive Story Box */}
                            <div className="glass-card rounded-[24px] p-8 min-h-[300px] border border-white/5 shadow-2xl relative">
                                <div className="absolute top-4 right-6 font-labels text-[8px] tracking-widest text-white/30 uppercase">
                                    Active Chapter Body
                                </div>
                                <div ref={textContainerRef} className="prose prose-lg max-w-none text-white font-sans text-base md:text-lg leading-relaxed select-none">
                                    
                                    {/* Dual-Language Parallel Mode */}
                                    {selectedLanguage === "dual" ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/5">
                                            {/* Target Language Column */}
                                            <div className="space-y-4 pr-2">
                                                <span className="font-labels text-[9px] text-accentTeal tracking-wider block font-bold uppercase mb-2">Target Prose</span>
                                                <div className="leading-loose text-base md:text-lg whitespace-pre-wrap">
                                                    {richTextWords.map((item: any, idx: number) => {
                                                        if (item.isWhitespace) return <span key={idx}>{item.text}</span>;
                                                        
                                                        const isHighlighted = item.timing && activeWordIndex !== -1 && activeTimings[activeWordIndex] === item.timing;
                                                        
                                                        return (
                                                            <span 
                                                                key={idx}
                                                                onClick={(e) => handleWordClick(item.text, e.currentTarget)}
                                                                onDoubleClick={() => item.timing && handleWordTimingJump(item.timing.start)}
                                                                className={`word-span cursor-pointer rounded px-0.5 transition-all duration-150 border-b ${
                                                                    isHighlighted 
                                                                        ? "bg-primaryAccent/20 text-primaryAccent border-b-2 border-primaryAccent font-bold shadow-md shadow-primaryAccent/5 scale-[1.02]" 
                                                                        : "border-transparent hover:bg-white/5 hover:text-white"
                                                                }`}
                                                            >
                                                                {item.text}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            
                                            {/* English Translation Column */}
                                            <div className="space-y-4 pt-6 md:pt-0 md:pl-8">
                                                <span className="font-labels text-[9px] text-white/40 tracking-wider block font-bold uppercase mb-2">Parallel English</span>
                                                <p className="text-white/55 font-sans leading-relaxed whitespace-pre-wrap">
                                                    {currentItem.type === 'reading_matter' ? currentItem.bodyNative : (currentChapter?.text_english || cleanScriptText(currentChapter?.script_english) || story.native_text || "No translation text available.")}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Standard Monolingual Mode (Interactive Click & Karaoke Highlights) */
                                        <div className="leading-loose text-base md:text-lg whitespace-pre-wrap">
                                            {selectedLanguage === "target" ? (
                                                richTextWords.map((item: any, idx: number) => {
                                                    if (item.isWhitespace) return <span key={idx}>{item.text}</span>;
                                                    
                                                    const isHighlighted = item.timing && activeWordIndex !== -1 && activeTimings[activeWordIndex] === item.timing;
                                                    
                                                    return (
                                                        <span 
                                                            key={idx}
                                                            onClick={(e) => handleWordClick(item.text, e.currentTarget)}
                                                            onDoubleClick={() => item.timing && handleWordTimingJump(item.timing.start)}
                                                            className={`word-span cursor-pointer rounded px-0.5 transition-all duration-150 border-b ${
                                                                isHighlighted 
                                                                    ? "bg-primaryAccent/20 text-primaryAccent border-b-2 border-primaryAccent font-bold shadow-md shadow-primaryAccent/5 scale-[1.02]" 
                                                                    : "border-transparent hover:bg-white/5 hover:text-white"
                                                            }`}
                                                        >
                                                            {item.text}
                                                        </span>
                                                    );
                                                })
                                            ) : (
                                                /* English only view */
                                                currentItem.type === 'reading_matter' ? currentItem.bodyNative : (currentChapter?.text_english || cleanScriptText(currentChapter?.script_english) || story.native_text || "")
                                            )}
                                        </div>
                                    )}
                                    
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Vocabulary Note List View */
                        <div className="glass-card rounded-[24px] p-6 border border-white/5 space-y-4">
                            <h3 className="font-heading text-xl font-bold flex items-center gap-2 mb-4">
                                <span className="text-xl">📝</span> Chapter Glossary Index
                            </h3>
                            <div className="divide-y divide-white/5 space-y-4">
                                {Object.keys(dictionary).length === 0 ? (
                                    <div className="text-center py-12 text-white/40 font-sans text-sm">
                                        No structured vocabulary notes found in this chapter. Click words in the prose scroll to translate them on the fly.
                                    </div>
                                ) : (
                                    Object.keys(dictionary).map((key) => {
                                        const entry = dictionary[key];
                                        const isSaved = savedWords.includes(entry.word.toLowerCase());
                                        
                                        return (
                                            <div key={key} className="pt-4 first:pt-0 flex justify-between items-start gap-4">
                                                <div className="space-y-1.5 flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-heading text-lg font-bold text-accentTeal">{entry.word}</span>
                                                        <Badge className="bg-white/5 text-white/60 text-[8px] font-labels tracking-widest uppercase border-none px-1.5 py-0.5">
                                                            {entry.type}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-white/80 font-semibold">{entry.translation}</p>
                                                    
                                                    {entry.examples.length > 0 && (
                                                        <div className="mt-2 pl-3 border-l border-white/10 space-y-1">
                                                            <p className="text-xs text-white/60 font-sans italic">{entry.examples[0].target}</p>
                                                            <p className="text-[11px] text-white/40 font-sans">{entry.examples[0].english}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex gap-1">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon"
                                                        onClick={() => playVoicePronunciation(entry.word)}
                                                        className="rounded-lg hover:bg-white/5 hover:text-white"
                                                    >
                                                        <Volume2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon"
                                                        onClick={() => handleAddWordToSRS(entry)}
                                                        className="rounded-lg hover:bg-white/5"
                                                    >
                                                        {isSaved ? (
                                                            <BookmarkCheck className="h-4 w-4 text-emerald-400" />
                                                        ) : (
                                                            <BookmarkPlus className="h-4 w-4 text-primaryAccent" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* Audio Persistent Cockpit */}
                    {audioUrl && (
                        <div className="glass-card rounded-[20px] p-5 border border-white/10 shadow-2xl">
                            <audio ref={audioRef} src={audioUrl} preload="metadata" />

                            <div className="flex flex-col gap-4">
                                {/* Timeline Progress Slider */}
                                <div className="flex items-center gap-3">
                                    <span className="font-labels text-[10px] text-white/50 w-8 text-right font-bold">
                                        {formatTime(currentTime)}
                                    </span>
                                    
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration || 0}
                                        value={currentTime}
                                        onChange={handleSeek}
                                        className="flex-1 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primaryAccent focus:outline-none"
                                    />
                                    
                                    <span className="font-labels text-[10px] text-white/50 w-8 font-bold">
                                        {formatTime(duration)}
                                    </span>
                                </div>

                                {/* Controls cockpit row */}
                                <div className="flex flex-wrap justify-between items-center gap-4">
                                    
                                    {/* Playback speed selector */}
                                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-xl px-2 py-1">
                                        <span className="font-labels text-[8px] text-white/30 tracking-wider uppercase font-bold pl-1">Speed</span>
                                        <select
                                            value={playbackRate}
                                            onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                                            className="bg-transparent border-none text-xs font-bold text-primaryAccent focus:outline-none focus:ring-0 pr-6 py-0.5 cursor-pointer"
                                        >
                                            <option value="0.5">0.5x</option>
                                            <option value="0.75">0.75x</option>
                                            <option value="1">1.0x</option>
                                            <option value="1.25">1.25x</option>
                                            <option value="1.5">1.5x</option>
                                            <option value="2">2.0x</option>
                                        </select>
                                    </div>

                                    {/* Core Playback Buttons */}
                                    <div className="flex items-center gap-3">
                                        {hasMultiplePages && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={prevChapter}
                                                disabled={currentDeckIndex === 0}
                                                className="rounded-xl hover:bg-white/5 text-white/60 hover:text-white border border-white/5"
                                            >
                                                <SkipBack className="h-4 w-4" />
                                            </Button>
                                        )}

                                        <Button
                                            size="icon"
                                            onClick={togglePlay}
                                            className="h-14 w-14 rounded-full bg-primaryAccent text-brandDark shadow-lg shadow-primaryAccent/15 hover:shadow-primaryAccent/30 hover:scale-105 active:scale-95 transition-all"
                                        >
                                            {isPlaying ? (
                                                <Pause className="h-6 w-6 text-brandDark fill-brandDark" />
                                            ) : (
                                                <Play className="h-6 w-6 ml-0.5 text-brandDark fill-brandDark" />
                                            )}
                                        </Button>

                                        {hasMultiplePages && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={nextChapter}
                                                disabled={currentDeckIndex === deck.length - 1}
                                                className="rounded-xl hover:bg-white/5 text-white/60 hover:text-white border border-white/5"
                                            >
                                                <SkipForward className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    {/* Download button */}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        asChild
                                        className="rounded-xl hover:bg-white/5 text-white/55 hover:text-white border border-white/5"
                                    >
                                        <a href={audioUrl} download title="Download Audio Track">
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </Button>

                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column (Glossary Lookup Panel) */}
                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
                    {/* Active word lookup card */}
                    <div id="vocab-lookup-box" className="glass-card rounded-[24px] p-6 border border-white/5 shadow-2xl min-h-[250px] flex flex-col justify-between relative overflow-hidden">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                            <span className="font-labels text-[10px] tracking-widest text-white/40 uppercase font-bold">Dictionary Console</span>
                            <BookOpen className="h-3.5 w-3.5 text-white/30" />
                        </div>

                        {lookupData ? (
                            <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex flex-wrap justify-between items-center gap-3 w-full">
                                        <h3 className="font-heading text-xl md:text-2xl font-extrabold text-accentTeal break-words" title={lookupData.word}>
                                            {lookupData.word}
                                        </h3>
                                        <span className="px-2.5 py-1 rounded-lg bg-accentTeal/10 border border-accentTeal/20 text-[9px] font-labels tracking-wider uppercase font-extrabold text-accentTeal whitespace-nowrap">
                                            {lookupData.type}
                                        </span>
                                    </div>
                                    <p className="text-white/60 font-sans text-xs mt-2 font-semibold italic">{lookupData.translation}</p>
                                </div>
                                <div className="border-t border-white/5 my-2"></div>
                                <p className="text-xs text-white/80 font-sans leading-relaxed">
                                    {lookupData.definition}
                                </p>
                                
                                {lookupData.examples.length > 0 && (
                                    <div className="space-y-2 bg-white/[0.01] border border-white/5 rounded-xl p-3">
                                        <p className="font-labels text-[8px] text-white/30 tracking-widest uppercase font-bold">Context Examples</p>
                                        {lookupData.examples.map((ex, idx) => (
                                            <div key={idx} className="space-y-0.5">
                                                <p className="text-xs text-primaryAccent font-sans italic">{ex.target}</p>
                                                {ex.english && <p className="text-[10px] text-white/40 font-sans">{ex.english}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="pt-3 flex gap-2">
                                    <Button 
                                        onClick={() => handleAddWordToSRS(lookupData)}
                                        className={`flex-grow py-3 rounded-xl font-heading text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                                            savedWords.includes(lookupData.word.toLowerCase())
                                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                                                : "bg-primaryAccent text-brandDark shadow-md shadow-primaryAccent/10 hover:scale-[1.02] active:scale-[0.98]"
                                        }`}
                                    >
                                        {savedWords.includes(lookupData.word.toLowerCase()) ? (
                                            <>
                                                <Check className="h-4 w-4" /> DECKED
                                            </>
                                        ) : (
                                            <>
                                                <BookmarkPlus className="h-4 w-4" /> ADD TO SRS DECK
                                            </>
                                        )}
                                    </Button>
                                    <Button 
                                        onClick={() => playVoicePronunciation(lookupData.word)}
                                        variant="ghost"
                                        className="rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 p-3 text-white/60 hover:text-white"
                                        title="Hear Pronunciation"
                                    >
                                        <Volume2 className="h-4.5 w-4.5" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center my-auto space-y-3 py-12 text-white/40">
                                <BookOpen className="h-10 w-10 text-white/20" />
                                <p className="text-sm font-sans">
                                    Click any word in the target prose above to load its parallel translation, part of speech, and context sentences in the glossary console.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
