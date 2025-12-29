import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes, TriggerEventTypes} from "deno-slack-api/mod.ts";
import ClaudeAssistantWorkflow from "../workflows/claude_assistant_workflow.ts";

/**
 * Fires when the app is mentioned in a message.
 * The workflow receives:
 *  - channel_id
 *  - message_ts (the message that mentioned the app)
 *  - thread_ts (root thread ts if present)
 */
const ClaudeMentionTrigger: Trigger<typeof ClaudeAssistantWorkflow.definition> = {
  type: TriggerTypes.Event,
  name: "Claude assistant – app mention",
  description: "Launch Claude when the app is mentioned",
  workflow: `#/workflows/${ClaudeAssistantWorkflow.definition.callback_id}`,
  event: {
    event_type: TriggerEventTypes.AppMentioned,
    channel_ids: ["C0A3PFLA9F1"],
  },
  inputs: {
    channel: {
      value: "{{event.channel_id}}", //TriggerContextData.Event.AppMentioned.Event.channel,
    },
    message_ts: {
      value: "{{event.message_ts}}", //TriggerContextData.Event.AppMentioned.Event.ts,
    },
    thread_ts: {
      value: "{{event.thread_ts}}", //TriggerContextData.Event.AppMentioned.Event.thread_ts,
    },
    // thread_ts: {
    //   // If the mention is already in a thread, use the root.
    //   // Otherwise fall back to the message itself.
    //   value: "{{event.thread_ts}}",
    // },
  },
};

export default ClaudeMentionTrigger;

