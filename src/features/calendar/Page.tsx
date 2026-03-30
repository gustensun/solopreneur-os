import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Plus,
  Trash2,
  Clock,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  parseISO,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCalendarStore } from "@/stores/calendar";
import type { CalendarEvent } from "@/types";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "month" | "week" | "day";

// ─── Color options ────────────────────────────────────────────────────────────

const EVENT_COLORS = [
  "#10B981", // emerald
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#F59E0B", // amber
  "#EC4899", // pink
  "#EF4444", // red
  "#06B6D4", // cyan
  "#F97316", // orange
  "#14B8A6", // teal
  "#6366F1", // indigo
];

// ─── Hours ────────────────────────────────────────────────────────────────────

const START_HOUR = 6;
const END_HOUR = 22;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
const HOUR_HEIGHT = 60; // px per hour

function formatHour(h: number) {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

// ─── Event Dialog ─────────────────────────────────────────────────────────────

interface EventFormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
}

function EventDialog({
  open,
  onClose,
  event,
  defaultDate,
  defaultTime,
  onSave,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  defaultDate?: string;
  defaultTime?: string;
  onSave: (data: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">) => void;
  onDelete?: () => void;
}) {
  const isNew = !event?.id;

  const buildForm = (): EventFormData => ({
    title: event?.title ?? "",
    description: event?.description ?? "",
    date: event?.date ?? defaultDate ?? format(new Date(), "yyyy-MM-dd"),
    startTime: event?.startTime ?? defaultTime ?? "09:00",
    endTime:
      event?.endTime ??
      (defaultTime
        ? `${String(parseInt(defaultTime.split(":")[0]) + 1).padStart(2, "0")}:00`
        : "10:00"),
    color: event?.color ?? EVENT_COLORS[0],
  });

  const [form, setForm] = useState<EventFormData>(buildForm);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleOpenChange(v: boolean) {
    if (v) {
      setForm(buildForm());
      setConfirmDelete(false);
    } else {
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="h-3.5 w-3.5 rounded-full shrink-0"
              style={{ backgroundColor: form.color }}
            />
            {isNew ? "New Event" : "Edit Event"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Event title..."
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Optional notes..."
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startTime: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>End Time</Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endTime: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={cn(
                    "h-7 w-7 rounded-full transition-all duration-150 hover:scale-110",
                    form.color === c && "ring-2 ring-offset-2 ring-primary scale-110"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!isNew && onDelete && (
            <div className="flex-1">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-destructive">Delete this event?</span>
                  <Button variant="destructive" size="sm" onClick={onDelete}>
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              )}
            </div>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!form.title.trim() || !form.date}
            onClick={() => {
              if (form.title.trim()) {
                onSave({
                  title: form.title,
                  description: form.description,
                  date: form.date,
                  startTime: form.startTime,
                  endTime: form.endTime,
                  color: form.color,
                });
              }
            }}
          >
            {isNew ? "Create Event" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Event Pill (month view) ──────────────────────────────────────────────────

function EventPill({
  event,
  onClick,
}: {
  event: CalendarEvent;
  onClick: (e: CalendarEvent) => void;
}) {
  return (
    <button
      onClick={(ev) => {
        ev.stopPropagation();
        onClick(event);
      }}
      className="w-full text-left rounded text-white truncate font-medium transition-opacity hover:opacity-80 text-[10px] px-1.5 py-0.5 leading-tight"
      style={{ backgroundColor: event.color }}
      title={`${event.title} — ${event.startTime}–${event.endTime}`}
    >
      {event.title}
    </button>
  );
}

// ─── Month View ───────────────────────────────────────────────────────────────

function MonthView({
  currentDate,
  events,
  onDayClick,
  onEventClick,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (e: CalendarEvent) => void;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);

  const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/20">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-hidden">
        {days.map((day, idx) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayEvents = (eventsByDate[dateKey] ?? []).sort((a, b) =>
            a.startTime.localeCompare(b.startTime)
          );
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <div
              key={idx}
              onClick={() => onDayClick(day)}
              className={cn(
                "border-b border-r border-border/40 p-1.5 cursor-pointer hover:bg-primary/5 transition-colors group min-h-[80px]",
                !isCurrentMonth && "bg-muted/10",
                isCurrentDay && "bg-primary/5",
                isWeekend && !isCurrentMonth && "bg-muted/5"
              )}
            >
              <div
                className={cn(
                  "h-6 w-6 flex items-center justify-center rounded-full text-xs font-medium mb-1 transition-colors",
                  isCurrentDay
                    ? "bg-primary text-primary-foreground font-semibold"
                    : isCurrentMonth
                    ? "text-foreground group-hover:bg-muted"
                    : "text-muted-foreground/40"
                )}
              >
                {format(day, "d")}
              </div>

              <div className="flex flex-col gap-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <EventPill key={ev.id} event={ev} onClick={onEventClick} />
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[9px] text-muted-foreground pl-1 font-medium">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Time Grid (week & day views) ─────────────────────────────────────────────

function TimeGrid({
  days,
  events,
  onSlotClick,
  onEventClick,
}: {
  days: Date[];
  events: CalendarEvent[];
  onSlotClick: (date: Date, hour: number) => void;
  onEventClick: (e: CalendarEvent) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);

  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Day headers */}
      <div className="flex border-b border-border shrink-0">
        <div className="w-16 shrink-0 border-r border-border/50 bg-muted/10" />
        {days.map((day, di) => (
          <div
            key={di}
            className={cn(
              "flex-1 min-w-0 border-r border-border/30 last:border-r-0 py-2 flex flex-col items-center gap-0.5",
              isToday(day) && "bg-primary/5"
            )}
          >
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {format(day, "EEE")}
            </span>
            <span
              className={cn(
                "text-sm font-semibold leading-none h-7 w-7 flex items-center justify-center rounded-full",
                isToday(day)
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground"
              )}
            >
              {format(day, "d")}
            </span>
          </div>
        ))}
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex" style={{ minHeight: `${HOURS.length * HOUR_HEIGHT}px` }}>
          {/* Time gutter */}
          <div className="w-16 shrink-0 border-r border-border/50 relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="border-b border-border/15"
                style={{ height: `${HOUR_HEIGHT}px` }}
              >
                <span className="text-[10px] text-muted-foreground px-2 -translate-y-2 block">
                  {formatHour(h)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, di) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDate[dateKey] ?? [];
            const isCurrentDay = isToday(day);

            return (
              <div
                key={di}
                className={cn(
                  "flex-1 min-w-0 border-r border-border/30 last:border-r-0 relative",
                  isCurrentDay && "bg-primary/5"
                )}
              >
                {/* Hour slots */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    onClick={() => onSlotClick(day, h)}
                    className="border-b border-border/15 hover:bg-primary/5 cursor-pointer transition-colors"
                    style={{ height: `${HOUR_HEIGHT}px` }}
                  />
                ))}

                {/* Current time line */}
                {isCurrentDay && (
                  <div
                    className="absolute left-0 right-0 flex items-center pointer-events-none z-10"
                    style={{
                      top: `${((nowMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT}px`,
                    }}
                  >
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500 -ml-1.5 shrink-0" />
                    <div className="flex-1 h-px bg-red-500 opacity-70" />
                  </div>
                )}

                {/* Events overlay */}
                {dayEvents.map((ev) => {
                  const startMin = timeToMinutes(ev.startTime);
                  const endMin = timeToMinutes(ev.endTime) || startMin + 60;
                  const top = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT;
                  const height = Math.max(
                    ((endMin - startMin) / 60) * HOUR_HEIGHT,
                    24
                  );

                  return (
                    <button
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(ev);
                      }}
                      className="absolute left-0.5 right-0.5 rounded-md text-white text-[10px] font-medium px-1.5 py-1 overflow-hidden hover:opacity-90 transition-opacity text-left z-20 shadow-sm"
                      style={{
                        backgroundColor: ev.color,
                        top: `${top}px`,
                        height: `${height}px`,
                      }}
                    >
                      <div className="font-semibold truncate leading-tight">
                        {ev.title}
                      </div>
                      {height > 32 && (
                        <div className="opacity-80 truncate flex items-center gap-0.5 mt-0.5">
                          <Clock className="h-2.5 w-2.5 shrink-0" />
                          {ev.startTime}–{ev.endTime}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useCalendarStore();

  const [view, setView] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState<string>("");
  const [defaultTime, setDefaultTime] = useState<string>("");

  // ── Navigation ────────────────────────────────────────────────────────────

  function goBack() {
    if (view === "month") setCurrentDate((d) => subMonths(d, 1));
    else if (view === "week") setCurrentDate((d) => subWeeks(d, 1));
    else setCurrentDate((d) => subDays(d, 1));
  }

  function goForward() {
    if (view === "month") setCurrentDate((d) => addMonths(d, 1));
    else if (view === "week") setCurrentDate((d) => addWeeks(d, 1));
    else setCurrentDate((d) => addDays(d, 1));
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  // ── Title ─────────────────────────────────────────────────────────────────

  const displayTitle = useMemo(() => {
    if (view === "month") return format(currentDate, "MMMM yyyy");
    if (view === "day") return format(currentDate, "EEEE, MMMM d, yyyy");
    const wStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const wEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    if (wStart.getMonth() === wEnd.getMonth()) {
      return `${format(wStart, "MMM d")} – ${format(wEnd, "d, yyyy")}`;
    }
    return `${format(wStart, "MMM d")} – ${format(wEnd, "MMM d, yyyy")}`;
  }, [view, currentDate]);

  // ── Visible events ────────────────────────────────────────────────────────

  const visibleEvents = useMemo(() => {
    if (view === "month") {
      const mStart = startOfMonth(currentDate);
      const mEnd = endOfMonth(currentDate);
      const calStart = startOfWeek(mStart, { weekStartsOn: 0 });
      const calEnd = endOfWeek(mEnd, { weekStartsOn: 0 });
      return events.filter((ev) => {
        const d = parseISO(ev.date);
        return d >= calStart && d <= calEnd;
      });
    }
    if (view === "week") {
      const wStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const wEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return events.filter((ev) => {
        const d = parseISO(ev.date);
        return d >= wStart && d <= wEnd;
      });
    }
    const dateKey = format(currentDate, "yyyy-MM-dd");
    return events.filter((ev) => ev.date === dateKey);
  }, [view, currentDate, events]);

  // ── Week days ─────────────────────────────────────────────────────────────

  const weekDays = useMemo(() => {
    const wStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: wStart, end: addDays(wStart, 6) });
  }, [currentDate]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function openNew(date?: Date, hour?: number) {
    setEditingEvent(null);
    setDefaultDate(
      date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
    );
    setDefaultTime(
      hour !== undefined ? `${String(hour).padStart(2, "0")}:00` : "09:00"
    );
    setDialogOpen(true);
  }

  function openEdit(ev: CalendarEvent) {
    setEditingEvent(ev);
    setDialogOpen(true);
  }

  function handleSave(data: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">) {
    if (editingEvent) {
      updateEvent(editingEvent.id, data);
    } else {
      addEvent(data);
    }
    setDialogOpen(false);
    setEditingEvent(null);
  }

  function handleDelete() {
    if (editingEvent) {
      deleteEvent(editingEvent.id);
      setDialogOpen(false);
      setEditingEvent(null);
    }
  }

  // ── Upcoming events sidebar summary ──────────────────────────────────────

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const upcomingToday = events
    .filter((ev) => ev.date === todayKey)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div
      className="page-container flex flex-col gap-0"
      style={{ height: "calc(100vh - 64px)" }}
    >
      {/* Page header */}
      <div className="page-header shrink-0 pb-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <h1 className="page-title">Calendar</h1>
        </div>
        <p className="page-description">Schedule and manage your events and tasks.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4 shrink-0">
        {/* View switcher */}
        <div className="flex items-center rounded-lg border border-border overflow-hidden bg-background">
          {(["month", "week", "day"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium capitalize transition-all duration-150",
                view === v
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1 bg-background border border-border rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="h-8 w-8 rounded-none border-r border-border"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToday}
            className="h-8 px-3 text-xs font-medium rounded-none"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goForward}
            className="h-8 w-8 rounded-none border-l border-border"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Period title */}
        <span className="font-semibold text-sm sm:text-base">{displayTitle}</span>

        {/* Today's events mini-summary */}
        {upcomingToday.length > 0 && (
          <div className="hidden lg:flex items-center gap-2 ml-auto mr-2">
            {upcomingToday.slice(0, 2).map((ev) => (
              <button
                key={ev.id}
                onClick={() => openEdit(ev)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full text-white font-medium hover:opacity-80 transition-opacity"
                style={{ backgroundColor: ev.color }}
              >
                <Clock className="h-3 w-3 shrink-0" />
                <span className="max-w-24 truncate">{ev.title}</span>
                <span className="opacity-80">{ev.startTime}</span>
              </button>
            ))}
            {upcomingToday.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{upcomingToday.length - 2} more today
              </span>
            )}
          </div>
        )}

        <Button
          size="sm"
          onClick={() => openNew()}
          className={cn(upcomingToday.length === 0 && "ml-auto")}
        >
          <Plus className="h-3.5 w-3.5" />
          New Event
        </Button>
      </div>

      {/* Calendar body */}
      <div className="flex-1 glass-card overflow-hidden flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${format(currentDate, "yyyy-MM-dd")}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {view === "month" && (
              <MonthView
                currentDate={currentDate}
                events={visibleEvents}
                onDayClick={(day) => openNew(day)}
                onEventClick={openEdit}
              />
            )}

            {view === "week" && (
              <TimeGrid
                days={weekDays}
                events={visibleEvents}
                onSlotClick={(date, hour) => openNew(date, hour)}
                onEventClick={openEdit}
              />
            )}

            {view === "day" && (
              <TimeGrid
                days={[currentDate]}
                events={visibleEvents}
                onSlotClick={(date, hour) => openNew(date, hour)}
                onEventClick={openEdit}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Event dialog */}
      <EventDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingEvent(null);
        }}
        event={editingEvent}
        defaultDate={defaultDate}
        defaultTime={defaultTime}
        onSave={handleSave}
        onDelete={editingEvent ? handleDelete : undefined}
      />
    </div>
  );
}
