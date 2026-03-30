import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Star,
  Copy,
  Check,
  Search,
  X,
  Type,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getAnthropicClient, resolveApiKey } from '@/lib/ai';
import { useUserStore } from '@/stores/user';
import { useContextStore } from '@/stores/context';
import { useCopyVaultStore } from '@/stores/copyVault';

// ─── Types ──────────────────────────────────────────────────────────────────

export type CopyCategory =
  | 'headlines'
  | 'hooks'
  | 'bullets'
  | 'ctas'
  | 'testimonials'
  | 'objections'
  | 'guarantees'
  | 'urgency'
  | 'price'
  | 'ps';

interface CopyTemplate {
  id: string;
  category: CopyCategory;
  text: string;
  useCase: string;
  tags: string[];
}

// ─── Template Library ────────────────────────────────────────────────────────

const TEMPLATES: CopyTemplate[] = [
  // ── Headlines ──
  { id: 'h1', category: 'headlines', text: 'How to {achieve_desired_result} in {timeframe} Even If {biggest_objection}', useCase: 'Classic how-to headline with objection built in. Highest-converting structure in direct response.', tags: ['how-to', 'benefit', 'objection'] },
  { id: 'h2', category: 'headlines', text: 'The {adjective} Secret to {desired_result} That {authority_source} Don\'t Want You to Know', useCase: 'Authority-disruption headline. Works well in skeptical, sophisticated markets.', tags: ['secret', 'authority', 'curiosity'] },
  { id: 'h3', category: 'headlines', text: 'Warning: Do NOT Try to {action} Until You Read This', useCase: 'Gary Halbert-style warning headline. Stops scanning readers cold.', tags: ['warning', 'pattern-interrupt', 'direct'] },
  { id: 'h4', category: 'headlines', text: 'Who Else Wants to {achieve_desired_result}?', useCase: 'Social proof built into the headline. Implies others are already doing it.', tags: ['social-proof', 'desire', 'invitation'] },
  { id: 'h5', category: 'headlines', text: 'The Lazy {person_type}\'s Way to {desired_result}', useCase: 'Anti-hustle angle. Appeals to people who want results without the grind.', tags: ['lazy', 'ease', 'transformation'] },
  { id: 'h6', category: 'headlines', text: 'At Last! A {product_type} That Actually {delivers_specific_result}', useCase: 'Relief headline. "At Last" signals to frustrated buyers this is the solution.', tags: ['relief', 'solution', 'finally'] },
  { id: 'h7', category: 'headlines', text: 'They Laughed When I Said I\'d {bold_claim} — But When I {achieved_result}…', useCase: 'Classic AIDA story headline by John Caples. Creates curiosity gap with social redemption.', tags: ['story', 'social', 'proof'] },
  { id: 'h8', category: 'headlines', text: 'If You Can {simple_action}, You Can {desired_result}', useCase: 'Lowers the barrier. Makes success feel accessible and inevitable.', tags: ['accessible', 'simple', 'empowering'] },
  { id: 'h9', category: 'headlines', text: 'The {number}-Step System for Getting {desired_result} — Even If You\'re Starting From Zero', useCase: 'Process-based headline that systematizes the outcome. Highly credible.', tags: ['system', 'steps', 'beginners'] },
  { id: 'h10', category: 'headlines', text: 'What {successful_group} Know About {topic} That {struggling_group} Don\'t', useCase: 'In-group/out-group contrast. Reader wants to move from struggling to successful group.', tags: ['contrast', 'education', 'curiosity'] },
  { id: 'h11', category: 'headlines', text: 'Stop {painful_activity} — There\'s a Better Way to {desired_result}', useCase: 'Identifies the exact thing the audience hates doing. Strong empathy signal.', tags: ['problem', 'pain', 'solution'] },
  { id: 'h12', category: 'headlines', text: 'How a {relatable_person} Discovered the {secret_thing} That Changed {aspect_of_life} Forever', useCase: 'Discovery story headline. Works for case studies and origin stories.', tags: ['story', 'discovery', 'transformation'] },
  { id: 'h13', category: 'headlines', text: 'The Truth About {topic} That Nobody Talks About', useCase: 'Creates intrigue and positions you as the honest insider.', tags: ['truth', 'contrarian', 'insider'] },
  { id: 'h14', category: 'headlines', text: '{number} {topic} Mistakes Even Smart {audience} Make — And How to Avoid Them', useCase: 'Ego-preserving mistake headline. Even smart people make these = safe to admit.', tags: ['mistakes', 'education', 'ego-safe'] },
  { id: 'h15', category: 'headlines', text: 'How to {achieve_result} Without {sacrifice}, {sacrifice2}, or {sacrifice3}', useCase: 'The "without" headline. Removes all the objections in one shot.', tags: ['without', 'objections', 'ease'] },
  { id: 'h16', category: 'headlines', text: 'Do You Make These {number} {topic} Mistakes?', useCase: 'Question headline that creates fear of missing out on important knowledge.', tags: ['mistakes', 'question', 'fomo'] },
  { id: 'h17', category: 'headlines', text: 'The Fastest Way to {desired_result} Starts With This One {thing}', useCase: 'Speed + simplicity. One thing = low commitment feel.', tags: ['speed', 'simplicity', 'one-thing'] },
  { id: 'h18', category: 'headlines', text: 'Finally, a {product_type} That Works for People Who {have_specific_struggle}', useCase: 'Specifically acknowledges the audience\'s unique situation.', tags: ['specific', 'empathy', 'solution'] },
  { id: 'h19', category: 'headlines', text: 'Why {conventional_approach} Fails — And What to Do Instead', useCase: 'Contrarian authority headline. Positions your method as the correct alternative.', tags: ['contrarian', 'authority', 'alternative'] },
  { id: 'h20', category: 'headlines', text: 'The {timeframe} {challenge_type} That Helped {number} {people} {achieve_result}', useCase: 'Social proof + time-bound = credibility stack. High trust headline.', tags: ['social-proof', 'time-bound', 'results'] },

  // ── Opening Hooks ──
  { id: 'ok1', category: 'hooks', text: 'I\'m going to tell you something that most {experts} in {industry} don\'t want you to know.', useCase: 'Authority-disrupting opener. Creates immediate curiosity and positions you as the honest insider.', tags: ['authority', 'secret', 'opener'] },
  { id: 'ok2', category: 'hooks', text: '{timeframe} ago, I was {painful_situation}. Today, I {current_success}. This is exactly how it happened.', useCase: 'Origin story hook. Instantly relatable starting point with proof of transformation.', tags: ['story', 'transformation', 'before-after'] },
  { id: 'ok3', category: 'hooks', text: 'If you\'re like most {audience}, you\'ve been told to {common_advice}. That advice is costing you {loss}.', useCase: 'Reframes existing belief as harmful. Creates urgency to keep reading.', tags: ['reframe', 'cost', 'attention'] },
  { id: 'ok4', category: 'hooks', text: 'Here\'s a question nobody asks but everybody should: {thought_provoking_question}', useCase: 'Intellectual curiosity hook. Makes the reader feel they\'re getting access to insider thinking.', tags: ['question', 'curiosity', 'intellectual'] },
  { id: 'ok5', category: 'hooks', text: 'The most dangerous number in business is {specific_number}. Here\'s why.', useCase: 'Specific number + "most dangerous" creates instant curiosity gap.', tags: ['number', 'danger', 'specific'] },
  { id: 'ok6', category: 'hooks', text: 'I spent {timeframe} testing {number} different {approaches}. Here\'s everything I found.', useCase: 'Research-backed credibility opener. Implies you\'ve done the hard work for them.', tags: ['research', 'testing', 'credibility'] },
  { id: 'ok7', category: 'hooks', text: 'Let me paint a picture for you. It\'s {time_of_day}. You\'ve just {achieved_outcome}. How does that feel?', useCase: 'Visualization hook. Gets the reader living in the desired future state immediately.', tags: ['visualization', 'desire', 'future'] },
  { id: 'ok8', category: 'hooks', text: 'The day I {pivotal_moment} was the day everything changed. I didn\'t know it at the time.', useCase: 'Hinge moment story opener. Creates suspense about what changed and why.', tags: ['story', 'suspense', 'hinge'] },
  { id: 'ok9', category: 'hooks', text: 'This might sound crazy, but {counterintuitive_claim}. And I can prove it.', useCase: 'Credibility challenge. "This might sound crazy" pre-handles the skepticism.', tags: ['counterintuitive', 'bold', 'proof'] },
  { id: 'ok10', category: 'hooks', text: 'Most people approach {topic} backwards. They start with {wrong_thing} when they should start with {right_thing}.', useCase: 'Process correction hook. Implies expertise and a better method.', tags: ['process', 'mistake', 'correction'] },
  { id: 'ok11', category: 'hooks', text: 'There are {number} types of {audience}. Only {small_number} will ever reach {milestone}. Here\'s the difference.', useCase: 'Segmentation hook. Reader wants to identify as being in the winning group.', tags: ['segmentation', 'identity', 'aspiration'] },
  { id: 'ok12', category: 'hooks', text: 'What if I told you that everything you believe about {topic} is {wrong/exaggerated/incomplete}?', useCase: 'Belief challenge hook. Strong pattern interrupt for audiences with strong prior views.', tags: ['belief', 'challenge', 'pattern-interrupt'] },
  { id: 'ok13', category: 'hooks', text: 'I\'m going to show you something in the next {timeframe} that will change how you think about {topic} forever.', useCase: 'Bold promise opener with timeframe. Sets up high expectation immediately.', tags: ['promise', 'transformation', 'time-bound'] },
  { id: 'ok14', category: 'hooks', text: 'The #1 reason {audience} fail at {goal} isn\'t lack of {common_excuse}. It\'s {real_reason}.', useCase: 'Reframe hook. Destroys the excuse they\'re hiding behind and offers the real answer.', tags: ['reframe', 'excuse', 'truth'] },
  { id: 'ok15', category: 'hooks', text: 'I want to ask you a personal question. And I want you to be brutally honest with yourself when you answer it. {question}', useCase: 'Intimate vulnerability hook. Creates a psychological 1-on-1 feeling.', tags: ['intimate', 'personal', 'introspective'] },

  // ── Bullet Points ──
  { id: 'bp1', category: 'bullets', text: 'The {surprising_thing} that {famous_person/authority} uses every {timeframe} — and why it works even if you {have_limitation}', useCase: 'Authority + accessibility fascination bullet.', tags: ['authority', 'fascination', 'accessible'] },
  { id: 'bp2', category: 'bullets', text: 'Why you should NEVER {common_action} before doing {uncommon_action} first (this mistake costs most people {loss})', useCase: 'Warning bullet. Fear of loss is a powerful motivator.', tags: ['warning', 'fear', 'loss'] },
  { id: 'bp3', category: 'bullets', text: 'The little-known {strategy/tool/trick} that {positive_outcome} — even when {negative_condition}', useCase: 'Persistence/resilience benefit bullet.', tags: ['strategy', 'benefit', 'even-when'] },
  { id: 'bp4', category: 'bullets', text: 'How to {achieve_result} in {timeframe} without {sacrifice_1}, {sacrifice_2}, or {sacrifice_3}', useCase: '"Without" benefit bullet. Removes multiple objections simultaneously.', tags: ['without', 'benefit', 'objections'] },
  { id: 'bp5', category: 'bullets', text: 'The {number}-word {script/framework/phrase} that {produces_specific_outcome} (use this word-for-word)', useCase: 'Extreme specificity bullet. "Word-for-word" increases perceived value.', tags: ['specific', 'script', 'done-for-you'] },
  { id: 'bp6', category: 'bullets', text: 'What to do when {worst_case_scenario} — the exact {number} steps I take every time', useCase: 'Worst-case scenario protection bullet. Reduces fear of failure.', tags: ['fear', 'protection', 'process'] },
  { id: 'bp7', category: 'bullets', text: 'The {adjective} truth about {topic} that {industry_insiders} will never tell you', useCase: 'Insider secret bullet. Positions the reader as gaining access to hidden knowledge.', tags: ['secret', 'insider', 'truth'] },
  { id: 'bp8', category: 'bullets', text: 'How {successful_person} went from {starting_point} to {end_result} using this {counterintuitive_method}', useCase: 'Case study fascination bullet. Specific transformation with intriguing method.', tags: ['case-study', 'transformation', 'method'] },
  { id: 'bp9', category: 'bullets', text: 'The biggest mistake {audience} make with {topic} — and the {simple_fix} that changes everything overnight', useCase: 'Mistake + simple fix bullet. Promise of easy improvement.', tags: ['mistake', 'fix', 'simple'] },
  { id: 'bp10', category: 'bullets', text: 'Why {common_belief_about_topic} is actually {backwards/wrong/limiting} — and what the top {percentage}% do instead', useCase: 'Belief correction bullet with social proof.', tags: ['belief', 'correction', 'social-proof'] },

  // ── CTAs ──
  { id: 'cta1', category: 'ctas', text: 'Yes! I Want to {achieve_specific_outcome} — {click_here/get_access_now}', useCase: 'First-person CTA. Reader says "yes" in their head before clicking. Conversion booster.', tags: ['yes-button', 'first-person', 'desire'] },
  { id: 'cta2', category: 'ctas', text: 'Get Instant Access to {specific_thing} Right Now →', useCase: '"Instant" removes delay anxiety. Specificity increases perceived value.', tags: ['instant', 'specific', 'access'] },
  { id: 'cta3', category: 'ctas', text: 'Claim Your {free_thing/spot/discount} Before {deadline/limit}', useCase: '"Claim" implies ownership. Creates mild urgency without aggression.', tags: ['claim', 'urgency', 'ownership'] },
  { id: 'cta4', category: 'ctas', text: 'Start {achieving_outcome} Today — Join {number}+ {people} Who Already Have', useCase: 'Social proof embedded in CTA. Reduces fear of being first.', tags: ['social-proof', 'start', 'today'] },
  { id: 'cta5', category: 'ctas', text: 'Show Me How to {achieve_result} (I\'m Ready)', useCase: 'Conversational, declaration of readiness. Creates momentum.', tags: ['conversational', 'readiness', 'action'] },
  { id: 'cta6', category: 'ctas', text: 'Send Me the Free {resource_name} →', useCase: 'Clear value exchange. "Free" + specific name = high click rate.', tags: ['free', 'specific', 'resource'] },
  { id: 'cta7', category: 'ctas', text: 'Reserve My Spot Now — Only {number} Spots Remaining', useCase: 'Scarcity embedded in CTA. "Reserve" implies exclusive access.', tags: ['scarcity', 'reserve', 'exclusive'] },
  { id: 'cta8', category: 'ctas', text: 'I\'m Ready to Stop {painful_thing} and Start {desired_thing}', useCase: 'Pain + desire contrast CTA. Reader affirms their transformation intent.', tags: ['pain-desire', 'contrast', 'affirmation'] },
  { id: 'cta9', category: 'ctas', text: 'Click Here to Watch the Free {training/video/demo} →', useCase: 'Directs to low-commitment free step. "Watch" is passive, low effort.', tags: ['free', 'low-commitment', 'video'] },
  { id: 'cta10', category: 'ctas', text: 'Apply for {program_name} — See If You Qualify', useCase: 'Application-style CTA. Creates exclusivity and self-selection.', tags: ['exclusivity', 'application', 'qualify'] },
  { id: 'cta11', category: 'ctas', text: 'Download Your Free Copy of {resource_name} (Instant PDF)', useCase: 'PDF + instant delivery. Reduces friction, sets clear expectation.', tags: ['pdf', 'download', 'free'] },
  { id: 'cta12', category: 'ctas', text: 'Yes, I\'m Ready to Invest in {transformation} →', useCase: '"Invest" reframes cost as value. Affirms commitment.', tags: ['invest', 'framing', 'commitment'] },
  { id: 'cta13', category: 'ctas', text: 'Join the {community_name} Family — Get Started Today', useCase: 'Community + family language. Emotional belonging appeal.', tags: ['community', 'belonging', 'family'] },
  { id: 'cta14', category: 'ctas', text: 'Get the {specific_tool} That {successful_people} Use to {achieve_result}', useCase: 'Authority social proof embedded in CTA. Desire by association.', tags: ['authority', 'social-proof', 'tool'] },
  { id: 'cta15', category: 'ctas', text: 'Book Your Free {strategy_call/consultation} — {number} Spots Available This Week', useCase: 'Urgency + free offer. Strong for service-based businesses.', tags: ['free', 'call', 'urgency'] },

  // ── Testimonial Frameworks ──
  { id: 'tf1', category: 'testimonials', text: 'Before {program_name}, I was {specific_painful_situation}. After just {timeframe}, I {specific_positive_outcome}. I couldn\'t believe it worked that fast.', useCase: 'Before-after-timeframe structure. Specificity in both states = credibility.', tags: ['before-after', 'specific', 'time'] },
  { id: 'tf2', category: 'testimonials', text: 'I was skeptical at first because I\'d tried {number} other {programs/methods}. But {program_name} was different because {specific_differentiator}. The result: {measurable_outcome}.', useCase: 'Skeptic-to-believer arc. Pre-handles the same objection future buyers have.', tags: ['skeptic', 'objection', 'result'] },
  { id: 'tf3', category: 'testimonials', text: '{program_name} didn\'t just give me {surface_result}. It gave me {deeper_transformation}. That\'s the thing nobody tells you about — it changes more than just {thing}.', useCase: 'Depth testimonial. Goes beyond the obvious benefit to the real transformation.', tags: ['depth', 'transformation', 'unexpected'] },
  { id: 'tf4', category: 'testimonials', text: 'If you\'re on the fence about {program_name}, let me make it simple: I made back my investment in {timeframe}. Everything after that was pure profit.', useCase: 'ROI testimonial. Financial justification from peer = most persuasive format.', tags: ['roi', 'investment', 'financial'] },
  { id: 'tf5', category: 'testimonials', text: 'I\'ve recommended {program_name} to {number} people because {specific_reason}. Every single one of them has thanked me for it.', useCase: 'Word-of-mouth testimonial. Social validation doubled.', tags: ['referral', 'social-proof', 'advocacy'] },

  // ── Objection Handlers ──
  { id: 'ob1', category: 'objections', text: '"I can\'t afford it right now." → You can\'t afford NOT to. Every {timeframe} you spend without this system is {estimated_loss} in {potential_revenue/time/opportunity} left on the table.', useCase: 'Cost of inaction reframe. Shifts from "can I afford this?" to "can I afford NOT to?"', tags: ['cost', 'inaction', 'reframe'] },
  { id: 'ob2', category: 'objections', text: '"I don\'t have enough time." → This system was specifically designed for people with {constraint}. In fact, most students spend less than {hours}/week and still achieve {result}.', useCase: 'Time objection handler. Acknowledge + redirect with social proof.', tags: ['time', 'busy', 'social-proof'] },
  { id: 'ob3', category: 'objections', text: '"I\'ve tried things like this before and they didn\'t work." → Here\'s what makes this different: {specific_differentiator}. It\'s not another {commodity_thing} — it\'s a {unique_mechanism}.', useCase: 'Failed attempts objection. Must name the unique mechanism specifically.', tags: ['skeptic', 'different', 'mechanism'] },
  { id: 'ob4', category: 'objections', text: '"I need to think about it." → I understand. But here\'s a question worth sitting with: what exactly will have changed in {timeframe} that will make this decision easier? If the answer is "nothing" — then waiting only costs you {timeframe} of results.', useCase: 'Think-about-it deflection handler. Socratic method without pressure.', tags: ['think', 'delay', 'socratic'] },
  { id: 'ob5', category: 'objections', text: '"I\'m not sure it will work for me." → That\'s exactly why we have a {guarantee_type} guarantee. You either get {result} or you get your money back. The risk is entirely on us.', useCase: 'Works-for-me objection neutralized by risk reversal.', tags: ['guarantee', 'risk-reversal', 'confidence'] },
  { id: 'ob6', category: 'objections', text: '"I don\'t have a big audience / list / following." → Good news: this method was specifically designed to work WITHOUT a big audience. In fact, {number} of my students started with fewer than {small_number} followers.', useCase: 'Starting-from-zero objection. Use specifics to prove it\'s possible.', tags: ['beginners', 'zero', 'proof'] },
  { id: 'ob7', category: 'objections', text: '"Is this just another course that sits on a hard drive?" → Fair concern. Here\'s what keeps students accountable and getting results: {accountability_mechanism}. The average completion rate is {percentage}%.', useCase: 'Course-fatigue objection. Attack the exact fear directly.', tags: ['completion', 'accountability', 'action'] },
  { id: 'ob8', category: 'objections', text: '"Why should I trust you?" → Fair question. Here\'s my proof: {credential_1}, {credential_2}, and {number} students who have achieved {result}. But don\'t take my word for it — read what they say.', useCase: 'Trust objection. Lead with evidence, defer to social proof.', tags: ['trust', 'credibility', 'evidence'] },
  { id: 'ob9', category: 'objections', text: '"The timing isn\'t right." → The perfect time to start {goal} was {timeframe} ago. The second best time is right now. {specific_reason_why_now}.', useCase: 'Timing objection. Classic urgency reframe.', tags: ['timing', 'urgency', 'now'] },
  { id: 'ob10', category: 'objections', text: '"I could probably figure this out on my own." → You could. It took me {timeframe} and ${cost} in trial and error to figure this out alone. I\'m handing you the shortcut for a fraction of that.', useCase: 'DIY objection. Make the cost of DIY visceral and specific.', tags: ['diy', 'shortcut', 'value'] },

  // ── Guarantees ──
  { id: 'gu1', category: 'guarantees', text: 'Try {program_name} for a full {number} days. If you don\'t {specific_result}, email us and we\'ll refund every penny. No questions, no hoops, no hard feelings.', useCase: 'Standard money-back guarantee. "No hoops" pre-handles anxiety about claiming it.', tags: ['money-back', 'days', 'no-questions'] },
  { id: 'gu2', category: 'guarantees', text: 'We\'re so confident in {program_name} that if you complete {specific_action} and don\'t see {measurable_result}, we\'ll work with you personally until you do — or refund you completely.', useCase: 'Action-based performance guarantee. Higher perceived confidence.', tags: ['performance', 'personal', 'action-based'] },
  { id: 'gu3', category: 'guarantees', text: 'The risk is entirely on us. Either {program_name} delivers {promised_outcome}, or you pay nothing. Period.', useCase: 'Bold risk-reversal statement. Short, punchy, maximum confidence signal.', tags: ['risk-reversal', 'bold', 'confident'] },
  { id: 'gu4', category: 'guarantees', text: 'You have {number} days to go through everything, implement the strategies, and decide if it\'s right for you. If not — for any reason at all — you\'ll get a full refund. No explanation needed.', useCase: '"For any reason" guarantee removes ALL buyer risk. Highest-converting style.', tags: ['any-reason', 'generous', 'risk-free'] },
  { id: 'gu5', category: 'guarantees', text: 'I stand behind {program_name} with a double guarantee: if you follow the steps and don\'t {result_1}, I\'ll refund you AND {bonus_action} as my way of apologizing for wasting your time.', useCase: 'Double guarantee. Extreme confidence signal. Rarely matched by competitors.', tags: ['double', 'extreme', 'confidence'] },

  // ── Urgency/Scarcity ──
  { id: 'ur1', category: 'urgency', text: 'This offer expires {specific_deadline}. After that, the price increases to {higher_price} — permanently.', useCase: 'Price increase urgency. Permanent increase is more credible than "limited time."', tags: ['price-increase', 'permanent', 'deadline'] },
  { id: 'ur2', category: 'urgency', text: 'Only {number} spots available. Once they\'re gone, I\'m closing enrollment until {next_opening_date}.', useCase: 'Seat scarcity with concrete next-open date. Adds believability.', tags: ['seats', 'scarcity', 'enrollment'] },
  { id: 'ur3', category: 'urgency', text: 'I\'m taking this page down on {date} at {time}. Not as a tactic — I genuinely can\'t take on more clients than I can serve well.', useCase: 'Authentic-sounding scarcity. Reason-why scarcity is more believable.', tags: ['authentic', 'reason-why', 'capacity'] },
  { id: 'ur4', category: 'urgency', text: 'The bonus package ({list_bonuses}) disappears when this offer closes. You can still join after — but at the higher price, without these.', useCase: 'Bonus disappearance urgency. Less aggressive than price increase alone.', tags: ['bonus', 'disappear', 'loss'] },
  { id: 'ur5', category: 'urgency', text: 'Every day you wait costs you an estimated {daily_cost_of_inaction}. Here\'s the math: {simple_calculation}.', useCase: 'Cost-of-delay urgency. Makes waiting feel financially irrational.', tags: ['cost', 'math', 'delay'] },
  { id: 'ur6', category: 'urgency', text: '{number} people are looking at this page right now. {smaller_number} spots remain.', useCase: 'Real-time social scarcity. Common on ecommerce, very effective on landing pages.', tags: ['real-time', 'social', 'watching'] },
  { id: 'ur7', category: 'urgency', text: 'This is the last time I\'m offering {specific_component} — I\'m removing it from the program after this launch.', useCase: 'Component retirement urgency. Creates "last chance" for a specific item.', tags: ['last-chance', 'component', 'removal'] },
  { id: 'ur8', category: 'urgency', text: 'The founding member price ends when we hit {number} students. We\'re at {current_number} right now.', useCase: 'Milestone-based urgency. Transparent and trackable = more credible.', tags: ['founding', 'milestone', 'transparent'] },
  { id: 'ur9', category: 'urgency', text: 'I\'m opening just {number} spots this quarter. After they\'re filled, I go back to my waitlist — which has {number} people on it.', useCase: 'Waitlist scarcity. Makes availability feel earned and exclusive.', tags: ['waitlist', 'exclusive', 'quarterly'] },
  { id: 'ur10', category: 'urgency', text: 'Once you close this page, I can\'t guarantee this offer will still be here when you come back. I\'m not saying that to pressure you — it\'s just the reality of how I run things.', useCase: 'Authentic page-close urgency. Honest framing reduces manipulation feel.', tags: ['authentic', 'page-close', 'honest'] },

  // ── Price Justification ──
  { id: 'pj1', category: 'price', text: 'Think about what it would cost you to hire {professional} to deliver {specific_result}. That\'s {high_price}. {program_name} gives you the same outcome for {your_price}.', useCase: 'Comparison anchor. Reference a more expensive alternative to make your price feel reasonable.', tags: ['comparison', 'anchor', 'value'] },
  { id: 'pj2', category: 'price', text: 'At {price}, that\'s less than {relatable_daily_cost} per day. What\'s {desired_outcome} worth to you per day?', useCase: 'Daily cost reframe. Makes large prices feel trivially small.', tags: ['daily-cost', 'reframe', 'small'] },
  { id: 'pj3', category: 'price', text: 'One {result} from this system will pay for the entire investment {number}x over. Most students see their first result in {timeframe}.', useCase: 'ROI justification. Makes the investment feel like a money machine.', tags: ['roi', 'payback', 'investment'] },
  { id: 'pj4', category: 'price', text: 'I spent {high_amount} and {timeframe} to figure out what I\'m teaching you in {program_name}. You\'re getting it for {your_price}.', useCase: 'Time-and-money-spent justification. Makes your price feel like a steal.', tags: ['cost-to-build', 'value', 'shortcut'] },
  { id: 'pj5', category: 'price', text: 'The price of {program_name} is {price}. The cost of NOT doing this is {opportunity_cost} per {timeframe}. Do the math.', useCase: 'Opportunity cost framing. Makes inaction feel expensive.', tags: ['opportunity-cost', 'math', 'inaction'] },
  { id: 'pj6', category: 'price', text: 'This isn\'t an expense — it\'s a capital allocation. The expected ROI is {specific_return} based on what our average student achieves in {timeframe}.', useCase: 'Investment-language reframe. Sophisticated buyers respond strongly to ROI language.', tags: ['investment', 'roi', 'capital'] },
  { id: 'pj7', category: 'price', text: 'Most people spend more on {relatable_small_expense} every month than the monthly equivalent of {program_name}. The difference: {program_name} actually {delivers_result}.', useCase: 'Relatable comparison anchor. Puts price in familiar, everyday context.', tags: ['comparison', 'relatable', 'everyday'] },
  { id: 'pj8', category: 'price', text: 'I\'ve intentionally priced this at {price} — not the {higher_price} my peers charge — because I want {specific_audience_type} to be able to afford it. Here\'s why that matters to me.', useCase: 'Intentional pricing with story. Builds emotional connection and positions below competition.', tags: ['story', 'pricing-intent', 'empathy'] },

  // ── PS Lines ──
  { id: 'ps1', category: 'ps', text: 'P.S. Remember: this offer closes on {date} at {time}. After that, the price goes up permanently. Don\'t let procrastination cost you {price_difference}.', useCase: 'Urgency re-emphasis PS. Readers scan to PS — restate the deadline.', tags: ['urgency', 'deadline', 'summary'] },
  { id: 'ps2', category: 'ps', text: 'P.S. If you\'re still reading, you\'re clearly interested — but something is holding you back. Email me at {email} and tell me what it is. I respond personally.', useCase: 'Objection-surfacing PS. Invites dialogue and humanizes the seller.', tags: ['objection', 'dialogue', 'personal'] },
  { id: 'ps3', category: 'ps', text: 'P.S. Still on the fence? Read what {student_name} said: "{testimonial_quote}" — That result is available to you too.', useCase: 'Testimonial PS. Perfect for readers who skipped the body copy.', tags: ['testimonial', 'fence', 'social-proof'] },
  { id: 'ps4', category: 'ps', text: 'P.S. You\'ve read this far, which tells me you\'re serious about {desired_outcome}. Serious people take action. Click here to get started: [LINK]', useCase: 'Commitment consistency PS. Uses their reading behavior to imply they\'re the type who acts.', tags: ['consistency', 'commitment', 'identity'] },
  { id: 'ps5', category: 'ps', text: 'P.S. Quick recap of what you\'re getting: {benefit_1}, {benefit_2}, {benefit_3}. All for {price}. With a {guarantee} guarantee. There\'s genuinely no risk here.', useCase: 'Summary PS. Perfect for scanners who jumped to the bottom.', tags: ['summary', 'scanners', 'recap'] },
  { id: 'ps6', category: 'ps', text: 'P.P.S. If you only take one thing from this letter, let it be this: {core_insight}. That insight alone is worth 10x the price of admission.', useCase: 'Core insight PS. Creates a final moment of value before the decision.', tags: ['insight', 'value', 'final'] },
  { id: 'ps7', category: 'ps', text: 'P.S. I\'ll be honest — I don\'t know if {program_name} is right for you. But if {qualifying_statement}, there\'s a very good chance this changes everything. [LINK]', useCase: 'Honest/qualifying PS. Counter-intuitively builds trust by not claiming it\'s for everyone.', tags: ['honest', 'qualifying', 'trust'] },
  { id: 'ps8', category: 'ps', text: 'P.S. The people who hesitate and miss this opportunity don\'t usually regret the money. They regret the time they lost waiting. Don\'t be that person.', useCase: 'Regret-avoidance PS. Shifts from financial fear to time regret — more visceral.', tags: ['regret', 'time', 'emotional'] },
  { id: 'ps9', category: 'ps', text: 'P.S. Have questions? Here are the 3 most common ones I get — and my honest answers: {q1 + a1} | {q2 + a2} | {q3 + a3}', useCase: 'FAQ PS. Handles last-minute hesitations right at the decision point.', tags: ['faq', 'questions', 'objections'] },
  { id: 'ps10', category: 'ps', text: 'P.S. Everything I promised in this letter is backed by my {guarantee_name} guarantee. If it doesn\'t deliver, you pay nothing. You literally cannot lose.', useCase: 'Guarantee re-emphasis PS. Risk reversal at final decision point.', tags: ['guarantee', 'risk-free', 'final'] },
];

// ─── Category Config ─────────────────────────────────────────────────────────

const CATEGORIES: { value: CopyCategory; label: string; icon: string; count: number }[] = [
  { value: 'headlines', label: 'Headlines', icon: '📰', count: TEMPLATES.filter(t => t.category === 'headlines').length },
  { value: 'hooks', label: 'Opening Hooks', icon: '🎣', count: TEMPLATES.filter(t => t.category === 'hooks').length },
  { value: 'bullets', label: 'Bullet Points', icon: '•', count: TEMPLATES.filter(t => t.category === 'bullets').length },
  { value: 'ctas', label: 'CTAs', icon: '👆', count: TEMPLATES.filter(t => t.category === 'ctas').length },
  { value: 'testimonials', label: 'Testimonials', icon: '💬', count: TEMPLATES.filter(t => t.category === 'testimonials').length },
  { value: 'objections', label: 'Objection Handlers', icon: '🛡️', count: TEMPLATES.filter(t => t.category === 'objections').length },
  { value: 'guarantees', label: 'Guarantees', icon: '✅', count: TEMPLATES.filter(t => t.category === 'guarantees').length },
  { value: 'urgency', label: 'Urgency/Scarcity', icon: '⏰', count: TEMPLATES.filter(t => t.category === 'urgency').length },
  { value: 'price', label: 'Price Justification', icon: '💰', count: TEMPLATES.filter(t => t.category === 'price').length },
  { value: 'ps', label: 'PS Lines', icon: '📝', count: TEMPLATES.filter(t => t.category === 'ps').length },
];

// ─── Token Extractor ─────────────────────────────────────────────────────────

function extractTokens(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) ?? [];
  return [...new Set(matches.map(m => m.slice(1, -1)))];
}

function replaceTokens(text: string, values: Record<string, string>): string {
  return text.replace(/\{([^}]+)\}/g, (_, key) => values[key] ?? `{${key}}`);
}

function highlightTokens(text: string): React.ReactNode {
  const parts = text.split(/(\{[^}]+\})/g);
  return parts.map((part, i) =>
    part.startsWith('{') ? (
      <mark key={i} className="bg-green-100 text-green-800 rounded px-0.5 not-italic font-semibold">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// ─── Template Card ───────────────────────────────────────────────────────────

function TemplateCard({
  template,
  isSelected,
  onFillIn,
}: {
  template: CopyTemplate;
  isSelected: boolean;
  onFillIn: (template: CopyTemplate) => void;
}) {
  const { toggleFavorite, isFavorite } = useCopyVaultStore();
  const { user } = useUserStore();
  const { getContextString } = useContextStore();
  const [copied, setCopied] = useState(false);
  const [generatingVariations, setGeneratingVariations] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const fav = isFavorite(template.id);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(template.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleVariations = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!resolveApiKey(user.anthropicApiKey)) {
      // Static fallback: generate simple variations
      const staticVariations = [
        template.text.replace(/\{(\w+)\}/g, '[Your $1]'),
        `ALTERNATIVE: ${template.text}`,
        `VARIATION: ${template.text}`,
      ];
      setVariations(staticVariations);
      return;
    }

    setGeneratingVariations(true);
    const toastId = toast.loading('Generating AI variations…');
    try {
      const client = getAnthropicClient(resolveApiKey(user.anthropicApiKey));
      const contextString = getContextString();

      const response = await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: 'You are Dan Kennedy, Gary Halbert, and Alex Hormozi combined — the world\'s best direct response copywriter.',
        messages: [
          {
            role: 'user',
            content: `Create 3 powerful variations of this copy template:
Original: ${template.text}
Category: ${template.category}
Use Case: ${template.useCase}

Business Context:
${contextString}

Return ONLY a JSON array of 3 strings. Each variation must be different in approach (emotional, logical, urgency-based) but achieve the same goal. Use {token} placeholders where appropriate.`,
          },
        ],
      });

      const raw = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found in response');

      const parsed = JSON.parse(jsonMatch[0]) as string[];
      setVariations(parsed.slice(0, 3));
      toast.success('3 AI variations generated!', { id: toastId });
    } catch (err) {
      console.error('AI variations failed:', err);
      toast.warning('AI generation failed — showing static variations.', { id: toastId });
      setVariations([
        template.text.replace(/\{(\w+)\}/g, '[Your $1]'),
        `VARIATION 2: ${template.text}`,
        `VARIATION 3: ${template.text}`,
      ]);
    } finally {
      setGeneratingVariations(false);
    }
  };

  const tokenCount = extractTokens(template.text).length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={cn(
        'group bg-white/90 border rounded-xl shadow-sm p-4 flex flex-col gap-3 cursor-pointer transition-all hover:shadow-md',
        isSelected
          ? 'border-[hsl(160_40%_25%)] ring-1 ring-[hsl(160_40%_25%)/20%]'
          : 'border-border/70 hover:border-border/90'
      )}
      onClick={() => onFillIn(template)}
    >
      <div className="text-sm leading-relaxed">
        {highlightTokens(template.text)}
      </div>

      <p className="text-xs text-muted-foreground">{template.useCase}</p>

      <div className="flex flex-wrap gap-1">
        {template.tags.slice(0, 4).map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
            {tag}
          </Badge>
        ))}
      </div>

      {variations.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-border/30" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-violet-500" />
            <span className="text-xs font-semibold text-violet-700">AI Variations</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 ml-auto"
              onClick={(e) => { e.stopPropagation(); setVariations([]); }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          {variations.map((v, i) => (
            <div key={i} className="bg-violet-50 border border-violet-100 rounded-lg p-2 text-xs leading-relaxed text-foreground">
              {v}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 pt-1 border-t border-border/40">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Quick Copy'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1 text-violet-700 border-violet-200 hover:bg-violet-50"
          disabled={generatingVariations}
          onClick={handleVariations}
        >
          {generatingVariations ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
              <Sparkles className="w-3 h-3" />
            </motion.div>
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          Variations
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <span className={cn(
            'text-xs font-medium transition-colors',
            isSelected ? 'text-[hsl(160_40%_25%)]' : 'text-muted-foreground group-hover:text-[hsl(160_40%_25%)]'
          )}>
            {isSelected ? 'Editing →' : 'Copy & Fill →'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 w-7 p-0', fav && 'text-amber-500')}
            onClick={(e) => { e.stopPropagation(); toggleFavorite(template.id); }}
          >
            <Star className={cn('w-3.5 h-3.5', fav && 'fill-current')} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Fill-In Tool ─────────────────────────────────────────────────────────────

function FillInPanel({
  initialTemplate,
  onClose,
}: {
  initialTemplate: CopyTemplate | null;
  onClose: () => void;
}) {
  const { user } = useUserStore();
  const { getContextString } = useContextStore();
  const [customText, setCustomText] = useState(initialTemplate?.text ?? '');
  const [tokenValues, setTokenValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [polishedText, setPolishedText] = useState('');
  const [copiedPolished, setCopiedPolished] = useState(false);

  const tokens = useMemo(() => extractTokens(customText), [customText]);
  const filled = useMemo(() => replaceTokens(customText, tokenValues), [customText, tokenValues]);

  const hasUnfilled = tokens.some((t) => !tokenValues[t]);

  const handleCopyFilled = async () => {
    await navigator.clipboard.writeText(filled);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePolish = async () => {
    if (!user.anthropicApiKey || !filled.trim()) return;
    setPolishing(true);
    setPolishedText('');
    const toastId = toast.loading('Polishing with Claude AI…');
    try {
      const client = getAnthropicClient(resolveApiKey(user.anthropicApiKey));
      const contextString = getContextString();
      const response = await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: `Refine this copy to be more compelling and punchy. Keep the same structure and all filled-in values. Return ONLY the improved copy text.

Copy:
${filled}

Business Context:
${contextString}`,
          },
        ],
      });
      const polished = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
      setPolishedText(polished);
      toast.success('Copy polished with AI!', { id: toastId });
    } catch (err) {
      console.error('AI polish failed:', err);
      toast.error('AI polish failed. Try again.', { id: toastId });
    } finally {
      setPolishing(false);
    }
  };

  const handleCopyPolished = async () => {
    await navigator.clipboard.writeText(polishedText);
    setCopiedPolished(true);
    setTimeout(() => setCopiedPolished(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base">Fill-In Tool</h3>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div>
        <Label className="text-xs font-semibold mb-1.5 block">Template Text</Label>
        <Textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Paste any template with {tokens} here..."
          rows={4}
          className="text-sm resize-none font-mono"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use {'{token_name}'} format. Detected {tokens.length} token{tokens.length !== 1 ? 's' : ''}.
        </p>
      </div>

      {tokens.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold block">Fill In Tokens</Label>
          {tokens.map((token) => (
            <div key={token}>
              <Label htmlFor={`token-${token}`} className="text-xs text-muted-foreground mb-0.5 block">
                {token.replace(/_/g, ' ')}
              </Label>
              <Input
                id={`token-${token}`}
                value={tokenValues[token] ?? ''}
                onChange={(e) => setTokenValues((prev) => ({ ...prev, [token]: e.target.value }))}
                placeholder={`Enter ${token.replace(/_/g, ' ')}...`}
                className="text-sm h-8"
              />
            </div>
          ))}
        </div>
      )}

      {customText && (
        <div className="flex-1 flex flex-col gap-2">
          <Label className="text-xs font-semibold mb-0.5 block">Live Preview</Label>
          <div className="bg-muted/20 border border-border/40 rounded-lg p-3 text-sm leading-relaxed min-h-[80px]">
            {hasUnfilled ? highlightTokens(filled) : filled}
          </div>
          <Button
            className="w-full gap-2 bg-[hsl(160_40%_12%)] hover:bg-[hsl(160_40%_16%)] text-white"
            size="sm"
            onClick={handleCopyFilled}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Completed Copy'}
          </Button>
          {user.anthropicApiKey && !hasUnfilled && filled.trim() && (
            <Button
              variant="outline"
              className="w-full gap-2 border-violet-200 text-violet-700 hover:bg-violet-50"
              size="sm"
              disabled={polishing}
              onClick={handlePolish}
            >
              {polishing ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
                  <Sparkles className="w-3.5 h-3.5" />
                </motion.div>
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {polishing ? 'Polishing…' : '✨ Polish with AI'}
            </Button>
          )}
          {polishedText && (
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-violet-500" />
                <Label className="text-xs font-semibold text-violet-700">AI-Polished Version</Label>
              </div>
              <div className="bg-violet-50 border border-violet-100 rounded-lg p-3 text-sm leading-relaxed">
                {polishedText}
              </div>
              <Button
                className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                size="sm"
                onClick={handleCopyPolished}
              >
                {copiedPolished ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPolished ? 'Copied!' : 'Copy Polished Copy'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CopyVaultPage() {
  const { favorites } = useCopyVaultStore();

  const [activeCategory, setActiveCategory] = useState<CopyCategory | 'favorites'>('headlines');
  const [search, setSearch] = useState('');
  const [fillInTemplate, setFillInTemplate] = useState<CopyTemplate | null>(null);

  const handleFillIn = useCallback((template: CopyTemplate) => {
    setFillInTemplate((prev) => prev?.id === template.id ? null : template);
  }, []);

  const filteredTemplates = useMemo(() => {
    let list = activeCategory === 'favorites'
      ? TEMPLATES.filter((t) => favorites.includes(t.id))
      : TEMPLATES.filter((t) => t.category === activeCategory);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.text.toLowerCase().includes(q) ||
          t.useCase.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.includes(q))
      );
    }

    return list;
  }, [activeCategory, search, favorites]);

  const catMeta = CATEGORIES.find((c) => c.value === activeCategory);

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Copy Vault</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Proven copy templates from the world's top copywriters. Swipe, fill, and convert.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_320px] gap-4 sm:gap-6">
          {/* ── Sidebar Navigation ── */}
          <div className="flex flex-col gap-1.5">
            <div className="bg-white/90 border border-border/70 rounded-xl shadow-sm p-2">
              {/* Favorites */}
              <button
                type="button"
                onClick={() => setActiveCategory('favorites')}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all',
                  activeCategory === 'favorites'
                    ? 'bg-amber-50 text-amber-700 font-semibold border border-amber-200'
                    : 'hover:bg-muted/40 text-foreground'
                )}
              >
                <span className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5" />
                  Favorites
                </span>
                <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                  {favorites.length}
                </Badge>
              </button>

              <div className="h-px bg-border/40 my-2" />

              {/* Categories */}
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setActiveCategory(cat.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all',
                    activeCategory === cat.value
                      ? 'bg-[hsl(160_40%_12%)] text-white font-semibold'
                      : 'hover:bg-muted/40 text-foreground'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base leading-none">{cat.icon}</span>
                    <span className="text-xs">{cat.label}</span>
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs px-1.5 py-0 h-5',
                      activeCategory === cat.value && 'bg-white/20 text-white border-white/30'
                    )}
                  >
                    {cat.count}
                  </Badge>
                </button>
              ))}
            </div>

          </div>

          {/* ── Main Content ── */}
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates, use cases, tags..."
                className="pl-9 bg-white/90"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearch('')}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* Category header */}
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-base">
                {activeCategory === 'favorites'
                  ? 'Favorites'
                  : catMeta?.label ?? activeCategory}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Templates grid */}
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <AnimatePresence mode="popLayout">
                  {filteredTemplates.map((template, i) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <TemplateCard
                        template={template}
                        isSelected={fillInTemplate?.id === template.id}
                        onFillIn={handleFillIn}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="bg-white/90 border border-border/70 rounded-xl shadow-sm flex flex-col items-center justify-center py-16 gap-3">
                <BookOpen className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium">
                  {activeCategory === 'favorites' ? 'No favorites yet' : 'No templates found'}
                </p>
                <p className="text-xs text-muted-foreground/60">
                  {activeCategory === 'favorites'
                    ? 'Star templates to save them here'
                    : 'Try a different search term'}
                </p>
              </div>
            )}
          </div>

          {/* ── Fill-In Panel ── */}
          <AnimatePresence mode="wait">
            {fillInTemplate ? (
              <motion.div
                key={fillInTemplate.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.18 }}
                className="bg-white/90 border border-border/70 rounded-xl shadow-sm p-4 self-start sticky top-6"
              >
                <FillInPanel
                  initialTemplate={fillInTemplate}
                  onClose={() => setFillInTemplate(null)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/90 border border-border/70 rounded-xl shadow-sm p-6 self-start sticky top-6 flex flex-col items-center justify-center text-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
                  <Type className="w-5 h-5 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground/60">Fill-In Tool</p>
                  <p className="text-xs text-muted-foreground/50 mt-1 leading-relaxed">
                    Click any template card to open the fill-in tool and customize it with your details.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
