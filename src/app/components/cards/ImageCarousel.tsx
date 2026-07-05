"use client";

import React from "react";
import Image from "next/image";

type ImageCarouselProps = {
  images: string[];
};

export default function ImageCarousel({ images }: ImageCarouselProps) {
  if (images.length === 1) {
    return (
      <div className="relative w-full aspect-[4/3] max-h-[550px] bg-slate-50 rounded-xl overflow-hidden border border-gray-100">
        <Image
          src={images[0]}
          alt="Post image"
          fill
          sizes="(min-width: 768px) 700px, 100vw"
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div className="w-full flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
      {images.map((img, idx) => (
        <div
          key={idx}
          className="relative flex-shrink-0 w-[90%] md:w-[350px] aspect-[4/3] max-h-[450px] snap-center bg-slate-50 rounded-xl overflow-hidden border border-gray-100"
        >
          <Image
            src={img}
            alt={`Image ${idx + 1}`}
            fill
            sizes="(min-width: 768px) 350px, 90vw"
            className="object-contain"
          />
        </div>
      ))}
    </div>
  );
}
