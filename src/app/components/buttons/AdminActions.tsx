"use client"; // Dit maakt interactie mogelijk

import React, { useState } from 'react';
import { Edit3, Share2 } from 'lucide-react';
import PinButton from './PinButton';
import EditPostModal from '../post/EditPost';
import ExportModal from '../admin/ExportModal';

export default function AdminActions({ post }: { post: any }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExportModalOpen, setExportIsModalOpen] = useState(false);

  return (
    <>
      <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
          <span className="text-orange-800 font-bold text-sm uppercase tracking-wider">Admin Paneel</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <PinButton postId={post.id} isPinnedInitially={post.is_pinned} />

          {post.type === 'run' && (
            <button
              onClick={() => setExportIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-300 text-white rounded-xl font-bold text-sm transition-all"
            >
              <Share2 size={16} className="text-blue-400" />
              Deel Post
            </button>
          )}

          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-orange-200 text-orange-700 rounded-xl text-sm font-bold hover:bg-orange-100 transition shadow-sm"
          >
            <Edit3 size={16} />
            Bewerken
          </button>
        </div>
      </div>

      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setExportIsModalOpen(false)} 
        post={post} 
      />

      {isEditModalOpen && (
        <EditPostModal 
          post={post} 
          onClose={() => setIsEditModalOpen(false)} 
        />
      )}
    </>
  );
}