"use client";

import React, { useEffect, useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { storageService } from "@/lib/storage";

type MediaLibraryProps = {
  isOpen: boolean;
  onCloseAction: () => void;
  onSelectAction: (url: string) => void;
  selectedUrls: string[];
};

export default function MediaLibrary({ isOpen, onCloseAction: onClose, onSelectAction: onSelect, selectedUrls }: MediaLibraryProps) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const data = await storageService.listExistingImages();
      setImages(data);
    } catch (err) {
      console.error("Fout bij laden bibliotheek:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Media Bibliotheek</h2>
            <p className="text-sm text-slate-500">Selecteer foto's uit je Supabase opslag</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {/* Grid Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-indigo-600 font-medium animate-pulse">Foto's ophalen...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              Geen foto's gevonden in de opslag.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((img) => {
                const isSelected = selectedUrls.includes(img.url);
                return (
                  <div 
  key={img.name}
  onClick={() => onSelect(img.url)}
  className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-4 transition-all ${
    isSelected ? "border-indigo-500 shadow-lg scale-95" : "border-transparent hover:border-slate-300"
  }`}
                  >
                    <img 
                      src={img.url} 
                      alt={img.name} 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Hover overlay */}
                    <div className={`absolute inset-0 flex items-center justify-center bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100' : ''}`}>
                      {isSelected && <CheckCircle2 className="text-white fill-indigo-600" size={32} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
          >
            Klaar
          </button>
        </div>
      </div>
    </div>
  );
}