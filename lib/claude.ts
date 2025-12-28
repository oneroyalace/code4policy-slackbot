// lib/claude.ts
export async function callClaude({
  apiKey,
  model,
  maxTokens,
  messages,
}: {
  apiKey: string;
  model: string;
  maxTokens: number;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages,
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Anthropic error ${resp.status}: ${errText}`);
  }

  // Response contains content blocks; commonly you'll want the first text block.
  // Keep this robust because Claude responses can contain multiple blocks.
  return await resp.json();
}

