"use client";

import React from "react";
import Image from "next/image";

type ImageCarouselProps = {
  images: string[];
};

export default function ImageCarousel({ images }: ImageCarouselProps) {
  if (images.length === 1) {
    return (
      <div className="relative w-full aspect-auto">
        <Image
          src={images[0]}
          alt="Image"
          width={1200}
          height={0}
          sizes="100vw"
          className="w-full h-auto rounded-xl object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
      {images.map((img, idx) => (
        <div key={idx} className="flex-shrink-0 w-full sm:w-[400px]">
          <Image
            src={img}
            alt={`Image ${idx + 1}`}
            width={1200}
            height={0}
            sizes="100vw"
            className="w-full h-auto rounded-xl object-contain"
          />
        </div>
      ))}
    </div>
  );
}
