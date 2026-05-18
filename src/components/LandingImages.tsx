"use client";

import Image from "next/image";
import { useState } from "react";

interface LandingImagesProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
}

export default function LandingImages({ src, alt, className, fallbackText }: LandingImagesProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-primary-100 to-accent-100 ${className}`}>
        {fallbackText && (
          <span className="text-4xl font-display font-bold text-primary-700">
            {fallbackText}
          </span>
        )}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      onError={() => setError(true)}
    />
  );
}
