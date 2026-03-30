import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/stores/user";
import {
  Bell,
  Settings,
  LogOut,
  Shield,
  ChevronRight,
  Menu,
} from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  noPadding?: boolean;
  title?: string;
  description?: string;
}

// Map routes to readable breadcrumb labels
const routeLabels: Record<string, string> = {
  "ai-chat": "AI Chat",
  "voice-call": "AI Voice",
  calendar: "Calendar",
  "business-quiz": "Business Quiz",
  "income-streams": "Income Streams",
  "niche-statement": "Niche Statement",
  "avatar-architect": "Avatar Architect",
  "offer-creator": "Offer Creator",
  projects: "Content",
  program: "Program Builder",
  "personal-brand": "Personal Brand",
  "vibe-coding": "Vibe Coding",
  "copy-writer": "Sales Page Writer",
  "ad-writer": "Ad Writer",
  "gdoc-magic": "G Doc Magic",
  "vsl-generator": "VSL Generator",
  academy: "Academy",
  clients: "Clients",
  messages: "Messages",
  brain: "Brain",
  skills: "Skills",
  assets: "Assets",
  settings: "Settings",
  admin: "Admin",
  dashboard: "Dashboard",
  "context-hub": "Context Hub",
  "market-research": "Market Research",
  "image-studio": "Image Studio",
  hooks: "Hook Generator",
  "email-studio": "Email Studio",
  "copy-vault": "Copy Vault",
  slides: "Slides",
};

function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return <span className="text-sm font-medium">Home</span>;
  }

  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link
        to="/"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Home
      </Link>
      {segments.map((seg, i) => {
        const label = routeLabels[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
        const isLast = i === segments.length - 1;
        const path = "/" + segments.slice(0, i + 1).join("/");
        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link
                to={path}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

const notifications = [
  { id: "1", title: "Welcome to Solopreneur OS!", time: "Just now", read: false },
  { id: "2", title: "Your brain has been updated", time: "2h ago", read: false },
  { id: "3", title: "New skill generated: Brand Voice", time: "1d ago", read: true },
];

export function DashboardLayout({
  children,
  noPadding = false,
  title,
  description,
}: DashboardLayoutProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const hasCompletedOnboarding = useUserStore((s) => s.hasCompletedOnboarding);
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    // Only redirect brand-new users (no name set yet). Existing users who
    // already have data are considered onboarded even if the flag is unset.
    const isNewUser = !hasCompletedOnboarding && !user.name;
    if (isNewUser && location.pathname !== "/onboarding") {
      navigate("/onboarding", { replace: true });
    }
  }, [hasCompletedOnboarding, user.name, location.pathname, navigate]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-3 left-3 z-30"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[240px]">
          <AppSidebar />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0 z-10">
          <div className="flex items-center gap-3 md:gap-0 pl-10 md:pl-0">
            <Breadcrumb />
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[hsl(var(--sidebar-primary))]" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <span className="text-sm font-semibold">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <div className="py-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "flex items-start gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors",
                        !n.read && "bg-muted/30"
                      )}
                    >
                      {!n.read && (
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--sidebar-primary))] shrink-0" />
                      )}
                      {n.read && <span className="mt-1.5 w-1.5 h-1.5 shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-snug">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-[hsl(var(--sidebar-primary))]/20 text-[hsl(var(--sidebar-primary))] text-xs font-semibold">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/auth" className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="h-full"
            >
              {(title || description) && !noPadding && (
                <div className="page-container pb-0">
                  <div className="page-header">
                    {title && <h1 className="page-title">{title}</h1>}
                    {description && (
                      <p className="page-description">{description}</p>
                    )}
                  </div>
                </div>
              )}
              {noPadding ? (
                <div className="h-full">{children}</div>
              ) : (
                <div>{children}</div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
