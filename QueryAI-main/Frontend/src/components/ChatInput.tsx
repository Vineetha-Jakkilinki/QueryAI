import { useState, useRef, useEffect } from 'react';
import { Paperclip, ArrowUp, X, FileText, Image as ImageIcon, Presentation, FileType } from 'lucide-react';
import type { Attachment } from '@/types';
import FileUpload from './FileUpload';

interface ChatInputProps {
  onSend: (text: string, attachments: Attachment[]) => void;
}

const MAX_HEIGHT = 200;

export default function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [text]);

  const canSend = text.trim().length > 0 || attachments.length > 0;

  const send = () => {
    if (!canSend) return;
    onSend(text.trim(), attachments);
    setText('');
    setAttachments([]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((a) => a.filter((x) => x.id !== id));
  };

  const attIcon = (t: Attachment['type']) =>
    t === 'image' ? ImageIcon
    : t === 'pdf' ? FileText
    : t === 'ppt' ? Presentation
    : FileType;

  return (
    <div className="shrink-0 px-4 pb-4 pt-2">
      <div className="max-w-3xl mx-auto">
        {/* Attachment chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((a) => {
              const Icon = attIcon(a.type);
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 rounded-lg bg-surface border border-app text-xs text-muted"
                >
                  <Icon size={14} className="text-accent" />
                  <span className="truncate max-w-[160px] text-app">{a.name}</span>
                  <button
                    onClick={() => removeAttachment(a.id)}
                    className="p-0.5 rounded hover:bg-surface-2 text-muted hover:text-app transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Input box */}
        <div className="relative flex items-end gap-2 px-3 py-2.5 rounded-2xl bg-surface border border-app focus-within:border-accent transition-colors">
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1.5 rounded-lg text-muted hover:text-app hover:bg-surface-2 transition-colors"
              title="Attach file"
            >
              <Paperclip size={20} />
            </button>
            <FileUpload
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              onAttach={(att) => setAttachments((a) => [...a, att])}
            />
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message QueryAI..."
            rows={1}
            className="flex-1 bg-transparent resize-none text-app placeholder:text-muted text-sm leading-relaxed focus:outline-none py-1.5 max-h-[200px]"
          />

          <button
            onClick={send}
            disabled={!canSend}
            className={`p-1.5 rounded-lg transition-all shrink-0 ${
              canSend
                ? 'bg-accent text-white hover:bg-accent/90'
                : 'bg-surface-2 text-muted cursor-not-allowed'
            }`}
            title="Send"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </div>
        <p className="text-center text-xs text-muted mt-2">
          QueryAI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
