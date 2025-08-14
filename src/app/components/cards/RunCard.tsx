"use client";

import React from "react";
import Card from "./Card";
import ImageCarousel from "./ImageCarousel";

type RunCardProps = {
  title: string;
  date: string;
  time: string;
  distance: string;
  startLocation: string;
  speed: string;
  images?: string[];
};

export default function RunCard({
  title,
  date,
  time,
  distance,
  startLocation,
  speed,
  images = []
}: RunCardProps) {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      <p className="text-gray-500 text-sm mb-2">{date} • {time}</p>
      <p className="text-gray-700">
        <strong>Afstand:</strong> {distance} km<br />
        <strong>Start:</strong> {startLocation}<br />
        <strong>Snelheid:</strong> {speed}
      </p>
      {images.length > 0 && (
        <div className="mt-3">
          <ImageCarousel images={images} />
        </div>
      )}
    </Card>
  );
}
