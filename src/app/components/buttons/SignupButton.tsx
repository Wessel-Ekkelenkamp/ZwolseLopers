// components/buttons/SignupButton.tsx
"use client";

import { useState, useEffect } from "react";
import { signUpForRun, cancelRunSignup, getRunSignups } from "@/lib/run-signups";
import { useUser } from "../../hooks/useUser";
import { Users, Lock } from "lucide-react";

export default function SignupButton({ runId, maxParticipants }: { runId: string, maxParticipants?: number | null }) {
  const { user } = useUser();
  const [count, setCount] = useState(0);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [loading, setLoading] = useState(true);

  const isFull = maxParticipants ? count >= maxParticipants : false;

  const fetchStatus = async () => {
    const data = await getRunSignups(runId);
    setCount(data.length);
    setIsSignedUp(user ? data.some(s => s.user_id === user.id) : false);
    setLoading(false);
  };

  useEffect(() => { fetchStatus(); }, [runId, user]);

  const handleToggle = async () => {
    if (!user) { window.location.href = '/auth'; return; }
    
    // Block signup if full (unless user is already signed up and wants to cancel)
    if (isFull && !isSignedUp) return;

    const success = isSignedUp ? await cancelRunSignup(runId) : await signUpForRun(runId);
    
    if (success) {
      await fetchStatus();
      window.dispatchEvent(new CustomEvent("signup-updated", { detail: { runId } }));
    }
  };

  if (loading) return <div className="h-10 w-24 bg-gray-100 animate-pulse rounded-xl" />;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
          <Users size={14} />
          <span>{count} {maxParticipants ? `/ ${maxParticipants}` : ''}</span>
        </div>
        {isFull && !isSignedUp && (
          <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter bg-red-50 px-2 py-0.5 rounded">
            Volgeboekt
          </span>
        )}
      </div>

      <button
        onClick={handleToggle}
        disabled={isFull && !isSignedUp}
        className={`w-full py-3 rounded-xl font-black text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
          isSignedUp 
            ? "bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600 group" 
            : isFull 
              ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100"
        }`}
      >
        {isSignedUp ? (
          <>
            <span className="group-hover:hidden">Aangemeld ✓</span>
            <span className="hidden group-hover:inline text-red-600">Afmelden</span>
          </>
        ) : isFull ? (
          <><Lock size={14} /> Run is Vol</>
        ) : (
          "Ik doe mee"
        )}
      </button>
    </div>
  );
}