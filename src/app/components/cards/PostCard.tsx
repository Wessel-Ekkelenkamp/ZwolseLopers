"use client";

import React from "react";
import Card from "./Card";
import ImageCarousel from "./ImageCarousel";

type PostCardProps = {
  title: string;
  content: string;
  images?: string[];
};

export default function PostCard({
  title,
  content,
  images = []
}: PostCardProps) {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-700 mb-3">{content}</p>
      {images.length > 0 && (
        <ImageCarousel images={images} />
      )}
    </Card>
  );
}
