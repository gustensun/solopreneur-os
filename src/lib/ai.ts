import Anthropic from '@anthropic-ai/sdk';

// App-level key set via Vercel env var (VITE_ANTHROPIC_API_KEY).
// Falls back to the per-user key stored in settings.
export const APP_API_KEY: string =
  (import.meta.env.VITE_ANTHROPIC_API_KEY as string) ?? '';

/**
 * Returns the effective API key: app-level key takes priority,
 * then the user's own key from Settings.
 */
export function resolveApiKey(userKey: string): string {
  return APP_API_KEY || userKey;
}

export function getAnthropicClient(apiKey: string): Anthropic {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

// Maps our model names to Anthropic model IDs
export function resolveModelId(model: string): string {
  const map: Record<string, string> = {
    'claude-opus': 'claude-opus-4-5',
    'claude-sonnet': 'claude-sonnet-4-5',
    'claude-haiku': 'claude-haiku-3-5',
  };
  return map[model] ?? 'claude-sonnet-4-5';
}
