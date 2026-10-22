import { useRef, useEffect } from 'react';
import { Image as ImageIcon, FileText, Presentation, FileType } from 'lucide-react';
import type { Attachment } from '@/types';

interface FileUploadProps {
  open: boolean;
  onClose: () => void;
  onAttach: (att: Attachment) => void;
}

const OPTIONS: {
  label: string;
  type: Attachment['type'];
  accept: string;
  Icon: typeof FileText;
}[] = [
  { label: 'Upload Image', type: 'image', accept: 'image/*', Icon: ImageIcon },
  { label: 'Upload PDF', type: 'pdf', accept: '.pdf', Icon: FileText },
  { label: 'Upload PPT/PPTX', type: 'ppt', accept: '.ppt,.pptx', Icon: Presentation },
  { label: 'Upload DOC/DOCX', type: 'doc', accept: '.doc,.docx', Icon: FileType },
];

export default function FileUpload({ open, onClose, onAttach }: FileUploadProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handlePick = (opt: (typeof OPTIONS)[number]) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = opt.accept;
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        onAttach({
          id: crypto.randomUUID(),
          name: file.name,
          type: opt.type,
          size: `${(file.size / 1024).toFixed(0)} KB`,
          file: file,
        });
      }
      onClose();
    };
    input.click();
  };

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 w-52 rounded-xl border border-app bg-surface shadow-xl py-1.5 animate-fade-in z-20"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.type}
          onClick={() => handlePick(opt)}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted hover:text-app hover:bg-surface-2 transition-colors"
        >
          <opt.Icon size={16} className="text-accent" />
          {opt.label}
        </button>
      ))}
    </div>
  );
}
