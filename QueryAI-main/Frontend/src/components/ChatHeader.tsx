import { PanelLeftOpen } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  onOpenSidebar: () => void;
  sidebarCollapsed: boolean;
}

export default function ChatHeader({
  title,
  onOpenSidebar,
  sidebarCollapsed,
}: ChatHeaderProps) {
  return (
    <header className="flex items-center gap-3 px-4 h-14 border-b border-app bg-app/80 backdrop-blur-sm shrink-0">
      {sidebarCollapsed && (
        <button
          onClick={onOpenSidebar}
          className="p-1.5 rounded-md text-muted hover:text-app hover:bg-surface-2 transition-colors"
          title="Open sidebar"
        >
          <PanelLeftOpen size={20} />
        </button>
      )}
      <h1 className="text-sm font-medium text-app truncate">{title}</h1>
    </header>
  );
}
