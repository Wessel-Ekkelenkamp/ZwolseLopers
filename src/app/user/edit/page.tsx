"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import { storageService } from "@/lib/storage";
import {
  ArrowLeft,
  AlertTriangle,
  Camera,
  ChevronDown,
  ChevronUp,
  Lock,
  Loader2,
  Mail,
  User,
} from "lucide-react";

export default function EditUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showSecurity, setShowSecurity] = useState(false);
  const [showDanger, setShowDanger] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setError("");
    setSuccess("");
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

  const saveProfile = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const cleanUrl = profilePic.split("?")[0];
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ username, avatar_url: cleanUrl })
        .eq("id", currentUser.id);
      if (updateError) throw updateError;
      setSuccess("Profiel opgeslagen!");
    } catch (e: any) {
      setError("Fout bij opslaan: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const saveSecurity = async () => {
    setError("");
    setSuccess("");
    setSavingSecurity(true);
    try {
      const updates: { email?: string; password?: string } = {};

      if (email !== currentUser.email) updates.email = email;
      if (newPassword) {
        if (newPassword.length < 6) throw new Error("Wachtwoord moet minimaal 6 tekens zijn.");
        updates.password = newPassword;
      }

      if (Object.keys(updates).length === 0) {
        setSuccess("Geen wijzigingen om op te slaan.");
        return;
      }

      const { error: secError } = await supabase.auth.updateUser(updates);
      if (secError) throw secError;

      setNewPassword("");
      if (updates.email) {
        setSuccess("Bevestigingsmail verstuurd naar je nieuwe e-mailadres. Klik op de link om de wijziging te bevestigen.");
      } else {
        setSuccess("Wachtwoord succesvol gewijzigd!");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSavingSecurity(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/delete-account", { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (e: any) {
      setError("Account verwijderen mislukt: " + e.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <Loader2 className="animate-spin text-[#2454a3]" size={32} />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-blue-50 flex justify-center p-6">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 w-full max-w-md overflow-hidden border border-blue-100">

          {/* Blue header */}
          <div className="bg-[#2454a3] px-8 py-6 text-center relative">
            <Link
              href="/user"
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-black text-white italic tracking-tight">
              Profiel bewerken
            </h1>
          </div>

          <div className="p-8 space-y-6">

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-xl text-sm font-medium">
                {success}
              </div>
            )}

            {/* Profile picture */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-24 h-24">
                <div className="w-full h-full rounded-full border-4 border-blue-100 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {profilePic ? (
                    <img src={profilePic} className="w-full h-full object-cover" alt="Profielfoto" />
                  ) : (
                    <User size={40} className="text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-[#2454a3] p-2 rounded-full text-white cursor-pointer hover:bg-blue-800 shadow-lg transition-all">
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
              <p className="text-xs text-gray-400 font-medium">
                Klik op de camera om je foto te wijzigen
              </p>
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                Gebruikersnaam
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={username}
                  maxLength={20}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-[#2454a3] outline-none transition-all text-gray-900"
                />
              </div>
            </div>

            {/* Save profile button */}
            <button
              onClick={saveProfile}
              disabled={saving || uploading}
              style={{ backgroundColor: saving || uploading ? "#94a3b8" : "#2454a3" }}
              className="w-full py-4 rounded-2xl font-bold text-white shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : "Opslaan"}
            </button>

            {/* Security section */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowSecurity(s => !s)}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-gray-400" />
                  Beveiligingsinstellingen
                </div>
                {showSecurity
                  ? <ChevronUp size={16} className="text-gray-400" />
                  : <ChevronDown size={16} className="text-gray-400" />
                }
              </button>

              {showSecurity && (
                <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
                  <div className="space-y-1.5 pt-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                      E-mailadres
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-[#2454a3] outline-none transition-all text-gray-900"
                      />
                    </div>
                    <p className="text-xs text-gray-400 ml-1">
                      Je ontvangt een bevestigingsmail bij het wijzigen van je e-mailadres.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                      Nieuw wachtwoord
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Laat leeg om niet te wijzigen"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-[#2454a3] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <button
                    onClick={saveSecurity}
                    disabled={savingSecurity}
                    style={{ backgroundColor: savingSecurity ? "#94a3b8" : "#2454a3" }}
                    className="w-full py-3 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2"
                  >
                    {savingSecurity ? <Loader2 className="animate-spin" size={18} /> : "Instellingen opslaan"}
                  </button>
                </div>
              )}
            </div>

            {/* Danger zone */}
            <div className="border border-red-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => { setShowDanger(s => !s); setConfirmDelete(false); }}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Account verwijderen
                </div>
                {showDanger
                  ? <ChevronUp size={16} />
                  : <ChevronDown size={16} />
                }
              </button>

              {showDanger && (
                <div className="px-5 pb-5 border-t border-red-100">
                  {!confirmDelete ? (
                    <div className="pt-4 space-y-3">
                      <p className="text-sm text-gray-500">
                        Dit verwijdert je account, profielfoto en alle run-inschrijvingen permanent. Dit kan niet ongedaan worden gemaakt.
                      </p>
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="w-full py-3 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 transition-all"
                      >
                        Account verwijderen
                      </button>
                    </div>
                  ) : (
                    <div className="pt-4 space-y-3">
                      <p className="text-sm font-bold text-red-600">
                        Weet je het zeker? Dit kan niet worden teruggedraaid.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 py-3 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                        >
                          Annuleren
                        </button>
                        <button
                          onClick={deleteAccount}
                          disabled={deleting}
                          className="flex-1 py-3 rounded-2xl font-bold text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                        >
                          {deleting ? <Loader2 className="animate-spin" size={18} /> : "Ja, verwijder"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
