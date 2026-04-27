"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DB } from "@/lib/db";
import { useSearchParams, useRouter } from "next/navigation";

function AuthPageContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !password) {
      setError("Vul alle velden in aub.");
      return;
    }

    if (!isLogin) {
    if (username.length > 16) {
      setError("Gebruikersnaam mag maximaal 16 tekens zijn.");
      return;
    }
  }

    if (!isLogin && !username) {
      setError("Gebruikersnaam is verplicht.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
        
        setMessage("Succesvol ingelogd! Je wordt doorgestuurd...");
        setTimeout(() => router.push(redirectTo), 1000);
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          const { error: profileError } = await supabase
            .from(DB.TABLES.PROFILES)
            .insert({
              id: data.user.id,
              username: username,
              role: DB.ROLES.DEFAULT,
            });

          if (profileError) throw profileError;

          setMessage("Account aangemaakt! Je kunt nu inloggen.");
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "Er ging iets mis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 w-full max-w-md overflow-hidden border border-blue-100">
        
        {/* Blauwe Header op de kaart */}
        <div className="bg-[#2454a3] p-8 text-center relative">
          <Link
            href="/"
            className="absolute left-6 top-6 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex justify-center mb-4">
             <Image 
                src="/images/zwolseloperslight.svg" 
                alt="Logo" 
                width={120} 
                height={50} 
                className="h-10 w-auto"
             />
          </div>
          <h1 className="text-2xl font-black text-white italic tracking-tight">
            {isLogin ? "Welkom terug" : "Meld je aan"}
          </h1>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-xl text-sm font-medium">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                  Gebruikersnaam
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={16}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-[#2454a3] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="hardloper_038"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                E-mailadres
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-[#2454a3] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="je@email.nl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                Wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-[#2454a3] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: loading ? '#94a3b8' : '#2454a3' }}
              className="w-full py-4 rounded-2xl font-bold text-white shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isLogin ? (
                "Inloggen"
              ) : (
                "Account aanmaken"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setMessage("");
              }}
              className="text-[#2454a3] font-bold text-sm hover:underline"
            >
              {isLogin
                ? "Nog geen account? Registreer je hier"
                : "Heb je al een account? Log hier in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageContent />
    </Suspense>
  );
}