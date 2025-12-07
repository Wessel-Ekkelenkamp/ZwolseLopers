"use client";

import Header from "./components/Header";
import { useState, useEffect } from "react";
import RunCard from "./components/cards/RunCard";
import PostCard from "./components/cards/PostCard";
import { supabase } from "@/lib/supabase";
import { Post } from "./types/post";
import { Run } from "./types/run";

export default function Home() {
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const pageSize = 5;

  const cachedPages = useState<Map<number, Post[]>>(new Map())[0];

  useEffect(() => {
    if (cachedPages.has(page)) {
      setPosts(cachedPages.get(page)!);
    } else {
      loadPosts(page);
    }
  }, [page]);

  const loadPosts = async (pageNumber: number) => {
    setLoading(true);

    const from = (pageNumber - 1) * pageSize;
    const to = pageNumber * pageSize - 1;

    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        type,
        title,
        content,
        author_id,
        created_at,
        runs (
          id,
          run_date,
          run_time,
          distance,
          start_location,
          average_speed,
          max_participants,
          image_urls
        ),
        post_images (
          image_url
        )
      `)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error loading posts:", error);
      setLoading(false);
      return;
    }

    if (data) {
      const mappedPosts = data.map((p: any) => ({
        id: p.id,
        type: p.type,
        title: p.title,
        content: p.content,
        author_id: p.author_id,
        created_at: p.created_at,
        run: p.runs || null,
        images: p.post_images || []
      })) as Post[];

      setPosts(mappedPosts);
      cachedPages.set(pageNumber, mappedPosts);
    }

    setLoading(false);
  };

  return (
    <>
      <Header />
      <main
        style={{
          width: "100vw",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: "#f0f0f0",
          paddingTop: "1rem",
        }}
      >
        <div
          style={{
            width: "80%",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
            padding: "1rem",
          }}
        >
          {loading && <p>Loading posts...</p>}

          {!loading && posts.length === 0 && <p>No posts found.</p>}

          {posts.map((post) => {
            if (post.type === "run" && post.run) {
              return <RunCard key={post.id} title={post.title} run={post.run} />;
            }
            return <PostCard key={post.id} post={post} />;
          })}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "1rem 0",
              borderTop: "1px solid #ddd",
              gap: "1rem",
            }}
          >
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              ←
            </button>
            <span>Page {page}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={posts.length < pageSize}>
              →
            </button>
          </div>
        </div>
      </main>
    </>
  );
}