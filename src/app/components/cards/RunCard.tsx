"use client";

import Link from "next/link";
import ImageCarousel from "./ImageCarousel";
import CommentPanel from "./CommentPanel";
import { RunCardProps } from "../../types/runCardProps";
import { Calendar, Clock, MapPin, Gauge } from "lucide-react";
import SignupButton from "../../components/buttons/SingupButton";
import DOMPurify from 'isomorphic-dompurify';

export default function RunCard({ post, run, hideComments = false, clickable = false }: RunCardProps) {
  const imageUrls = (post.images || []).map(img => img.image_url);

return (
    <div className="flex flex-col lg:flex-row w-full bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 mb-8 items-start">
      
      {/* LEFT SIDE: Run Info */}
      <div className="flex-1 p-6 flex flex-col min-w-0 w-full">
        <div>
          {clickable ? (
            <Link href={`/post/${run.id}`}>
              <h2 className="text-2xl font-bold text-slate-800 mb-1 hover:text-blue-600 transition-colors cursor-pointer">
                {post.title}
              </h2>
            </Link>
          ) : (
            <h2 className="text-2xl font-bold text-slate-800 mb-1">{post.title}</h2>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1.5">
              <Calendar size={14}/> 
              {run.run_date ? new Date(run.run_date).toLocaleDateString('nl-NL') : 'N/A'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14}/> 
              {run.run_time || 'N/A'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <Gauge className="text-blue-600" size={20} />
              <div>
                <p className="text-xs text-blue-600 font-bold uppercase">Afstand</p>
                <p className="font-bold text-slate-800">{run.distance} km</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
              <MapPin className="text-red-600" size={20} />
              <div>
                <p className="text-xs text-red-600 font-bold uppercase">Startlocatie</p>
                <p className="font-bold text-slate-800">{run.start_location}</p>
              </div>
            </div>
          </div>

          <div 
  className="prose prose-sm text-slate-700"
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content || '') }} 
/>

          {imageUrls.length > 0 && (
            <div className="mb-6">
              <ImageCarousel images={imageUrls} />
            </div>
          )}
        </div>

        {/* Signup Action Component */}
        <div className="pt-4 border-t border-gray-100">
          <SignupButton runId={run.id}
          maxParticipants={run.max_participants} />
        </div>
      </div>

      {/* RIGHT SIDE: Comments */}
      {!hideComments && (
        <div className="lg:w-80 w-full border-t lg:border-t-0 lg:border-l border-gray-100 bg-slate-50/50">
          <CommentPanel postId={run.id} />
        </div>
      )}
    </div>
  );
}