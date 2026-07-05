"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { DB } from "@/lib/db";
import Header from "../Header";
import { Library, Plus, X, UploadCloud, CalendarDays, Info } from "lucide-react";
import { useUser } from "../../hooks/useUser";
import { useRouter } from "next/navigation";
import { storageService } from "@/lib/storage";
import MediaLibrary from "./MediaLibrary";
import RichTextEditor from "./RTEinputfield";

const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function AdminPanel() {
  const { user, isAdmin, loading: authLoading, username } = useUser();
  const router = useRouter();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const [isEvent, setIsEvent] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/");
    }
  }, [user, isAdmin, authLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const gifs = files.filter((f) => f.type === "image/gif");
      const tooLarge = files.filter((f) => f.type !== "image/gif" && f.size > MAX_FILE_SIZE_BYTES);
      const valid = files.filter((f) => f.type !== "image/gif" && f.size <= MAX_FILE_SIZE_BYTES);

      const errors: string[] = [];
      if (gifs.length > 0) {
        errors.push("GIF's worden niet ondersteund (animatie gaat verloren bij het comprimeren).");
      }
      if (tooLarge.length > 0) {
        errors.push(`${tooLarge.length} bestand(en) zijn groter dan ${MAX_FILE_SIZE_MB}MB en zijn overgeslagen.`);
      }
      if (errors.length > 0) {
        setError(errors.join(" "));
      }
      if (valid.length > 0) {
        setImageFiles((prev) => [...prev, ...valid]);
      }
    }
    e.target.value = "";
  };

  const handleSelectFromLibrary = (url: string) => {
    setImages(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  const removeFile = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!title.trim()) { setError("Titel is verplicht!"); return; }
    if (!content.trim()) { setError("Beschrijving is verplicht!"); return; }

    if (isEvent) {
      if (!eventDate || !eventTime || !location.trim()) {
        setError("Datum, tijdstip en locatie zijn verplicht voor een event!");
        return;
      }
    }

    if (!user) { setError("Je moet ingelogd zijn!"); return; }

    setLoading(true);

    try {
      let newUploadedUrls: string[] = [];
      if (imageFiles.length > 0) {
        newUploadedUrls = await storageService.uploadImages(imageFiles);
      }
      const allFinalUrls = [...images, ...newUploadedUrls];

      const { data: post, error: postError } = await supabase
        .from(DB.TABLES.POSTS)
        .insert({
          type: isEvent ? 'event' : 'post',
          title,
          content: content || null,
          author_id: user.id,
          is_pinned: false,
        })
        .select()
        .single();

      if (postError) throw postError;

      if (isEvent) {
        const { error: eventError } = await supabase
          .from(DB.TABLES.EVENTS)
          .insert({
            id: post.id,
            event_date: eventDate,
            event_time: eventTime,
            location,
            distance: distance ? parseFloat(distance) : null,
          });
        if (eventError) throw eventError;
      }

      if (allFinalUrls.length > 0) {
        const imageInserts = allFinalUrls.map((url, index) => ({
          post_id: post.id,
          image_url: url,
          display_order: index,
        }));
        const { error: imgError } = await supabase.from(DB.TABLES.POST_IMAGES).insert(imageInserts);
        if (imgError) throw imgError;
      }

      setSuccess("Succes! Je wordt nu doorgestuurd...");
      const newPostId = post.id;
      resetForm();
      setTimeout(() => router.push(`/post/${newPostId}`), 800);

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
    setIsEvent(false);
    setEventDate("");
    setEventTime("");
    setLocation("");
    setDistance("");
    setImages([]);
    setImageFiles([]);
  };

  if (authLoading) return <div className="min-h-screen bg-blue-50 flex items-center justify-center text-blue-600 font-bold">Laden...</div>;
  if (!isAdmin) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">

            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-1">Admin Panel</h1>
                <p className="text-gray-500 text-sm">Nieuw bericht plaatsen</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Ingelogd als</p>
                <p className="font-semibold text-gray-800">{username}</p>
              </div>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">{success}</div>}

            <div className="space-y-6">

              {/* Titel */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Titel *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-gray-900 placeholder:text-gray-400 shadow-sm w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Voeg titel toe"
                />
              </div>

              {/* Event toggle */}
              <div
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${isEvent ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                onClick={() => setIsEvent(!isEvent)}
              >
                <input
                  type="checkbox"
                  id="isEvent"
                  checked={isEvent}
                  onChange={(e) => setIsEvent(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-0.5 w-5 h-5 text-orange-500 rounded focus:ring-orange-400 cursor-pointer"
                />
                <label htmlFor="isEvent" className="cursor-pointer select-none">
                  <span className="flex items-center gap-2 text-sm font-bold text-gray-800">
                    <CalendarDays size={16} className={isEvent ? "text-orange-500" : "text-gray-400"} />
                    Dit is een event
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5 block">Voeg datum, tijdstip en locatie toe</span>
                </label>
              </div>

              {/* Event fields */}
              {isEvent && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Datum *</label>
                    <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tijdstip *</label>
                    <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Locatie *</label>
                    <input type="text" placeholder="bijv. Centrum Zwolle" value={location} onChange={(e) => setLocation(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder:text-gray-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Afstand in km <span className="font-normal text-gray-400">(optioneel)</span></label>
                    <input type="number" placeholder="bijv. 10" value={distance} onChange={(e) => setDistance(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder:text-gray-400" />
                  </div>
                </div>
              )}

              {/* Beschrijving */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Beschrijving *</label>
                <RichTextEditor
                  content={content}
                  onChange={(html) => setContent(html)}
                  placeholder="Schrijf hier je bericht..."
                />
              </div>

              {/* Media */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">Media</label>
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
                    <input type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>

                <div className="flex gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 leading-relaxed">
                  <Info size={16} className="flex-shrink-0 mt-0.5 text-blue-500" />
                  <div>
                    <p className="font-bold mb-1">Let op bij het uploaden van foto's</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Toegestane formaten: JPG, PNG en WEBP</li>
                      <li>Maximaal {MAX_FILE_SIZE_MB}MB per foto</li>
                      <li>Je kunt meerdere foto's in één keer selecteren</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[80px]">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Geselecteerde items</h3>
                  <div className="flex flex-wrap gap-3">
                    {images.map((url, i) => (
                      <div key={`lib-${i}`} className="relative group w-16 h-16 rounded-lg overflow-hidden border-2 border-indigo-500 shadow-sm">
                        <Image src={url} alt="" fill sizes="64px" className="object-cover" />
                        <button type="button" onClick={() => setImages(images.filter(u => u !== url))}
                          className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {imageFiles.map((file, i) => (
                      <div key={`new-${i}`} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                        <UploadCloud size={14} className="animate-pulse" />
                        <span className="truncate max-w-[100px]">{file.name}</span>
                        <button type="button" onClick={() => removeFile(i)} className="ml-1 hover:text-red-500 text-lg">×</button>
                      </div>
                    ))}
                    {images.length === 0 && imageFiles.length === 0 && (
                      <p className="text-sm text-slate-400 italic py-1">Geen media geselecteerd</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-2">
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-gray-300 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]">
                  {loading ? "Bezig..." : "Plaats Post"}
                </button>
                <button onClick={resetForm}
                  className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all">
                  Reset
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <MediaLibrary
        isOpen={isLibraryOpen}
        onCloseAction={() => setIsLibraryOpen(false)}
        onSelectAction={handleSelectFromLibrary}
        selectedUrls={images}
      />
    </>
  );
}
