import type { Chat, Message, Attachment } from '@/types';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* =========================
   Backend response types
   ========================= */

interface BackendChat {
  id: number;
  title: string;
  created_at: string;
}

interface BackendMessage {
  id: number;
  chat_id: number;
  role: string;
  content: string;
  created_at: string;

  // Attachment fields
  attachment_name?: string | null;
  attachment_type?: string | null;
  attachment_url?: string | null;
}


/* =========================
   Conversion helpers
   ========================= */

function convertChat(chat: BackendChat): Chat {
  return {
    id: String(chat.id),
    title: chat.title,
    messages: [],
    group: 'Today',
    createdAt: new Date(chat.created_at).getTime(),
  };
}


function convertMessage(
  message: BackendMessage
): Message {

  let attachment: Attachment | undefined;


  // ==================================================
  // CONVERT BACKEND ATTACHMENT → FRONTEND ATTACHMENT
  // ==================================================

  if (
    message.attachment_name &&
    message.attachment_type &&
    message.attachment_url
  ) {

    /*
     * Cloudinary gives us a complete URL:
     *
     * https://res.cloudinary.com/...
     *
     * Use it directly.
     *
     * For any old/local URL such as:
     *
     * /uploads/image.png
     *
     * add the backend URL.
     */

    const attachmentUrl =
      message.attachment_url.startsWith('http')
        ? message.attachment_url
        : `${API_URL}${message.attachment_url}`;


    attachment = {
      id: String(message.id),

      name: message.attachment_name,

      type:
        message.attachment_type === 'image'
          ? 'image'
          : message.attachment_type === 'pdf'
          ? 'pdf'
          : message.attachment_type === 'ppt'
          ? 'ppt'
          : 'doc',

      size: '',

      url: attachmentUrl,
    };
  }


  return {
    id: String(message.id),

    role:
      message.role === 'assistant'
        ? 'assistant'
        : 'user',

    content: message.content,

    attachments: attachment
      ? [attachment]
      : undefined,

    createdAt: new Date(
      message.created_at
    ).getTime(),
  };
}


/* =========================
   GET ALL CHATS
   ========================= */

export async function getChats(): Promise<Chat[]> {

  const response = await fetch(
    `${API_URL}/chats/`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );


  if (!response.ok) {
    throw new Error(
      'Failed to fetch chats'
    );
  }


  const data: BackendChat[] =
    await response.json();


  return data.map(convertChat);
}


/* =========================
   CREATE CHAT
   ========================= */

export async function createChat(
  title: string = 'New Chat'
): Promise<Chat> {

  const response = await fetch(
    `${API_URL}/chats/`,
    {
      method: 'POST',
      credentials: 'include',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        title,
      }),
    }
  );


  if (!response.ok) {
    throw new Error(
      'Failed to create chat'
    );
  }


  const data: BackendChat =
    await response.json();


  return convertChat(data);
}


/* =========================
   GET MESSAGES
   ========================= */

export async function getMessages(
  chatId: number
): Promise<Message[]> {

  const response = await fetch(
    `${API_URL}/chats/${chatId}/messages`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );


  if (!response.ok) {
    throw new Error(
      'Failed to fetch messages'
    );
  }


  const data: BackendMessage[] =
    await response.json();


  return data.map(convertMessage);
}


/* =========================
   CREATE MESSAGE
   ========================= */

export async function createMessage(
  chatId: number,
  role: string,
  content: string,
  file?: File
): Promise<Message> {

  const formData = new FormData();


  formData.append(
    'role',
    role
  );


  formData.append(
    'content',
    content
  );


  if (file) {

    formData.append(
      'file',
      file
    );

  }


  const response = await fetch(
    `${API_URL}/chats/${chatId}/messages`,
    {
      method: 'POST',
      credentials: 'include',

      /*
       * IMPORTANT:
       * Do NOT manually set Content-Type.
       * The browser automatically sets:
       *
       * multipart/form-data
       * + the correct boundary.
       */

      body: formData,
    }
  );


  if (!response.ok) {
    throw new Error(
      'Failed to create message'
    );
  }


  const data: BackendMessage =
    await response.json();


  return convertMessage(data);
}


/* =========================
   RENAME CHAT
   ========================= */

export async function renameChat(
  chatId: number,
  title: string
): Promise<Chat> {

  const response = await fetch(
    `${API_URL}/chats/${chatId}`,
    {
      method: 'PATCH',
      credentials: 'include',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        title,
      }),
    }
  );


  if (!response.ok) {
    throw new Error(
      'Failed to rename chat'
    );
  }


  const data: BackendChat =
    await response.json();


  return convertChat(data);
}


/* =========================
   DELETE CHAT
   ========================= */

export async function deleteChat(
  chatId: number
): Promise<void> {

  const response = await fetch(
    `${API_URL}/chats/${chatId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );


  if (!response.ok) {
    throw new Error(
      'Failed to delete chat'
    );
  }
}