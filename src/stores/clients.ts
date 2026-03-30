import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type { Client, ClientStatus } from '@/types';

const now = new Date().toISOString();

const sampleClients: Client[] = [
  {
    id: generateId(),
    name: 'Sarah Johnson',
    email: 'sarah@creatorhq.co',
    company: 'Creator HQ',
    status: 'active',
    value: 5000,
    notes: 'Joined AI Business Accelerator in January. Making great progress — hit $3k/month in month 2. Very coachable and takes action quickly.',
    tags: ['high-ticket', 'accelerator', 'content-creator'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    name: 'Marcus Chen',
    email: 'marcus@digitalshift.io',
    company: 'Digital Shift',
    status: 'active',
    value: 5000,
    notes: 'Consultant transitioning to productized services. Has a strong LinkedIn presence. Working on packaging expertise into a $2k/month retainer offer.',
    tags: ['high-ticket', 'accelerator', 'consultant'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    name: 'Emily Rodriguez',
    email: 'emily@flourishcoaching.com',
    company: 'Flourish Coaching',
    status: 'completed',
    value: 5000,
    notes: 'Completed the accelerator program. Hit $12k/month by month 3. Now a success story and brand ambassador. Has referred 2 new clients.',
    tags: ['completed', 'success-story', 'referral-source'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    name: 'James Park',
    email: 'james@parkventures.com',
    status: 'prospect',
    value: 5000,
    notes: 'Had a discovery call on March 15. Very interested in the accelerator. Waiting to close his current freelance contract before starting. Follow up April 1.',
    tags: ['warm-lead', 'discovery-call-done'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    name: 'Priya Patel',
    email: 'priya@mindfulmarketer.com',
    company: 'Mindful Marketer',
    status: 'lead',
    value: 0,
    notes: 'Downloaded the free AI toolkit. Engages with YouTube content regularly. Replied to email newsletter last week. Move to prospect after sending VSL.',
    tags: ['email-subscriber', 'youtube-fan'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    name: 'David Kim',
    email: 'david@scaledup.io',
    company: 'ScaledUp',
    status: 'churned',
    value: 2500,
    notes: 'Left the program after 6 weeks due to unexpected personal circumstances. No negative feedback — just bad timing. Offered to rejoin at a discount when ready.',
    tags: ['churned', 'good-relationship'],
    createdAt: now,
    updatedAt: now,
  },
];

interface ClientsStore {
  clients: Client[];

  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientsByStatus: (status: ClientStatus) => Client[];
  getTotalRevenue: () => number;
}

export const useClientsStore = create<ClientsStore>()(
  persist(
    (set, get) => ({
      clients: sampleClients,

      addClient: (client) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newClient: Client = { ...client, id, createdAt: now, updatedAt: now };
        set((state) => ({ clients: [...state.clients, newClient] }));
        return id;
      },

      updateClient: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: now } : c
          ),
        }));
      },

      deleteClient: (id) =>
        set((state) => ({ clients: state.clients.filter((c) => c.id !== id) })),

      getClientsByStatus: (status) => {
        return get().clients.filter((c) => c.status === status);
      },

      getTotalRevenue: () => {
        return get().clients
          .filter((c) => c.status === 'active' || c.status === 'completed')
          .reduce((sum, c) => sum + c.value, 0);
      },
    }),
    { name: 'solopreneur-clients' }
  )
);
