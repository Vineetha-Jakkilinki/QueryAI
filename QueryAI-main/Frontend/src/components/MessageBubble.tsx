import { Sparkles, FileText, Image as ImageIcon, Presentation, FileType } from 'lucide-react';
import type { Message, Attachment } from '@/types';
import Markdown from './Markdown';

function AttachmentChip({ att }: { att: Attachment }) {

  const Icon =
    att.type === 'image'
      ? ImageIcon
      : att.type === 'pdf'
      ? FileText
      : att.type === 'ppt'
      ? Presentation
      : FileType;

  // ==================================================
  // IMAGE ATTACHMENT
  // ==================================================

  if (att.type === 'image' && att.url) {
    return (
      <div className="mt-2 overflow-hidden rounded-xl border border-app max-w-sm">
        <img
          src={att.url}
          alt={att.name}
          className="block max-w-full max-h-80 object-contain"
        />

        <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-2 text-xs text-muted">
          <ImageIcon
            size={14}
            className="text-accent"
          />

          <span className="truncate">
            {att.name}
          </span>
        </div>
      </div>
    );
  }

  // ==================================================
  // OTHER ATTACHMENTS
  // ==================================================

  return (
    <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-md bg-surface-2 border border-app text-xs text-muted">

      <Icon
        size={14}
        className="text-accent"
      />

      <span className="truncate max-w-[180px]">
        {att.name}
      </span>

    </div>
  );
}

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-3 animate-fade-in-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-surface-2 border border-app flex items-center justify-center text-xs font-medium text-muted">
            U
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Sparkles size={16} className="text-white" strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={
            isUser
              ? 'px-4 py-2.5 rounded-2xl rounded-tr-sm bg-accent text-white text-sm leading-relaxed'
              : 'px-4 py-3 rounded-2xl rounded-tl-sm bg-surface border border-app text-app text-sm leading-relaxed'
          }
        >
          {isUser ? <p className="whitespace-pre-wrap">{message.content}</p> : <Markdown content={message.content} />}
        </div>
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((a) => <AttachmentChip key={a.id} att={a} />)}
          </div>
        )}
      </div>
    </div>
  );
}
