"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { 
    Play, Pause, Volume2, RotateCcw, RotateCw, 
    Search, ChevronDown, Headphones, Sparkles, 
    Clock, User, ChevronRight, Check, Plus, Trash2, Loader2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAudio } from "@/context/audio-context";
import { mockPodcasts, PodcastShow, PodcastEpisode } from "@/lib/mock-podcasts";

export default function PodcastsPage() {
    const supabase = createClient();
    const {
        track,
        isPlaying,
        currentTime,
        duration,
        playbackRate,
        play,
        pause,
        seek,
        setPlaybackRate,
        playTrack,
    } = useAudio();

    // Auth & DB States
    const [userId, setUserId] = useState<string | null>(null);
    const [subscriptions, setSubscriptions] = useState<any[]>([]); // DB rows from podcast_shows
    const [dbEpisodes, setDbEpisodes] = useState<any[]>([]);       // DB rows from podcast_episodes
    const [loading, setLoading] = useState(true);
    const [submittingShowId, setSubmittingShowId] = useState<string | null>(null);

    // UI States
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedShowId, setSelectedShowId] = useState<string | null>(null);
    const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
    const [translationMode, setTranslationMode] = useState<"target" | "english" | "parallel">("parallel");
    const [expandedShows, setExpandedShows] = useState<Record<string, boolean>>({});

    const transcriptContainerRef = useRef<HTMLDivElement | null>(null);
    const lastSavedTimeRef = useRef(0);

    // 1. Fetch User Session
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUserId(session.user.id);
                    await fetchPodcastData(session.user.id);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error fetching session:", err);
                setLoading(false);
            }
        };
        fetchSession();
    }, []);

    // 2. Fetch Podcast Data from DB
    const fetchPodcastData = async (uid: string) => {
        setLoading(true);
        try {
            // Fetch shows this user is subscribed to
            const { data: showsData, error: showsError } = await (supabase.from("podcast_shows") as any)
                .select("*")
                .eq("user_id", uid);

            if (showsError) throw showsError;
            const subs = showsData || [];
            setSubscriptions(subs);

            if (subs.length > 0) {
                // Fetch episodes progress linked to these shows
                const showIds = subs.map((s: any) => s.id);
                const { data: epsData, error: epsError } = await (supabase.from("podcast_episodes") as any)
                    .select("*")
                    .in("show_id", showIds);

                if (epsError) throw epsError;
                setDbEpisodes(epsData || []);
            } else {
                setDbEpisodes([]);
            }
        } catch (err) {
            console.error("Error loading podcast database tables:", err);
        } finally {
            setLoading(false);
        }
    };

    // Sync UI selection with background playing track if it's a podcast
    useEffect(() => {
        if (track && track.type === "podcast") {
            // Find show and episode that matches the active track id
            for (const show of mockPodcasts) {
                const ep = show.episodes.find(e => e.id === track.id);
                if (ep) {
                    setSelectedShowId(show.id);
                    setSelectedEpisodeId(ep.id);
                    setExpandedShows(prev => ({ ...prev, [show.id]: true }));
                    break;
                }
            }
        }
    }, [track]);

    // Derived Selection Data
    const selectedShow = useMemo(() => {
        return mockPodcasts.find(s => s.id === selectedShowId) || null;
    }, [selectedShowId]);

    const selectedEpisode = useMemo(() => {
        if (!selectedShow) return null;
        return selectedShow.episodes.find(e => e.id === selectedEpisodeId) || null;
    }, [selectedShow, selectedEpisodeId]);

    // Filter shows/episodes based on search query
    const filteredPodcasts = useMemo(() => {
        if (!searchQuery) return mockPodcasts;
        const query = searchQuery.toLowerCase();
        return mockPodcasts.map(show => {
            const matchesShow = show.title.toLowerCase().includes(query) || 
                                show.description.toLowerCase().includes(query) ||
                                show.host.toLowerCase().includes(query);
            
            const matchedEpisodes = show.episodes.filter(ep => 
                ep.title.toLowerCase().includes(query) || 
                ep.description.toLowerCase().includes(query)
            );

            if (matchesShow || matchedEpisodes.length > 0) {
                return {
                    ...show,
                    episodes: matchesShow ? show.episodes : matchedEpisodes
                };
            }
            return null;
        }).filter(Boolean) as PodcastShow[];
    }, [searchQuery]);

    // Set initial expanded states on load
    useEffect(() => {
        const initialStates: Record<string, boolean> = {};
        mockPodcasts.forEach(show => {
            initialStates[show.id] = show.id === selectedShowId;
        });
        setExpandedShows(prev => ({ ...initialStates, ...prev }));
    }, [selectedShowId]);

    // Active transcript segment calculation
    const activeSegmentIndex = useMemo(() => {
        if (!selectedEpisode || !track || track.id !== selectedEpisode.id) return -1;
        return selectedEpisode.transcript.findIndex(
            seg => currentTime >= seg.start && currentTime <= seg.end
        );
    }, [selectedEpisode, track, currentTime]);

    // Auto-scroll transcript active line into view
    useEffect(() => {
        if (activeSegmentIndex !== -1 && transcriptContainerRef.current) {
            const activeElement = document.getElementById(`segment-${activeSegmentIndex}`);
            if (activeElement) {
                activeElement.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                });
            }
        }
    }, [activeSegmentIndex]);

    // Periodic progress saving to database (every 5 seconds of active playback)
    useEffect(() => {
        if (!userId || !selectedEpisode || !selectedShow) return;
        if (track?.id !== selectedEpisode.id || !isPlaying) return;

        if (Math.abs(currentTime - lastSavedTimeRef.current) >= 5) {
            saveEpisodeProgress(selectedShow.title, selectedEpisode.title, currentTime);
        }
    }, [currentTime, isPlaying, selectedEpisode, selectedShow, track, userId]);

    // Save progress on pause or ended
    useEffect(() => {
        if (!isPlaying && currentTime > 0 && selectedEpisode && selectedShow && userId) {
            saveEpisodeProgress(selectedShow.title, selectedEpisode.title, currentTime);
        }
    }, [isPlaying]);

    const isCurrentEpisode = track?.id === selectedEpisode?.id;

    const getShowSubscription = (showTitle: string) => {
        return subscriptions.find(s => s.title === showTitle) || null;
    };

    const getEpisodeDbRecord = (showTitle: string, episodeTitle: string) => {
        const sub = getShowSubscription(showTitle);
        if (!sub) return null;
        return dbEpisodes.find(e => e.title === episodeTitle && e.show_id === sub.id) || null;
    };

    // DB Operations: Subscribe
    const handleSubscribe = async (show: PodcastShow) => {
        if (!userId) return;
        setSubmittingShowId(show.id);
        try {
            // 1. Insert into podcast_shows
            const { data: newShows, error: showErr } = await (supabase.from("podcast_shows") as any)
                .insert({
                    title: show.title,
                    user_id: userId
                })
                .select();

            if (showErr || !newShows || newShows.length === 0) {
                throw new Error(showErr?.message || "Failed to create show subscription");
            }

            const dbShow = newShows[0];

            // 2. Insert all episodes for this show into podcast_episodes
            const epsToInsert = show.episodes.map(ep => ({
                show_id: dbShow.id,
                title: ep.title,
                duration: ep.duration,
                audio_url: ep.audioUrlPath,
                playback_position: 0,
                is_played: false
            }));

            const { data: newEps, error: epsErr } = await (supabase.from("podcast_episodes") as any)
                .insert(epsToInsert)
                .select();

            if (epsErr) throw epsErr;

            // Update local state
            setSubscriptions(prev => [...prev, dbShow]);
            if (newEps) {
                setDbEpisodes(prev => [...prev, ...newEps]);
            }
        } catch (err) {
            console.error("Error subscribing to podcast show:", err);
        } finally {
            setSubmittingShowId(null);
        }
    };

    // DB Operations: Unsubscribe
    const handleUnsubscribe = async (show: PodcastShow) => {
        if (!userId) return;
        const sub = getShowSubscription(show.title);
        if (!sub) return;

        setSubmittingShowId(show.id);
        try {
            // Delete episodes first (safe cascade)
            await (supabase.from("podcast_episodes") as any)
                .delete()
                .eq("show_id", sub.id);

            // Delete show
            await (supabase.from("podcast_shows") as any)
                .delete()
                .eq("id", sub.id);

            // Update local state
            setSubscriptions(prev => prev.filter(s => s.id !== sub.id));
            setDbEpisodes(prev => prev.filter(e => e.show_id !== sub.id));
        } catch (err) {
            console.error("Error unsubscribing from show:", err);
        } finally {
            setSubmittingShowId(null);
        }
    };

    // DB Operations: Save Episode Playback Progress
    const saveEpisodeProgress = async (showTitle: string, episodeTitle: string, position: number) => {
        const sub = getShowSubscription(showTitle);
        if (!sub) return;

        const dbEp = getEpisodeDbRecord(showTitle, episodeTitle);
        if (!dbEp) return;

        try {
            // Mark as completed if 90% of duration is reached
            const isPlayed = position >= (duration || 30) * 0.9;
            
            const { error } = await (supabase.from("podcast_episodes") as any)
                .update({
                    playback_position: position,
                    is_played: isPlayed
                })
                .eq("id", dbEp.id);

            if (!error) {
                lastSavedTimeRef.current = position;
                setDbEpisodes(prev => prev.map(e => 
                    e.id === dbEp.id 
                        ? { ...e, playback_position: position, is_played: isPlayed } 
                        : e
                ));
            }
        } catch (err) {
            console.error("Error saving playback position:", err);
        }
    };

    const toggleShowExpanded = (showId: string) => {
        setExpandedShows(prev => ({
            ...prev,
            [showId]: !prev[showId]
        }));
    };

    const handlePlayEpisode = (show: PodcastShow, episode: PodcastEpisode) => {
        const { data: { publicUrl } } = supabase.storage
            .from("audio-stories")
            .getPublicUrl(episode.audioUrlPath);

        // Fetch last saved position if subscribed
        const dbEp = getEpisodeDbRecord(show.title, episode.title);
        const savedPosition = dbEp ? dbEp.playback_position : 0;

        playTrack({
            id: episode.id,
            title: episode.title,
            subtitle: show.title,
            coverUrl: show.coverUrl,
            audioUrl: publicUrl,
            type: "podcast",
            metadata: {
                showId: show.id,
                episodeId: episode.id,
            }
        });

        // Resume from saved playback position if available
        if (savedPosition > 0) {
            setTimeout(() => {
                seek(savedPosition);
            }, 350);
        }
    };

    const togglePlay = () => {
        if (!selectedEpisode || !selectedShow) return;
        if (isCurrentEpisode) {
            if (isPlaying) {
                pause();
            } else {
                play();
            }
        } else {
            handlePlayEpisode(selectedShow, selectedEpisode);
        }
    };

    const handleSegmentClick = (segmentStart: number) => {
        if (!selectedEpisode || !selectedShow) return;

        if (isCurrentEpisode) {
            seek(segmentStart);
            if (!isPlaying) play();
        } else {
            handlePlayEpisode(selectedShow, selectedEpisode);
            setTimeout(() => {
                seek(segmentStart);
            }, 350);
        }
    };

    const getLevelBadgeStyle = (level: string) => {
        switch (level) {
            case "BEGINNER":
                return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "INTERMEDIATE":
                return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case "ADVANCED":
                return "bg-rose-500/10 text-rose-400 border-rose-500/20";
            default:
                return "bg-white/10 text-white/60 border-white/10";
        }
    };

    // Main loading skeleton
    if (loading && !userId) {
        return (
            <div className="space-y-8 animate-fade-in pb-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
                    <div className="space-y-2 w-1/3">
                        <div className="h-8 bg-white/5 rounded-xl animate-pulse"></div>
                        <div className="h-4 bg-white/5 rounded-lg animate-pulse w-2/3"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 h-[65vh] bg-white/5 rounded-[28px] animate-pulse"></div>
                    <div className="lg:col-span-8 h-[65vh] bg-white/5 rounded-[28px] animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-24">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="p-1.5 rounded-lg bg-primaryAccent/10 border border-primaryAccent/20">
                            <Headphones className="h-4 w-4 text-primaryAccent" />
                        </span>
                        <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight">
                            Podcast Portal
                        </h1>
                    </div>
                    <p className="text-white/60 text-sm max-w-2xl font-sans">
                        Immerse yourself in conversational Spanish. Subscribe to shows to track progress across devices, bookmark playback positions, and view bilingual scripts.
                    </p>
                </div>
            </div>

            {/* Split View Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Sidebar: Shows and Episodes (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Search and Filters */}
                    <div className="glass-card rounded-2xl p-4 border border-white/5 space-y-3 shadow-lg">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                            <input
                                type="text"
                                placeholder="Search shows or episodes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-sans text-white placeholder-white/45 focus:outline-none focus:border-primaryAccent/50 focus:ring-1 focus:ring-primaryAccent/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Shows List */}
                    <div className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
                        {filteredPodcasts.length === 0 ? (
                            <div className="glass-card rounded-2xl p-8 text-center text-white/40 border border-white/5">
                                <Search className="h-8 w-8 mx-auto mb-2 text-white/20" />
                                <p className="text-xs font-sans">No shows or episodes found matching your search.</p>
                            </div>
                        ) : (
                            filteredPodcasts.map(show => {
                                const isExpanded = !!expandedShows[show.id];
                                const isSubscribed = !!getShowSubscription(show.title);
                                const isSubmitting = submittingShowId === show.id;

                                return (
                                    <div 
                                        key={show.id} 
                                        className={`glass-card rounded-2xl overflow-hidden border transition-all duration-300 shadow-md ${
                                            selectedShowId === show.id 
                                                ? "border-primaryAccent/30 bg-primaryAccent/[0.02]" 
                                                : "border-white/5 hover:border-white/10"
                                        }`}
                                    >
                                        {/* Show Row Header */}
                                        <div 
                                            onClick={() => {
                                                setSelectedShowId(show.id);
                                                toggleShowExpanded(show.id);
                                            }}
                                            className="p-4 flex gap-3 items-center cursor-pointer select-none"
                                        >
                                            <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-inner">
                                                <Image
                                                    src={show.coverUrl}
                                                    alt={show.title}
                                                    fill
                                                    sizes="48px"
                                                    className="object-cover"
                                                />
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <h3 className="font-heading font-extrabold text-sm text-white truncate">
                                                        {show.title}
                                                    </h3>
                                                    {isSubscribed && (
                                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] py-0 px-1 font-labels tracking-widest font-extrabold uppercase shrink-0">
                                                            SUBSCRIBED
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="font-labels text-[9px] text-white/55 font-bold">
                                                        {show.host}
                                                    </span>
                                                    <span className="h-1 w-1 rounded-full bg-white/15"></span>
                                                    <span className="font-labels text-[9px] text-primaryAccent font-extrabold">
                                                        {show.episodes.length} EPISODES
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-white/50 hover:text-white transition-colors shrink-0">
                                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            </div>
                                        </div>

                                        {/* Episodes List (Expanded State) */}
                                        {isExpanded && (
                                            <div className="border-t border-white/5 bg-brandDark/40 p-3 space-y-2">
                                                {/* Subscription Controller inside accordion */}
                                                <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-xl p-2.5 mb-2.5">
                                                    <span className="font-labels text-[9px] text-white/40 uppercase font-bold tracking-wide">
                                                        {isSubscribed ? "Subscription Active" : "Not Subscribed"}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled={isSubmitting}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            isSubscribed ? handleUnsubscribe(show) : handleSubscribe(show);
                                                        }}
                                                        className={`h-7 px-2.5 rounded-lg text-[9px] font-labels tracking-wider font-extrabold uppercase transition-all ${
                                                            isSubscribed 
                                                                ? "text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/10" 
                                                                : "bg-primaryAccent text-brandDark hover:scale-[1.02] active:scale-[0.98]"
                                                        }`}
                                                    >
                                                        {isSubmitting ? (
                                                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                        ) : isSubscribed ? (
                                                            <>
                                                                <Trash2 className="h-3 w-3 mr-1" />
                                                                Unsubscribe
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Plus className="h-3 w-3 mr-1" />
                                                                Subscribe
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>

                                                {show.episodes.map(ep => {
                                                    const isSelected = selectedEpisodeId === ep.id;
                                                    const isPlayingCurrent = isSelected && isCurrentEpisode && isPlaying;
                                                    const dbEp = getEpisodeDbRecord(show.title, ep.title);
                                                    
                                                    // Calculate visual progress from DB records
                                                    const epProgressPercent = dbEp && duration > 0 && isSelected
                                                        ? (currentTime / duration) * 100 
                                                        : dbEp && dbEp.playback_position > 0 && ep.durationSeconds > 0
                                                            ? (dbEp.playback_position / ep.durationSeconds) * 100
                                                            : 0;

                                                    return (
                                                        <div
                                                            key={ep.id}
                                                            onClick={() => {
                                                                setSelectedShowId(show.id);
                                                                setSelectedEpisodeId(ep.id);
                                                            }}
                                                            className={`p-3 rounded-xl border cursor-pointer transition-all relative overflow-hidden ${
                                                                isSelected
                                                                    ? "bg-primaryAccent/10 border-primaryAccent/30 shadow-sm shadow-primaryAccent/5"
                                                                    : "bg-white/[0.01] border-transparent hover:bg-white/5 hover:border-white/5"
                                                            }`}
                                                        >
                                                            {/* Micro progress indicator line */}
                                                            {isSubscribed && epProgressPercent > 0 && (
                                                                <div 
                                                                    className="absolute bottom-0 left-0 h-0.5 bg-primaryAccent/70 transition-all"
                                                                    style={{ width: `${Math.min(100, epProgressPercent)}%` }}
                                                                ></div>
                                                            )}

                                                            <div className="flex items-start justify-between gap-3 relative z-10">
                                                                <div className="space-y-0.5 min-w-0">
                                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                                        <span className="font-labels text-[8px] tracking-widest text-primaryAccent font-extrabold uppercase">
                                                                            {ep.episodeNumber}
                                                                        </span>
                                                                        <Badge className={`text-[8px] font-bold py-0 px-1 px-1.5 border uppercase ${getLevelBadgeStyle(ep.level)}`}>
                                                                            {ep.level}
                                                                        </Badge>
                                                                        {dbEp?.is_played && (
                                                                            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] rounded font-labels font-extrabold tracking-wide">
                                                                                <Check className="h-2 w-2" /> PLAYED
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <h4 className="font-heading font-extrabold text-xs text-white truncate">
                                                                        {ep.title}
                                                                    </h4>
                                                                </div>
                                                                
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedShowId(show.id);
                                                                        setSelectedEpisodeId(ep.id);
                                                                        if (isSelected && isCurrentEpisode) {
                                                                            isPlaying ? pause() : play();
                                                                        } else {
                                                                            handlePlayEpisode(show, ep);
                                                                        }
                                                                    }}
                                                                    className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                                                        isPlayingCurrent
                                                                            ? "bg-primaryAccent text-brandDark shadow-md shadow-primaryAccent/20 hover:scale-105"
                                                                            : isSelected
                                                                                ? "bg-white/10 hover:bg-white/20 text-white hover:scale-105"
                                                                                : "bg-white/5 hover:bg-white/10 text-white/50 hover:text-white"
                                                                    }`}
                                                                >
                                                                    {isPlayingCurrent ? (
                                                                        <Pause className="h-3.5 w-3.5 fill-current" />
                                                                    ) : (
                                                                        <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <div className="flex justify-between items-center mt-2 font-labels text-[9px] text-white/40 font-semibold relative z-10">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {ep.duration}
                                                                </span>
                                                                {isSubscribed && dbEp && dbEp.playback_position > 0 && !dbEp.is_played && (
                                                                    <span className="text-[8px] text-white/30 italic">
                                                                        Saved: {formatTime(dbEp.playback_position)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Sidebar: Active Player and Transcript (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    {!selectedEpisode ? (
                        /* Welcome State */
                        <div className="glass-card rounded-[28px] border border-white/5 p-12 text-center flex flex-col items-center justify-center min-h-[500px] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(56,97,251,0.08)_0%,rgba(56,97,251,0)_70%)] blur-[80px] pointer-events-none"></div>
                            
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primaryAccent/20 to-accentTeal/10 flex items-center justify-center border border-white/10 shadow-lg mb-6 animate-pulse">
                                <Headphones className="h-8 w-8 text-primaryAccent" />
                            </div>
                            
                            <h2 className="font-heading text-xl md:text-2xl font-extrabold text-white tracking-tight max-w-md">
                                Audio Immersion Center
                            </h2>
                            <p className="text-white/50 text-xs md:text-sm font-sans mt-2 max-w-sm leading-relaxed">
                                Select a show and episode from the sidebar to start listening. Subscribe to save your playback progress and automatically resume exactly where you left off.
                            </p>
                        </div>
                    ) : (
                        /* Active Episode & Player View */
                        <div className="space-y-6 animate-fade-in">
                            {/* Episode Card */}
                            <div className="glass-card rounded-[28px] overflow-hidden border border-white/5 relative shadow-2xl flex flex-col md:flex-row">
                                <div 
                                    className="absolute inset-0 opacity-[0.03] scale-110 pointer-events-none bg-cover bg-center filter blur-xl"
                                    style={{ backgroundImage: `url(${selectedShow?.coverUrl || ""})` }}
                                ></div>

                                {/* Show Cover Image */}
                                <div className="relative w-full md:w-52 h-44 md:h-auto shrink-0 border-b md:border-b-0 md:border-r border-white/5 shadow-md">
                                    <Image
                                        src={selectedShow?.coverUrl || ""}
                                        alt={selectedShow?.title || ""}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 208px"
                                        className="object-cover"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-brandDark via-brandDark/20 to-transparent md:hidden"></div>
                                </div>

                                {/* Episode Metadata & Details */}
                                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex gap-2 items-center flex-wrap">
                                            <Badge className="bg-primaryAccent/10 text-primaryAccent font-labels text-[9px] font-extrabold uppercase tracking-wider border border-primaryAccent/20">
                                                {selectedShow?.title}
                                            </Badge>
                                            <Badge className={`font-labels text-[9px] font-bold tracking-wider uppercase border ${getLevelBadgeStyle(selectedEpisode.level)}`}>
                                                {selectedEpisode.level}
                                            </Badge>
                                            <span className="font-labels text-[9px] text-white/30 tracking-widest font-bold uppercase">
                                                {selectedEpisode.episodeNumber}
                                            </span>
                                        </div>
                                        
                                        <h2 className="font-heading text-xl md:text-2xl font-extrabold text-white tracking-tight leading-tight">
                                            {selectedEpisode.title}
                                        </h2>
                                        
                                        <p className="text-white/60 font-sans text-xs leading-relaxed max-w-xl">
                                            {selectedEpisode.description}
                                        </p>
                                    </div>

                                    {/* Host Row */}
                                    <div className="flex items-center gap-2.5 pt-2 border-t border-white/5">
                                        <div className="relative h-7 w-7 rounded-full overflow-hidden border border-white/10 shrink-0">
                                            <Image
                                                src={selectedShow?.hostAvatarUrl || ""}
                                                alt={selectedShow?.host || ""}
                                                fill
                                                sizes="28px"
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-labels text-[8px] text-white/30 tracking-wider uppercase font-extrabold">Host</p>
                                            <p className="font-heading font-bold text-xs text-white/80">{selectedShow?.host}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Player Controls Panel */}
                            <div className="glass-card rounded-[24px] p-5 border border-white/5 shadow-xl space-y-4">
                                {/* Timeline Scrubber */}
                                <div className="flex items-center gap-3">
                                    <span className="font-labels text-[10px] text-white/50 w-10 text-right font-bold">
                                        {formatTime(isCurrentEpisode ? currentTime : 0)}
                                    </span>
                                    
                                    <input
                                        type="range"
                                        min="0"
                                        max={(isCurrentEpisode ? duration : selectedEpisode.durationSeconds) || 1}
                                        value={isCurrentEpisode ? currentTime : 0}
                                        onChange={(e) => {
                                            if (isCurrentEpisode) {
                                                seek(parseFloat(e.target.value));
                                            }
                                        }}
                                        disabled={!isCurrentEpisode}
                                        className="flex-1 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primaryAccent focus:outline-none disabled:opacity-50"
                                        style={{
                                            background: `linear-gradient(to right, var(--color-primaryAccent, #3861FB) ${
                                                isCurrentEpisode && duration > 0 ? (currentTime / duration) * 100 : 0
                                            }%, rgba(255, 255, 255, 0.05) ${
                                                isCurrentEpisode && duration > 0 ? (currentTime / duration) * 100 : 0
                                            }%)`
                                        }}
                                    />
                                    
                                    <span className="font-labels text-[10px] text-white/50 w-10 font-bold">
                                        {formatTime(isCurrentEpisode ? duration : selectedEpisode.durationSeconds)}
                                    </span>
                                </div>

                                {/* Speed & Play Buttons Row */}
                                <div className="flex flex-wrap justify-between items-center gap-4">
                                    {/* Playback speed */}
                                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-xl px-2.5 py-1.5">
                                        <span className="font-labels text-[9px] text-white/30 tracking-wider uppercase font-bold pl-1">Speed</span>
                                        <select
                                            value={playbackRate}
                                            onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                                            disabled={!isCurrentEpisode}
                                            className="bg-transparent border-none text-xs font-bold text-primaryAccent focus:outline-none focus:ring-0 pr-6 py-0.5 cursor-pointer disabled:opacity-50"
                                        >
                                            <option value="0.5">0.5x</option>
                                            <option value="0.75">0.75x</option>
                                            <option value="1">1.0x</option>
                                            <option value="1.25">1.25x</option>
                                            <option value="1.5">1.5x</option>
                                            <option value="2">2.0x</option>
                                        </select>
                                    </div>

                                    {/* Action Cockpit Buttons */}
                                    <div className="flex items-center gap-4 mx-auto sm:mx-0">
                                        {/* Rewind 10s */}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => seek(Math.max(0, currentTime - 10))}
                                            disabled={!isCurrentEpisode}
                                            className="rounded-xl border border-white/5 hover:bg-white/5 text-white/60 hover:text-white h-10 w-10 shrink-0"
                                            title="Rewind 10s"
                                        >
                                            <RotateCcw className="h-4.5 w-4.5" />
                                        </Button>

                                        {/* Core Play Button */}
                                        <Button
                                            size="icon"
                                            onClick={togglePlay}
                                            className="h-14 w-14 rounded-full bg-primaryAccent text-brandDark shadow-lg shadow-primaryAccent/15 hover:shadow-primaryAccent/30 hover:scale-105 active:scale-95 transition-all shrink-0"
                                        >
                                            {isCurrentEpisode && isPlaying ? (
                                                <Pause className="h-6 w-6 text-brandDark fill-brandDark" />
                                            ) : (
                                                <Play className="h-6 w-6 ml-0.5 text-brandDark fill-brandDark" />
                                            )}
                                        </Button>

                                        {/* Fast Forward 10s */}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => seek(Math.min(duration, currentTime + 10))}
                                            disabled={!isCurrentEpisode}
                                            className="rounded-xl border border-white/5 hover:bg-white/5 text-white/60 hover:text-white h-10 w-10 shrink-0"
                                            title="Fast Forward 10s"
                                        >
                                            <RotateCw className="h-4.5 w-4.5" />
                                        </Button>
                                    </div>

                                    {/* Subscription Tracker Alert Status */}
                                    <div className="flex items-center justify-end text-right shrink-0 w-full sm:w-auto">
                                        {selectedShow && getShowSubscription(selectedShow.title) ? (
                                            <span className="font-labels text-[9px] text-emerald-400 font-bold tracking-wide flex items-center gap-1 bg-emerald-500/5 border border-emerald-500/15 px-2.5 py-1.5 rounded-xl">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                DB Progress Sync Active
                                            </span>
                                        ) : (
                                            <span className="font-labels text-[9px] text-white/30 tracking-wide flex items-center gap-1 bg-white/[0.02] border border-white/5 px-2.5 py-1.5 rounded-xl">
                                                Not Subscribed (Progress Local Only)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Transcript Console Panel */}
                            <div className="glass-card rounded-[24px] overflow-hidden border border-white/5 shadow-2xl flex flex-col">
                                {/* Transcript Panel Header */}
                                <div className="p-4 border-b border-white/5 bg-white/[0.01] flex flex-col sm:flex-row justify-between items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-primaryAccent" />
                                        <span className="font-heading font-extrabold text-sm text-white">
                                            Interactive Transcript
                                        </span>
                                        <Badge className="bg-amber-500/10 text-amber-400 border-none text-[8px] font-labels tracking-wider font-extrabold uppercase px-1.5 py-0.5">
                                            KARAOKE SYNC
                                        </Badge>
                                    </div>

                                    {/* Translation Toggles */}
                                    <div className="flex rounded-xl bg-white/5 p-1 border border-white/5 text-[9px] font-labels font-bold tracking-wider w-full sm:w-auto">
                                        <button
                                            onClick={() => setTranslationMode("target")}
                                            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all ${
                                                translationMode === "target"
                                                    ? "bg-white/10 text-primaryAccent"
                                                    : "text-white/60 hover:text-white"
                                            }`}
                                        >
                                            SPANISH
                                        </button>
                                        <button
                                            onClick={() => setTranslationMode("english")}
                                            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all ${
                                                translationMode === "english"
                                                    ? "bg-white/10 text-primaryAccent"
                                                    : "text-white/60 hover:text-white"
                                            }`}
                                        >
                                            ENGLISH
                                        </button>
                                        <button
                                            onClick={() => setTranslationMode("parallel")}
                                            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all ${
                                                translationMode === "parallel"
                                                    ? "bg-white/10 text-primaryAccent"
                                                    : "text-white/60 hover:text-white"
                                            }`}
                                        >
                                            PARALLEL
                                        </button>
                                    </div>
                                </div>

                                {/* Transcript Dialogue Body */}
                                <div 
                                    ref={transcriptContainerRef}
                                    className="p-6 max-h-[450px] overflow-y-auto custom-scrollbar space-y-4 bg-brandDark/25 relative"
                                >
                                    {selectedEpisode.transcript.map((line, index) => {
                                        const isActive = index === activeSegmentIndex;
                                        return (
                                            <div
                                                key={index}
                                                id={`segment-${index}`}
                                                onClick={() => handleSegmentClick(line.start)}
                                                className={`p-3 rounded-2xl border transition-all cursor-pointer duration-300 group ${
                                                    isActive
                                                        ? "bg-amber-500/10 border-amber-500/30 shadow-md shadow-amber-500/5 text-white"
                                                        : "bg-white/[0.01] border-transparent hover:bg-white/5 hover:border-white/5"
                                                }`}
                                            >
                                                <div className="flex gap-3 items-start">
                                                    {/* Speaker Avatar */}
                                                    {line.avatarUrl ? (
                                                        <div className="relative h-8 w-8 rounded-full overflow-hidden border border-white/15 shrink-0 shadow-sm">
                                                            <Image
                                                                src={line.avatarUrl}
                                                                alt={line.speaker}
                                                                fill
                                                                sizes="32px"
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                                            <User className="h-4 w-4 text-white/50" />
                                                        </div>
                                                    )}

                                                    {/* Dialogue Content */}
                                                    <div className="space-y-1 flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="font-heading font-extrabold text-xs text-primaryAccent uppercase tracking-wide">
                                                                {line.speaker}
                                                            </span>
                                                            <span className="font-labels text-[8px] text-white/20 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {line.start.toFixed(1)}s
                                                            </span>
                                                        </div>

                                                        {translationMode === "parallel" ? (
                                                            <div className="space-y-1">
                                                                <p className="text-sm font-sans leading-relaxed text-white font-medium">
                                                                    {line.textTarget}
                                                                </p>
                                                                <p className="text-xs font-sans leading-relaxed text-white/50 border-t border-white/5 pt-1 mt-1">
                                                                    {line.textEnglish}
                                                                </p>
                                                            </div>
                                                        ) : translationMode === "target" ? (
                                                            <p className="text-sm font-sans leading-relaxed text-white font-medium">
                                                                {line.textTarget}
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm font-sans leading-relaxed text-white/70">
                                                                {line.textEnglish}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};
