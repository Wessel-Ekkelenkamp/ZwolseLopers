"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Pin } from "lucide-react";

type PinButtonProps = {
  postId: string;
  isPinnedInitially?: boolean;
  onPinned?: () => void;
};

export default function PinButton({ postId, isPinnedInitially = false, onPinned }: PinButtonProps) {
  const [isPinned, setIsPinned] = useState(isPinnedInitially);
  const [loading, setLoading] = useState(false);

  const handlePin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Unpin any currently pinned post
      const { error: unpinError } = await supabase
        .from("posts")
        .update({ is_pinned: false })
        .eq("is_pinned", true);

      if (unpinError) throw unpinError;

      // 2. Pin the target post
      const { error: pinError } = await supabase
        .from("posts")
        .update({ is_pinned: true })
        .eq("id", postId);

      if (pinError) throw pinError;

      setIsPinned(true);
      if (onPinned) onPinned();
      alert("Post succesvol vastgezet!");
    } catch (err: any) {
      console.error("Pinning error:", err.message);
      alert("Fout bij vastzetten: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePin}
      disabled={loading || isPinned}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
        isPinned
          ? "bg-orange-500 text-white cursor-default"
          : "bg-white/90 text-gray-700 hover:bg-orange-50 border border-gray-200 shadow-sm"
      }`}
    >
      <Pin size={14} className={isPinned ? "fill-white" : ""} />
      {loading ? "Laden..." : isPinned ? "Gepind" : "Pinnen"}
    </button>
  );
}