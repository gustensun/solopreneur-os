import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type { CalendarEvent } from '@/types';

function dateStr(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

const now = new Date().toISOString();

const sampleEvents: CalendarEvent[] = [
  {
    id: generateId(),
    title: 'Weekly Content Batch Day',
    description: 'Record 4 YouTube videos and batch Instagram Reels for the week',
    date: dateStr(1),
    startTime: '09:00',
    endTime: '13:00',
    color: '#8B5CF6',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: 'AI Inner Circle Live Call',
    description: 'Monthly group coaching call with AI Inner Circle members',
    date: dateStr(3),
    startTime: '17:00',
    endTime: '18:30',
    color: '#10B981',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: '1:1 Client Session - Sarah',
    description: 'Weekly coaching call with high-ticket client',
    date: dateStr(2),
    startTime: '10:00',
    endTime: '11:00',
    color: '#F59E0B',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: 'Strategy Planning Session',
    description: 'Quarterly business review and Q2 planning',
    date: dateStr(5),
    startTime: '14:00',
    endTime: '16:00',
    color: '#EC4899',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: 'Email Newsletter - Weekly Roundup',
    description: 'Write and schedule the weekly email to subscribers',
    date: dateStr(4),
    startTime: '08:00',
    endTime: '09:30',
    color: '#3B82F6',
    createdAt: now,
    updatedAt: now,
  },
];

interface CalendarStore {
  events: CalendarEvent[];

  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  getEventsByDate: (date: string) => CalendarEvent[];
  getEventsByMonth: (year: number, month: number) => CalendarEvent[];
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set, get) => ({
      events: sampleEvents,

      addEvent: (event) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newEvent: CalendarEvent = { ...event, id, createdAt: now, updatedAt: now };
        set((state) => ({ events: [...state.events, newEvent] }));
        return id;
      },

      updateEvent: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: now } : e
          ),
        }));
      },

      deleteEvent: (id) =>
        set((state) => ({ events: state.events.filter((e) => e.id !== id) })),

      getEventsByDate: (date) => {
        return get().events.filter((e) => e.date === date);
      },

      getEventsByMonth: (year, month) => {
        return get().events.filter((e) => {
          const eventDate = new Date(e.date);
          return eventDate.getFullYear() === year && eventDate.getMonth() === month;
        });
      },
    }),
    { name: 'solopreneur-calendar' }
  )
);
