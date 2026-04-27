"use client";

import React from "react";
import Link from "next/link";
import ImageCarousel from "./ImageCarousel";
import CommentPanel from "./CommentPanel";
import { Post } from "@/src/app/types/post";
import { sanitizePost } from "@/lib/sanitize";
import { PostCardProps } from "../../types/PostCardProps";



export default function PostCard({ post, hideComments = false, clickable = false }: PostCardProps) {
  return (
    /* The Master Container: One shadow, one border, one rounded corner set */
    <div className="flex flex-col lg:flex-row w-full bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 mb-8 items-start">
      
      {/* Left Side: Content */}
      <div className="flex-1 p-6 flex flex-col min-w-0 w-full">
        {clickable ? (
          <Link href={`/post/${post.id}`}>
            <h2 className="text-2xl font-bold text-slate-800 mb-2 hover:text-blue-600 transition-colors">
              {post.title}
            </h2>
          </Link>
        ) : (
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{post.title}</h2>
        )}
        
        <div 
  className="prose prose-sm text-slate-700"
  dangerouslySetInnerHTML={{ __html: sanitizePost(post.content || '') }}
/>
        
        {post.images && post.images.length > 0 && (
          <div className="mt-4">
            <ImageCarousel images={post.images.map((i) => i.image_url)} />
          </div>
        )}
      </div>

      {/* Right Side: Comments */}
      {!hideComments && (
        /* border-t on mobile, border-l on desktop to "connect" the panels */
        <div className="lg:w-80 w-full border-t lg:border-t-0 lg:border-l border-gray-100 bg-slate-50/50">
          <CommentPanel postId={post.id} />
        </div>
      )}
    </div>
  );
}