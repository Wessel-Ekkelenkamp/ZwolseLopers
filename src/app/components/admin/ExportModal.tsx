// components/modals/ExportModal.tsx
"use client";

import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Trophy } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
}

export default function ExportModal({ isOpen, onClose, post }: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'strava'>('whatsapp');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !post.run) return null;

  const run = post.run;
  const dateObj = new Date(run.run_date);
  const formattedDate = dateObj.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const time = run.run_time.substring(0, 5);
  const url = `https://zwolselopers.nl/post/${post.id}`;

  // --- Templates ---
  const templates = {
    whatsapp: `*${formattedDate}* staat er een *${run.distance} km* loopje op het programma. We starten bij *${run.start_location}* om *${time} uur*.\n\nBekijk alle details en meld je aan op: \n${url}`,
    
    strava: `Zwolse Lopers: ${post.title}\n\n📅 ${formattedDate}\n📏 ${run.distance} km\n📍 Start: ${run.start_location}\n⏰ Tijd: ${time} uur\n\nKom je ook? Meld je aan via de site:\n${url}`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(templates[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Export Run</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 mx-6 mt-6 rounded-xl">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'whatsapp' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle size={18} /> WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('strava')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'strava' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Trophy size={18} /> Strava
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-6">
          <div className="relative group">
            <div className="absolute top-3 right-3">
              
            </div>
            
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Preview</label>
            <div className="bg-slate-50 border border-gray-200 rounded-2xl p-5 pt-10 text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed h-48 overflow-y-auto">
              {templates[activeTab]}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={handleCopy}
            className={`w-full py-4 rounded-2xl font-black text-white transition-all shadow-lg active:scale-[0.98] ${
              activeTab === 'whatsapp' ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {copied ? 'Klaar! ✅' : `Kopieer voor ${activeTab === 'whatsapp' ? 'WhatsApp' : 'Strava'}`}
          </button>
        </div>
      </div>
    </div>
  );
}