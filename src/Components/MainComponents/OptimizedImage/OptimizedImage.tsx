"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  quality?: number;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  className = "",
  fill = false,
  objectFit = "cover",
  quality = 80,
}: OptimizedImageProps) {
  const [optimizedSrc, setOptimizedSrc] = useState<string>(src);
  const [blurDataURL, setBlurDataURL] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(!priority);

  useEffect(() => {
    // Only optimize non-priority images
    if (!priority) {
      // Create a placeholder blur data URL
      setBlurDataURL("data:image/svg+xml;base64,PCFET0NUWVBFIHNWRyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlZWVlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiIC8+Cjwvc3ZnPg==");
      
      // Use our image optimization API for both remote and local images
      const params = new URLSearchParams({
        url: encodeURIComponent(src),
        width: width?.toString() || "800",
        height: height?.toString() || "600",
        quality: quality.toString(),
        format: "webp",
        fit: objectFit === "contain" ? "contain" : "cover",
      });
      
      setOptimizedSrc(`/api/image/optimize?${params.toString()}`);
    }
  }, [src, width, height, quality, objectFit, priority]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative ${className}`} style={{ overflow: "hidden" }}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ zIndex: 1 }}
        />
      )}
      
      <Image
        src={optimizedSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        priority={priority}
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        style={{
          objectFit,
          width: fill ? "100%" : undefined,
          height: fill ? "100%" : undefined,
        }}
        fill={fill}
        className={`transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
