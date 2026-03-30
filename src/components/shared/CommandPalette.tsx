import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  Mic,
  Zap,
  Mail,
  PenTool,
  Megaphone,
  Video,
  Brain,
  GraduationCap,
  Database,
  Target,
  Users2,
  Package,
  Search,
  Image,
  PresentationIcon,
  Calendar,
  UserCheck,
  TrendingUp,
  Settings,
  ArrowRight,
  Clock,
} from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';

interface CommandEntry {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  route: string;
  group: 'Navigation' | 'AI Tools' | 'Actions' | 'Recent';
  shortcut?: string;
}

const ALL_COMMANDS: CommandEntry[] = [
  // Navigation
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Your business OS home',
    icon: LayoutDashboard,
    route: '/dashboard',
    group: 'Navigation',
    shortcut: '⌘D',
  },
  {
    id: 'ai-chat',
    label: 'AI Chat',
    description: 'Chat with your AI strategist',
    icon: MessageSquare,
    route: '/ai-chat',
    group: 'Navigation',
  },
  {
    id: 'voice-call',
    label: 'AI Voice',
    description: 'Voice session with your AI coach',
    icon: Mic,
    route: '/voice-call',
    group: 'Navigation',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    description: 'Manage your schedule',
    icon: Calendar,
    route: '/calendar',
    group: 'Navigation',
  },
  {
    id: 'clients',
    label: 'Clients',
    description: 'Manage client relationships',
    icon: UserCheck,
    route: '/clients',
    group: 'Navigation',
  },
  {
    id: 'income-streams',
    label: 'Income Streams',
    description: 'Track revenue sources',
    icon: TrendingUp,
    route: '/income-streams',
    group: 'Navigation',
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'App configuration',
    icon: Settings,
    route: '/settings',
    group: 'Navigation',
    shortcut: '⌘,',
  },

  // AI Tools
  {
    id: 'hooks',
    label: 'Hook Generator',
    description: 'Generate scroll-stopping hooks',
    icon: Zap,
    route: '/hooks',
    group: 'AI Tools',
  },
  {
    id: 'email-studio',
    label: 'Email Studio',
    description: 'Write high-converting emails',
    icon: Mail,
    route: '/email-studio',
    group: 'AI Tools',
  },
  {
    id: 'copy-writer',
    label: 'Copy Writer',
    description: 'Sales pages that convert',
    icon: PenTool,
    route: '/copy-writer',
    group: 'AI Tools',
  },
  {
    id: 'ad-writer',
    label: 'Ad Writer',
    description: 'Write high-converting ad copy',
    icon: Megaphone,
    route: '/ad-writer',
    group: 'AI Tools',
  },
  {
    id: 'vsl-generator',
    label: 'VSL Generator',
    description: 'Create video sales letters',
    icon: Video,
    route: '/vsl-generator',
    group: 'AI Tools',
  },
  {
    id: 'image-studio',
    label: 'Image Studio',
    description: 'AI image generation',
    icon: Image,
    route: '/image-studio',
    group: 'AI Tools',
  },
  {
    id: 'slides',
    label: 'Slides',
    description: 'Create presentations',
    icon: PresentationIcon,
    route: '/slides',
    group: 'AI Tools',
  },

  // Business Actions
  {
    id: 'brain',
    label: 'Brain',
    description: 'Your AI knowledge base',
    icon: Brain,
    route: '/brain',
    group: 'Actions',
  },
  {
    id: 'skills',
    label: 'Skills',
    description: 'Configure AI skill profiles',
    icon: GraduationCap,
    route: '/skills',
    group: 'Actions',
  },
  {
    id: 'context-hub',
    label: 'Context Hub',
    description: 'Manage AI context data',
    icon: Database,
    route: '/context-hub',
    group: 'Actions',
  },
  {
    id: 'niche-statement',
    label: 'Niche Statement',
    description: 'Define your target market',
    icon: Target,
    route: '/niche-statement',
    group: 'Actions',
  },
  {
    id: 'avatar-architect',
    label: 'Avatar Architect',
    description: 'Build your customer avatar',
    icon: Users2,
    route: '/avatar-architect',
    group: 'Actions',
  },
  {
    id: 'offer-creator',
    label: 'Offer Creator',
    description: 'Design your core offer',
    icon: Package,
    route: '/offer-creator',
    group: 'Actions',
  },
  {
    id: 'market-research',
    label: 'Market Research',
    description: 'Research your niche & competitors',
    icon: Search,
    route: '/market-research',
    group: 'Actions',
  },
];

const RECENT_COMMAND_IDS = ['ai-chat', 'hooks', 'email-studio', 'copy-writer'];

function fuzzyMatch(label: string, query: string): boolean {
  if (!query) return true;
  const lowerLabel = label.toLowerCase();
  const lowerQuery = query.toLowerCase();
  // Simple fuzzy: every character in query must appear in order in label
  let qi = 0;
  for (let i = 0; i < lowerLabel.length && qi < lowerQuery.length; i++) {
    if (lowerLabel[i] === lowerQuery[qi]) qi++;
  }
  return qi === lowerQuery.length;
}

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (value: boolean) => {
      if (onOpenChange) onOpenChange(value);
      else setInternalOpen(value);
    },
    [onOpenChange]
  );

  // Register global keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setOpen]);

  // Reset query on close
  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  function handleSelect(route: string) {
    setOpen(false);
    navigate(route);
  }

  const filteredCommands = ALL_COMMANDS.filter(
    (cmd) =>
      fuzzyMatch(cmd.label, query) ||
      (cmd.description && fuzzyMatch(cmd.description, query))
  );

  const recentCommands = query
    ? []
    : ALL_COMMANDS.filter((cmd) => RECENT_COMMAND_IDS.includes(cmd.id));

  const navigationCmds = filteredCommands.filter((c) => c.group === 'Navigation');
  const aiToolCmds = filteredCommands.filter((c) => c.group === 'AI Tools');
  const actionCmds = filteredCommands.filter((c) => c.group === 'Actions');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            key="palette"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-2xl -translate-x-1/2"
          >
            <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
              <Command shouldFilter={false}>
                <div className="flex items-center border-b border-border px-3">
                  <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search commands, pages, tools..."
                    className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <kbd className="hidden sm:flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    ESC
                  </kbd>
                </div>

                <CommandList className="max-h-[420px]">
                  <CommandEmpty>
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No commands found for &ldquo;{query}&rdquo;
                    </div>
                  </CommandEmpty>

                  {/* Recent (only shown when no query) */}
                  {recentCommands.length > 0 && (
                    <>
                      <CommandGroup heading="Recent">
                        {recentCommands.map((cmd) => {
                          const Icon = cmd.icon;
                          return (
                            <CommandItem
                              key={`recent-${cmd.id}`}
                              value={`recent-${cmd.id}`}
                              onSelect={() => handleSelect(cmd.route)}
                              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                            >
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                              <div className="flex flex-1 flex-col min-w-0">
                                <span className="text-sm font-medium">{cmd.label}</span>
                                {cmd.description && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    {cmd.description}
                                  </span>
                                )}
                              </div>
                              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                      <CommandSeparator />
                    </>
                  )}

                  {/* Navigation */}
                  {navigationCmds.length > 0 && (
                    <>
                      <CommandGroup heading="Navigation">
                        {navigationCmds.map((cmd) => {
                          const Icon = cmd.icon;
                          return (
                            <CommandItem
                              key={cmd.id}
                              value={cmd.id}
                              onSelect={() => handleSelect(cmd.route)}
                              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                            >
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
                                <Icon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex flex-1 flex-col min-w-0">
                                <span className="text-sm font-medium">{cmd.label}</span>
                                {cmd.description && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    {cmd.description}
                                  </span>
                                )}
                              </div>
                              {cmd.shortcut && (
                                <CommandShortcut>{cmd.shortcut}</CommandShortcut>
                              )}
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                      {(aiToolCmds.length > 0 || actionCmds.length > 0) && (
                        <CommandSeparator />
                      )}
                    </>
                  )}

                  {/* AI Tools */}
                  {aiToolCmds.length > 0 && (
                    <>
                      <CommandGroup heading="AI Tools">
                        {aiToolCmds.map((cmd) => {
                          const Icon = cmd.icon;
                          return (
                            <CommandItem
                              key={cmd.id}
                              value={cmd.id}
                              onSelect={() => handleSelect(cmd.route)}
                              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                            >
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950">
                                <Icon className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                              </div>
                              <div className="flex flex-1 flex-col min-w-0">
                                <span className="text-sm font-medium">{cmd.label}</span>
                                {cmd.description && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    {cmd.description}
                                  </span>
                                )}
                              </div>
                              {cmd.shortcut && (
                                <CommandShortcut>{cmd.shortcut}</CommandShortcut>
                              )}
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                      {actionCmds.length > 0 && <CommandSeparator />}
                    </>
                  )}

                  {/* Actions */}
                  {actionCmds.length > 0 && (
                    <CommandGroup heading="Actions">
                      {actionCmds.map((cmd) => {
                        const Icon = cmd.icon;
                        return (
                          <CommandItem
                            key={cmd.id}
                            value={cmd.id}
                            onSelect={() => handleSelect(cmd.route)}
                            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                          >
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950">
                              <Icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex flex-1 flex-col min-w-0">
                              <span className="text-sm font-medium">{cmd.label}</span>
                              {cmd.description && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {cmd.description}
                                </span>
                              )}
                            </div>
                            {cmd.shortcut && (
                              <CommandShortcut>{cmd.shortcut}</CommandShortcut>
                            )}
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                </CommandList>

                {/* Footer hint */}
                <div className="flex items-center justify-between border-t border-border px-3 py-2">
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">↑↓</kbd>
                      navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">↵</kbd>
                      select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">ESC</kbd>
                      close
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {filteredCommands.length} commands
                  </span>
                </div>
              </Command>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
