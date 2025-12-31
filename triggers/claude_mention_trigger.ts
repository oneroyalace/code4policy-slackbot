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
      value: "C0A3PFLA9F1",
      // value: TriggerContextData.Event.AppMentioned.channel_id,
    },
    message_ts: {
      value: "1767199732.989619"//TriggerContextData.Event.AppMentioned.message_ts,
    },
    user_text: {
      value: "Please wite me a haiku about high school band programs. Provide no additional output." //TriggerContextData.Event.AppMentioned.Event.user_text,
    },
  }
};

export default ClaudeMentionTrigger;

