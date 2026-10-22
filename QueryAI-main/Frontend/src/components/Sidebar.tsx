import { PanelLeftClose } from 'lucide-react';
import type { Chat, User } from '@/types';
import { Logo } from './Logo';
import NewChatButton from './NewChatButton';
import SearchChats from './SearchChats';
import ChatHistory from './ChatHistory';
import UserMenu from './UserMenu';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  search: string;
  user: User;
  onSearchChange: (v: string) => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  onDeleteChat: (id: string) => void;
  onCollapse: () => void;
  onSettings: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  chats,
  activeChatId,
  search,
  user,
  onSearchChange,
  onNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
  onCollapse,
  onSettings,
  onLogout,
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-surface border-r border-app">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="font-semibold text-app tracking-tight">QueryAI</span>
        </div>
        <button
          onClick={onCollapse}
          className="p-1.5 rounded-md text-muted hover:text-app hover:bg-surface-2 transition-colors lg:flex hidden"
          title="Collapse sidebar"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      {/* New chat */}
      <div className="px-3 pb-3">
        <NewChatButton onClick={onNewChat} />
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <SearchChats value={search} onChange={onSearchChange} />
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        <ChatHistory
          chats={chats}
          activeChatId={activeChatId}
          search={search}
          onSelect={onSelectChat}
          onRename={onRenameChat}
          onDelete={onDeleteChat}
        />
      </div>

      {/* User menu */}
      <div className="border-t border-app p-2">
        <UserMenu user={user} onSettings={onSettings} onLogout={onLogout} />
      </div>
    </div>
  );
}
