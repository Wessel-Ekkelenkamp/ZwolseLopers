"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase"; 
import { useSearchParams, useRouter } from "next/navigation";

export default function AuthPage() {
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
      setError("Please fill in all fields");
      return;
    }

    if (!isLogin && !username) {
      setError("Username is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        console.log("🔐 Attempting login...");
        
        // LOGIN
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          console.error("❌ Login error:", loginError);
          throw loginError;
        }

        console.log("✅ Login successful:", data);
        console.log("✅ Session:", data.session);
        console.log("✅ User:", data.user?.email);

        // Verify session was created
        const { data: sessionCheck } = await supabase.auth.getSession();
        console.log("🔍 Session check after login:", sessionCheck);

        setMessage("Login successful! Redirecting...");
setTimeout(() => {
  router.push(redirectTo);
}, 1500);
        
 } else {
        console.log("📝 Attempting signup...");
        
        // SIGN UP
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          console.error("❌ Signup error:", signUpError);
          throw signUpError;
        }

        if (data.user) {
          console.log("✅ User created:", data.user.email);
          
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: username,
              role: 'user',
            });

          if (profileError) {
            console.error("❌ Profile creation error:", profileError);
            throw profileError;
          }

          console.log("✅ Profile created successfully");
          setMessage("Account created successfully! Please sign in.");
          setIsLogin(true);
          setPassword("");
          setUsername("");
        }
      }
    } catch (err: any) {
      console.error("❌ Auth error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 text-sm"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {isLogin ? "Welcome Back" : "Join Us"}
        </h1>
        <p className="text-gray-600 mb-6">
          {isLogin
            ? "Sign in to your Zwolse Lopers account"
            : "Create your account to get started"}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="runner_2024"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setMessage("");
            }}
            className="text-blue-600 hover:underline text-sm"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
