import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type { AIConversation, AIMessage, AttachedFile, AgentTool, AIModel } from '@/types';

const MOCK_RESPONSES = [
  "Great question! As a solopreneur, focusing on your core offer is the most important thing you can do. Start by identifying your ideal client's #1 pain point, then build a solution around that. The riches are in the niches — the more specific you get, the more you can charge.",
  "When it comes to building an audience, consistency beats perfection every time. Show up daily with valuable content, share your journey, and document your wins and lessons. People buy from people they trust, and trust is built through repeated exposure over time.",
  "Your personal brand is your most valuable asset. It's not just a logo or color palette — it's the unique combination of your story, skills, and perspective. Focus on what makes you different, not what makes you similar to everyone else in your space.",
  "To scale your income without scaling your hours, think in systems. Create once, sell forever. A digital product, course, or membership that runs on automation can generate revenue while you sleep. Start with what you already know and package it.",
  "The fastest way to grow your business is to talk to your customers. Schedule 5 customer interviews this week. Ask them what they struggle with most, what they've already tried, and what success looks like for them. That language becomes your marketing copy.",
  "Pricing is psychology as much as it is math. Most solopreneurs underprice because of imposter syndrome. A higher price signals higher value. Test a 2x price increase on your next offer — you may convert the same or better, with clients who are more committed.",
  "Content marketing compounds over time. A YouTube video you record today can bring in leads 3 years from now. Focus on search-intent content that answers the questions your ideal clients are already asking. One great piece of content beats 100 mediocre posts.",
  "Your email list is your most valuable marketing asset — you own it. Social media algorithms change, platforms die, but your email list stays with you. Offer a compelling lead magnet and direct all social traffic to grow that list consistently.",
];

const AI_RESPONSE_DELAY_MS = 30;

function getMockResponse(): string {
  return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
}

interface ChatStore {
  conversations: AIConversation[];
  currentConversationId: string | null;
  selectedProfileId: string | null;
  agentTool: AgentTool;
  model: AIModel;
  attachedFiles: AttachedFile[];
  isStreaming: boolean;

  createConversation: (title?: string) => string;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (id: string) => void;
  sendMessage: (content: string) => void;
  editMessage: (conversationId: string, messageId: string, newContent: string) => void;
  regenerateMessage: (conversationId: string, messageId: string) => void;
  setSelectedProfileId: (id: string | null) => void;
  setAgentTool: (tool: AgentTool) => void;
  setModel: (model: AIModel) => void;
  addAttachedFile: (file: AttachedFile) => void;
  removeAttachedFile: (id: string) => void;
  clearAttachedFiles: () => void;
  getCurrentMessages: () => AIMessage[];
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      selectedProfileId: null,
      agentTool: 'none',
      model: 'claude-sonnet',
      attachedFiles: [],
      isStreaming: false,

      createConversation: (title = 'New Conversation') => {
        const id = generateId();
        const now = new Date().toISOString();
        const conversation: AIConversation = {
          id,
          title,
          messages: [],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id,
        }));
        return id;
      },

      deleteConversation: (id) => {
        set((state) => {
          const remaining = state.conversations.filter((c) => c.id !== id);
          const newCurrentId =
            state.currentConversationId === id
              ? (remaining[0]?.id ?? null)
              : state.currentConversationId;
          return { conversations: remaining, currentConversationId: newCurrentId };
        });
      },

      setCurrentConversation: (id) => {
        set({ currentConversationId: id });
      },

      sendMessage: (content) => {
        const state = get();
        let conversationId = state.currentConversationId;

        if (!conversationId) {
          conversationId = get().createConversation(
            content.length > 40 ? content.slice(0, 40) + '...' : content
          );
        }

        const now = new Date().toISOString();
        const userMessage: AIMessage = {
          id: generateId(),
          role: 'user',
          content,
          timestamp: now,
        };

        // Add user message
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, userMessage],
                  updatedAt: now,
                  title:
                    c.messages.length === 0
                      ? content.length > 40
                        ? content.slice(0, 40) + '...'
                        : content
                      : c.title,
                }
              : c
          ),
          attachedFiles: [],
          isStreaming: true,
        }));

        // Create the assistant message placeholder
        const assistantMessageId = generateId();
        const assistantMessage: AIMessage = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, messages: [...c.messages, assistantMessage] }
              : c
          ),
        }));

        // Simulate streaming
        const fullResponse = getMockResponse();
        let charIndex = 0;

        const interval = setInterval(() => {
          charIndex++;
          const partialContent = fullResponse.slice(0, charIndex);

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, content: partialContent }
                        : m
                    ),
                    updatedAt: new Date().toISOString(),
                  }
                : c
            ),
          }));

          if (charIndex >= fullResponse.length) {
            clearInterval(interval);
            set({ isStreaming: false });
          }
        }, AI_RESPONSE_DELAY_MS);
      },

      editMessage: (conversationId, messageId, newContent) => {
        const now = new Date().toISOString();
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, content: newContent } : m
                  ),
                  updatedAt: now,
                }
              : c
          ),
        }));
      },

      regenerateMessage: (conversationId, messageId) => {
        const now = new Date().toISOString();
        const fullResponse = getMockResponse();
        let charIndex = 0;

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, content: '' } : m
                  ),
                }
              : c
          ),
          isStreaming: true,
        }));

        const interval = setInterval(() => {
          charIndex++;
          const partialContent = fullResponse.slice(0, charIndex);

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === messageId ? { ...m, content: partialContent } : m
                    ),
                    updatedAt: now,
                  }
                : c
            ),
          }));

          if (charIndex >= fullResponse.length) {
            clearInterval(interval);
            set({ isStreaming: false });
          }
        }, AI_RESPONSE_DELAY_MS);
      },

      setSelectedProfileId: (id) => set({ selectedProfileId: id }),
      setAgentTool: (tool) => set({ agentTool: tool }),
      setModel: (model) => set({ model }),

      addAttachedFile: (file) =>
        set((state) => ({ attachedFiles: [...state.attachedFiles, file] })),

      removeAttachedFile: (id) =>
        set((state) => ({
          attachedFiles: state.attachedFiles.filter((f) => f.id !== id),
        })),

      clearAttachedFiles: () => set({ attachedFiles: [] }),

      getCurrentMessages: () => {
        const state = get();
        const conv = state.conversations.find(
          (c) => c.id === state.currentConversationId
        );
        return conv?.messages ?? [];
      },
    }),
    {
      name: 'solopreneur-chat',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        selectedProfileId: state.selectedProfileId,
        agentTool: state.agentTool,
        model: state.model,
      }),
    }
  )
);
