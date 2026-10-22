import { useMemo } from 'react';
import type { Chat } from '@/types';
import ChatHistoryItem from './ChatHistoryItem';

interface ChatHistoryProps {
  chats: Chat[];
  activeChatId: string | null;
  search: string;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

const GROUP_ORDER = ['Today', 'Yesterday', 'Previous 7 Days'] as const;

export default function ChatHistory({
  chats,
  activeChatId,
  search,
  onSelect,
  onRename,
  onDelete,
}: ChatHistoryProps) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? chats.filter((c) => c.title.toLowerCase().includes(q)) : chats;
  }, [chats, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, Chat[]>();
    for (const c of filtered) {
      const arr = map.get(c.group) ?? [];
      arr.push(c);
      map.set(c.group, arr);
    }
    return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({
      group: g,
      items: map.get(g)!,
    }));
  }, [filtered]);

  if (search.trim() && filtered.length === 0) {
    return (
      <div className="px-3 py-6 text-center text-sm text-muted">
        No chats found
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {grouped.map(({ group, items }) => (
        <div key={group}>
          <div className="px-2 mb-1 text-xs font-medium text-muted uppercase tracking-wide">
            {group}
          </div>
          <div className="flex flex-col gap-0.5">
            {items.map((chat) => (
              <ChatHistoryItem
                key={chat.id}
                chat={chat}
                active={chat.id === activeChatId}
                onSelect={() => onSelect(chat.id)}
                onRename={(title) => onRename(chat.id, title)}
                onDelete={() => onDelete(chat.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
