"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Ruler, ChevronRight } from "lucide-react";
import { RunCardMiniProps } from "../../types/runCardMiniProps";

export default function RunCardMini({ run, title }: RunCardMiniProps) {
  const displayTitle = title || "Gezamenlijke Run";
    const formattedDate = run.run_date 
    ? new Date(run.run_date).toLocaleDateString('nl-NL', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      }) 
    : 'N/A';

  const formattedTime = run.run_time ? run.run_time.slice(0, 5) : '--:--';

  return (
    <Link 
      href={`/post/${run.id}`} 
      className="group block bg-white hover:bg-indigo-50 border border-slate-200 rounded-xl p-4 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          {/* Datum & Tijd Badge */}
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formattedDate}
            </span>
            <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formattedTime}
            </span>
          </div>

          {/* Titel van de run */}
          <h4 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors line-clamp-1">
            {displayTitle}
          </h4>

          {/* Details (Locatie & Afstand) */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-slate-400" /> 
              {run.start_location}
            </span>
            <span className="flex items-center gap-1">
              <Ruler size={14} className="text-slate-400" /> 
              {run.distance} km
            </span>
          </div>
        </div>

        {/* Pijltje indicatie */}
        <div className="text-slate-300 group-hover:text-indigo-400 pl-4">
          <ChevronRight size={20} />
        </div>
      </div>
    </Link>
  );
}