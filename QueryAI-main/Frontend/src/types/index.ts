export type Role =
  | 'user'
  | 'assistant';


export interface Attachment {

  id: string;

  name: string;

  type:
    | 'image'
    | 'pdf'
    | 'ppt'
    | 'doc';

  size: string;

  // Present when user selects a new file
  file?: File;

  // Present when attachment comes from backend
  url?: string;
}


export interface Message {

  id: string;

  role: Role;

  content: string;

  attachments?: Attachment[];

  createdAt: number;
}


export interface Chat {

  id: string;

  title: string;

  messages: Message[];

  group:
    | 'Today'
    | 'Yesterday'
    | 'Previous 7 Days';

  createdAt: number;
}


export type Theme =
  | 'dark'
  | 'light';


export interface User {

  name: string;

  email: string;

  avatarUrl: string;
}