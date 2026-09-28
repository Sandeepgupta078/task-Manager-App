// All AI provider logic lives here. Controllers only call summarizeText().

const PROMPT = (text) =>
  `Summarize the following task description in 1-2 short sentences (max 40 words). ` +
  `Keep the key action items. Return only the summary text.\n\nTask description:\n${text}`;

const REQUEST_TIMEOUT_MS = 15000;

const postJson = async (url, body, headers = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const reason = data?.error?.message || res.statusText;
      throw new Error(`AI provider error (${res.status}): ${reason}`);
    }
    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('AI provider took too long to respond');
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

const geminiSummary = async (text) => {
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const data = await postJson(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    { contents: [{ parts: [{ text: PROMPT(text) }] }] },
    { 'x-goog-api-key': process.env.GEMINI_API_KEY }
  );
  return data?.candidates?.[0]?.content?.parts?.[0]?.text;
};

const openAiSummary = async (text) => {
  const data = await postJson(
    'https://api.openai.com/v1/chat/completions',
    {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: PROMPT(text) }],
      max_tokens: 120,
      temperature: 0.3,
    },
    { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
  );
  return data?.choices?.[0]?.message?.content;
};

// Offline fallback: first sentence(s) trimmed to ~30 words.
// Handy for local dev and for reviewers who don't have an API key.
const mockSummary = async (text) => {
  await new Promise((r) => setTimeout(r, 800)); // mimic network delay so the loader is visible
  const clean = text.replace(/\s+/g, ' ').trim();
  const sentences = clean.match(/[^.!?]+[.!?]?/g) || [clean];

  let summary = '';
  for (const s of sentences) {
    if ((summary + s).split(' ').length > 30) break;
    summary += s;
  }
  if (!summary) summary = clean.split(' ').slice(0, 30).join(' ') + '...';
  return summary.trim();
};

const providers = {
  gemini: { fn: geminiSummary, key: 'GEMINI_API_KEY' },
  openai: { fn: openAiSummary, key: 'OPENAI_API_KEY' },
  mock: { fn: mockSummary },
};

const summarizeText = async (text) => {
  const name = (process.env.AI_PROVIDER || 'mock').toLowerCase();
  let provider = providers[name] || providers.mock;

  // no key configured -> fall back to mock instead of crashing
  if (provider.key && !process.env[provider.key]) {
    console.warn(`${provider.key} missing, using mock summary`);
    provider = providers.mock;
  }

  const summary = await provider.fn(text);
  if (!summary || !summary.trim()) {
    throw new Error('AI returned an empty summary');
  }
  return summary.trim();
};

export { summarizeText };
