"use client";

import React, { useState, useEffect } from "react";
import { X, Link2 } from "lucide-react";

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string, text?: string) => void;
  initialUrl?: string;
  initialText?: string;
}

export default function HyperLinkModal({ isOpen, onClose, onConfirm, initialUrl = "", initialText = "" }: LinkModalProps) {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setText(initialText);
    }
  }, [isOpen, initialUrl, initialText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-blue-50 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-blue-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2454a3] text-white rounded-xl">
              <Link2 size={20} />
            </div>
            <h3 className="font-black text-[#2454a3] italic uppercase tracking-wider">Link Toevoegen</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Link Tekst</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Bijv: Bekijk de route"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#2454a3]/20 focus:border-[#2454a3] outline-none text-gray-900 transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">URL (Website adres)</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://strava.com/..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#2454a3]/20 focus:border-[#2454a3] outline-none text-gray-900 transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            Terug
          </button>
          <button
            onClick={() => onConfirm(url, text)}
            disabled={!url}
            className="flex-1 py-3 px-4 bg-[#2454a3] text-white rounded-xl font-bold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/10 transition-all"
          >
            Bevestigen
          </button>
        </div>
      </div>
    </div>
  );
}