// functions/claude_reply.ts
import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { callClaude } from "../lib/claude.ts";

import { load } from "jsr:@std/dotenv";

const env = await load({
  // optional: choose a specific path (defaults to ".env")
  envPath: ".env",
  // optional: also export to the process environment (so Deno.env can read it)
  export: true,
});


export const ClaudeReplyFunctionDefinition = DefineFunction({
  callback_id: "claude_reply_function",
  title: "ClaudeReply function",
  description: "A claude_reply function",
  source_file: "functions/claude_reply_function.ts",
  input_parameters: {
    properties: {
      channel: { type: Schema.slack.types.channel_id },
      message_ts: { type: Schema.types.string },
      user_text: { type: Schema.types.string },
    },
    required: ["channel", "message_ts"],
  },
  output_parameters: {
    properties: {
      claudeReply: {
        type: Schema.types.string,
        description: "Claude's reply",
      },
    },
    required: ["claudeReply"],
  },
});

/**
 * SlackFunction takes in two arguments: the CustomFunction
 * definition (see above), as well as a function that contains
 * handler logic that's run when the function is executed.
 * https://api.slack.com/automation/functions/custom
 */
export default SlackFunction(
  ClaudeReplyFunctionDefinition,
  async ({ inputs, client, env }) => {
    console.log(inputs)
    // const { channel_id, message_ts, user_text } = inputs;
    const channel_id = inputs.channel
    const message_ts = inputs.message_ts
    const user_text = inputs.user_text
    console.log(channel_id)
    console.log(message_ts)
    console.log(user_text)

    console.log("in function")
    // 1) Pull thread context
    const replies = await client.conversations.replies({
      channel: channel_id,
      ts: message_ts,
      limit: 50,
    });

    if (!replies.ok) {
      return { error: `Failed to read thread: ${replies.error}` };
    }
    else {
      console.log("read thread")
      console.log(replies)
    }

    // 2) Convert Slack messages to Claude messages
    // Keep it simple: treat all human messages as "user" and bot outputs as "assistant"
    const threadMessages = (replies.messages ?? []).map((m) => {
      const isBot = Boolean((m as any).bot_id) || m.subtype === "bot_message";
      return {
        role: (isBot ? "assistant" : "user") as "assistant" | "user",
        content: (m.text ?? "").trim(),
      };
    }).filter((m) => m.content.length > 0);

    // Optional: append the new user_text if you’re triggering off a message that
    // doesn’t include the final desired prompt.
    if (user_text?.trim()) {
      threadMessages.push({ role: "user", content: user_text.trim() });
    }

    // 3) Call Claude
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    const model = env.CLAUDE_MODEL ?? "claude-sonnet-4-20250514";
    const result = await callClaude({
      apiKey,
      model,
      maxTokens: 800,
      messages: threadMessages,
    });

    const text =
      result?.content?.find?.((b: any) => b.type === "text")?.text ??
      "(No text content returned)";

    // 4) Reply in thread
    const post = await client.chat.postMessage({
      channel: channel_id,
      thread_ts: message_ts,
      text,
    });

    if (!post.ok) {
      return { error: `Failed to post: ${post.error}` };
    }

    return { outputs: { claudeReply: text } };
  },
);


