// hooks/useRunSignups.ts
import { useState, useEffect } from "react";
import { getRunSignups, signUpForRun, cancelRunSignup, RunSignup } from "@/lib/run-signups";
import { useUser } from "./useUser";

export function useRunSignups(runId: string, initialData?: RunSignup[]) {
  const { user } = useUser();
  const [signups, setSignups] = useState<RunSignup[]>(initialData || []);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    async function sync() {
      const data = await getRunSignups(runId);
      setSignups(data);
      setIsSignedUp(user ? data.some(s => s.user_id === user.id) : false);
      setLoading(false);
    }
    sync();
  }, [runId, user]);

  const toggleSignup = async () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    const previousState = isSignedUp;
    setIsSignedUp(!previousState); 

    const success = previousState ? await cancelRunSignup(runId) : await signUpForRun(runId);
    if (success) {
      const freshData = await getRunSignups(runId);
      setSignups(freshData);
    } else {
      setIsSignedUp(previousState); 
    }
  };

  return { signups, isSignedUp, toggleSignup, loading };
}