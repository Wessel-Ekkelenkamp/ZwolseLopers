"use client";

import React from "react";
import Card from "./Card";
import ImageCarousel from "./ImageCarousel";
import { Post } from "@/src/app/types/post";

type PostCardProps = {
  post: Post;
};

export default function PostCard({ post }: PostCardProps) {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
      <p className="text-gray-700 mb-3">{post.content || ""}</p>
      {post.images?.length && (
        <ImageCarousel images={post.images.map((i) => i.image_url)} />
      )}
    </Card>
  );
}
