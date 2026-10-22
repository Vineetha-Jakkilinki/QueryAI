import type { Chat, Attachment } from '@/types';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

interface ChatWindowProps {
  chat: Chat | null;
  sidebarCollapsed: boolean;
  onOpenSidebar: () => void;
  onSend: (text: string, attachments: Attachment[]) => void;
}

export default function ChatWindow({
  chat,
  sidebarCollapsed,
  onOpenSidebar,
  onSend,
}: ChatWindowProps) {
  const title = chat ? chat.title : 'New chat';

  return (
    <div className="flex flex-col h-full bg-app">
      <ChatHeader
        title={title}
        onOpenSidebar={onOpenSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      <MessageList messages={chat?.messages ?? []} />
      <ChatInput onSend={onSend} />
    </div>
  );
}
