// workflows/claude_assistant_workflow.ts
import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { ClaudeReplyFunctionDefinition } from "../functions/claude_reply_function.ts";

/**
 * Workflow: Claude Assistant
 * Inputs: channel_id, message_ts (thread root), optional user_text
 */
const ClaudeAssistantWorkflow = DefineWorkflow({
  callback_id: "claude_assistant_workflow",
  title: "Claude Assistant",
  description: "Reads a thread, calls Claude, and replies in the same thread.",
  input_parameters: {
    properties: {
      channel: { type: Schema.slack.types.channel_id },
      message_ts: { type: Schema.types.string }, // Slack ts like "1712345678.123456"
      user_text: { type: Schema.types.string },
    },
    required: ["channel", "message_ts"],
  },
});

// Step 1: call your function that does thread fetch + Claude + reply
ClaudeAssistantWorkflow.addStep(ClaudeReplyFunctionDefinition, {
  channel: ClaudeAssistantWorkflow.inputs.channel,
  message_ts: ClaudeAssistantWorkflow.inputs.message_ts,
  user_text: ClaudeAssistantWorkflow.inputs.user_text,
});

export default ClaudeAssistantWorkflow;
