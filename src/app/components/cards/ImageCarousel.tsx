"use client";

import React from "react";
import Image from "next/image";

type ImageCarouselProps = {
  images: string[];
};

export default function ImageCarousel({ images }: ImageCarouselProps) {
  if (images.length === 1) {
    return (
      <div className="relative w-full h-64">
        <Image
          src={images[0]}
          alt="Image"
          fill
          className="object-cover rounded-xl"
        />
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
      {images.map((img, idx) => (
        <div key={idx} className="relative flex-shrink-0 w-72 h-64 snap-center">
          <Image
            src={img}
            alt={`Image ${idx + 1}`}
            fill
            className="object-cover rounded-xl"
          />
        </div>
      ))}
    </div>
  );
}
