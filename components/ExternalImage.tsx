"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";

interface ExternalImageProps extends ImageProps {
    fallbackSrc?: string;
    customFallback?: React.ReactNode;
}

/**
 * A wrapper around next/image that disables optimization by default.
 * useful for external images (YouTube thumbnails, etc.) where we don't want
 * to whitelist every domain in next.config.js.
 */
export function ExternalImage({
    src,
    alt,
    unoptimized = true,
    className,
    fallbackSrc,
    customFallback,
    ...props
}: ExternalImageProps) {
    const [error, setError] = useState(false);

    if (error) {
        if (customFallback) return <>{customFallback}</>;

        const fillStyles = props.fill ? "absolute inset-0 w-full h-full" : "";

        return (
            <div className={`flex items-center justify-center bg-muted text-muted-foreground ${fillStyles} ${className || ""}`} style={props.style}>
                <ImageOff className="w-6 h-6 opacity-50" />
            </div>
        );
    }

    // Use native img for unoptimized to avoid Next.js processing entirely
    if (unoptimized) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { fill, priority, sizes, loading, quality, placeholder, blurDataURL, loader, ...nativeProps } = props;
        const fillStyles = props.fill ? "absolute inset-0 w-full h-full" : "";

        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={src as string}
                alt={alt}
                className={`${fillStyles} ${className || ""}`}
                onError={() => setError(true)}
                style={props.style}
                referrerPolicy="no-referrer"
                {...nativeProps}
            />
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            unoptimized={unoptimized}
            className={className}
            onError={() => setError(true)}
            {...props}
        />
    );
}
