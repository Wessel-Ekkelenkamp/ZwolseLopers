"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import ImageCarousel from "./ImageCarousel";
import { PostCardProps } from "../../types/PostCardProps";
import { Calendar, Clock, MapPin, Ruler } from "lucide-react";

function formatEventDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function PostCard({ post, clickable = false }: PostCardProps) {
  const firstImage = post.images?.[0]?.image_url ?? null;
  const displayDate = new Date(post.created_at).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const cardContent = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-orange-400 overflow-hidden mb-5 hover:shadow-md transition-shadow">
      <div className="flex min-h-[160px]">

        {/* Left: image thumbnail (only on clickable/list view when image exists) */}
        {clickable && firstImage && (
          <div className="w-44 md:w-56 flex-shrink-0 bg-gray-100 relative overflow-hidden">
            <Image
              src={firstImage}
              alt={post.title}
              fill
              sizes="(min-width: 768px) 224px, 176px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Right: content */}
        <div className="flex-1 p-6 flex flex-col gap-3 min-w-0">
          {/* Title + date */}
          <div className="flex items-start justify-between gap-3">
            <h2 className={`text-lg font-bold text-gray-900 leading-snug ${clickable ? "group-hover:text-[#2454a3] transition-colors" : ""}`}>
              {post.title}
            </h2>
            <span className="text-xs font-bold text-orange-500 whitespace-nowrap flex-shrink-0 pt-0.5">
              {displayDate}
            </span>
          </div>

          {/* HTML content preview */}
          {post.content && (
            <div className="relative overflow-hidden" style={{ maxHeight: '9rem' }}>
              <div
                className="prose prose-sm max-w-none text-gray-500 [&_*]:text-gray-500"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            </div>
          )}

          {/* Event detail row */}
          {post.event && (
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-auto pt-2 border-t border-gray-50">
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-orange-400" />
                {formatEventDate(post.event.event_date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-orange-400" />
                {post.event.event_time?.slice(0, 5)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-orange-400" />
                {post.event.location}
              </span>
              {post.event.distance && (
                <span className="flex items-center gap-1">
                  <Ruler size={12} className="text-orange-400" />
                  {post.event.distance} km
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full carousel below — detail page only */}
      {!clickable && post.images && post.images.length > 0 && (
        <div className="px-5 pb-5">
          <ImageCarousel images={post.images.map((i) => i.image_url)} />
        </div>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link href={`/post/${post.id}`} className="group block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
