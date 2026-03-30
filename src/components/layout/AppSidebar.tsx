import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Phone,
  Calendar,
  ClipboardList,
  DollarSign,
  Target,
  Users,
  Gift,
  BookOpen,
  Fingerprint,
  FileText,
  Megaphone,
  FileSpreadsheet,
  Video,
  GraduationCap,
  UserCheck,
  Mail,
  Brain,
  Sparkles,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Leaf,
  LayoutDashboard,
  Layout,
  TrendingUp,
  LayoutTemplate,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  icon: React.ElementType;
  to: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// ─── Top-level nav (always visible) ─────────────────────────────────────────

const mainNav: NavItem[] = [
  { label: "Dashboard",     icon: LayoutDashboard, to: "/dashboard" },
  { label: "AI Chat",       icon: MessageSquare,   to: "/ai-chat" },
  { label: "AI Voice",      icon: Phone,           to: "/voice-call" },
  { label: "Business Quiz", icon: ClipboardList,   to: "/business-quiz" },
  { label: "Calendar",      icon: Calendar,        to: "/calendar" },
];

// ─── Collapsible tool groups ─────────────────────────────────────────────────

const toolGroups: NavGroup[] = [
  {
    label: "Plan",
    items: [
      { label: "Income Streams", icon: DollarSign,  to: "/income-streams" },
      { label: "Niche",          icon: Target,      to: "/niche-statement" },
      { label: "Avatar",         icon: Users,       to: "/avatar-architect" },
    ],
  },
  {
    label: "Build",
    items: [
      { label: "Offer",       icon: Gift,      to: "/offer-creator" },
      { label: "Sales Page",  icon: FileText,  to: "/copy-writer" },
      { label: "Program",     icon: BookOpen,  to: "/program" },
    ],
  },
  {
    label: "Launch",
    items: [
      { label: "G Doc",   icon: FileSpreadsheet, to: "/gdoc-magic" },
      { label: "Content", icon: Layout,          to: "/projects" },
      { label: "VSL",     icon: Video,           to: "/vsl-generator" },
    ],
  },
  {
    label: "Scale",
    items: [
      { label: "Ad Writer",       icon: Megaphone,     to: "/ad-writer" },
      { label: "Personal Brand",  icon: Fingerprint,   to: "/personal-brand" },
      { label: "Slides",          icon: LayoutTemplate, to: "/slides" },
    ],
  },
];

const workspaceNav: NavItem[] = [
  { label: "Brain",    icon: Brain,          to: "/brain" },
  { label: "Skills",   icon: Sparkles,       to: "/skills" },
  { label: "Academy",  icon: GraduationCap,  to: "/academy" },
  { label: "Messages", icon: Mail,           to: "/messages" },
  { label: "Clients",  icon: UserCheck,      to: "/clients" },
  { label: "Assets",   icon: FolderOpen,     to: "/assets" },
];

// ─── NavLink ──────────────────────────────────────────────────────────────────

function NavLink({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;

  const linkContent = (
    <Link
      to={item.to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative",
        active
          ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]"
          : "text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"
      )}
    >
      <Icon
        className={cn(
          "shrink-0 transition-colors duration-200",
          collapsed ? "w-5 h-5" : "w-4 h-4",
          active
            ? "text-[hsl(var(--sidebar-primary))]"
            : "text-[hsl(var(--sidebar-muted))] group-hover:text-[hsl(var(--sidebar-foreground))]"
        )}
      />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      {active && (
        <motion.div
          layoutId="active-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[hsl(var(--sidebar-primary))] rounded-r-full"
        />
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

// ─── CollapsibleGroup ─────────────────────────────────────────────────────────

function CollapsibleGroup({
  group,
  collapsed: sidebarCollapsed,
  location,
}: {
  group: NavGroup;
  collapsed: boolean;
  location: string;
}) {
  // All groups closed by default
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-0.5">
      {!sidebarCollapsed ? (
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-muted))] hover:text-[hsl(var(--sidebar-foreground))] transition-colors duration-200 rounded-md hover:bg-[hsl(var(--sidebar-accent))]/50"
        >
          {group.label}
          <ChevronDown
            className={cn(
              "w-3 h-3 transition-transform duration-200",
              open ? "rotate-0" : "-rotate-90"
            )}
          />
        </button>
      ) : (
        <div className="px-3 py-1.5 mb-1">
          <div className="h-px bg-[hsl(var(--sidebar-border))]" />
        </div>
      )}

      <AnimatePresence initial={false}>
        {(open || sidebarCollapsed) && (
          <motion.div
            initial={sidebarCollapsed ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 pt-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  item={item}
                  collapsed={sidebarCollapsed}
                  active={location === item.to}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── AppSidebar ───────────────────────────────────────────────────────────────

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] shrink-0 overflow-hidden z-20"
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-16 px-3 border-b border-[hsl(var(--sidebar-border))] shrink-0",
          collapsed ? "justify-center" : "gap-2.5"
        )}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[hsl(var(--sidebar-primary))]/20 shrink-0">
          <Leaf className="w-4 h-4 text-[hsl(var(--sidebar-primary))]" />
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <span className="whitespace-nowrap text-sm font-semibold text-[hsl(var(--sidebar-foreground))]">
                Solopreneur OS
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 scrollbar-thin">

        {/* Main nav — always visible */}
        <div className="space-y-0.5 mb-3">
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              item={item}
              collapsed={collapsed}
              active={location.pathname === item.to}
            />
          ))}
        </div>

        {/* Divider before tool groups */}
        {!collapsed && (
          <div className="h-px bg-[hsl(var(--sidebar-border))] mx-3 mb-2" />
        )}

        {/* Tool groups */}
        <div className="space-y-0.5">
          {toolGroups.map((group) => (
            <CollapsibleGroup
              key={group.label}
              group={group}
              collapsed={collapsed}
              location={location.pathname}
            />
          ))}
        </div>

        {/* Divider before workspace */}
        {!collapsed && (
          <div className="h-px bg-[hsl(var(--sidebar-border))] mx-3 mt-2 mb-1" />
        )}

        {/* Workspace group */}
        <div className="mt-1">
          {!collapsed ? (
            <button
              onClick={() => setWorkspaceOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-muted))] hover:text-[hsl(var(--sidebar-foreground))] transition-colors duration-200 rounded-md hover:bg-[hsl(var(--sidebar-accent))]/50"
            >
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" />
                Workspace
              </span>
              <ChevronDown
                className={cn(
                  "w-3 h-3 transition-transform duration-200",
                  workspaceOpen ? "rotate-0" : "-rotate-90"
                )}
              />
            </button>
          ) : (
            <div className="px-3 py-1.5 mb-1">
              <div className="h-px bg-[hsl(var(--sidebar-border))]" />
            </div>
          )}

          <AnimatePresence initial={false}>
            {(workspaceOpen || collapsed) && (
              <motion.div
                initial={collapsed ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="space-y-0.5 pt-0.5">
                  {workspaceNav.map((item) => (
                    <NavLink
                      key={item.to}
                      item={item}
                      collapsed={collapsed}
                      active={location.pathname === item.to}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center justify-center h-12 border-t border-[hsl(var(--sidebar-border))] text-[hsl(var(--sidebar-muted))] hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] transition-all duration-200 shrink-0 w-full"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <div className="flex items-center gap-2 text-xs font-medium">
            <ChevronLeft className="w-4 h-4" />
            <span>Collapse</span>
          </div>
        )}
      </button>
    </motion.aside>
  );
}
