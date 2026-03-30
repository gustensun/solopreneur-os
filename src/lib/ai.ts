import Anthropic from '@anthropic-ai/sdk';

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
