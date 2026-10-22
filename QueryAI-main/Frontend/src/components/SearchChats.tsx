import { Search } from 'lucide-react';

interface SearchChatsProps {
  value: string;
  onChange: (v: string) => void;
}

export default function SearchChats({ value, onChange }: SearchChatsProps) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search chats"
        className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-2 border border-app text-app text-sm placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
      />
    </div>
  );
}
