/** The whole Hanzo integration: one streaming call to /v1/chat/completions.
 *
 *  Config is read at RUNTIME (Settings tab) rather than baked in at build time,
 *  because an EXPO_PUBLIC_* key is compiled into the JS bundle and therefore
 *  published to every user who installs the app. Ship the app, let the user
 *  bring the key.
 */
import { useSyncExternalStore } from 'react';

export type Msg = { role: 'user' | 'assistant' | 'system'; content: string };

const DEFAULT_BASE = 'https://api.hanzo.ai/v1';
const DEFAULT_MODEL = 'zen-omni';

// Minimal observable store — no state library for four fields.
let cfg = { base: DEFAULT_BASE, key: '', model: DEFAULT_MODEL };
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const useConfig = () =>
  useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => cfg,
    () => cfg,
  );

export const setConfig = (patch: Partial<typeof cfg>) => {
  cfg = { ...cfg, ...patch };
  emit();
};

/** Streams the assistant reply, calling `onDelta` with each token chunk.
 *  Falls back to a single non-streamed read when the platform has no
 *  ReadableStream body (older RN fetch polyfills). */
export async function complete(
  messages: Msg[],
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (!cfg.key) throw new Error('No API key. Open Settings and paste a Hanzo key.');

  const res = await fetch(`${cfg.base}/chat/completions`, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.key}` },
    body: JSON.stringify({ model: cfg.model, messages, stream: true }),
  });

  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);

  const reader = (res.body as ReadableStream<Uint8Array> | null)?.getReader?.();
  if (!reader) {
    const json = await res.json();
    onDelta(json.choices?.[0]?.message?.content ?? '');
    return;
  }

  const dec = new TextDecoder();
  let buf = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    // SSE frames are separated by a blank line; a chunk may split one in half.
    const frames = buf.split('\n\n');
    buf = frames.pop() ?? '';
    for (const f of frames) {
      const line = f.split('\n').find((l) => l.startsWith('data:'));
      if (!line) continue;
      const payload = line.slice(5).trim();
      if (payload === '[DONE]') return;
      try {
        onDelta(JSON.parse(payload).choices?.[0]?.delta?.content ?? '');
      } catch {
        /* keep-alive comment or partial frame — skip it */
      }
    }
  }
}
