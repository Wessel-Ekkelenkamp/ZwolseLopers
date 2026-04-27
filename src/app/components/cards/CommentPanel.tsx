"use client";

import React, { useState, useEffect, useRef } from "react";
import { getComments, createComment, deleteComment, Comment } from "@/lib/comments";
import { getCurrentProfile } from "@/lib/supabase";
import { Trash2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "../../hooks/useUser";

type CommentPanelProps = {
  postId: string;
  cardHeight?: number;
};

export default function CommentPanel({ postId, cardHeight }: CommentPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [visibleCount, setVisibleCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedComments, setExpandedComments] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const inputSectionRef = useRef<HTMLDivElement>(null);
  const commentListRef = useRef<HTMLDivElement>(null);
  const { user } = useUser(); 
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    loadComments();
    loadCurrentUser();
  }, [postId]);

  const loadCurrentUser = async () => {
    const profile = await getCurrentProfile();
    if (profile) {
      setCurrentUserId(profile.id);
      setIsAdmin(profile.role === 'admin');
    }
  };

  const loadComments = async () => {
    const data = await getComments(postId);
    setComments(data);
  };

  const INITIAL_COUNT = 5;
  const displayedComments = showAll ? comments : comments.slice(0, INITIAL_COUNT);
  const hasMore = comments.length > INITIAL_COUNT;

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push(`/auth?redirect=${pathname}`);
      return;
    }

     const trimmed = newComment.trim();
  if (!trimmed || trimmed.length > 256) return;

    const sanitized = trimmed.replace(/<[^>]*>/g, "");
  if (!sanitized) return;


    const comment = await createComment(postId, sanitized);
  if (comment) {
    setComments([comment, ...comments]);
    setNewComment("");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const success = await deleteComment(commentId);
    if (success) {
      setComments(comments.filter(c => c.id !== commentId));
    }
  };

return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 lg:block hidden">
        <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Reacties ({comments.length})</h4>
      </div>

      {/* Comments Area: Met scrollbar en vaste hoogte-beperking */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-200" 
        style={{ maxHeight: '350px', minHeight: '200px' }} // Hier dwingen we de scrollbar af
      >
        {displayedComments.map((comment) => (
          <div key={comment.id} className="text-sm flex justify-between group">
            <div className="leading-relaxed pr-2">
              <span className="font-bold text-slate-900 mr-2">{comment.profiles.username}</span>
              <span className="text-slate-700">{comment.content}</span>
            </div>
            
            {(currentUserId === comment.user_id || isAdmin) && (
              <button 
                onClick={() => handleDeleteComment(comment.id)}
                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}

        {/* Toon meer knop */}
        {hasMore && !showAll && (
          <button 
            onClick={() => setShowAll(true)}
            className="text-xs font-bold text-[#2454a3] hover:underline pt-2"
          >
            Bekijk alle {comments.length} reacties...
          </button>
        )}

        {comments.length === 0 && (
          <p className="text-gray-400 text-sm italic text-center py-4">Nog geen reacties...</p>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white" ref={inputSectionRef}>
        <form onSubmit={handleSubmitComment} className="flex gap-2 items-center">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Reageer..."
            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-100 focus:border-[#2454a3] outline-none"
          />
          <button 
      type="submit" 
      disabled={!newComment.trim()} 
      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
        newComment.trim() 
          ? "bg-[#2454a3] text-white shadow-md shadow-blue-900/10" 
          : "bg-gray-100 text-gray-400 cursor-not-allowed"
      }`}
    >
      {user ? "Post" : "Log in"} 
    </button>
        </form>
      </div>
    </div>
  );
}