// components/post/LiveParticipants.tsx
"use client";

import { useState, useEffect } from "react";
import { getRunSignups, RunSignup } from "@/lib/run-signups";

export default function LiveParticipants({ runId, initialData }: { runId: string, initialData: RunSignup[] }) {
  const [signups, setSignups] = useState<RunSignup[]>(
    initialData.filter(s => s.status === 'confirmed')
  );

  const refresh = async () => {
    const data = await getRunSignups(runId);
    setSignups(data);
  };

  useEffect(() => {
    const handleEvent = (e: any) => {
      if (e.detail.runId === runId) refresh();
    };

    window.addEventListener("signup-updated", handleEvent);
    return () => window.removeEventListener("signup-updated", handleEvent);
  }, [runId]);

  return (
    <div className="space-y-3">
      {signups.map((s) => (
        <div key={s.user_id} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden">
            {s.profiles?.avatar_url && <img src={s.profiles.avatar_url} className="w-full h-full object-cover" />}
          </div>
          <span className="text-sm font-bold text-slate-700">@{s.profiles?.username}</span>
        </div>
      ))}
    </div>
  );
}