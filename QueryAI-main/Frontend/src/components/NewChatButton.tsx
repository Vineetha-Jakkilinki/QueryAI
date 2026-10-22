import { Plus } from 'lucide-react';

interface NewChatButtonProps {
  onClick: () => void;
}

export default function NewChatButton({ onClick }: NewChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-accent hover:bg-accent/90 text-white font-medium text-sm transition-colors duration-150"
    >
      <Plus size={18} strokeWidth={2.5} />
      New Chat
    </button>
  );
}
