"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";

interface FavoriteButtonProps {
    resource: {
        id: string; // unused for consumption_url but good for key
        title: string;
        type: string;
        author: string;
        cover_image_url: string;
        main_url: string;
    };
    initialIsFavorited?: boolean;
    onToggle?: (isFavorited: boolean) => void;
    className?: string;
}

export function FavoriteButton({ resource, initialIsFavorited = false, onToggle, className }: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        // Optimistic update
        const newState = !isFavorited;
        setIsFavorited(newState);
        if (onToggle) onToggle(newState);

        setIsLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast({
                    title: "Authentication Required",
                    description: "You must be logged in to favorite items",
                    variant: "destructive",
                });
                setIsFavorited(!newState); // Revert
                return;
            }

            if (newState) {
                // ADD to favorites
                // Map ID/URL logic: Use main_url as consumption_url to match iOS behavior
                const consumptionUrl = resource.main_url || resource.id;

                // Map Type logic: Ensure lowercase to match DB/iOS enum
                let type = resource.type.toLowerCase();
                if (type === 'apple_podcasts' || type === 'spotify') type = 'podcast';
                if (type === 'book' || type === 'pdf') type = 'website'; // Fallback mapping

                const { error } = await supabase.from("favorites")
                    // @ts-ignore
                    .insert({
                        user_id: user.id,
                        title: resource.title,
                        type: type,
                        consumption_url: consumptionUrl,
                        author: resource.author,
                        image_url: resource.cover_image_url,
                    } as any);

                if (error) throw error;
                toast({
                    title: "Added to Favorites",
                    description: `${resource.title} has been added to your favorites.`,
                });

            } else {
                // REMOVE from favorites
                // We delete by consumption_url for this user
                // Ideally we delete by ID but we might not have it loaded. 
                // consumption_url + user_id should be unique enough for this context.
                const consumptionUrl = resource.main_url || resource.id;

                const { error } = await supabase.from("favorites")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("consumption_url", consumptionUrl);

                if (error) throw error;
                toast({
                    title: "Removed from Favorites",
                    description: "Item removed from your favorites.",
                });
            }

        } catch (error) {
            console.error("Favorite toggle error:", error);
            toast({
                title: "Error",
                description: "Failed to update favorites. Please try again.",
                variant: "destructive",
            });
            setIsFavorited(!newState); // Revert
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className={`hover:bg-transparent ${className}`}
            onClick={handleToggle}
            disabled={isLoading}
        >
            <Heart
                className={`h-5 w-5 transition-all ${isFavorited ? "fill-red-500 text-red-500 scale-110" : "text-muted-foreground hover:text-red-500"}`}
            />
        </Button>
    );
}
