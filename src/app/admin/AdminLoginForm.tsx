"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { DB } from "@/lib/db";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogIn, UserPlus } from "lucide-react";

export default function AdminLoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Ongeldige inloggegevens.");
      setLoading(false);
      return;
    }

    router.refresh();
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!username.trim() || username.length > 16) {
      setError("Gebruikersnaam is verplicht en mag maximaal 16 tekens zijn.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from(DB.TABLES.PROFILES)
        .insert({ id: data.user.id, username, role: DB.ROLES.DEFAULT });

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
    }

    setMessage("Account aangemaakt! Je kunt nu inloggen.");
    setMode("login");
    setPassword("");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-sm p-8">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/zwolselopers.svg"
            alt="Zwolse Lopers"
            width={120}
            height={48}
            className="h-12 w-auto"
          />
        </div>

        <h1 className="text-xl font-bold text-gray-800 text-center mb-1">
          {mode === "login" ? "Admin inloggen" : "Account aanmaken"}
        </h1>
        <p className="text-sm text-gray-400 text-center mb-6">Alleen voor beheerders</p>

        {mode === "login" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">E-mailadres</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="admin@voorbeeld.nl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Wachtwoord</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            {message && (
              <p className="text-sm text-green-600 text-center">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2454a3] hover:bg-[#1d4490] text-white font-bold rounded-xl transition disabled:opacity-60"
            >
              <LogIn size={16} />
              {loading ? "Bezig..." : "Inloggen"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Gebruikersnaam</label>
              <input
                type="text"
                required
                maxLength={16}
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Gebruikersnaam"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">E-mailadres</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="admin@voorbeeld.nl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Wachtwoord</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2454a3] hover:bg-[#1d4490] text-white font-bold rounded-xl transition disabled:opacity-60"
            >
              <UserPlus size={16} />
              {loading ? "Bezig..." : "Account aanmaken"}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
            setMessage(null);
          }}
          className="w-full text-center text-xs text-gray-500 hover:text-[#2454a3] mt-4"
        >
          {mode === "login"
            ? "Nog geen account? Registreer je hier"
            : "Heb je al een account? Log hier in"}
        </button>
      </div>
    </div>
  );
}
