"use client";

import React from "react";
import Image from "next/image";

type ImageCarouselProps = {
  images: string[];
};

export default function ImageCarousel({ images }: ImageCarouselProps) {
  if (images.length === 1) {
    return (
      <div className="w-full bg-slate-50 rounded-xl overflow-hidden border border-gray-100 flex justify-center">
        <img
          src={images[0]}
          alt="Post image"
          // max-h voorkomt dat de kaart oneindig lang wordt
          // w-full + h-auto + object-contain behoudt de verhouding zonder te croppen
          className="w-full h-auto max-h-[550px] object-contain"
        />
      </div>
    );
  }

  return (
    <div className="w-full flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
      {images.map((img, idx) => (
        <div 
          key={idx} 

          className="relative flex-shrink-0 w-[90%] md:w-[350px] snap-center bg-slate-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center"
        >
          <img
            src={img}
            alt={`Image ${idx + 1}`}
            className="w-full h-auto max-h-[450px] object-contain"
          />
        </div>
      ))}
    </div>
  );
}
