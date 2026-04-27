"use client";

import React, { useState } from 'react';
import { X, Save, Trash2, Calendar, Clock, MapPin, Gauge, Users, ImageIcon, Plus } from 'lucide-react';
import { updatePost, deletePost } from '@/lib/posts';
import { useRouter } from 'next/navigation';
import MediaLibrary from '../admin/MediaLibrary';

export default function EditPostModal({ post, onClose }: { post: any; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Base Post State
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content || '');

  // Run Specific State (All Props)
  const [runDate, setRunDate] = useState(post.run?.run_date || '');
  const [runTime, setRunTime] = useState(post.run?.run_time || '');
  const [distance, setDistance] = useState(post.run?.distance || '');
  const [location, setLocation] = useState(post.run?.start_location || '');
  const [speed, setSpeed] = useState(post.run?.average_speed || '');
  const [maxParticipants, setMaxParticipants] = useState(post.run?.max_participants || '');

  // Image State
  const [currentImages, setCurrentImages] = useState(post.post_images || []);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [imagesToAdd, setImagesToAdd] = useState<string[]>([]);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updatePost(post.id, {
        title,
        content,
        run_info: post.type === 'run' ? {
          run_date: runDate,
          run_time: runTime,
          distance: parseFloat(distance),
          start_location: location,
          average_speed: speed,
          max_participants: maxParticipants === '' ? null : parseInt(maxParticipants.toString()),
        } : null,
        imagesToDelete,
        imagesToAdd,
      });
      router.refresh();
      onClose();
    } catch (err) {
      alert("Fout bij opslaan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Weet je zeker dat je dit bericht wilt verwijderen?")) return;
    try {
      await deletePost(post.id);
      router.push('/');
    } catch (err) {
      alert("Fout bij verwijderen");
    }
  };

  const toggleImageForDeletion = (imageRecord: any) => {
    setImagesToDelete(prev =>
      prev.includes(imageRecord.id)
        ? prev.filter(id => id !== imageRecord.id)
        : [...prev, imageRecord.id]
    );
  };

  const handleMediaSelect = (url: string) => {
    setImagesToAdd(prev =>
      prev.includes(url)
        ? prev.filter(u => u !== url)
        : [...prev, url]
    );
  };

  const labelStyle = "block text-sm font-black text-slate-700 uppercase tracking-wide mb-1.5 ml-1";
  const inputStyle = "w-full p-3 bg-white border-2 border-slate-100 rounded-2xl focus:border-orange-400 focus:ring-0 outline-none transition text-slate-900 font-medium placeholder:text-slate-300";

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
        <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

          {/* Header */}
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Bewerk Bericht</h2>
              <p className="text-slate-500 text-sm font-bold">Wijzig de details van je {post.type === 'run' ? 'loopje' : 'post'}</p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition text-slate-400">
              <X size={24} />
            </button>
          </div>

          {/* Scrollable Form */}
          <div className="p-8 overflow-y-auto space-y-6">

            {/* Section: Algemeen */}
            <div className="space-y-4">
              <div>
                <label className={labelStyle}>Titel van het bericht</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Bijv. Maandagavond Interval"
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Beschrijving</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Vertel wat over de route of het tempo..."
                  className={`${inputStyle} resize-none`}
                />
              </div>
            </div>

            {/* IMAGE MANAGEMENT SECTION */}
            <div className="pt-6 border-t border-slate-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest">Afbeeldingen Beheren</h3>
                <button
                  onClick={() => setIsMediaLibraryOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-black text-orange-500 hover:bg-orange-50 px-3 py-1.5 rounded-xl transition"
                >
                  <Plus size={14} />
                  Toevoegen
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {currentImages.map((img: any) => {
                  const isMarked = imagesToDelete.includes(img.id);
                  return (
                    <div key={img.id} className="relative group rounded-2xl overflow-hidden border-2 border-slate-100 aspect-square">
                      <img
                        src={img.image_url}
                        alt=""
                        className={`w-full h-full object-cover transition-all ${isMarked ? 'opacity-30' : ''}`}
                      />
                      <button
                        onClick={() => toggleImageForDeletion(img)}
                        className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity ${isMarked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      >
                        {isMarked ? (
                          <span className="text-white text-xs font-bold">Herstellen</span>
                        ) : (
                          <Trash2 size={24} className="text-red-400" />
                        )}
                      </button>
                      {isMarked && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full">
                          <Trash2 size={12} />
                        </div>
                      )}
                    </div>
                  );
                })}
                {imagesToAdd.map((url) => (
                  <div key={url} className="relative group rounded-2xl overflow-hidden border-2 border-green-400 aspect-square">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleMediaSelect(url)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={24} className="text-white" />
                    </button>
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                      <Plus size={12} />
                    </div>
                  </div>
                ))}
                {currentImages.length === 0 && imagesToAdd.length === 0 && (
                  <div className="col-span-full text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                    <ImageIcon size={32} className="mx-auto mb-2" />
                    <p className="text-sm font-bold">Geen afbeeldingen</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section: Run Details (Only if type is 'run') */}
            {post.type === 'run' && (
              <div className="pt-6 border-t border-slate-50">
                <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-4">Run Informatie</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className={labelStyle}>Datum</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="date" value={runDate} onChange={(e) => setRunDate(e.target.value)} className={`${inputStyle} pl-12`} />
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>Tijd</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="time" value={runTime} onChange={(e) => setRunTime(e.target.value)} className={`${inputStyle} pl-12`} />
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>Afstand (km)</label>
                    <div className="relative">
                      <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="number" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} className={`${inputStyle} pl-12`} />
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>Tempo (min/km)</label>
                    <div className="relative">
                      <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input placeholder="Bijv. 05:30" value={speed} onChange={(e) => setSpeed(e.target.value)} className={`${inputStyle} pl-12`} />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelStyle}>Startlocatie</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Naam park of straat" className={`${inputStyle} pl-12`} />
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>Max Deelnemers</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} placeholder="Onbeperkt" className={`${inputStyle} pl-12`} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-600 font-black text-sm hover:bg-red-50 px-6 py-3 rounded-2xl transition w-full sm:w-auto justify-center"
            >
              <Trash2 size={18} />
              Verwijderen
            </button>

            <div className="flex gap-3 w-full sm:w-auto">
              <button onClick={onClose} className="flex-1 sm:flex-none px-6 py-3 font-black text-slate-500 hover:text-slate-700 transition">
                Annuleren
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-10 py-3 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-slate-800 transition disabled:opacity-50"
              >
                <Save size={18} />
                {loading ? "Opslaan..." : "Opslaan"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <MediaLibrary
        isOpen={isMediaLibraryOpen}
        onCloseAction={() => setIsMediaLibraryOpen(false)}
        onSelectAction={handleMediaSelect}
        selectedUrls={imagesToAdd}
      />
    </>
  );
}
