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
      // event: {type: Schema.types.object },
      channel: { type: Schema.slack.types.channel_id },
      message_ts: { type: Schema.types.string },
      user_text: { type: Schema.types.string },
    },
    required: [] //["channel", "message_ts"],
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
    const channel_id = inputs.channel
    let message_ts = inputs.message_ts
    const user_text = inputs.user_text
    console.log(channel_id)
    console.log(message_ts)
    console.log(user_text)

    console.log("in function")

    // If message_ts not provided, find the latest app mention in the channel
    if (!message_ts) {
      console.log("message_ts not provided, searching for recent bot mention")

      // First, get our bot's user ID
      const authTest = await client.auth.test();
      if (!authTest.ok) {
        return { error: `Failed to get bot user ID: ${authTest.error}` };
      }
      const botUserId = authTest.user_id;
      console.log(`Bot user ID: ${botUserId}`);

      // Get recent channel messages
      const history = await client.conversations.history({
        channel: channel_id,
        limit: 50,
      });

      if (!history.ok) {
        return { error: `Failed to read channel history: ${history.error}` };
      }

      // Look in both channel messages AND thread replies
      const allMessagesToCheck: any[] = [];

      // Add channel messages
      if (history.messages) {
        allMessagesToCheck.push(...history.messages);

        // For each message with replies, fetch the thread
        for (const msg of history.messages) {
          if (msg.reply_count && msg.reply_count > 0) {
            const threadReplies = await client.conversations.replies({
              channel: channel_id,
              ts: msg.ts,
              limit: 50,
            });
            if (threadReplies.ok && threadReplies.messages) {
              // Skip the first message (it's the root, already in allMessagesToCheck)
              allMessagesToCheck.push(...threadReplies.messages.slice(1));
            }
          }
        }
      }

      // Sort all messages by timestamp, newest first
      allMessagesToCheck.sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts));

      console.log(`Searching ${allMessagesToCheck.length} messages for bot mention (sorted by timestamp)`);

      // Find the most recent HUMAN message that mentions the bot
      const mentionMessage = allMessagesToCheck.find((msg: any) => {
        const isHumanMessage = !msg.bot_id && msg.subtype !== "bot_message";
        const mentionsBot = msg.text?.includes(`<@${botUserId}>`);
        console.log(`Checking message ${msg.ts}: human=${isHumanMessage}, mentions=${mentionsBot}, text="${msg.text?.substring(0, 50)}"`);
        return isHumanMessage && mentionsBot;
      });

      if (!mentionMessage) {
        return { error: `Could not find a recent bot mention. Bot ID: ${botUserId}, searched ${allMessagesToCheck.length} messages` };
      }

      // If the mention is in a thread, use the thread root timestamp
      // Otherwise use the mention message timestamp
      message_ts = (mentionMessage as any).thread_ts || mentionMessage.ts;
      console.log(`Found bot mention at ${mentionMessage.ts}, thread_ts: ${(mentionMessage as any).thread_ts}, using thread root ${message_ts}`);

      // Check if the message contains "ping" - if so, skip processing (let ping workflow handle it)
      if (mentionMessage.text?.toLowerCase().includes("ping")) {
        console.log("Message contains 'ping', skipping Claude processing");
        return { outputs: { claudeReply: "Ping workflow will handle this." } };
      }
    }

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

    // Check if the most recent user message contains "ping" - if so, skip Claude processing
    const recentUserMessages = (replies.messages ?? []).filter((m: any) => {
      return !m.bot_id && m.subtype !== "bot_message";
    });
    if (recentUserMessages.length > 0) {
      const lastUserMessage = recentUserMessages[recentUserMessages.length - 1];
      if (lastUserMessage.text?.toLowerCase().includes("ping")) {
        console.log("Recent message contains 'ping', skipping Claude processing");
        return { outputs: { claudeReply: "Ping workflow will handle this." } };
      }
    }

    // 2) Convert Slack messages to Claude messages
    // Keep it simple: treat all human messages as "user" and bot outputs as "assistant"
    const threadMessages = (replies.messages ?? []).map((m: any) => {
      const isBot = Boolean(m.bot_id) || m.subtype === "bot_message";
      let content = (m.text ?? "").trim();

      // Strip out bot mentions from the content
      content = content.replace(/<@[A-Z0-9]+>/g, "").trim();

      return {
        role: (isBot ? "assistant" : "user") as "assistant" | "user",
        content: content,
      };
    }).filter((m) => m.content.length > 0);

    // Optional: append the new user_text if you’re triggering off a message that
    // doesn’t include the final desired prompt.
    if (user_text?.trim()) {
      threadMessages.push({ role: "user", content: user_text.trim() });
    }

    // 3) Call Claude
    const apiKey = env["ANTHROPIC_API_KEY"];
    const model = env["CLAUDE_MODEL"];

    console.log("Calling Claude with messages:", JSON.stringify(threadMessages, null, 2));

    const result = await callClaude({
      apiKey,
      model,
      maxTokens: 800,
      messages: threadMessages,
    });

    console.log("Claude response:", JSON.stringify(result, null, 2));

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


