import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';

import LoginPage from '@/components/LoginPage';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import SettingsModal from '@/components/SettingsModal';
import ConfirmDialog from '@/components/ConfirmDialog';

import {
  getChats,
  createChat,
  getMessages,
  createMessage,
  renameChat,
  deleteChat,
} from '@/api/chatApi';

import type { Chat, Message, Attachment } from '@/types';


// ==================================================
// APP INNER
// ==================================================

function AppInner() {
  const { user, loading, logout } = useAuth();

  // ==================================================
  // CHAT STATE
  // ==================================================

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [mobileSidebar, setMobileSidebar] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const [logoutOpen, setLogoutOpen] = useState(false);

  const [deleteChatId, setDeleteChatId] =
    useState<string | null>(null);

  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined'
      ? window.innerWidth >= 1024
      : true
  );

  // ==================================================
  // RESPONSIVE SIDEBAR
  // ==================================================

  useEffect(() => {
    const onResize = () => {
      const desktop = window.innerWidth >= 1024;

      setIsDesktop(desktop);

      if (desktop) {
        setMobileSidebar(false);
      }
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // ==================================================
  // LOAD CHATS FROM BACKEND
  // ==================================================

  useEffect(() => {
    if (!user) return;

    const loadChats = async () => {
      try {
        const data = await getChats();

        setChats(data);

        if (data.length > 0) {
          setActiveChatId(data[0].id);
        }
      } catch (error) {
        console.error(
          'Failed to load chats:',
          error
        );
      }
    };

    loadChats();
  }, [user]);

  // ==================================================
  // ACTIVE CHAT
  // ==================================================

  const activeChat =
    chats.find(
      (chat) => chat.id === activeChatId
    ) ?? null;

  const sidebarCollapsed =
    isDesktop && !sidebarOpen;

  // ==================================================
  // LOAD MESSAGES WHEN CHAT IS SELECTED
  // ==================================================

  useEffect(() => {
    if (!activeChatId) return;

    const loadMessages = async () => {
      try {
        const messages = await getMessages(
          Number(activeChatId)
        );

        setChats((currentChats) =>
          currentChats.map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  messages,
                }
              : chat
          )
        );
      } catch (error) {
        console.error(
          'Failed to load messages:',
          error
        );
      }
    };

    loadMessages();
  }, [activeChatId]);

  // ==================================================
  // NEW CHAT
  // ==================================================

  const handleNewChat = async () => {
    try {
      const newChat = await createChat(
        'New Chat'
      );

      setChats((currentChats) => [
        newChat,
        ...currentChats,
      ]);

      setActiveChatId(newChat.id);

      if (!isDesktop) {
        setMobileSidebar(false);
      }
    } catch (error) {
      console.error(
        'Failed to create chat:',
        error
      );
    }
  };

  // ==================================================
  // SELECT CHAT
  // ==================================================

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);

    if (!isDesktop) {
      setMobileSidebar(false);
    }
  };

  // ==================================================
  // RENAME CHAT
  // ==================================================

  const handleRename = async (
  id: string,
  title: string
) => {
  try {
    const updatedChat = await renameChat(
      Number(id),
      title
    );

    setChats((currentChats) =>
      currentChats.map((chat) =>
        chat.id === id
          ? {
              ...chat,
              title: updatedChat.title,
            }
          : chat
      )
    );

  } catch (error) {
    console.error(
      'Failed to rename chat:',
      error
    );
  }
};

  // ==================================================
  // DELETE CHAT REQUEST
  // ==================================================

  const handleDeleteRequest = (
    id: string
  ) => {
    setDeleteChatId(id);
  };

  // ==================================================
  // CONFIRM DELETE
  // ==================================================

const confirmDelete = async () => {
  if (!deleteChatId) {
    return;
  }

  try {
    // Delete from backend
    await deleteChat(Number(deleteChatId));

    // Delete from frontend state
    setChats((currentChats) =>
      currentChats.filter(
        (chat) => chat.id !== deleteChatId
      )
    );

    // If deleted chat was active, clear it
    if (activeChatId === deleteChatId) {
      setActiveChatId(null);
    }

    // Close confirmation dialog
    setDeleteChatId(null);

  } catch (error) {
    console.error(
      'Failed to delete chat:',
      error
    );
  }
};
// ==================================================
// SEND MESSAGE
// ==================================================

const handleSend = async (
  text: string,
  attachments: Attachment[]
) => {
  if (!text && attachments.length === 0) {
    return;
  }

  try {
    let chatId = activeChatId;

    // ==================================================
    // IF NO CHAT EXISTS → CREATE ONE
    // ==================================================

    if (!chatId) {
      const newChat = await createChat(
        text
          ? deriveTitle(text)
          : 'New Chat'
      );

      setChats((currentChats) => [
        newChat,
        ...currentChats,
      ]);

      chatId = newChat.id;

      setActiveChatId(chatId);
    }

    // ==================================================
    // SEND MESSAGE TO BACKEND
    // ==================================================

    if (text || attachments.length > 0) {
  const file =
    attachments.length > 0
      ? attachments[0].file
      : undefined;

  await createMessage(
    Number(chatId),
    'user',
    text,
    file
  );

      // Backend has now:
      // 1. Saved user message
      // 2. Called Groq
      // 3. Saved assistant response

      // Reload complete conversation
      const messages = await getMessages(
        Number(chatId)
      );

      setChats((currentChats) =>
        currentChats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                title:
                  chat.messages.length === 0
                    ? deriveTitle(text)
                    : chat.title,
                messages,
              }
            : chat
        )
      );
    }

  } catch (error) {
    console.error(
      'Failed to send message:',
      error
    );
  }
};


  // ==================================================
  // SIDEBAR
  // ==================================================

  const sidebar = (
    <Sidebar
      chats={chats}
      activeChatId={activeChatId}
      search={search}
      user={user!}

      onSearchChange={setSearch}

      onNewChat={
        handleNewChat
      }

      onSelectChat={
        handleSelectChat
      }

      onRenameChat={
        handleRename
      }

      onDeleteChat={
        handleDeleteRequest
      }

      onCollapse={() =>
        setSidebarOpen(false)
      }

      onSettings={() =>
        setSettingsOpen(true)
      }

      onLogout={() =>
        setLogoutOpen(true)
      }
    />
  );

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-app text-app">
        <div className="text-muted">
          Loading QueryAI...
        </div>
      </div>
    );
  }

  // ==================================================
  // NOT AUTHENTICATED
  // ==================================================

  if (!user) {
    return <LoginPage />;
  }

  // ==================================================
  // MAIN QUERYAI UI
  // ==================================================

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-app text-app">

      {/* =========================================
          DESKTOP SIDEBAR
      ========================================= */}

      <aside
        className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed
            ? 'w-0'
            : 'w-72'
        } overflow-hidden`}
      >
        <div className="w-72 h-full">
          {sidebar}
        </div>
      </aside>

      {/* =========================================
          MOBILE SIDEBAR
      ========================================= */}

      {mobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-40 flex">

          {/* Overlay */}

          <div
            className="absolute inset-0 bg-black/60 animate-fade-in"
            onClick={() =>
              setMobileSidebar(false)
            }
          />

          {/* Sidebar */}

          <div className="relative w-72 h-full animate-fade-in-up">

            <button
              onClick={() =>
                setMobileSidebar(false)
              }
              className="absolute top-3 right-3 z-10 p-1.5 rounded-md text-muted hover:text-app hover:bg-surface-2"
            >
              <X size={18} />
            </button>

            {sidebar}

          </div>
        </div>
      )}

      {/* =========================================
          MAIN CHAT AREA
      ========================================= */}

      <main className="flex-1 flex flex-col min-w-0 relative">

        {/* Mobile top bar */}

        {!mobileSidebar && (
          <div className="lg:hidden flex items-center px-3 h-12 border-b border-app bg-surface shrink-0">

            <button
              onClick={() =>
                setMobileSidebar(true)
              }
              className="p-1.5 rounded-md text-muted hover:text-app hover:bg-surface-2 transition-colors"
            >
              <Menu size={20} />
            </button>

            <span className="ml-2 text-sm font-medium text-app truncate">
              {activeChat
                ? activeChat.title
                : 'QueryAI'}
            </span>

          </div>
        )}

        {/* Chat Window */}

        <ChatWindow
          chat={activeChat}
          sidebarCollapsed={
            sidebarCollapsed
          }

          onOpenSidebar={() =>
            setSidebarOpen(true)
          }

          onSend={handleSend}
        />

      </main>

      {/* =========================================
          SETTINGS
      ========================================= */}

      <SettingsModal
        open={settingsOpen}
        onClose={() =>
          setSettingsOpen(false)
        }
      />

      {/* =========================================
          LOGOUT
      ========================================= */}

      <ConfirmDialog
        open={logoutOpen}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmLabel="Logout"
        danger

        onConfirm={async () => {
          await logout();

          setLogoutOpen(false);
        }}

        onCancel={() =>
          setLogoutOpen(false)
        }
      />

      {/* =========================================
          DELETE CHAT
      ========================================= */}

      <ConfirmDialog
        open={
          deleteChatId !== null
        }
        title="Delete chat"
        message="Delete this chat?"
        confirmLabel="Delete"
        danger

        onConfirm={
          confirmDelete
        }

        onCancel={() =>
          setDeleteChatId(null)
        }
      />

    </div>
  );
}


// ==================================================
// CHAT TITLE
// ==================================================

function deriveTitle(
  text: string
) {
  const title = text
    .trim()
    .replace(/\s+/g, ' ');

  return title.length > 40
    ? title.slice(0, 40) + '…'
    : title;
}

// ==================================================
// ROOT APP
// ==================================================

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
}