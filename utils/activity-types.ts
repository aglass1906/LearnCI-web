import {
    Smartphone,
    RectangleVertical, // For flashcards (closest to stack) or Layers
    MonitorPlay,
    Headphones,
    BookOpen,
    MessageCircle, // CrossTalk
    Users, // Tutoring
    Mic,
    Pencil,
    Globe, // Immersion
    Music,
    Ear,
    Waves, // Shadowing
    Book // Grammar
} from "lucide-react";

export const ACTIVITY_TYPES = [
    {
        id: "App Learning",
        icon: Smartphone,
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-950/30",
        border: "border-blue-200 dark:border-blue-900"
    },
    {
        id: "Flashcards",
        icon: RectangleVertical,
        color: "text-teal-500",
        bg: "bg-teal-50 dark:bg-teal-950/30",
        border: "border-teal-200 dark:border-teal-900"
    },
    {
        id: "Watching Videos",
        icon: MonitorPlay,
        color: "text-red-500",
        bg: "bg-red-50 dark:bg-red-950/30",
        border: "border-red-200 dark:border-red-900"
    },
    {
        id: "Podcasts",
        icon: Headphones,
        color: "text-green-500",
        bg: "bg-green-50 dark:bg-green-950/30",
        border: "border-green-200 dark:border-green-900"
    },
    {
        id: "Reading",
        icon: BookOpen,
        color: "text-violet-500",
        bg: "bg-violet-50 dark:bg-violet-950/30",
        border: "border-violet-200 dark:border-violet-900"
    },
    {
        id: "CrossTalk",
        icon: MessageCircle,
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-950/30",
        border: "border-orange-200 dark:border-orange-900"
    },
    {
        id: "Language Tutors",
        icon: Users,
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-950/30",
        border: "border-purple-200 dark:border-purple-900"
    },
    {
        id: "Speaking",
        icon: Mic,
        color: "text-pink-500",
        bg: "bg-pink-50 dark:bg-pink-950/30",
        border: "border-pink-200 dark:border-pink-900"
    },
    {
        id: "Writing",
        icon: Pencil,
        color: "text-indigo-500",
        bg: "bg-indigo-50 dark:bg-indigo-950/30",
        border: "border-indigo-200 dark:border-indigo-900"
    },
    {
        id: "Immersion",
        icon: Globe,
        color: "text-mint-500", // Tailwind doesn't have mint by default, mapped to emerald or spring green usually. Using emerald for now.
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        border: "border-emerald-200 dark:border-emerald-900"
    },
    {
        id: "Music",
        icon: Music,
        color: "text-yellow-500",
        bg: "bg-yellow-50 dark:bg-yellow-950/30",
        border: "border-yellow-200 dark:border-yellow-900"
    },
    {
        id: "Listening",
        icon: Ear,
        color: "text-green-600",
        bg: "bg-green-100 dark:bg-green-900/40",
        border: "border-green-300 dark:border-green-800"
    },
    {
        id: "Shadowing",
        icon: Waves,
        color: "text-stone-500",
        bg: "bg-stone-50 dark:bg-stone-950/30",
        border: "border-stone-200 dark:border-stone-900"
    },
    {
        id: "Grammar",
        icon: Book,
        color: "text-gray-500",
        bg: "bg-gray-50 dark:bg-gray-950/30",
        border: "border-gray-200 dark:border-gray-900"
    }
];

export const getActivityConfig = (typeId: string) => {
    return ACTIVITY_TYPES.find(t => t.id === typeId) || ACTIVITY_TYPES[0];
};
