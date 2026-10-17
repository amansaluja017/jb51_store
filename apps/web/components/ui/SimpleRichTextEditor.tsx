'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, List, Heading, RotateCcw, X } from 'lucide-react';

interface SimpleRichTextEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string;
}

export function SimpleRichTextEditor({
  label,
  value,
  onChange,
  placeholder = 'Add details with formatting...',
  rows = 4,
  required = false,
  className = '',
}: SimpleRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isInternalChangeRef = useRef(false);
  const [hasSelection, setHasSelection] = useState(false);

  // Sync value from props into contentEditable div only when changed externally
  useEffect(() => {
    if (editorRef.current && !isInternalChangeRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isInternalChangeRef.current = false;
  }, [value]);

  const checkSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0 && editorRef.current?.contains(sel.anchorNode)) {
      setHasSelection(true);
    } else {
      setHasSelection(false);
    }
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const plainText = editorRef.current.innerText.trim();
    isInternalChangeRef.current = true;
    onChange(plainText === '' ? '' : html);
  };

  const execCommand = (cmd: string, val: string | null = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(cmd, false, val ?? undefined);
    handleInput();
    setHasSelection(false);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
          {label} {required && <span className="text-[#FF5E36]">*</span>}
        </label>
      )}

      {/* Clean Resizable Editor Container */}
      <div className="relative border border-zinc-200 rounded-2xl bg-white overflow-hidden transition-all focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-400/20 shadow-xs">
        {/* Formatting Options: ON TOP in normal layout flow when text is selected */}
        {hasSelection && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-white transition-all shadow-md">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  execCommand('bold');
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
              >
                <Bold size={12} />
                <span>Bold</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  execCommand('italic');
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
              >
                <Italic size={12} />
                <span>Italic</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  execCommand('insertUnorderedList');
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
              >
                <List size={12} />
                <span>Bullet</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  execCommand('formatBlock', '<h2>');
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
              >
                <Heading size={12} />
                <span>Title</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  execCommand('removeFormat');
                }}
                title="Clear formatting"
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <RotateCcw size={12} />
              </button>
            </div>

            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setHasSelection(false);
              }}
              className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Visual WYSIWYG ContentEditable Area - Resizable vertically with native resize handle */}
        <div
          ref={editorRef}
          contentEditable
          data-placeholder={placeholder}
          onInput={handleInput}
          onSelect={checkSelection}
          onKeyUp={checkSelection}
          onMouseUp={checkSelection}
          onContextMenu={(e) => e.preventDefault()}
          style={{ minHeight: rows * 24 }}
          className="w-full px-4 py-3 outline-none text-xs text-zinc-800 font-sans leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-400 empty:before:pointer-events-none select-text resize-y overflow-auto"
        />
      </div>
    </div>
  );
}
