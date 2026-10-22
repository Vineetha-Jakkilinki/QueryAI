import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Pencil, Trash2, X } from 'lucide-react';
import type { Chat } from '@/types';

interface ChatHistoryItemProps {
  chat: Chat;
  active: boolean;
  onSelect: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
}

export default function ChatHistoryItem({
  chat,
  active,
  onSelect,
  onRename,
  onDelete,
}: ChatHistoryItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(chat.title);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) {
      inputRef.current?.focus();
    }
  }, [renaming]);

  const commitRename = () => {
    const v = title.trim();

    if (v) {
      onRename(v);
    } else {
      setTitle(chat.title);
    }

    setRenaming(false);
  };

  return (
    <>
      {/* Chat item */}
      <div
        onClick={onSelect}
        className={`group relative flex items-center px-2 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
          active
            ? 'bg-surface-2 text-app'
            : 'text-muted hover:bg-surface-2/60 hover:text-app'
        }`}
      >
        <span className="flex-1 truncate pr-6">
          {chat.title}
        </span>

        {/* Three dots */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(true);
          }}
          className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md transition-opacity ${
            active
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100'
          } hover:bg-surface text-muted hover:text-app`}
          title="Chat options"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Centered menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onMouseDown={() => setMenuOpen(false)}
        >
          <div
            className="w-72 rounded-xl border border-app bg-surface shadow-2xl p-2 animate-fade-in"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2">
              <div className="min-w-0">
                <p className="text-xs text-muted">
                  Chat options
                </p>

                <p className="text-sm font-medium text-app truncate mt-0.5">
                  {chat.title}
                </p>
              </div>

              <button
                onClick={() => setMenuOpen(false)}
                className="p-1.5 rounded-md text-muted hover:text-app hover:bg-surface-2 transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Rename */}
            <button
              onClick={() => {
                setMenuOpen(false);
                setRenaming(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-app hover:bg-surface-2 transition-colors"
            >
              <Pencil size={16} />
              <span>Rename</span>
            </button>

            {/* Delete */}
            <button
              onClick={() => {
                setMenuOpen(false);
                onDelete();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-red-400 hover:bg-surface-2 transition-colors"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Rename input */}
      {renaming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onMouseDown={() => {
            setTitle(chat.title);
            setRenaming(false);
          }}
        >
          <div
            className="w-96 max-w-[90vw] rounded-xl border border-app bg-surface shadow-2xl p-5 animate-fade-in"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-app">
              Rename chat
            </h2>

            <p className="text-xs text-muted mt-1 mb-4">
              Enter a new name for this chat.
            </p>

            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitRename();
                }

                if (e.key === 'Escape') {
                  setTitle(chat.title);
                  setRenaming(false);
                }
              }}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-app text-app text-sm focus:outline-none focus:border-accent"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setTitle(chat.title);
                  setRenaming(false);
                }}
                className="px-3 py-2 rounded-lg text-sm text-muted hover:text-app hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={commitRename}
                className="px-3 py-2 rounded-lg text-sm bg-accent text-white hover:bg-accent/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}