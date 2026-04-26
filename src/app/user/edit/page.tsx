"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import { storageService } from "@/lib/storage";
import { Camera, Loader2, User } from "lucide-react";

export default function EditUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showSecurity, setShowSecurity] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files || e.target.files.length === 0) return;
  
  setUploading(true);
  try {
    const file = e.target.files[0];
    const newUrl = await storageService.uploadAvatar(file, currentUser.id);
    setProfilePic(newUrl); 
    setSuccess("Foto geüpload! Vergeet niet op te slaan.");
  } catch (err: any) {
    setError("Upload mislukt: " + err.message);
  } finally {
    setUploading(false);
  }
};

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
    const cleanUrl = profilePic.split('?')[0];

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        username, 
        avatar_url: cleanUrl
      })
      .eq("id", currentUser.id);

    if (updateError) throw updateError;

    if (email !== currentUser.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email });
      if (emailError) throw emailError;
    }

    setSuccess("Profiel succesvol bijgewerkt!");
  } catch (e: any) {
    setError("Fout bij opslaan: " + e.message);
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

        <h1 className="text-gray-500 text-2xl font-bold">Edit Profile</h1>

        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        {/* PROFILE PIC */}
        <div className="flex flex-col items-center gap-4 py-4">
  <div className="relative w-24 h-24">
    <div className="w-full h-full rounded-full border-4 border-indigo-100 bg-gray-100 flex items-center justify-center overflow-hidden">
      {profilePic ? (
        <img 
          src={profilePic} 
          className="w-full h-full object-cover" 
          alt="Profile"
        />
      ) : (
        <div className="text-gray-500 flex flex-col items-center">
          <User size={40} />
          <span className="text-[10px]">No Photo</span>
        </div>
      )}
    </div>
    
    <label className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full text-white cursor-pointer hover:bg-indigo-700 shadow-lg transition-all">
      {uploading ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />}
      <input 
        type="file" 
        className="hidden" 
        accept="image/*" 
        onChange={handleAvatarChange} 
        disabled={uploading} 
      />
    </label>
  </div>
  <p className="text-xs text-gray-500 font-medium">Klik op de camera om je foto te wijzigen</p>
</div>

        {/* USERNAME */}
        <label className="text-gray-500 font-semibold text-sm">Username</label>
        <input
          type="text"
          className="text-gray-500 w-full border p-2 rounded"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        {/* EMAIL */}
        <label className="text-gray-500 font-semibold text-sm">Email</label>
        <input
          type="email"
          className="text-gray-500 w-full border p-2 rounded"
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
