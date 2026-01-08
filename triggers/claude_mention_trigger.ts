import type { Trigger } from "deno-slack-api/types.ts";
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
    all_resources: true,
    filter: {
      version: 1,
      root: {
        statement: "{{data.text}} NOT CONTAINS ping",
      },
    },
  },
  inputs: {
    channel: {
      value: "{{data.channel_id}}",
    },
  }
};

export default ClaudeMentionTrigger;

