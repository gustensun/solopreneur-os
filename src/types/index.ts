// === Shared Types ===

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// AI Chat
export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  timestamp: string;
  retryable?: boolean;
}

export interface AIConversation extends BaseEntity {
  title: string;
  messages: AIMessage[];
}

export interface AttachedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string;
}

export type AgentTool = "none" | "ad" | "copy" | "vsl" | "offer" | "niche" | "brand" | "program" | "gdoc" | "avatar" | "content";
export type AIModel = "gemini-flash" | "claude-sonnet";

// Brain / Knowledge Base
export type BrainCategory = "personal-brand" | "products-offers" | "marketing-content" | "social-proof" | "resources";
export type ResourceStatus = "pending" | "processed" | "error";
export type ResourceType = "file" | "text" | "url" | "video";

export interface BrainResource extends BaseEntity {
  name: string;
  type: ResourceType;
  category: BrainCategory;
  profileId: string;
  status: ResourceStatus;
  content?: string;
  url?: string;
  size?: number;
}

export interface BrainProfile extends BaseEntity {
  name: string;
  initials: string;
  description: string;
  isDefault: boolean;
}

// Income Streams
export type IncomeType = "Consulting" | "Membership" | "Affiliate" | "Courses" | "Coaching" | "Digital Product" | "SaaS" | "Freelance";
export type IncomeFormat = "Recurring" | "One Time";

export interface IncomeStream extends BaseEntity {
  name: string;
  fee: number;
  type: IncomeType;
  format: IncomeFormat;
  monthlySales: number;
  active: boolean;
  position: number;
}

// Skills
export type SkillType = "brand-voice" | "offer-architect" | "niche-expert" | "avatar-specialist" | "content-strategist" | "sales-page" | "ad-writer" | "coach";

export interface Skill extends BaseEntity {
  title: string;
  description: string;
  type: SkillType;
  content: string;
  version: number;
  isStale: boolean;
}

// Personal Brand (7 Pillars)
export interface BrandPillar {
  id: string;
  name: string;
  icon: string;
  description: string;
  fields: BrandField[];
}

export interface BrandField {
  key: string;
  label: string;
  value: string;
  placeholder: string;
  type: "text" | "textarea" | "slider";
}

export interface PersonalBrand extends BaseEntity {
  pillars: Record<string, Record<string, string>>;
  progress: number;
}

// Niche Statement
export type NicheMarket = "health" | "wealth" | "relationships";

export interface NicheStatement extends BaseEntity {
  market: NicheMarket;
  group: string;
  outcome: string;
  benefit: string;
  pain: string;
  fullStatement: string;
}

// Offer
export interface Offer extends BaseEntity {
  name: string;
  clearOutcome: string;
  newVehicle: string;
  betterResults: string;
  fasterDelivery: string;
  convenience: string;
  offerStack: OfferStackItem[];
  price: string;
  objections: ObjectionPair[];
}

export interface OfferStackItem {
  id: string;
  name: string;
  value: string;
  description: string;
}

export interface ObjectionPair {
  id: string;
  objection: string;
  killer: string;
}

// Avatar
export interface CustomerAvatar extends BaseEntity {
  name: string;
  age: string;
  gender: string;
  occupation: string;
  income: string;
  goals: string;
  frustrations: string;
  fears: string;
  desires: string;
  dailyLife: string;
  platforms: string;
  objections: string;
}

// Projects
export type ProjectStatus = "backlog" | "todo" | "in-progress" | "review" | "done";
export type ProjectPriority = "low" | "medium" | "high" | "urgent";

export interface Project extends BaseEntity {
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  dueDate?: string;
  tags: string[];
}

// Calendar
export interface CalendarEvent extends BaseEntity {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
  projectId?: string;
}

// Messages
export interface Conversation extends BaseEntity {
  title: string;
  participants: string[];
  lastMessage: string;
  unreadCount: number;
}

export interface Message extends BaseEntity {
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
}

// Clients
export type ClientStatus = "lead" | "prospect" | "active" | "completed" | "churned";

export interface Client extends BaseEntity {
  name: string;
  email: string;
  company?: string;
  status: ClientStatus;
  value: number;
  notes: string;
  tags: string[];
}

// Academy
export interface AcademyModule extends BaseEntity {
  title: string;
  description: string;
  lessons: AcademyLesson[];
  order: number;
}

export interface AcademyLesson extends BaseEntity {
  moduleId: string;
  title: string;
  content: string;
  order: number;
  completed: boolean;
}

// Program Builder
export interface ProgramPhase extends BaseEntity {
  title: string;
  description: string;
  order: number;
  lessons: ProgramLesson[];
}

export interface ProgramLesson extends BaseEntity {
  phaseId: string;
  title: string;
  content: string;
  order: number;
  type: "video" | "text" | "worksheet" | "quiz";
}

// Content
export interface ContentPillar extends BaseEntity {
  title: string;
  description: string;
  color: string;
  topics: string[];
}

export interface ContentIdea extends BaseEntity {
  title: string;
  pillarId?: string;
  status: "idea" | "drafting" | "review" | "published";
  platform: string;
  notes: string;
}

// Business Quiz
export interface QuizAnswer {
  questionId: string;
  answer: string;
}

export interface QuizResult extends BaseEntity {
  answers: QuizAnswer[];
  analysis: string;
  completed: boolean;
}

// Vibe Coding
export interface VibeCodingProject extends BaseEntity {
  name: string;
  description: string;
  techStack: string;
  phase: "idea" | "planning" | "building" | "testing" | "launched";
  notes: string;
}

// User / Auth
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
  anthropicApiKey: string;
}
