import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type { AIConversation, AIMessage, AttachedFile, AgentTool, AIModel } from '@/types';
import { useContextStore } from '@/stores/context';

// Context-aware responses — keyed by keyword patterns in the user's message
const CONTEXTUAL_RESPONSES: Array<{ keywords: string[]; response: (ctx: string) => string }> = [
  {
    keywords: ['niche', 'market', 'audience', 'who', 'target'],
    response: (ctx) => `Based on your business context, ${ctx.includes('I help') ? 'you\'ve already defined your niche — now it\'s about going deeper' : 'let\'s sharpen your niche positioning'}.\n\n**The Niche Domination Framework:**\n\n1. **Drill to the pain** — Don't say "I help entrepreneurs." Say "I help e-commerce founders who are stuck at $30k/mo and can't scale past one-person operations."\n\n2. **Own the mechanism** — Your unique method is your moat. What do you do that nobody else does the same way?\n\n3. **Validate with money** — The best niche validation is someone paying you. Before you overthink positioning, get 3 clients in the niche you're targeting.\n\n4. **The Riches in Niches test** — Google your niche + "coach" or "consultant." If you find 10+ people, there's proven demand. If you find none, you're either pioneering or there's no market.\n\nWhat specific aspect of your niche positioning feels most unclear right now?`,
  },
  {
    keywords: ['offer', 'price', 'package', 'sell', 'product', 'course'],
    response: (ctx) => `Let me give you the Offer Architecture framework that top solopreneurs use to create irresistible offers.\n\n**The $10k Offer Stack:**\n\n🎯 **Core Transformation** (what they really want)\n- Not "12 coaching calls" — but "go from side hustle to $10k/mo in 90 days"\n\n💎 **Value Stack** (perceived value > actual price)\n- Core offer: $X value\n- Bonus 1: removes obstacle #1\n- Bonus 2: removes obstacle #2  \n- Guarantee: removes final risk\n\n🔑 **Price Anchoring**\n- Compare to the cost of NOT solving this problem\n- "This saves you 12 months of figuring it out alone — what's that worth?"\n\n⚡ **The Hormozi Formula:** Make the dream outcome so specific, the timeline believable, the effort minimal, and the guarantee strong enough that saying no feels irrational.\n\nWhat's the core transformation your offer delivers? Let's build it out.`,
  },
  {
    keywords: ['content', 'post', 'social', 'instagram', 'twitter', 'linkedin', 'video', 'youtube'],
    response: () => `Here's the Content System that generates leads on autopilot:\n\n**The Content Pyramid:**\n\n📹 **Long-form Anchor** (1x/week)\nYouTube video, podcast, or blog post. This is your SEO asset — it compounds forever.\n\n📱 **Short-form Derivatives** (5-7x/week)\nClip, carousel, quote graphic from the long-form piece. Never create original short content — always repurpose.\n\n📧 **Email Summary** (2x/week)\nSend your best insights to your list. Email is the only channel with 100% reach.\n\n**The Hook Formula that works in 2026:**\n- Line 1: Bold claim or pattern interrupt\n- Line 2: The proof or the question\n- Line 3: What they'll get if they keep reading\n\n**What most people miss:** Don't create content to educate — create content to make people *feel* something. Emotion drives saves, shares, and sales.\n\nWhat platform are you going all-in on first?`,
  },
  {
    keywords: ['revenue', 'income', 'money', 'scale', 'grow', '$', 'earn', 'sales'],
    response: (ctx) => `${ctx.includes('$') ? 'You\'ve already got income flowing — now let\'s multiply it.' : 'Let\'s map out your path to consistent revenue.'}\n\n**The Solopreneur Revenue Stack:**\n\n**Floor Income** (pay the bills)\n- 1-3 premium clients at $2-5k/mo\n- This is your "never worry about money" base\n\n**Leverage Income** (scale without hours)\n- A digital product, course, or membership\n- Sells while you sleep, no extra time\n\n**Sky Income** (the multiplier)\n- Speaking, licensing, affiliate, or equity deals\n- One deal can be worth 12 months of client work\n\n**The 90-day path to $10k/mo:**\n1. Week 1-2: Define your premium offer and price it at $2k+\n2. Week 3-4: Reach out to 50 warm contacts\n3. Month 2: Close 3-5 clients at your premium price\n4. Month 3: Package what's working into a digital product\n\nYou don't need more followers. You need a clearer offer and the courage to ask for the sale.`,
  },
  {
    keywords: ['brand', 'story', 'authority', 'credibility', 'trust', 'positioning'],
    response: () => `Your personal brand is the #1 leverage point for a solopreneur. Here's how to build one that attracts premium clients:\n\n**The Authority Pyramid:**\n\n🏔️ **Peak: Point of View**\nA bold, specific stance that polarizes — you can't be remembered if you don't stand for something. What's your contrarian take on your industry?\n\n🎯 **Middle: Proof**\n- Personal results (your own transformation)\n- Client results (documented case studies)\n- Frameworks (proprietary systems with names)\n\n🌱 **Base: Consistency**\nShow up in the same place, with the same message, every week for 12 months. The solopreneurs who "blow up" aren't lucky — they just didn't quit.\n\n**The #1 Brand Mistake:** Trying to appeal to everyone. The more specific your message, the more powerfully it resonates with your ideal person — even if it repels everyone else.\n\nWhat's one bold perspective you have that most people in your industry would disagree with?`,
  },
  {
    keywords: ['stuck', 'help', 'lost', 'overwhelmed', 'where', 'start', 'how', 'first'],
    response: (ctx) => `I hear you. Let me give you the solopreneur clarity framework:\n\n**The Clarity Stack — do these in order:**\n\n1️⃣ **Who** — Define exactly who you serve. One sentence: "I help [specific person] who [specific problem]."\n\n2️⃣ **What** — Design ONE offer. Not a menu. One thing. Price it higher than feels comfortable.\n\n3️⃣ **Where** — Pick ONE platform to get clients from. Master it before adding another.\n\n4️⃣ **Proof** — Get 3 clients at any price and document their results. Nothing beats case studies.\n\n5️⃣ **Scale** — Once you can get clients reliably, then automate, productize, and delegate.\n\n**The truth:** Most solopreneurs fail because they skip step 1 and wonder why nothing works. Clarity precedes everything.\n\n${ctx.includes('Niche') ? 'I can see you\'ve started on your niche — keep going. The clearer it gets, the easier everything else becomes.' : 'Start with your niche statement. Everything else flows from that.'}\n\nWhat feels most unclear right now?`,
  },
];

const FALLBACK_RESPONSES = [
  "That's a powerful question. Here's what I'd focus on: **specificity over scale**. Most solopreneurs try to grow faster when they should be going deeper. Deeper into their niche, their offer clarity, their relationship with existing clients. Depth creates authority. Authority creates price leverage. Price leverage creates freedom. What does 'going deeper' look like for your business right now?",
  "The solopreneurs who build lasting businesses all have one thing in common: they stopped chasing tactics and started building systems. A system for getting clients. A system for delivering results. A system for creating content. When your business runs on systems, you get your time back AND your revenue becomes predictable. What's the one area of your business that feels most chaotic right now?",
  "Here's something most business coaches won't tell you: **your mindset is your #1 business constraint**. Not your funnel, your audience size, or your offer. It's the story you tell yourself about what's possible. The solopreneurs doing $50k+ months aren't smarter than you. They just decided to stop playing small. What would you do differently if you genuinely believed $30k months were inevitable for you?",
  "Let's talk about the most underrated skill in business: **asking for the sale**. Content gets people interested. Trust gets people close. But only a clear, confident ask closes the deal. Most solopreneurs are excellent at the first two and terrible at the third. Practice this: 'Based on everything we've talked about, I think you'd be a great fit. Should we get started?' Say it without flinching. The discomfort fades after the third time.",
];

function getMockResponse(userMessage: string): string {
  const ctx = useContextStore.getState().getContextString();
  const lower = userMessage.toLowerCase();

  for (const { keywords, response } of CONTEXTUAL_RESPONSES) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return response(ctx);
    }
  }

  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

const AI_RESPONSE_DELAY_MS = 30;

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

        // Simulate streaming with context-aware response
        const fullResponse = getMockResponse(content);
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
        const fullResponse = getMockResponse('regenerate');
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
