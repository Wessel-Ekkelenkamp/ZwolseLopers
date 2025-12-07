"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";

export default function EditUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showSecurity, setShowSecurity] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/auth");

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single();

      setCurrentUser(user);
      setUsername(profile?.username || "");
      setEmail(user.email || "");
      setProfilePic(profile?.avatar_url || "");
      setLoading(false);
    };
    load();
  }, []);

  const saveProfile = async () => {
    setError("");
    setSuccess("");

    try {
      await supabase
        .from("profiles")
        .update({ username, avatar_url: profilePic })
        .eq("id", currentUser.id);

      if (email !== currentUser.email) {
        await supabase.auth.updateUser({ email });
      }

      setSuccess("Profile updated!");
    } catch (e: any) {
      setError(e.message);
    }
  };

  const changePassword = async (pw: string) => {
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) setError(error.message);
    else setSuccess("Password changed!");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
    <Header />
    <div className="min-h-screen flex justify-center p-6 bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-xl space-y-6">

        <h1 className="text-2xl font-bold">Edit Profile</h1>

        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        {/* PROFILE PIC */}
        <label className="font-semibold text-sm">Profile Picture URL</label>
        <input
          type="url"
          className="w-full border p-2 rounded"
          value={profilePic}
          onChange={e => setProfilePic(e.target.value)}
        />

        {/* USERNAME */}
        <label className="font-semibold text-sm">Username</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        {/* EMAIL */}
        <label className="font-semibold text-sm">Email</label>
        <input
          type="email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        {/* SAVE PROFILE BUTTON */}
        <button
          onClick={saveProfile}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>

        {/* SECURITY SECTION */}
        <button
          onClick={() => setShowSecurity(s => !s)}
          className="w-full bg-gray-200 py-2 rounded"
        >
          {showSecurity ? "Hide Security Settings" : "Security Settings"}
        </button>

        {showSecurity && (
          <div className="space-y-3 pt-3">
            <label className="font-semibold text-sm">New Password</label>
            <input
              id="pw"
              type="password"
              className="w-full border p-2 rounded"
            />
            <button
              onClick={() => {
                const pw = (document.getElementById("pw") as HTMLInputElement).value;
                if (pw.length >= 6) changePassword(pw);
                else setError("Password must be ≥ 6 characters");
              }}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Change Password
            </button>
          </div>
        )}

        <Link
          href="/user"
          className="block text-center mt-4 text-blue-600 underline"
        >
          ← Back to Profile
        </Link>
      </div>
    </div>
    </>
  );
}
