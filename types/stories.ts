export interface WordTiming {
    word: string;
    start: number;
    end: number;
}

export interface StoryChapter {
    chapter_number: number;
    title_target_language: string;
    title_english: string;
    text_target_language: string;
    text_english: string;
    audio_url?: string;
    word_timings: WordTiming[];
    comprehension_question_target_language?: string;
    comprehension_question_english?: string;
    chapter_image_prompt?: string;
    plot_summary?: string;
    cover_url?: string;
}

export interface Story {
    id: string;
    title: string;
    target_text: string;
    native_text: string | null;
    prompt: string;
    language: string;
    level: number;
    remote_cover_path: string | null;
    remote_audio_path: string | null;
    comprehension_questions_json: string | null;
    video_gen_prompt: string | null;
    video_style: string | null;
    remote_video_path: string | null;
    created_at: string;
    is_public: boolean;
    user_id: string;
    chapters?: StoryChapter[]; // Added for long-form support
}
