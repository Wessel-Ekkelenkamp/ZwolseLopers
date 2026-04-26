"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Link as LinkIcon, List} from 'lucide-react';
import React, { useState } from 'react';
import HyperLinkModal from './HyperlinkModal';

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: Props) {
const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-indigo-600 underline cursor-pointer' },
      }),
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        lang: 'nl',
        spellcheck: 'true',
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] p-4 bg-white border border-gray-200 rounded-b-xl text-gray-900',
      },
    },
  });

  if (!editor) return null;

  const handleLinkConfirm = (url: string, text?: string) => {
  if (url === "") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  } else {
    let finalUrl = url;
    if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url) && !/^tel:/i.test(url)) {
      finalUrl = `https://${url}`;
    }

    if (text && editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${finalUrl}">${text}</a>`).run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: finalUrl }).run();
    }
  }
  setIsLinkModalOpen(false);
};

  const btnClass = (active: boolean) => 
    `p-2 rounded-md transition-all ${active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`;

  return (
    <div className="w-full flex flex-col border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-1.5 flex gap-1 flex-wrap">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Vet">
          <Bold size={18} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Cursief">
          <Italic size={18} />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Lijst">
          <List size={18} />
        </button>
        <button 
  type="button" 
  onClick={() => setIsLinkModalOpen(true)}
  className={btnClass(editor.isActive('link'))}
>
  <LinkIcon size={18} />
</button>
      </div>

      <>
  <EditorContent editor={editor} />
  
  <HyperLinkModal 
    isOpen={isLinkModalOpen}
    onClose={() => setIsLinkModalOpen(false)}
    onConfirm={handleLinkConfirm}
    initialUrl={editor.getAttributes('link').href}
    initialText={editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)}
  />
</>
    </div>
  );
}