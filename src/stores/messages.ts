import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type { Conversation, Message } from '@/types';

const CURRENT_USER_ID = 'gusten-sun';
const now = new Date().toISOString();

const sampleConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Sarah Johnson',
    participants: [CURRENT_USER_ID, 'sarah-johnson'],
    lastMessage: 'Thanks so much for the session today! I had a breakthrough moment.',
    unreadCount: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'conv-2',
    title: 'Marcus Chen',
    participants: [CURRENT_USER_ID, 'marcus-chen'],
    lastMessage: 'Can we reschedule our call to Thursday?',
    unreadCount: 0,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'conv-3',
    title: 'AI Inner Circle Community',
    participants: [CURRENT_USER_ID, 'member-1', 'member-2', 'member-3'],
    lastMessage: 'Great call everyone! See you next month.',
    unreadCount: 3,
    createdAt: now,
    updatedAt: now,
  },
];

const sampleMessages: Message[] = [
  {
    id: generateId(),
    conversationId: 'conv-1',
    senderId: 'sarah-johnson',
    content: 'Hi Gusten! Really enjoyed the YouTube video on AI content systems.',
    isRead: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    conversationId: 'conv-1',
    senderId: CURRENT_USER_ID,
    content: 'Thanks Sarah! Glad it resonated. Have you started implementing the content batching workflow?',
    isRead: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    conversationId: 'conv-1',
    senderId: 'sarah-johnson',
    content: 'Thanks so much for the session today! I had a breakthrough moment.',
    isRead: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    conversationId: 'conv-2',
    senderId: 'marcus-chen',
    content: 'Hey! Quick question — which AI tool do you recommend for building course outlines?',
    isRead: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    conversationId: 'conv-2',
    senderId: CURRENT_USER_ID,
    content: 'Claude is my go-to for that! Try prompting it with your target avatar and desired transformation first.',
    isRead: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    conversationId: 'conv-2',
    senderId: 'marcus-chen',
    content: 'Can we reschedule our call to Thursday?',
    isRead: true,
    createdAt: now,
    updatedAt: now,
  },
];

interface MessagesStore {
  conversations: Conversation[];
  messages: Message[];
  activeConversationId: string | null;

  createConversation: (title: string, participants: string[]) => string;
  sendMessage: (conversationId: string, content: string) => void;
  markAsRead: (conversationId: string) => void;
  setActiveConversation: (id: string | null) => void;
  getMessagesByConversation: (conversationId: string) => Message[];
  getTotalUnread: () => number;
}

export const useMessagesStore = create<MessagesStore>()(
  persist(
    (set, get) => ({
      conversations: sampleConversations,
      messages: sampleMessages,
      activeConversationId: null,

      createConversation: (title, participants) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newConversation: Conversation = {
          id,
          title,
          participants: [CURRENT_USER_ID, ...participants],
          lastMessage: '',
          unreadCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ conversations: [newConversation, ...state.conversations] }));
        return id;
      },

      sendMessage: (conversationId, content) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newMessage: Message = {
          id,
          conversationId,
          senderId: CURRENT_USER_ID,
          content,
          isRead: true,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: content, updatedAt: now }
              : c
          ),
        }));
      },

      markAsRead: (conversationId) => {
        const now = new Date().toISOString();
        set((state) => ({
          messages: state.messages.map((m) =>
            m.conversationId === conversationId ? { ...m, isRead: true } : m
          ),
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0, updatedAt: now } : c
          ),
        }));
      },

      setActiveConversation: (id) => set({ activeConversationId: id }),

      getMessagesByConversation: (conversationId) => {
        return get().messages.filter((m) => m.conversationId === conversationId);
      },

      getTotalUnread: () => {
        return get().conversations.reduce((sum, c) => sum + c.unreadCount, 0);
      },
    }),
    { name: 'solopreneur-messages' }
  )
);
