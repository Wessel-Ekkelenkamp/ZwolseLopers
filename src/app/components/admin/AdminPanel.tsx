"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DB } from "@/lib/db";
import Header from "../Header";
import { Pin, Library, Plus, X, UploadCloud, CheckCircle2 } from "lucide-react";
import { useUser } from "../../hooks/useUser";
import { useRouter } from "next/navigation";
import { storageService } from "@/lib/storage";
import MediaLibrary from "./MediaLibrary";
import RichTextEditor from "./RTEinputfield";


type PostType = "regular" | "run";
type Platform = "strava" | "instagram" | "facebook";

export default function AdminPanel() {
  const { user, isAdmin, loading: authLoading, username } = useUser();
  const router = useRouter();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const [postType, setPostType] = useState<PostType>("regular");
  
  // State for form fields
  const [shouldPin, setShouldPin] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [distance, setDistance] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [speed, setSpeed] = useState("5:30");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);

const handlePaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9:]/g, "");
    
    if (val.length === 3 && !val.includes(":")) {
      val = val.slice(0, 1) + ":" + val.slice(1);
    }
    
    if (val.split(":").length <= 2) setSpeed(val);
  };

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/");
    }
  }, [user, isAdmin, authLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files) {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);
  }
};

const handleSelectFromLibrary = (url: string) => {
  setImages(prev => 
    prev.includes(url) 
      ? prev.filter(u => u !== url) 
      : [...prev, url]
  );
};

const removeFile = (index: number) => {
  setImageFiles(imageFiles.filter((_, i) => i !== index));
};


  const handleSubmit = async () => {
  setError("");
  setSuccess("");

  // --- 1. Validation Logic ---
  if (!title.trim()) { setError("Titel is verplicht!"); return; }
  
  if (postType === "regular" && !content.trim()) { 
    setError("Inhoud is verplicht voor een normale post!"); 
    return; 
  }

  if (postType === "run") {
    if (!date || !time || !distance || !startLocation || !speed) {
      setError("Alle run-velden zijn verplicht!");
      return;
    }
    const paceRegex = /^\d{1,2}:[0-5][0-9]$/;
    if (!paceRegex.test(speed)) {
      setError("Tempo moet in formaat M:SS zijn (bijv. 5:30)");
      return;
    }
  }

  if (!user) { setError("Je moet ingelogd zijn!"); return; }

  setLoading(true);

  try {
    // --- 2. Handle Image Uploads First ---
    let newUploadedUrls: string[] = [];
    if (imageFiles.length > 0) {
      newUploadedUrls = await storageService.uploadImages(imageFiles);
    }
    const allFinalUrls = [...images, ...newUploadedUrls];

    // --- 3. Create Base Post ---
    const { data: post, error: postError } = await supabase
      .from(DB.TABLES.POSTS)
      .insert({
        type: postType === 'run' ? 'run' : 'post',
        title: title,
        content: content || null,
        author_id: user.id,
        is_pinned: false 
      })
      .select()
      .single();

    if (postError) throw postError;

    // --- 4. Create Run Details (Specific to Run) ---
    if (postType === "run") {
      const { error: runError } = await supabase
        .from(DB.TABLES.RUNS)
        .insert({
          id: post.id,
          run_date: date,
          run_time: time,
          distance: parseFloat(distance),
          start_location: startLocation,
          average_speed: speed,
          max_participants: maxParticipants ? parseInt(maxParticipants) : null,
        });
      if (runError) throw runError;
    }

    // --- 5. Handle Post Images (Shared Table) ---
    if (allFinalUrls.length > 0) {
      const imageInserts = allFinalUrls.map((url, index) => ({
        post_id: post.id,
        image_url: url,
        display_order: index,
      }));
      const { error: imgError } = await supabase.from(DB.TABLES.POST_IMAGES).insert(imageInserts);
      if (imgError) throw imgError;
    }

    // --- 6. Handle Pinning Logic ---
    if (shouldPin && post?.id) {
      await Promise.all([
        supabase.from(DB.TABLES.POSTS).update({ is_pinned: false }).neq('id', post.id).eq('is_pinned', true),
        supabase.from(DB.TABLES.POSTS).update({ is_pinned: true }).eq('id', post.id),
      ]);
    }

    setSuccess("Succes! Je wordt nu doorgestuurd...");
    setTimeout(() => {
      router.push(`/post/${post.id}`);
    }, 1000);
    const newPostId = post.id;
    
    // --- 7. Reset Form ---
    resetForm();
    setImageFiles([]);
    setSpeed("5:30"); 

    router.push(`/post/${newPostId}`);

  } catch (err: any) {
    console.error(err);
    setError(err.message || "Fout bij het aanmaken van de post");
  } finally {
    setLoading(false);
  }
};

  const resetForm = () => {
    setTitle("");
    setContent("");
    setDate("");
    setTime("");
    setDistance("");
    setStartLocation("");
    setSpeed("");
    setMaxParticipants("");
    setImages([]);
    setImageInput("");
    setShouldPin(false);
  };
  

  // Prevent flicker while checking admin status
  if (authLoading) return <div className="min-h-screen bg-blue-50 flex items-center justify-center text-blue-600 font-bold">Verifying admin...</div>;
  if (!isAdmin) return null;

return (
  <>
    <Header />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header Sectie */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Panel</h1>
              <p className="text-gray-600">Create content for Zwolse Lopers</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Logged in as</p>
              <p className="font-semibold text-gray-800">{username}</p>
            </div>
          </div>

          {/* Berichten */}
          {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">{success}</div>}

          <div className="space-y-6">
            {/* Post Type Toggle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Post Type</label>
              <div className="flex gap-4">
                {(["regular", "run"] as PostType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setPostType(type)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      postType === type ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {type === "regular" ? "Regular Post" : "Run Post"}
                  </button>
                ))}
              </div>
            </div>

            {/* Titel Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Titel *</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-gray-900 placeholder:text-gray-500 shadow-sm w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Voeg titel toe"
              />
            </div>

            {/* Specifieke velden voor Runs */}
            {postType === "run" && (
              <div className="text-gray-900 placeholder:text-gray-500 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="number" placeholder="afstand (km)" value={distance} onChange={(e) => setDistance(e.target.value)} className="p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="text" placeholder="Pace (m/km)" value={speed} onChange={(e) => setSpeed(e.target.value)} className="p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="text" placeholder="Start Locatie" value={startLocation} onChange={(e) => setStartLocation(e.target.value)} className="p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="number" placeholder="Max deelnemers (leeg voor geen max)" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} className="p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            )}

            {/* Content Textarea */}
            <div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    {postType === "run" ? "Beschrijving (optioneel)" : "Beschrijving *"}
  </label>
  <RichTextEditor 
    content={content} 
    onChange={(html) => setContent(html)} 
    placeholder="Schrijf hier je bericht..."
  />
</div>

            {/* --- MEDIA SECTIE --- */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">Media Management</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setIsLibraryOpen(true)}
                  className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all"
                >
                  <Library size={20} /> Open Bibliotheek
                </button>

                <label className="flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 cursor-pointer transition-all shadow-md">
                  <Plus size={20} /> Nieuwe Foto's
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {/* Geselecteerde Items Feedback */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[100px]">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Geselecteerde items</h3>
                <div className="flex flex-wrap gap-3">
                  {/* Thumbnails van Library */}
                  {images.map((url, i) => (
                    <div key={`lib-${i}`} className="relative group w-16 h-16 rounded-lg overflow-hidden border-2 border-indigo-500 shadow-sm">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setImages(images.filter(u => u !== url))}
                        className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}

                  {/* Labels van Nieuwe Uploads */}
                  {imageFiles.map((file, i) => (
                    <div key={`new-${i}`} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                      <UploadCloud size={14} className="animate-pulse" />
                      <span className="truncate max-w-[100px]">{file.name}</span>
                      <button type="button" onClick={() => removeFile(i)} className="ml-1 hover:text-red-500 text-lg">×</button>
                    </div>
                  ))}

                  {images.length === 0 && imageFiles.length === 0 && (
                    <p className="text-sm text-slate-400 italic py-2">Geen media geselecteerd</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pin Optie */}
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <input
                type="checkbox"
                id="pinPost"
                checked={shouldPin}
                onChange={(e) => setShouldPin(e.target.checked)}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
              />
              <label htmlFor="pinPost" className="text-sm font-bold text-orange-800 flex items-center gap-2 cursor-pointer">
                <Pin size={18} /> Pin dit bericht bovenaan de homepage
              </label>
            </div>

            {/* Actie Knoppen */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-gray-300 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
              >
                {loading ? "Creating..." : "Plaats Post"}
              </button>
              <button 
                onClick={resetForm} 
                className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Media Library Modal - Slechts één keer aanroepen buiten de main container */}
    <MediaLibrary 
      isOpen={isLibraryOpen}
      onCloseAction={() => setIsLibraryOpen(false)}
      onSelectAction={handleSelectFromLibrary}
      selectedUrls={images} 
    />
  </>
);
}