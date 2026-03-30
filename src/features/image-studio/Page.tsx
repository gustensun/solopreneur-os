import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Copy,
  RefreshCw,
  Trash2,
  Sparkles,
  Image as ImageIcon,
  LayoutGrid,
  BookImage,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn, generateId } from '@/lib/utils';
import { useImageStudioStore } from '@/stores/imageStudio';

// ─── Types ──────────────────────────────────────────────────────────────────

type Platform = 'facebook' | 'instagram' | 'linkedin' | 'twitter';
type CampaignGoal = 'awareness' | 'lead-gen' | 'sales' | 'retargeting';
type VisualStyle =
  | 'photorealistic'
  | 'minimalist'
  | 'bold-vibrant'
  | 'dark-premium'
  | 'lifestyle'
  | 'professional'
  | 'artistic'
  | 'neon-cyber';
type CarouselTheme = 'educational' | 'storytelling' | 'list-tips' | 'before-after' | 'case-study';
type SlideCount = 3 | 5 | 7 | 10;

interface AdOptions {
  platform: Platform;
  goal: CampaignGoal;
  style: VisualStyle;
  description: string;
  addTextSpace: boolean;
  brandedColors: boolean;
  highContrast: boolean;
  negativePrompt: string;
}

interface ImageState {
  url: string | null;
  loading: boolean;
  error: boolean;
  prompt: string;
}

interface CarouselSlide {
  id: string;
  imageState: ImageState;
  index: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const PLATFORMS: { value: Platform; label: string; width: number; height: number; displayW: number; displayH: number }[] = [
  { value: 'facebook', label: 'Facebook Ad', width: 1200, height: 628, displayW: 1200, displayH: 628 },
  { value: 'instagram', label: 'Instagram Ad', width: 1080, height: 1350, displayW: 864, displayH: 1080 },
  { value: 'linkedin', label: 'LinkedIn Ad', width: 1200, height: 628, displayW: 1200, displayH: 628 },
  { value: 'twitter', label: 'Twitter/X Ad', width: 1200, height: 675, displayW: 1200, displayH: 675 },
];

const CAMPAIGN_GOALS: { value: CampaignGoal; label: string }[] = [
  { value: 'awareness', label: 'Awareness' },
  { value: 'lead-gen', label: 'Lead Generation' },
  { value: 'sales', label: 'Sales' },
  { value: 'retargeting', label: 'Retargeting' },
];

const VISUAL_STYLES: { value: VisualStyle; label: string; emoji: string }[] = [
  { value: 'photorealistic', label: 'Photorealistic', emoji: '📸' },
  { value: 'minimalist', label: 'Minimalist', emoji: '◻' },
  { value: 'bold-vibrant', label: 'Bold & Vibrant', emoji: '🎨' },
  { value: 'dark-premium', label: 'Dark & Premium', emoji: '🖤' },
  { value: 'lifestyle', label: 'Lifestyle', emoji: '🌿' },
  { value: 'professional', label: 'Professional', emoji: '💼' },
  { value: 'artistic', label: 'Artistic', emoji: '🎭' },
  { value: 'neon-cyber', label: 'Neon/Cyber', emoji: '⚡' },
];

const CAROUSEL_THEMES: { value: CarouselTheme; label: string }[] = [
  { value: 'educational', label: 'Educational' },
  { value: 'storytelling', label: 'Storytelling' },
  { value: 'list-tips', label: 'List / Tips' },
  { value: 'before-after', label: 'Before & After' },
  { value: 'case-study', label: 'Case Study' },
];

const SLIDE_COUNTS: SlideCount[] = [3, 5, 7, 10];

const STYLE_PROMPT_MAP: Record<VisualStyle, string> = {
  photorealistic: 'photorealistic commercial photography, ultra detailed, natural lighting',
  minimalist: 'clean minimalist design, lots of white space, simple elegant composition',
  'bold-vibrant': 'bold vibrant colors, high saturation, dynamic composition, eye-catching',
  'dark-premium': 'dark luxury aesthetic, deep shadows, premium feel, sophisticated',
  lifestyle: 'lifestyle photography, authentic candid feel, warm natural tones',
  professional: 'professional corporate style, clean polished look, business aesthetic',
  artistic: 'artistic creative composition, unique visual style, expressive',
  'neon-cyber': 'neon cyberpunk aesthetic, glowing neon lights, futuristic tech vibes',
};

const GOAL_PROMPT_MAP: Record<CampaignGoal, string> = {
  awareness: 'brand awareness campaign, memorable visual impact',
  'lead-gen': 'lead generation ad, compelling call to action visual',
  sales: 'direct response sales ad, product showcase, conversion focused',
  retargeting: 'retargeting campaign, familiarity and trust visual',
};

// ─── Utility Functions ───────────────────────────────────────────────────────

function buildAdPrompt(options: AdOptions): string {
  const { platform, goal, style, description, addTextSpace, brandedColors, highContrast } = options;

  const platformLabel = PLATFORMS.find((p) => p.value === platform)?.label ?? platform;
  const styleDesc = STYLE_PROMPT_MAP[style];
  const goalDesc = GOAL_PROMPT_MAP[goal];

  const parts = [
    `professional ${style.replace(/-/g, ' ')} advertisement`,
    `${goalDesc}`,
    description,
    `${platformLabel} format`,
    styleDesc,
    'high quality commercial photography',
    'sharp focus',
    '8k resolution',
  ];

  if (addTextSpace) parts.push('clear space for text overlay, negative space');
  if (brandedColors) parts.push('cohesive brand color palette');
  if (highContrast) parts.push('high contrast, strong visual hierarchy');

  return parts.filter(Boolean).join(', ');
}

function buildCarouselSlidePrompt(
  slideIndex: number,
  totalSlides: number,
  theme: CarouselTheme,
  hookPrompt: string,
  contentDescription: string,
  style: VisualStyle
): string {
  const styleDesc = STYLE_PROMPT_MAP[style];
  const isFirst = slideIndex === 0;
  const isLast = slideIndex === totalSlides - 1;

  const themeContext =
    theme === 'educational'
      ? 'educational infographic style'
      : theme === 'storytelling'
      ? 'narrative storytelling visual'
      : theme === 'list-tips'
      ? 'tips and list visual'
      : theme === 'before-after'
      ? slideIndex < totalSlides / 2 ? 'before state visual' : 'after transformation visual'
      : 'case study result visual';

  const slideContext = isFirst
    ? `hook slide: ${hookPrompt}`
    : isLast
    ? `conclusion call-to-action slide, ${contentDescription}`
    : `slide ${slideIndex + 1} of ${totalSlides}, ${contentDescription}`;

  return [
    `Instagram carousel slide`,
    themeContext,
    slideContext,
    styleDesc,
    'square format 1:1',
    'cohesive visual series',
    'high quality',
  ]
    .filter(Boolean)
    .join(', ');
}

function buildImageUrl(prompt: string, width: number, height: number): string {
  const seed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&model=flux&seed=${seed}&nologo=true`;
}

async function downloadImage(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch {
    // Fallback: open in new tab
    window.open(url, '_blank');
  }
}

// ─── Shimmer Skeleton ────────────────────────────────────────────────────────

interface ShimmerProps {
  width: number;
  height: number;
  className?: string;
}

function ShimmerSkeleton({ width, height, className }: ShimmerProps) {
  const aspectRatio = height / width;
  return (
    <div
      className={cn('relative overflow-hidden rounded-lg bg-gray-800', className)}
      style={{ paddingBottom: `${aspectRatio * 100}%` }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
        }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="h-8 w-8 text-emerald-400/60" />
        </motion.div>
        <p className="text-xs text-gray-500">Generating image...</p>
      </div>
    </div>
  );
}

// ─── Image Display ───────────────────────────────────────────────────────────

interface ImageDisplayProps {
  imageState: ImageState;
  displayWidth: number;
  displayHeight: number;
  onRetry: () => void;
  className?: string;
}

function ImageDisplay({ imageState, displayWidth, displayHeight, onRetry, className }: ImageDisplayProps) {
  const aspectRatio = displayHeight / displayWidth;

  if (imageState.loading) {
    return <ShimmerSkeleton width={displayWidth} height={displayHeight} className={className} />;
  }

  if (imageState.error || (!imageState.url && !imageState.loading)) {
    return (
      <div
        className={cn('relative overflow-hidden rounded-lg bg-gray-800 flex items-center justify-center', className)}
        style={{ paddingBottom: `${aspectRatio * 100}%` }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-sm text-gray-400 text-center">Failed to generate — try again</p>
          <Button size="sm" variant="outline" onClick={onRetry} className="text-xs">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!imageState.url) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-lg bg-gray-800/50 border-2 border-dashed border-gray-700 flex items-center justify-center',
          className
        )}
        style={{ paddingBottom: `${aspectRatio * 100}%` }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <ImageIcon className="h-12 w-12 text-gray-600" />
          <p className="text-sm text-gray-500">Your generated image will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden rounded-lg', className)}>
      <img
        src={imageState.url}
        alt="Generated ad creative"
        crossOrigin="anonymous"
        className="w-full h-auto block rounded-lg"
        onError={onRetry}
      />
    </div>
  );
}

// ─── Ad Creative Mode ────────────────────────────────────────────────────────

function AdCreativeMode() {
  const { addImage } = useImageStudioStore();

  const [platform, setPlatform] = useState<Platform>('facebook');
  const [goal, setGoal] = useState<CampaignGoal>('awareness');
  const [style, setStyle] = useState<VisualStyle>('photorealistic');
  const [description, setDescription] = useState(
    'Modern professional workspace with laptop and coffee, productive solopreneur environment'
  );
  const [addTextSpace, setAddTextSpace] = useState(false);
  const [brandedColors, setBrandedColors] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const [mainImage, setMainImage] = useState<ImageState>({ url: null, loading: false, error: false, prompt: '' });
  const [variations, setVariations] = useState<ImageState[]>([
    { url: null, loading: false, error: false, prompt: '' },
    { url: null, loading: false, error: false, prompt: '' },
    { url: null, loading: false, error: false, prompt: '' },
  ]);

  const platformConfig = PLATFORMS.find((p) => p.value === platform)!;

  const generate = useCallback(() => {
    const prompt = buildAdPrompt({ platform, goal, style, description, addTextSpace, brandedColors, highContrast, negativePrompt });

    // Set loading for main + variations
    setMainImage({ url: null, loading: true, error: false, prompt });
    setVariations([
      { url: null, loading: true, error: false, prompt },
      { url: null, loading: true, error: false, prompt },
      { url: null, loading: true, error: false, prompt },
    ]);

    const mainUrl = buildImageUrl(prompt, platformConfig.width, platformConfig.height);
    const varUrls = [
      buildImageUrl(prompt, platformConfig.width, platformConfig.height),
      buildImageUrl(prompt, platformConfig.width, platformConfig.height),
      buildImageUrl(prompt, platformConfig.width, platformConfig.height),
    ];

    // Load main image
    const mainImg = new Image();
    mainImg.crossOrigin = 'anonymous';
    mainImg.onload = () => {
      setMainImage({ url: mainUrl, loading: false, error: false, prompt });
      addImage({ url: mainUrl, prompt, platform, style });
    };
    mainImg.onerror = () => {
      setMainImage({ url: null, loading: false, error: true, prompt });
    };
    mainImg.src = mainUrl;

    // Load variations
    varUrls.forEach((varUrl, i) => {
      const varImg = new Image();
      varImg.crossOrigin = 'anonymous';
      varImg.onload = () => {
        setVariations((prev) => {
          const updated = [...prev];
          updated[i] = { url: varUrl, loading: false, error: false, prompt };
          return updated;
        });
      };
      varImg.onerror = () => {
        setVariations((prev) => {
          const updated = [...prev];
          updated[i] = { url: null, loading: false, error: true, prompt };
          return updated;
        });
      };
      varImg.src = varUrl;
    });
  }, [platform, goal, style, description, addTextSpace, brandedColors, highContrast, negativePrompt, platformConfig, addImage]);

  const handleRetryMain = () => {
    if (mainImage.prompt) {
      const url = buildImageUrl(mainImage.prompt, platformConfig.width, platformConfig.height);
      setMainImage((prev) => ({ ...prev, loading: true, error: false }));
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setMainImage({ url, loading: false, error: false, prompt: mainImage.prompt });
      img.onerror = () => setMainImage((prev) => ({ ...prev, loading: false, error: true }));
      img.src = url;
    }
  };

  const handleCopyPrompt = async () => {
    if (mainImage.prompt) {
      await navigator.clipboard.writeText(mainImage.prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const handleDownload = () => {
    if (mainImage.url) {
      downloadImage(mainImage.url, `ad-creative-${platform}-${Date.now()}.jpg`);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Controls Panel */}
      <div className="lg:w-[380px] flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-semibold text-gray-900">Ad Creative Settings</h2>
          <p className="text-xs text-gray-500 mt-0.5">Configure your ad parameters</p>
        </div>

        <div className="p-5 space-y-5">
          {/* Platform Selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Platform</label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPlatform(p.value)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-xs font-medium border transition-all',
                    platform === p.value
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign Goal */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Campaign Goal</label>
            <Select value={goal} onValueChange={(v) => setGoal(v as CampaignGoal)}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_GOALS.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Visual Style */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Visual Style</label>
            <div className="flex flex-wrap gap-2">
              {VISUAL_STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1',
                    style === s.value
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                  )}
                >
                  <span>{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Prompt */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the scene, product, or concept for your ad..."
              rows={3}
              className="resize-none text-sm bg-white"
            />
          </div>

          {/* Enhancement Toggles */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Enhancements</label>
            {[
              { key: 'addTextSpace', label: 'Add text overlay space', value: addTextSpace, setter: setAddTextSpace },
              { key: 'brandedColors', label: 'Branded colors', value: brandedColors, setter: setBrandedColors },
              { key: 'highContrast', label: 'High contrast', value: highContrast, setter: setHighContrast },
            ].map(({ key, label, value, setter }) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => setter(!value)}
                  className={cn(
                    'w-9 h-5 rounded-full transition-colors relative flex-shrink-0 cursor-pointer',
                    value ? 'bg-emerald-500' : 'bg-gray-200'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                      value ? 'translate-x-4' : 'translate-x-0.5'
                    )}
                  />
                </div>
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{label}</span>
              </label>
            ))}
          </div>

          {/* Negative Prompt */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Negative Prompt
              <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <Textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="What to avoid: blurry, watermark, text..."
              rows={2}
              className="resize-none text-sm bg-white"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={generate}
            disabled={mainImage.loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11"
          >
            {mainImage.loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                </motion.div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Ad Creative
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Output Panel */}
      <div className="flex-1 space-y-5">
        {/* Main Image */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Preview</h3>
            {mainImage.url && (
              <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-200 bg-emerald-50">
                {platformConfig.label} · {platformConfig.width}×{platformConfig.height}
              </Badge>
            )}
          </div>

          <div className="max-w-xl mx-auto">
            <ImageDisplay
              imageState={mainImage}
              displayWidth={platformConfig.displayW}
              displayHeight={platformConfig.displayH}
              onRetry={handleRetryMain}
            />
          </div>

          {/* Action Buttons */}
          <AnimatePresence>
            {mainImage.url && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex flex-wrap gap-2 justify-center"
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                  className="gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyPrompt}
                  className="gap-1.5"
                >
                  {copiedPrompt ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedPrompt ? 'Copied!' : 'Copy Prompt'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generate}
                  className="gap-1.5"
                  disabled={mainImage.loading}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  onClick={() => addImage({ url: mainImage.url!, prompt: mainImage.prompt, platform, style })}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <BookImage className="h-3.5 w-3.5" />
                  Save to Library
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Variations */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">Variations</h3>
          <div className="grid grid-cols-3 gap-3">
            {variations.map((varImg, i) => (
              <div key={i} className="space-y-2">
                <div className="text-xs text-gray-400 text-center">#{i + 1}</div>
                <div className="relative">
                  {varImg.loading ? (
                    <ShimmerSkeleton width={platformConfig.displayW} height={platformConfig.displayH} />
                  ) : varImg.url ? (
                    <div className="relative group rounded-lg overflow-hidden">
                      <img
                        src={varImg.url}
                        alt={`Variation ${i + 1}`}
                        crossOrigin="anonymous"
                        className="w-full h-auto block rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button
                          onClick={() => downloadImage(varImg.url!, `variation-${i + 1}-${Date.now()}.jpg`)}
                          className="p-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
                        >
                          <Download className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    </div>
                  ) : varImg.error ? (
                    <div
                      className="rounded-lg bg-gray-800 flex items-center justify-center"
                      style={{ aspectRatio: `${platformConfig.displayW}/${platformConfig.displayH}` }}
                    >
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                  ) : (
                    <div
                      className="rounded-lg bg-gray-100 border-2 border-dashed border-gray-200"
                      style={{ aspectRatio: `${platformConfig.displayW}/${platformConfig.displayH}` }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Instagram Carousel Mode ─────────────────────────────────────────────────

function CarouselMode() {
  const { addImage } = useImageStudioStore();

  const [slideCount, setSlideCount] = useState<SlideCount>(5);
  const [theme, setTheme] = useState<CarouselTheme>('educational');
  const [hookPrompt, setHookPrompt] = useState('Bold statement that stops the scroll with striking visual');
  const [contentDescription, setContentDescription] = useState('Top tips for productivity as a solopreneur, clean professional look');
  const [style, setStyle] = useState<VisualStyle>('minimalist');
  const [isGenerating, setIsGenerating] = useState(false);

  const [slides, setSlides] = useState<CarouselSlide[]>(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: generateId(),
      imageState: { url: null, loading: false, error: false, prompt: '' },
      index: i,
    }))
  );

  const handleSlideCountChange = (count: SlideCount) => {
    setSlideCount(count);
    setSlides(
      Array.from({ length: count }, (_, i) => ({
        id: generateId(),
        imageState: { url: null, loading: false, error: false, prompt: '' },
        index: i,
      }))
    );
  };

  const generateAllSlides = useCallback(() => {
    setIsGenerating(true);
    const newSlides: CarouselSlide[] = Array.from({ length: slideCount }, (_, i) => ({
      id: generateId(),
      imageState: { url: null, loading: true, error: false, prompt: '' },
      index: i,
    }));
    setSlides(newSlides);

    newSlides.forEach((slide, i) => {
      const prompt = buildCarouselSlidePrompt(i, slideCount, theme, hookPrompt, contentDescription, style);
      const url = buildImageUrl(prompt, 1080, 1080);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setSlides((prev) =>
          prev.map((s) =>
            s.id === slide.id
              ? { ...s, imageState: { url, loading: false, error: false, prompt } }
              : s
          )
        );
        addImage({ url, prompt, platform: 'instagram-carousel', style });
        // Check if all loaded
        setIsGenerating((prev) => {
          if (prev) {
            // Will re-check via slides state
          }
          return prev;
        });
      };
      img.onerror = () => {
        setSlides((prev) =>
          prev.map((s) =>
            s.id === slide.id
              ? { ...s, imageState: { url: null, loading: false, error: true, prompt } }
              : s
          )
        );
      };
      img.src = url;
    });

    // Turn off generating spinner after a reasonable time
    setTimeout(() => setIsGenerating(false), 3000);
  }, [slideCount, theme, hookPrompt, contentDescription, style, addImage]);

  const handleRetrySlide = (slideId: string, prompt: string) => {
    const url = buildImageUrl(prompt, 1080, 1080);
    setSlides((prev) =>
      prev.map((s) =>
        s.id === slideId ? { ...s, imageState: { ...s.imageState, loading: true, error: false } } : s
      )
    );
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setSlides((prev) =>
        prev.map((s) =>
          s.id === slideId ? { ...s, imageState: { url, loading: false, error: false, prompt } } : s
        )
      );
    };
    img.onerror = () => {
      setSlides((prev) =>
        prev.map((s) =>
          s.id === slideId ? { ...s, imageState: { url: null, loading: false, error: true, prompt } } : s
        )
      );
    };
    img.src = url;
  };

  const downloadAll = async () => {
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (slide.imageState.url) {
        await downloadImage(slide.imageState.url, `carousel-slide-${i + 1}.jpg`);
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  };

  const anyGenerated = slides.some((s) => s.imageState.url);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Controls */}
      <div className="lg:w-[380px] flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-semibold text-gray-900">Carousel Settings</h2>
          <p className="text-xs text-gray-500 mt-0.5">Build your Instagram carousel</p>
        </div>

        <div className="p-5 space-y-5">
          {/* Slide Count */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Number of Slides</label>
            <div className="flex gap-2">
              {SLIDE_COUNTS.map((count) => (
                <button
                  key={count}
                  onClick={() => handleSlideCountChange(count)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-semibold border transition-all',
                    slideCount === count
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                  )}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Carousel Theme</label>
            <Select value={theme} onValueChange={(v) => setTheme(v as CarouselTheme)}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAROUSEL_THEMES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hook Prompt */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Hook Slide (Slide 1)</label>
            <Textarea
              value={hookPrompt}
              onChange={(e) => setHookPrompt(e.target.value)}
              placeholder="What should the first slide show? Make it attention-grabbing..."
              rows={2}
              className="resize-none text-sm bg-white"
            />
          </div>

          {/* Content Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Content Description</label>
            <Textarea
              value={contentDescription}
              onChange={(e) => setContentDescription(e.target.value)}
              placeholder="Describe the overall content and story of your carousel..."
              rows={3}
              className="resize-none text-sm bg-white"
            />
          </div>

          {/* Visual Style */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Visual Style</label>
            <div className="flex flex-wrap gap-2">
              {VISUAL_STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1',
                    style === s.value
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                  )}
                >
                  <span>{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateAllSlides}
            disabled={isGenerating}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11"
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                </motion.div>
                Generating {slideCount} Slides...
              </>
            ) : (
              <>
                <LayoutGrid className="h-4 w-4 mr-2" />
                Generate All Slides
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Carousel Output */}
      <div className="flex-1 space-y-4">
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Carousel Preview
              <span className="ml-2 text-sm font-normal text-gray-500">
                {slideCount} slides · 1:1 format
              </span>
            </h3>
            {anyGenerated && (
              <Button size="sm" variant="outline" onClick={downloadAll} className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Download All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {slides.map((slide, i) => (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    {i === 0 ? 'Hook' : i === slides.length - 1 ? 'CTA' : `Slide ${i + 1}`}
                  </span>
                  {slide.imageState.url && (
                    <button
                      onClick={() => downloadImage(slide.imageState.url!, `slide-${i + 1}.jpg`)}
                      className="text-gray-400 hover:text-emerald-600 transition-colors"
                    >
                      <Download className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {slide.imageState.loading ? (
                  <ShimmerSkeleton width={1} height={1} />
                ) : slide.imageState.error ? (
                  <div className="aspect-square rounded-lg bg-gray-800 flex flex-col items-center justify-center gap-2 p-2">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <button
                      onClick={() => handleRetrySlide(slide.id, slide.imageState.prompt)}
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Retry
                    </button>
                  </div>
                ) : slide.imageState.url ? (
                  <div className="relative group rounded-lg overflow-hidden">
                    <img
                      src={slide.imageState.url}
                      alt={`Slide ${i + 1}`}
                      crossOrigin="anonymous"
                      className="w-full aspect-square object-cover rounded-lg"
                      onError={() => handleRetrySlide(slide.id, slide.imageState.prompt)}
                    />
                    <div className="absolute top-1.5 left-1.5">
                      <span className="text-xs font-bold bg-black/60 text-white px-1.5 py-0.5 rounded">
                        {i + 1}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-300">{i + 1}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Library Section ─────────────────────────────────────────────────────────

function LibrarySection() {
  const { images, deleteImage } = useImageStudioStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPrompt = async (id: string, prompt: string) => {
    await navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (images.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-10 text-center">
        <BookImage className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-600">No images yet</h3>
        <p className="text-sm text-gray-400 mt-1">Generated images will be saved here automatically</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Generated Library</h2>
          <p className="text-xs text-gray-500 mt-0.5">{images.length} image{images.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      {/* Masonry Grid */}
      <div
        className="columns-2 sm:columns-3 gap-4 [&>*]:break-inside-avoid [&>*]:mb-4"
      >
        {images.map((img) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm"
          >
            <img
              src={img.url}
              alt={img.prompt}
              crossOrigin="anonymous"
              className="w-full h-auto block"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
              <div className="flex justify-end">
                <button
                  onClick={() => deleteImage(img.id)}
                  className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-white/80 line-clamp-2">{img.prompt}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadImage(img.url, `image-${img.id}.jpg`)}
                    className="flex-1 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs text-white flex items-center justify-center gap-1 transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                  <button
                    onClick={() => handleCopyPrompt(img.id, img.prompt)}
                    className="flex-1 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs text-white flex items-center justify-center gap-1 transition-colors"
                  >
                    {copiedId === img.id ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copiedId === img.id ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] text-white/70 border-white/20 bg-white/10">
                    {img.platform}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] text-white/70 border-white/20 bg-white/10">
                    {img.style}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ImageStudioPage() {
  const [mode, setMode] = useState<'ads' | 'carousel'>('ads');

  return (
    <div className="min-h-screen bg-background">
      {/* Studio Header */}
      <div
        className="px-4 sm:px-6 py-4 sm:py-5"
        style={{ background: 'hsl(var(--forest))' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <ImageIcon className="h-5 w-5 text-emerald-400" />
                </div>
                <h1 className="text-xl font-bold text-white">Image Ad Studio</h1>
              </div>
              <p className="text-sm text-emerald-300/70 mt-1 ml-10">
                Generate professional ad creatives & Instagram carousels with AI
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-white/10 rounded-full p-1 gap-1">
              <button
                onClick={() => setMode('ads')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                  mode === 'ads'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-white/70 hover:text-white'
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Ad Creatives
              </button>
              <button
                onClick={() => setMode('carousel')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                  mode === 'carousel'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-white/70 hover:text-white'
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Instagram Carousel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {mode === 'ads' ? <AdCreativeMode /> : <CarouselMode />}
          </motion.div>
        </AnimatePresence>

        {/* Library Section */}
        <LibrarySection />
      </div>
    </div>
  );
}
