import { Suspense, lazy, useEffect } from "react";
import { useThemeStore, applyTheme } from "@/stores/theme";
import { useAuthStore } from "@/stores/auth";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Pages without layout
const LandingPage = lazy(() => import("@/features/settings/LandingPage"));
const AuthPage = lazy(() => import("@/features/settings/AuthPage"));
const NotFoundPage = lazy(() => import("@/features/settings/NotFoundPage"));

// Main nav
const AIChatPage = lazy(() => import("@/features/ai-chat/Page"));
const VoiceCallPage = lazy(() => import("@/features/voice/Page"));
const CalendarPage = lazy(() => import("@/features/calendar/Page"));

// Plan tools
const BusinessQuizPage = lazy(() => import("@/features/quiz/Page"));
const IncomeStreamsPage = lazy(() => import("@/features/income/Page"));
const NicheStatementPage = lazy(() => import("@/features/niche/Page"));
const AvatarArchitectPage = lazy(() => import("@/features/avatar/Page"));
const OfferCreatorPage = lazy(() => import("@/features/offer/Page"));

// Build tools
const ProjectsPage = lazy(() => import("@/features/projects/Page"));
const ProgramPage = lazy(() => import("@/features/program/Page"));
const PersonalBrandPage = lazy(() => import("@/features/brand/Page"));
const VibeCodingPage = lazy(() => import("@/features/vibe-coding/Page"));

// Launch tools
const CopyWriterPage = lazy(() => import("@/features/writers/CopyWriterPage"));
const AdWriterPage = lazy(() => import("@/features/writers/AdWriterPage"));
const GDocMagicPage = lazy(() => import("@/features/writers/GDocMagicPage"));
const VSLGeneratorPage = lazy(() => import("@/features/writers/VSLGeneratorPage"));

// Workspace
const AcademyPage = lazy(() => import("@/features/academy/Page"));
const ClientsPage = lazy(() => import("@/features/clients/Page"));
const MessagesPage = lazy(() => import("@/features/messages/Page"));
const BrainPage = lazy(() => import("@/features/brain/Page"));
const SkillsPage = lazy(() => import("@/features/skills/Page"));
const AssetsPage = lazy(() => import("@/features/settings/AssetsPage"));

// Settings
const SettingsPage = lazy(() => import("@/features/settings/Page"));
const AdminPage = lazy(() => import("@/features/settings/AdminPage"));

// Onboarding
const OnboardingPage = lazy(() => import("@/features/onboarding/Page"));

// New power features
const DashboardPage = lazy(() => import("@/features/dashboard/Page"));
const ContextHubPage = lazy(() => import("@/features/context/Page"));
const MarketResearchPage = lazy(() => import("@/features/research/Page"));
const ImageStudioPage = lazy(() => import("@/features/image-studio/Page"));
const HookGeneratorPage = lazy(() => import("@/features/hooks/Page"));
const EmailStudioPage = lazy(() => import("@/features/email-studio/Page"));
const CopyVaultPage = lazy(() => import("@/features/copy-vault/Page"));
const SlidesPage = lazy(() => import("@/features/slides/Page"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
    </div>
  );
}

function LayoutRoute({
  element,
  noPadding,
  title,
  description,
}: {
  element: React.ReactNode;
  noPadding?: boolean;
  title?: string;
  description?: string;
}) {
  return (
    <DashboardLayout noPadding={noPadding} title={title} description={description}>
      <Suspense fallback={<PageLoader />}>{element}</Suspense>
    </DashboardLayout>
  );
}

export default function App() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    applyTheme(theme);
    // Initialize Supabase auth session listener
    useAuthStore.getState().initialize();
  }, []); // Apply on initial mount

  return (
    <BrowserRouter>
      <TooltipProvider delayDuration={300}>
        <Routes>
          {/* Public routes (no layout) */}
          <Route
            path="/"
            element={
              <Suspense fallback={<PageLoader />}>
                <LandingPage />
              </Suspense>
            }
          />
          <Route
            path="/auth"
            element={
              <Suspense fallback={<PageLoader />}>
                <AuthPage />
              </Suspense>
            }
          />

          {/* Onboarding (no layout) */}
          <Route
            path="/onboarding"
            element={
              <Suspense fallback={<PageLoader />}>
                <OnboardingPage />
              </Suspense>
            }
          />

          {/* Protected routes (with layout) */}
          <Route
            path="/ai-chat"
            element={<LayoutRoute element={<AIChatPage />} noPadding />}
          />
          <Route
            path="/voice-call"
            element={<LayoutRoute element={<VoiceCallPage />} noPadding />}
          />
          <Route
            path="/calendar"
            element={
              <LayoutRoute
                element={<CalendarPage />}
                title="Calendar"
                description="Schedule and manage your events"
              />
            }
          />
          <Route
            path="/business-quiz"
            element={
              <LayoutRoute
                element={<BusinessQuizPage />}
                title="Business Quiz"
                description="Discover your business archetype"
              />
            }
          />
          <Route
            path="/income-streams"
            element={
              <LayoutRoute
                element={<IncomeStreamsPage />}
                title="Income Streams"
                description="Track and manage your revenue"
              />
            }
          />
          <Route
            path="/niche-statement"
            element={
              <LayoutRoute
                element={<NicheStatementPage />}
                title="Niche Statement"
                description="Craft your perfect niche"
              />
            }
          />
          <Route
            path="/avatar-architect"
            element={
              <LayoutRoute
                element={<AvatarArchitectPage />}
                title="Avatar Architect"
                description="Define your ideal customer"
              />
            }
          />
          <Route
            path="/offer-creator"
            element={
              <LayoutRoute
                element={<OfferCreatorPage />}
                title="Offer Creator"
                description="Design your irresistible offer"
              />
            }
          />
          <Route
            path="/projects"
            element={
              <LayoutRoute
                element={<ProjectsPage />}
                title="Content"
                description="Manage your content and projects"
              />
            }
          />
          <Route
            path="/program"
            element={
              <LayoutRoute
                element={<ProgramPage />}
                title="Program Builder"
                description="Build your coaching program"
              />
            }
          />
          <Route
            path="/personal-brand"
            element={
              <LayoutRoute
                element={<PersonalBrandPage />}
                title="Personal Brand"
                description="Build your brand pillars"
              />
            }
          />
          <Route
            path="/vibe-coding"
            element={
              <LayoutRoute
                element={<VibeCodingPage />}
                title="Vibe Coding"
                description="Build software with AI"
              />
            }
          />
          <Route
            path="/copy-writer"
            element={
              <LayoutRoute
                element={<CopyWriterPage />}
                title="Sales Page Writer"
                description="Write high-converting sales pages"
              />
            }
          />
          <Route
            path="/ad-writer"
            element={
              <LayoutRoute
                element={<AdWriterPage />}
                title="Ad Writer"
                description="Create compelling ad copy"
              />
            }
          />
          <Route
            path="/gdoc-magic"
            element={
              <LayoutRoute
                element={<GDocMagicPage />}
                title="G Doc Magic"
                description="AI-powered Google Doc generation"
              />
            }
          />
          <Route
            path="/vsl-generator"
            element={
              <LayoutRoute
                element={<VSLGeneratorPage />}
                title="VSL Generator"
                description="Generate video sales letter scripts"
              />
            }
          />
          <Route
            path="/academy"
            element={
              <LayoutRoute
                element={<AcademyPage />}
                title="Academy"
                description="Learn and grow"
              />
            }
          />
          <Route
            path="/clients"
            element={
              <LayoutRoute
                element={<ClientsPage />}
                title="Clients"
                description="Manage your client relationships"
              />
            }
          />
          <Route
            path="/messages"
            element={
              <LayoutRoute
                element={<MessagesPage />}
                title="Messages"
                description="Your conversations"
              />
            }
          />
          <Route
            path="/brain"
            element={
              <LayoutRoute
                element={<BrainPage />}
                title="Brain"
                description="Your knowledge base"
              />
            }
          />
          <Route
            path="/skills"
            element={
              <LayoutRoute
                element={<SkillsPage />}
                title="Skills"
                description="Your AI skill profiles"
              />
            }
          />
          <Route
            path="/assets"
            element={
              <LayoutRoute
                element={<AssetsPage />}
                title="Assets"
                description="Manage your digital assets"
              />
            }
          />
          <Route
            path="/settings"
            element={
              <LayoutRoute
                element={<SettingsPage />}
                title="Settings"
                description="Account and preferences"
              />
            }
          />
          <Route
            path="/admin"
            element={
              <LayoutRoute
                element={<AdminPage />}
                title="Admin"
                description="System management"
              />
            }
          />

          {/* Power features */}
          <Route path="/dashboard" element={<LayoutRoute element={<DashboardPage />} title="Dashboard" description="Your business command center" />} />
          <Route path="/context-hub" element={<LayoutRoute element={<ContextHubPage />} title="Context Hub" description="Your AI business context layer" />} />
          <Route path="/market-research" element={<LayoutRoute element={<MarketResearchPage />} title="Market Research" description="Deep market and competitor analysis" />} />
          <Route path="/image-studio" element={<LayoutRoute element={<ImageStudioPage />} title="Image Studio" description="Generate ads and carousel images" />} />
          <Route path="/hooks" element={<LayoutRoute element={<HookGeneratorPage />} title="Hook Generator" description="Viral hooks and headlines" />} />
          <Route path="/email-studio" element={<LayoutRoute element={<EmailStudioPage />} title="Email Studio" description="Build email sequences that convert" />} />
          <Route path="/copy-vault" element={<LayoutRoute element={<CopyVaultPage />} title="Copy Vault" description="Proven copy templates and frameworks" />} />
          <Route path="/slides" element={<LayoutRoute element={<SlidesPage />} title="Slides" description="AI-powered presentation builder" />} />

          {/* 404 */}
          <Route
            path="*"
            element={
              <Suspense fallback={<PageLoader />}>
                <NotFoundPage />
              </Suspense>
            }
          />
        </Routes>

        <Toaster position="bottom-right" richColors closeButton />
      </TooltipProvider>
    </BrowserRouter>
  );
}
