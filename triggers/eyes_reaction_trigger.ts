import type { Trigger } from "deno-slack-api/types.ts";
import { TriggerContextData, TriggerTypes, TriggerEventTypes} from "deno-slack-api/mod.ts";
import EyesReactionWorkflow from "../workflows/eyes_reaction_workflow.ts";

/**
 * Trigger that executes when someone adds an eyes reaction
 * In another function, we'll check whether the reactor is an instructor
 * And whether they're reacting to a support thread root message
 * If so, we'll update the support thread's status to in_review
 */
const EyesReactionTrigger: Trigger<typeof EyesReactionWorkflow.definition> = {
  type: TriggerTypes.Event,
  name: "Mark a support ticket thread as 'in review'",
  description: "Marks a ticket in_review when an instructor adds :eyes: to the ticket thread root message.",
  workflow: `#/workflows/${EyesReactionWorkflow.definition.callback_id}`,
  event: {
    event_type: TriggerEventTypes.ReactionAdded,
    channel_ids: ["C0A3PFLA9F1"],
    filter: {
      version: 1,
      root: {
        statement: "{{data.reaction}} == 'eyes'"
      }
    },
  },
  inputs: {
    // event: {
    //   value: "{{event}}",
    // },
    user: {
      value: TriggerContextData.Event.ReactionAdded.user_id, 
    },
    message_ts: {
      value: TriggerContextData.Event.ReactionAdded.message_ts,
    },
    channel: {
      value: TriggerContextData.Event.ReactionAdded.channel_id,
    },
  },
};

export default EyesReactionTrigger;

