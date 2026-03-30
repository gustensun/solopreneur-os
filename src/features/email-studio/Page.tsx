import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Plus,
  Copy,
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  Edit3,
  Settings2,
  X,
  FileText,
  Clock,
  Hash,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, generateId } from '@/lib/utils';
import { getAnthropicClient, resolveApiKey } from '@/lib/ai';
import { useUserStore } from '@/stores/user';
import { useContextStore } from '@/stores/context';
import {
  useEmailStudioStore,
  type SequenceType,
  type BrandVoice,
  type EmailItem,
} from '@/stores/emailStudio';

// ─── Constants ───────────────────────────────────────────────────────────────

const SEQUENCE_TABS: { value: SequenceType; label: string; count: number; desc: string; color: string }[] = [
  { value: 'welcome', label: 'Welcome Sequence', count: 5, desc: 'Onboard & build trust', color: 'bg-emerald-500' },
  { value: 'launch', label: 'Launch Sequence', count: 7, desc: 'Drive time-limited sales', color: 'bg-amber-500' },
  { value: 'nurture', label: 'Nurture Sequence', count: 5, desc: 'Weekly value delivery', color: 'bg-sky-500' },
  { value: 'reengagement', label: 'Re-engagement', count: 3, desc: 'Win-back campaign', color: 'bg-rose-500' },
];

const BRAND_VOICES: { value: BrandVoice; label: string }[] = [
  { value: 'conversational', label: 'Conversational' },
  { value: 'professional', label: 'Professional' },
  { value: 'bold', label: 'Bold' },
  { value: 'empathetic', label: 'Empathetic' },
];

const PURPOSE_COLORS: Record<string, string> = {
  'Welcome & First Promise': 'bg-emerald-100 text-emerald-700',
  'Origin Story': 'bg-violet-100 text-violet-700',
  'Core Value Lesson': 'bg-blue-100 text-blue-700',
  'Offer Tease': 'bg-amber-100 text-amber-700',
  'The Ask': 'bg-rose-100 text-rose-700',
  'Pre-Launch Hype': 'bg-orange-100 text-orange-700',
  'Open Cart Day 1': 'bg-green-100 text-green-700',
  'Open Cart Day 2 — Case Study': 'bg-cyan-100 text-cyan-700',
  'Open Cart Day 3 — Objections': 'bg-indigo-100 text-indigo-700',
  'Urgency Email': 'bg-yellow-100 text-yellow-700',
  'Last Chance': 'bg-red-100 text-red-700',
  'Cart Closed': 'bg-slate-100 text-slate-600',
  'Value — Mindset Shift': 'bg-purple-100 text-purple-700',
  'Value — Practical Strategy': 'bg-teal-100 text-teal-700',
  'Value — Case Study': 'bg-blue-100 text-blue-700',
  'Value — Tool/Resource': 'bg-sky-100 text-sky-700',
  'Soft Pitch': 'bg-amber-100 text-amber-700',
  '"We Miss You"': 'bg-pink-100 text-pink-700',
  'Value Bomb': 'bg-lime-100 text-lime-700',
  'Last Chance to Stay': 'bg-red-100 text-red-700',
};

// ─── Email Templates ──────────────────────────────────────────────────────────

function buildWelcomeSequence(
  name: string,
  offer: string,
  price: string,
  _voice: BrandVoice
): Omit<EmailItem, 'id'>[] {
  const n = name || 'Your Name';
  const o = offer || 'AI Solopreneur Blueprint';
  const p = price || '$997';

  return [
    {
      number: 1,
      purpose: 'Welcome & First Promise',
      subjectLine: `You're in. Here's what happens next, {first_name}.`,
      previewText: `Welcome to the community — and your first resource is already waiting.`,
      sendTiming: 'Day 0 (Immediately)',
      body: `Hey {first_name},

Welcome. I'm so glad you're here.

My name is ${n}, and I've spent the last 3 years figuring out how to build a profitable online business as a solopreneur — using AI tools to do the work of an entire team.

When I started, I was working a corporate job I hated, making decent money but trading my entire life for a salary that would never truly make me free.

Then I discovered a better way.

Over the next few emails, I'm going to share exactly what changed everything for me — and how you can use the same approach to build your own freedom business, even if you're starting from zero.

But first — here's your free resource: [LINK]

This alone will save you months of trial and error.

Talk soon,
${n}

P.S. Hit reply and tell me: what's the #1 thing you want to accomplish in the next 90 days? I read every reply personally.`,
    },
    {
      number: 2,
      purpose: 'Origin Story',
      subjectLine: `The embarrassing truth about how I started (don't judge me)`,
      previewText: `I was charging $47 for something worth $5,000. Here's the story.`,
      sendTiming: 'Day 1',
      body: `Hey {first_name},

I want to tell you something I've never shared publicly.

When I first started trying to make money online, I was completely lost.

I made a digital product, priced it at $47 (because that felt "safe"), launched it to my whopping 23-person email list, and made... $94.

Two sales. Both from people I knew personally.

I was humiliated.

I nearly quit that same week.

But something kept me going — a stubborn belief that there had to be a better way. And there was.

The turning point was when I stopped trying to "make content" and started focusing on one thing: solving a very specific, very painful problem for a very specific group of people.

That shift took my revenue from $94 to $11,000 in the same quarter.

Tomorrow, I'll show you exactly how that shift works — and how you can apply it to your business in the next 30 days.

Talk soon,
${n}

P.S. The biggest mistake I see solopreneurs make is pricing based on what feels "comfortable." We're going to fix that together.`,
    },
    {
      number: 3,
      purpose: 'Core Value Lesson',
      subjectLine: `The only positioning framework you'll ever need`,
      previewText: `Why some solopreneurs charge $10k while others charge $97 for the same result.`,
      sendTiming: 'Day 3',
      body: `Hey {first_name},

Let me give you something genuinely valuable today.

The #1 difference between solopreneurs charging $97 and those charging $10,000 for the same outcome isn't skill, experience, or audience size.

It's positioning.

Here's the framework:

THE VALUE STACK FORMULA

Most people price based on their time or effort.
The best solopreneurs price based on the outcome they deliver.

Ask yourself:
— What is the problem I solve REALLY worth to my client?
— What would they pay to have this problem gone forever?
— What does NOT solving this problem cost them every month?

When you answer those three questions honestly, $997 or $2,000 starts to feel like a bargain.

This is exactly what I teach inside ${o} — and it's the reason students consistently sign their first high-ticket clients within 30 days.

More on that soon.

Talk soon,
${n}

P.S. If you want to see the full positioning system in action, reply "POSITIONING" and I'll send you a behind-the-scenes breakdown.`,
    },
    {
      number: 4,
      purpose: 'Offer Tease',
      subjectLine: `I'm opening something early for you, {first_name}`,
      previewText: `Here's what's coming — and why I think you'll want to be first.`,
      sendTiming: 'Day 5',
      body: `Hey {first_name},

I've been hinting at something over the past few emails.

Tomorrow, I'm opening up a very limited number of spots in ${o}.

Here's what it is:

${o} is my signature program for solopreneurs who want to use AI tools to build a high-ticket consulting or coaching business — without burning out, without needing a big audience, and without guessing at what works.

Inside, I'll walk you through:
→ The exact positioning system I used to go from $97 products to ${p} clients
→ My AI content workflow that creates 30 days of content in 4 hours
→ The DM-first client acquisition method that doesn't require ads or a sales page
→ A proven launch playbook you can deploy in your first 30 days

The investment is ${p}.

Tomorrow I'll send you the full details and open enrollment.

If you already know you're in — reply "I'm ready" and I'll give you early access + a special bonus.

Talk soon,
${n}`,
    },
    {
      number: 5,
      purpose: 'The Ask',
      subjectLine: `{first_name}, doors are officially open.`,
      previewText: `${o} is live — here's everything you need to know.`,
      sendTiming: 'Day 7',
      body: `Hey {first_name},

It's here.

${o} is officially open.

Here's the truth: I built this program because I wish it existed when I was starting out. I spent 18 months piecing together strategies from different gurus, most of whom were teaching outdated methods.

This is the program I needed.

Inside ${o}, you'll get:

✅ The Positioning Framework that commands premium prices
✅ My complete AI Content Engine (the exact prompts I use)
✅ Client Acquisition System — without cold outreach or ads
✅ Launch Playbook for your first $10k month
✅ Direct access to me in weekly live Q&As

Investment: ${p}

→ [ENROLL NOW — CLICK HERE]

This is NOT a course where you watch videos and feel inspired for three days. This is a working system with done-for-you templates, live support, and a community that holds you accountable.

I have limited spots available at this price. When they're gone, the price increases.

If you have any questions, hit reply — I answer every single one.

I hope to see you inside.

${n}

P.S. Every week I don't take action costs me potential clients. Don't let that be you. Click here to enroll: [LINK]`,
    },
  ];
}

function buildLaunchSequence(
  name: string,
  offer: string,
  price: string,
  deadline: string,
  _voice: BrandVoice
): Omit<EmailItem, 'id'>[] {
  const n = name || 'Your Name';
  const o = offer || 'The Program';
  const p = price || '$997';
  const d = deadline || 'this Sunday at midnight';

  return [
    {
      number: 1,
      purpose: 'Pre-Launch Hype',
      subjectLine: `Something big is coming, {first_name} (sneak peek inside)`,
      previewText: `I've been working on this for months. Here's your exclusive preview.`,
      sendTiming: 'Day -3',
      body: `Hey {first_name},

I've been sitting on this for a while, and I'm finally ready to share it.

In 3 days, I'm opening ${o} to the public for the very first time.

I've spent months building this from scratch — testing everything, talking to students, refining the system until it actually works in the real world.

The result is the most complete framework I've ever put together for solopreneurs who want to build a real income online using AI tools.

I'm not going to share everything yet. But here's what I will tell you:

The early bird pricing is only available for 24 hours after launch.

After that, the price increases — permanently.

If you want to get notified the moment doors open AND lock in the best price, reply "EARLY" right now and I'll add you to the priority list.

More details coming in 3 days.

${n}

P.S. I'm limiting this cohort intentionally. If this sounds like something you'd want, make sure you're watching for my email on launch day.`,
    },
    {
      number: 2,
      purpose: 'Open Cart Day 1',
      subjectLine: `{first_name} — ${o} is officially LIVE (early bird closes tonight)`,
      previewText: `The doors are open. Early bird pricing ends in 24 hours.`,
      sendTiming: 'Day -1 at 9am',
      body: `Hey {first_name},

It's happening.

${o} is officially open — and for the next 24 hours, early bird pricing is in effect.

Here's what you get inside:

→ The Complete Business-Building System (not just tactics — the entire framework)
→ Done-for-you templates for offers, emails, content, and proposals
→ Weekly live coaching calls with me personally
→ Private community of solopreneurs doing the work
→ Lifetime access + all future updates

Investment today: ${p}
Investment after tonight: Price increases.

This isn't a threat — it's just reality. Early bird pricing exists because you took action before the crowd. That discipline is exactly what this program rewards.

→ [ENROLL NOW AT THE EARLY BIRD PRICE]

See you inside,
${n}

P.S. If you have any questions before enrolling, hit reply right now. I'm watching my inbox and I'll respond personally.`,
    },
    {
      number: 3,
      purpose: 'Open Cart Day 2 — Case Study',
      subjectLine: `[Real results] From 0 clients to $6k/month in 30 days`,
      previewText: `Real student. Real numbers. Real timeline. Here's exactly what she did.`,
      sendTiming: 'Day 2 at 10am',
      body: `Hey {first_name},

I want to share something that happened last month.

One of my students — we'll call her Sarah — joined ${o} with zero clients, a 200-person email list, and a lot of doubt.

She almost didn't join because she thought she needed "more experience" first.

30 days later: she had signed 3 clients at $2,000/month each.

Her exact process:
1. Used the positioning framework to niche down from "business coach" to "systems strategist for e-commerce founders"
2. Sent 12 personalized DMs using my exact template
3. Booked 5 discovery calls, closed 3 of them

$6,000/month in new recurring revenue. From a 200-person list. In 30 days.

She told me: "I kept waiting until I felt ready. This program showed me that readiness doesn't come before action — it comes because of it."

${o} is still open. Doors close ${d}.

→ [JOIN NOW — LIMITED SPOTS REMAINING]

${n}`,
    },
    {
      number: 4,
      purpose: 'Open Cart Day 3 — Objections',
      subjectLine: `"Is ${o} right for me?" — My completely honest answer`,
      previewText: `I get this question every launch. Here's my real, unfiltered answer.`,
      sendTiming: 'Day 3 at 11am',
      body: `Hey {first_name},

I've gotten a ton of replies this week, and the most common question is: "Is this right for me?"

Here's my honest answer:

${o} IS the right fit if:
✅ You want to build real income online without just trading time for money forever
✅ You're willing to follow a proven system even when it feels uncomfortable
✅ You have at least 5 focused hours per week to dedicate to building
✅ You're done with the "figure it out yourself" approach

${o} is NOT the right fit if:
❌ You're looking for a magic button or overnight riches
❌ You're not willing to have real conversations with potential clients
❌ You want fully passive income with zero relationship-building
❌ You're not ready to commit for at least 60 days

If you're in the first group — this was built for you. Everything inside is designed to get you to your first (or next) client as fast as possible.

→ [YES, I'M IN — ENROLL BEFORE ${d.toUpperCase()}]

${n}

P.S. If you're on the fence, reply with your specific hesitation. I'll give you a straight answer, no sales pressure.`,
    },
    {
      number: 5,
      purpose: 'Urgency Email',
      subjectLine: `48 hours left, {first_name} — what staying stuck is really costing you`,
      previewText: `Enrollment closes ${d}. Here's the real math.`,
      sendTiming: 'Day 4',
      body: `Hey {first_name},

${o} closes in 48 hours.

I know you've been thinking about it. Let me make this simple.

The question isn't "Can I afford this?"

The real question is: "What is staying exactly where I am costing me every month?"

If you don't have the clients, income, or freedom you want right now, staying still doesn't cost nothing. It costs you every month you stay stuck.

At ${p}, if this helps you sign even one client you wouldn't have otherwise signed — it's paid for itself completely.

Most students sign their first client within their first 30 days.

The math isn't complicated.

Doors close ${d}.

→ [SECURE YOUR SPOT NOW — 48 HOURS LEFT]

${n}

P.S. Once the cart closes, the price increases and the current bonuses disappear permanently. This is the last time I'll mention it until my next launch.`,
    },
    {
      number: 6,
      purpose: 'Last Chance',
      subjectLine: `Final hours — ${o} closes tonight at midnight`,
      previewText: `This is the last email about this. I genuinely mean it.`,
      sendTiming: 'Close day at 8am',
      body: `Hey {first_name},

Tonight at midnight, ${o} closes.

I won't be sending more emails about this. This is the last one.

If you've been on the fence, here's the simplest framing I can give you:

Sign one client using this system — and the entire investment is covered.

One client.

That's all it takes.

Most students sign their first client within 30 days of starting the program.

If you're still here reading this, something about this resonates with you. That feeling is worth paying attention to.

→ [JOIN ${o.toUpperCase()} — CLOSES TONIGHT AT MIDNIGHT]

To everyone who's already enrolled — I cannot wait to work with you. This is going to be a remarkable cohort.

See you on the other side,
${n}

P.S. Doors reopen in approximately 90 days at a higher price point. If you want in now, this is your moment.`,
    },
    {
      number: 7,
      purpose: 'Cart Closed',
      subjectLine: `{first_name}, the doors are closed.`,
      previewText: `What happens next — even if you missed it.`,
      sendTiming: 'After close',
      body: `Hey {first_name},

Enrollment for ${o} is officially closed.

To everyone who joined — welcome. I'm genuinely honored to work with you, and I'll be reaching out personally this week to get you set up.

If you missed the enrollment window — here's what's next:

1. I'll be reopening enrollment in approximately 90 days
2. In the meantime, I'll continue sharing free, valuable content every single week
3. If you want priority access to the next cohort at the best available price, reply "WAITLIST" right now

I won't leave you hanging. The free content I send out is some of the best stuff I produce — so you'll still be getting massive value while you wait.

Either way, I'm not going anywhere.

More good stuff coming your way soon.

${n}

P.S. If you want to talk through whether the program is right for you before the next cohort opens, reply and let's set up a quick call. No pressure, no pitch — just a real conversation.`,
    },
  ];
}

function buildNurtureSequence(
  name: string,
  offer: string,
): Omit<EmailItem, 'id'>[] {
  const n = name || 'Your Name';
  const o = offer || 'my coaching program';

  return [
    {
      number: 1,
      purpose: 'Value — Mindset Shift',
      subjectLine: `The mindset shift that separates $10k/mo solopreneurs from everyone else`,
      previewText: `Stop thinking like an employee. Start thinking like an owner.`,
      sendTiming: 'Week 1',
      body: `Hey {first_name},

One thing I wish someone had told me years earlier:

Employees ask: "How do I get paid more?"
Solopreneurs ask: "How do I create more value?"

That shift in thinking is worth $100,000+.

When you stop thinking about what you deserve and start thinking about what you can create — everything changes. You stop waiting for permission. You stop asking for raises. You start building things that compound.

Here's a simple exercise:

This week, write down the single most painful problem your ideal client has right now. Not the problem they think they have — the problem that keeps them up at 3am.

Then ask: what would it feel like to have that problem completely solved?

Now build or outline a solution that creates that feeling.

You might be surprised how quickly things move when you start from that place.

Talk soon,
${n}

P.S. Hit reply and tell me: what's the biggest problem you're solving for your clients right now? I read every single reply.`,
    },
    {
      number: 2,
      purpose: 'Value — Practical Strategy',
      subjectLine: `The 2-hour Monday routine that runs my entire business`,
      previewText: `I've done this every single week for 18 months. Here's the full breakdown.`,
      sendTiming: 'Week 2',
      body: `Hey {first_name},

Every Monday morning, I spend exactly 2 hours setting up my entire week.

No more. No less.

Here's the full routine:

8:00–8:30am — CONTENT PLANNING
I decide on 3–5 pieces of content for the week. Just the topics and angles — no writing yet. I use AI to brainstorm, then pick the ones that feel most alive.

8:30–9:00am — CLIENT PIPELINE REVIEW
I review active clients, follow up on open proposals, and identify 3 new outreach opportunities. Three. Not thirty. Three.

9:00–9:30am — AI PRODUCTION BLOCK
I use Claude to draft emails, content outlines, and proposal templates for everything I identified in the first two blocks. This 30 minutes replaces what used to take me half a day.

9:30–10:00am — PRIORITY LOCK
I choose the ONE most important thing for the week. Just one. Everything else is secondary and gets scheduled or delegated.

Two hours. That's the whole operating system.

Try it this Monday and hit reply to tell me how it went.

${n}`,
    },
    {
      number: 3,
      purpose: 'Value — Case Study',
      subjectLine: `She sent 1 email to 200 people. Here's what happened.`,
      previewText: `$3,000 from a single non-promotional email. Real story, real numbers.`,
      sendTiming: 'Week 3',
      body: `Hey {first_name},

I want to tell you about a conversation I had last month.

A solopreneur in my community — we'll call her Jade — had been posting on social media for 8 months with almost no traction. Great content, consistent effort, nearly zero ROI.

She was exhausted and genuinely considering quitting.

I suggested she stop posting entirely for one week and instead send one personal email to her 200 subscribers.

Not a promotional email. Not a pitch. Just a genuine, deeply helpful email about the #1 problem she saw her audience struggling with — written like she was writing to one specific friend.

200 people. One email. No pitch. No CTA except "hit reply if this resonates."

She got 47 replies.

Three of those conversations turned into sales calls.

Two of those calls converted at $1,500 each.

$3,000 from one non-promotional email to a 200-person list.

The lesson Jade took from this: relationship always beats reach. Every single time.

You don't need a bigger audience. You need a better conversation.

${n}

P.S. What would you write if you sent one deeply personal, helpful email this week? Seriously — hit reply and tell me the topic. I'll give you my honest feedback.`,
    },
    {
      number: 4,
      purpose: 'Value — Tool/Resource',
      subjectLine: `The 5 AI tools I actually use every week (and what each one does)`,
      previewText: `My real tech stack — not the ones everyone recommends for affiliate commissions.`,
      sendTiming: 'Week 4',
      body: `Hey {first_name},

I get asked about my AI toolkit constantly, so here's my completely honest breakdown — no affiliate links, no sponsorships, just what I actually use:

1. CLAUDE (ANTHROPIC)
My primary thinking partner. I use it for strategy, offer refinement, long-form writing, client communication drafts, and anything that requires real nuance. It's the only AI I trust with work that actually matters.

2. DESCRIPT
For all video and podcast editing. It edits video by editing a transcript — which means I can produce professional content in a fraction of the time.

3. MIDJOURNEY
Visual assets for content, slide decks, and concept visualization. The v6 model is genuinely remarkable for brand-consistent imagery.

4. MAKE (FORMERLY INTEGROMAT)
My automation backbone. It connects everything together so I'm not manually moving data between tools. It quietly runs my business while I sleep.

5. CONVERTKIT
Email. Simple, powerful, and doesn't get in the way. The tagging and segmentation system is exactly what solopreneurs need.

That's it. No AI tool will replace good thinking, but these five let me do the work of a 4-person team by myself.

Which of these are you already using? Hit reply — I'm curious.

${n}`,
    },
    {
      number: 5,
      purpose: 'Soft Pitch',
      subjectLine: `{first_name}, would this actually help you right now?`,
      previewText: `I'm considering opening something. I'd genuinely love your input first.`,
      sendTiming: 'Week 5',
      body: `Hey {first_name},

I'm thinking about opening a small group program next month.

Before I finalize anything, I want to check with my most engaged subscribers — that's you — to make sure it's actually what people need.

Here's the concept:

A 6-week intensive for solopreneurs who want to use AI to build a $10k/month business. Weekly live calls, done-for-you templates for everything, a private community, and direct access to me throughout.

This would be ${o} — and it's the most comprehensive thing I've put together.

If that sounds like something you'd genuinely want:

→ Reply "TELL ME MORE" and I'll send you the full details the moment they're ready — plus first access and the best pricing I'll ever offer.

No pressure. No commitment. Just a way to make sure the right people know first.

If it's not the right time for you, no worries at all. I'll keep sending these weekly emails either way.

Talk soon,
${n}

P.S. If you reply with your biggest specific challenge right now, I'll personally make sure the program addresses it. Your input literally shapes what I build.`,
    },
  ];
}

function buildReengagementSequence(
  name: string,
  _offer: string,
): Omit<EmailItem, 'id'>[] {
  const n = name || 'Your Name';

  return [
    {
      number: 1,
      purpose: '"We Miss You"',
      subjectLine: `{first_name}, did I do something wrong?`,
      previewText: `I noticed you haven't opened in a while. I want to ask you directly.`,
      sendTiming: 'Day 1',
      body: `Hey {first_name},

I noticed you haven't opened my emails in a while.

And honestly? I want to ask directly — did I do something wrong?

I take it personally when the content I send isn't landing for people. If my emails have been missing the mark for you, I genuinely want to know why.

Hit reply and tell me one of three things:

1. "Your content isn't relevant to me anymore" — and tell me what would be
2. "I've been busy, I'm still here" — totally fine, I get it
3. "Unsubscribe me please" — no hard feelings, I respect your inbox

Your honest answer helps me make this newsletter 10x better for the people who do want to be here.

If I don't hear from you, I'll assume you'd rather not receive these. And that's okay.

${n}

P.S. If there's something specific you're struggling with right now that I might be able to help with, I genuinely want to know that too.`,
    },
    {
      number: 2,
      purpose: 'Value Bomb',
      subjectLine: `My best resource ever — yours with no strings attached`,
      previewText: `I've never shared this publicly. It's yours free, no catch.`,
      sendTiming: 'Day 4',
      body: `Hey {first_name},

You haven't engaged in a while, so I want to earn your attention back properly.

No pitch. No segue into an offer. Just value.

Here's something I've never shared publicly:

THE SOLOPRENEUR REVENUE AUDIT FRAMEWORK

This is the exact 6-question audit I run with private clients who pay $5,000+ to work with me. In 20 minutes, it shows you exactly where your biggest revenue leaks are and which one to fix first.

Questions:
1. How many people did you have a real sales conversation with in the last 30 days?
2. What's your average client value? (Be honest — most underestimate this)
3. What's your average sales cycle length?
4. What objection kills the most deals?
5. What would you have to believe about your offer to charge 3x more?
6. What's the single biggest friction point between a cold lead and a paying client?

Most solopreneurs have never answered all six honestly. The answers usually reveal the one thing that, if fixed, doubles revenue without a bigger audience.

Use it. And if it helps you see something clearly, hit reply and tell me.

${n}

P.S. That's it. No ask. Just wanted to give you something real.`,
    },
    {
      number: 3,
      purpose: 'Last Chance to Stay',
      subjectLine: `Keeping you subscribed? (Please read — 24-hour notice)`,
      previewText: `I'm cleaning up my list. Here's how to stay if you want to.`,
      sendTiming: 'Day 8',
      body: `Hey {first_name},

I'm doing a list clean-up this week.

I'm removing subscribers who haven't engaged in 60+ days — not because I don't care about them, but because I want to make sure everyone receiving these emails actually wants to be here.

An email list isn't a number. It's a conversation. And conversations only work when both sides want them.

If you want to stay on my list, just click this link:

→ [YES, KEEP ME SUBSCRIBED — I'M STILL HERE]

If you don't click within 24 hours, I'll remove you automatically. You can always re-subscribe anytime at [WEBSITE] — and I'll have your full history there.

No hard feelings, no judgment. Sometimes people outgrow newsletters, and that's completely normal.

But if there's something I could do to make these emails more valuable for you — a topic you wish I covered, a problem you're facing that I haven't addressed — please reply and tell me. I genuinely read everything.

Thank you for being here, however long that's been.

${n}`,
    },
  ];
}

function buildSequenceEmails(
  type: SequenceType,
  name: string,
  offer: string,
  price: string,
  deadline: string,
  voice: BrandVoice
): EmailItem[] {
  let raw: Omit<EmailItem, 'id'>[];
  switch (type) {
    case 'welcome':
      raw = buildWelcomeSequence(name, offer, price, voice);
      break;
    case 'launch':
      raw = buildLaunchSequence(name, offer, price, deadline, voice);
      break;
    case 'nurture':
      raw = buildNurtureSequence(name, offer);
      break;
    case 'reengagement':
      raw = buildReengagementSequence(name, offer);
      break;
  }
  return raw.map((e) => ({ ...e, id: generateId() }));
}

// ─── Token highlighter ────────────────────────────────────────────────────────

function TokenHighlightedText({ text }: { text: string }) {
  const parts = text.split(/(\{[^}]+\})/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('{') ? (
          <span
            key={i}
            className="inline-flex items-center rounded px-1 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 mx-0.5"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

function extractTokens(text: string): string[] {
  const matches = text.match(/\{[^}]+\}/g);
  return [...new Set(matches ?? [])];
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ─── EmailCard ────────────────────────────────────────────────────────────────

function EmailCard({
  email,
  sequenceId,
  onUpdate,
}: {
  email: EmailItem;
  sequenceId: string;
  onUpdate: (sequenceId: string, emailId: string, updates: Partial<EmailItem>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [editing, setEditing] = useState(false);
  const [localSubject, setLocalSubject] = useState(email.subjectLine);
  const [localPreview, setLocalPreview] = useState(email.previewText);
  const [localBody, setLocalBody] = useState(email.body);

  const tokens = extractTokens(`${email.subjectLine} ${email.previewText} ${email.body}`);
  const wc = wordCount(email.body);
  const purposeColor = PURPOSE_COLORS[email.purpose] ?? 'bg-slate-100 text-slate-600';

  const handleCopySubject = async () => {
    await navigator.clipboard.writeText(email.subjectLine);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyAll = async () => {
    const text = `Subject: ${email.subjectLine}\nPreview: ${email.previewText}\n\n${email.body}`;
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleSave = () => {
    onUpdate(sequenceId, email.id, {
      subjectLine: localSubject,
      previewText: localPreview,
      body: localBody,
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setLocalSubject(email.subjectLine);
    setLocalPreview(email.previewText);
    setLocalBody(email.body);
    setEditing(false);
  };

  return (
    <div className="bg-white/90 border border-border/70 rounded-xl shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[hsl(160_40%_12%)] text-white flex items-center justify-center text-xs font-bold">
          {email.number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span
              className={cn(
                'inline-flex text-xs font-medium px-1.5 py-0.5 rounded',
                purposeColor
              )}
            >
              {email.purpose}
            </span>
          </div>
          <div className="text-sm font-medium truncate text-foreground/80">
            {email.subjectLine}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          <Badge variant="outline" className="text-xs hidden sm:flex gap-1 items-center">
            <Clock className="w-2.5 h-2.5" />
            {email.sendTiming}
          </Badge>
          <Badge variant="outline" className="text-xs hidden sm:flex gap-1 items-center">
            <Hash className="w-2.5 h-2.5" />
            {wc}w
          </Badge>
          <div className="flex items-center gap-0.5 ml-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => { e.stopPropagation(); handleCopyAll(); }}
              title="Copy all"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
            {expanded
              ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>
      </div>

      {/* Token strip */}
      {tokens.length > 0 && (
        <div className="px-4 pb-2 flex items-center gap-1.5 flex-wrap border-t border-border/20 pt-2">
          <span className="text-xs text-muted-foreground mr-1">Tokens:</span>
          {tokens.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 p-4 flex flex-col gap-3">
              {editing ? (
                <>
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">Subject Line</Label>
                    <Input
                      value={localSubject}
                      onChange={(e) => setLocalSubject(e.target.value)}
                      className="text-sm"
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">Preview Text</Label>
                    <Input
                      value={localPreview}
                      onChange={(e) => setLocalPreview(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold mb-1.5 block">Body</Label>
                    <Textarea
                      value={localBody}
                      onChange={(e) => setLocalBody(e.target.value)}
                      rows={16}
                      className="text-sm font-mono resize-y min-h-[280px]"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {wordCount(localBody)} words
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      className="bg-[hsl(160_40%_12%)] text-white hover:bg-[hsl(160_40%_16%)] gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Save Changes
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel} className="gap-1.5">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-1.5">
                    <div className="bg-muted/30 rounded-lg px-3 py-2 text-sm">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mr-2">Subject</span>
                      <TokenHighlightedText text={email.subjectLine} />
                    </div>
                    <div className="bg-muted/20 rounded-lg px-3 py-2 text-sm text-muted-foreground">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mr-2">Preview</span>
                      {email.previewText}
                    </div>
                  </div>

                  <div className="bg-muted/10 rounded-lg p-4 border border-border/30">
                    <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                      <TokenHighlightedText text={email.body} />
                    </pre>
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-7 text-xs"
                        onClick={handleCopySubject}
                      >
                        {copiedSubject ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        Copy Subject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-7 text-xs"
                        onClick={handleCopyAll}
                      >
                        {copiedAll ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        Copy All
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{wc} words</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 h-7 text-xs"
                        onClick={() => setEditing(true)}
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sequence Config Bar ──────────────────────────────────────────────────────

interface ConfigValues {
  authorName: string;
  offerName: string;
  price: string;
  deadline: string;
  brandVoice: BrandVoice;
}

function SequenceConfigBar({
  config,
  onChange,
  onApply,
  showDeadline,
}: {
  config: ConfigValues;
  onChange: (updates: Partial<ConfigValues>) => void;
  onApply: () => void;
  showDeadline: boolean;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white/90 border border-border/70 rounded-xl shadow-sm overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/10 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Sequence Configuration</span>
          {(config.authorName || config.offerName) && (
            <span className="text-xs text-muted-foreground">
              — {[config.authorName, config.offerName].filter(Boolean).join(' · ')}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="config"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 px-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="cfg-name" className="text-xs font-medium">Your Name</Label>
                  <Input
                    id="cfg-name"
                    value={config.authorName}
                    onChange={(e) => onChange({ authorName: e.target.value })}
                    placeholder="e.g. Alex Chen"
                    className="text-sm h-8"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="cfg-offer" className="text-xs font-medium">Offer Name</Label>
                  <Input
                    id="cfg-offer"
                    value={config.offerName}
                    onChange={(e) => onChange({ offerName: e.target.value })}
                    placeholder="e.g. AI Blueprint"
                    className="text-sm h-8"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="cfg-price" className="text-xs font-medium">Price ($)</Label>
                  <Input
                    id="cfg-price"
                    value={config.price}
                    onChange={(e) => onChange({ price: e.target.value })}
                    placeholder="e.g. $1,997"
                    className="text-sm h-8"
                  />
                </div>
                {showDeadline && (
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="cfg-deadline" className="text-xs font-medium">Cart Deadline</Label>
                    <Input
                      id="cfg-deadline"
                      value={config.deadline}
                      onChange={(e) => onChange({ deadline: e.target.value })}
                      placeholder="Sunday midnight"
                      className="text-sm h-8"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <Label htmlFor="cfg-voice" className="text-xs font-medium">Brand Voice</Label>
                  <Select
                    value={config.brandVoice}
                    onValueChange={(v) => onChange({ brandVoice: v as BrandVoice })}
                  >
                    <SelectTrigger id="cfg-voice" className="text-sm h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAND_VOICES.map((bv) => (
                        <SelectItem key={bv.value} value={bv.value}>{bv.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1 justify-end">
                  <Button
                    size="sm"
                    onClick={onApply}
                    className="h-8 bg-[hsl(160_40%_12%)] text-white hover:bg-[hsl(160_40%_16%)] gap-1.5 text-xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    Apply to Sequence
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EmailStudioPage() {
  const { sequences, activeSequenceId, addSequence, updateEmail, deleteSequence, setActiveSequence } =
    useEmailStudioStore();
  const { user } = useUserStore();
  const { getContextString } = useContextStore();

  const [activeTab, setActiveTab] = useState<SequenceType>('welcome');
  const [config, setConfig] = useState<ConfigValues>({
    authorName: '',
    offerName: '',
    price: '',
    deadline: '',
    brandVoice: 'conversational',
  });
  const [generating, setGenerating] = useState(false);
  const [lastGeneratedWithAI, setLastGeneratedWithAI] = useState(false);
  const emailListRef = useRef<HTMLDivElement>(null);

  const activeSequence = sequences.find((s) => s.id === activeSequenceId) ?? null;
  const tabMeta = SEQUENCE_TABS.find((t) => t.value === activeTab)!;

  const handleConfigChange = useCallback((updates: Partial<ConfigValues>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);

    if (resolveApiKey(user.anthropicApiKey)) {
      const toastId = toast.loading(`Generating ${tabMeta.label} with Claude AI…`);
      try {
        const client = getAnthropicClient(resolveApiKey(user.anthropicApiKey));
        const contextString = getContextString();
        const emailCount = tabMeta.count;
        const sequenceDescriptions: Record<SequenceType, string> = {
          welcome: 'Onboard new subscribers and build trust over 5 emails',
          launch: 'Drive time-limited sales with urgency and social proof over 7 emails',
          nurture: 'Deliver weekly value and nurture leads over 5 emails',
          reengagement: 'Win back inactive subscribers over 3 emails',
        };
        const sequenceDescription = sequenceDescriptions[activeTab];

        const response = await client.messages.create({
          model: 'claude-sonnet-4-5',
          max_tokens: 6000,
          system: 'You are a world-class email copywriter who writes high-converting sequences in the style of the best direct response marketers.',
          messages: [
            {
              role: 'user',
              content: `Write a complete ${tabMeta.label} email sequence for:
Name: ${config.authorName || 'Your Name'}
Offer: ${config.offerName || 'My Offer'} at $${config.price || '997'}
Brand Voice: ${config.brandVoice}
Sequence Type: ${tabMeta.label} (${sequenceDescription})
${activeTab === 'launch' && config.deadline ? `Cart Deadline: ${config.deadline}` : ''}

Business Context:
${contextString}

Return ONLY a JSON array where each item is:
{
  "subject": "Subject line",
  "previewText": "Preview text 50 chars",
  "body": "Full email body with personalization tokens like {first_name}",
  "day": 1,
  "timing": "Send immediately"
}

Write ${emailCount} emails. Make each email genuinely world-class — specific, emotional, and conversion-focused.`,
            },
          ],
        });

        const raw = response.content[0].type === 'text' ? response.content[0].text : '';
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('No JSON array found in response');

        const parsed = JSON.parse(jsonMatch[0]) as {
          subject: string;
          previewText: string;
          body: string;
          day: number;
          timing: string;
        }[];

        const emails: Omit<EmailItem, 'id'>[] = parsed.map((item, idx) => ({
          number: idx + 1,
          purpose: `Email ${idx + 1}`,
          subjectLine: item.subject,
          previewText: item.previewText,
          body: item.body,
          sendTiming: item.timing || `Day ${item.day}`,
        }));

        addSequence({
          type: activeTab,
          name: `${tabMeta.label} — ${config.offerName || 'My Offer'} ✨`,
          brandVoice: config.brandVoice,
          emails,
          authorName: config.authorName,
          offerName: config.offerName,
          price: config.price,
          deadline: config.deadline,
        });

        setLastGeneratedWithAI(true);
        toast.success(`${tabMeta.label} generated with AI!`, { id: toastId });
      } catch (err) {
        console.error('AI email generation failed:', err);
        toast.warning('AI generation failed — falling back to templates.', { id: toastId });

        const emails = buildSequenceEmails(
          activeTab,
          config.authorName,
          config.offerName,
          config.price,
          config.deadline,
          config.brandVoice
        );
        addSequence({
          type: activeTab,
          name: `${tabMeta.label} — ${config.offerName || 'My Offer'}`,
          brandVoice: config.brandVoice,
          emails,
          authorName: config.authorName,
          offerName: config.offerName,
          price: config.price,
          deadline: config.deadline,
        });
        setLastGeneratedWithAI(false);
      }
    } else {
      await new Promise((r) => setTimeout(r, 700));
      const emails = buildSequenceEmails(
        activeTab,
        config.authorName,
        config.offerName,
        config.price,
        config.deadline,
        config.brandVoice
      );
      addSequence({
        type: activeTab,
        name: `${tabMeta.label} — ${config.offerName || 'My Offer'}`,
        brandVoice: config.brandVoice,
        emails,
        authorName: config.authorName,
        offerName: config.offerName,
        price: config.price,
        deadline: config.deadline,
      });
      setLastGeneratedWithAI(false);
    }

    setGenerating(false);
    setTimeout(() => emailListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }, [activeTab, config, tabMeta, addSequence, user.anthropicApiKey, getContextString]);

  const handleApplyConfig = useCallback(() => {
    if (!activeSequence) return;
    // Regenerate the active sequence with new config values
    const emails = buildSequenceEmails(
      activeSequence.type,
      config.authorName,
      config.offerName,
      config.price,
      config.deadline,
      config.brandVoice
    );
    // Update all emails in the active sequence via individual updates
    // (or replace by creating a fresh sequence with the same type)
    addSequence({
      type: activeSequence.type,
      name: `${SEQUENCE_TABS.find(t => t.value === activeSequence.type)?.label ?? 'Sequence'} — ${config.offerName || 'My Offer'}`,
      brandVoice: config.brandVoice,
      emails,
      authorName: config.authorName,
      offerName: config.offerName,
      price: config.price,
      deadline: config.deadline,
    });
    deleteSequence(activeSequence.id);
  }, [activeSequence, config, addSequence, deleteSequence]);

  const handleExportAll = () => {
    if (!activeSequence) return;
    const allText = activeSequence.emails
      .map(
        (e) =>
          `${'='.repeat(60)}\nEMAIL ${e.number}: ${e.purpose}\nTiming: ${e.sendTiming}\n${'='.repeat(60)}\nSubject: ${e.subjectLine}\nPreview: ${e.previewText}\n\n${e.body}`
      )
      .join('\n\n\n');
    const blob = new Blob([allText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSequence.name.replace(/[\s—]+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-5">

        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-5 h-5 text-[hsl(160_40%_25%)]" />
            <h1 className="text-2xl font-bold text-foreground">Email Sequence Studio</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate world-class email sequences. Fill in your details and build a complete funnel in seconds.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white/90 border border-border/70 rounded-xl shadow-sm p-1.5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
            {SEQUENCE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'relative flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-lg text-left transition-all text-sm',
                  activeTab === tab.value
                    ? 'bg-[hsl(160_40%_12%)] text-white shadow-sm'
                    : 'hover:bg-muted/40 text-foreground'
                )}
              >
                <div className="flex items-center gap-2 w-full">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full flex-shrink-0',
                      activeTab === tab.value ? 'bg-white/70' : tab.color
                    )}
                  />
                  <span className="font-semibold text-xs sm:text-sm truncate">{tab.label}</span>
                  <span
                    className={cn(
                      'ml-auto text-xs rounded-full px-1.5 py-0.5 flex-shrink-0',
                      activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {tab.count}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-xs pl-4',
                    activeTab === tab.value ? 'text-white/60' : 'text-muted-foreground'
                  )}
                >
                  {tab.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Config Bar */}
        <SequenceConfigBar
          config={config}
          onChange={handleConfigChange}
          onApply={handleApplyConfig}
          showDeadline={activeTab === 'launch'}
        />

        {/* Generate Button */}
        <div className="flex flex-col gap-1.5">
          <Button
            size="lg"
            className="w-full gap-2 font-semibold text-base py-5 bg-[hsl(160_40%_12%)] hover:bg-[hsl(160_40%_18%)] text-white shadow-sm"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                {resolveApiKey(user.anthropicApiKey) ? 'Generating with Claude AI…' : `Generating ${tabMeta.label}…`}
              </>
            ) : (
              <>
                {resolveApiKey(user.anthropicApiKey) ? <Sparkles className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {resolveApiKey(user.anthropicApiKey) ? `✨ Generate with AI — ${tabMeta.label}` : `Generate ${tabMeta.label} (${tabMeta.count} emails)`}
              </>
            )}
          </Button>
          {user.anthropicApiKey && (
            <p className="text-xs text-center text-muted-foreground">Powered by Claude AI — personalized to your business</p>
          )}
        </div>

        {/* Saved Sequences Navigation */}
        {sequences.length > 0 && (
          <div className="bg-white/90 border border-border/70 rounded-xl shadow-sm p-4">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 block">
              Saved Sequences ({sequences.length})
            </Label>
            <div className="flex flex-wrap gap-2">
              {sequences.map((seq) => (
                <button
                  key={seq.id}
                  type="button"
                  onClick={() => setActiveSequence(seq.id)}
                  className={cn(
                    'group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all',
                    activeSequenceId === seq.id
                      ? 'bg-[hsl(160_40%_12%)] text-white border-transparent'
                      : 'border-border/50 hover:border-border/80 bg-white'
                  )}
                >
                  <FileText className="w-3 h-3 flex-shrink-0" />
                  <span className="font-medium text-xs truncate max-w-[180px]">{seq.name}</span>
                  <span className={cn('text-xs', activeSequenceId === seq.id ? 'text-white/60' : 'text-muted-foreground')}>
                    {seq.emails.length}
                  </span>
                  <button
                    type="button"
                    className={cn(
                      'ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5',
                      activeSequenceId === seq.id ? 'hover:bg-white/20' : 'hover:bg-muted'
                    )}
                    onClick={(e) => { e.stopPropagation(); deleteSequence(seq.id); }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Sequence Email Cards */}
        <div ref={emailListRef}>
          {activeSequence ? (
            <div className="flex flex-col gap-4">
              {/* Sequence header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg">{activeSequence.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {activeSequence.emails.length} emails ·{' '}
                    {BRAND_VOICES.find((b) => b.value === activeSequence.brandVoice)?.label} voice
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleExportAll}
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Sequence
                </Button>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                  {activeSequence.emails.map((email, i) => (
                    <motion.div
                      key={email.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                    >
                      <EmailCard
                        email={email}
                        sequenceId={activeSequence.id}
                        onUpdate={updateEmail}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Export footer */}
              <div className="bg-white/90 border border-border/70 rounded-xl shadow-sm p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Export This Sequence</p>
                  <p className="text-xs text-muted-foreground">
                    Downloads all {activeSequence.emails.length} emails as a formatted .txt file
                  </p>
                </div>
                <Button
                  onClick={handleExportAll}
                  className="gap-1.5 bg-[hsl(160_40%_12%)] text-white hover:bg-[hsl(160_40%_18%)]"
                >
                  <Download className="w-4 h-4" />
                  Download .txt
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white/90 border border-border/70 rounded-xl shadow-sm flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-muted/40 flex items-center justify-center">
                <Mail className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <div>
                <p className="font-semibold text-foreground/70">No sequence selected</p>
                <p className="text-sm text-muted-foreground/60 mt-0.5">
                  Configure your details above and click Generate to build a full sequence.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 gap-1.5"
                onClick={handleGenerate}
                disabled={generating}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate {tabMeta.label}
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
