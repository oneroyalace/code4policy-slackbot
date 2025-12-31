import type { Trigger } from "deno-slack-api/types.ts";
import { TriggerContextData, TriggerTypes, TriggerEventTypes} from "deno-slack-api/mod.ts";
import CompletedReactionWorkflow from "../workflows/completed_reaction_workflow.ts";

/**
 * Trigger that executes when someone adds a completed (white_check_mark) eaction
 * In another function, we'll check whether they're reacting to a support ticket thread root message
 * And whether they're teh person who created the support ticket thread
 * If so, we'll update the support thread's status to in_review
 */
const CompletedReactionTrigger: Trigger<typeof CompletedReactionWorkflow.definition> = {
  type: TriggerTypes.Event,
  name: "Use :completed: to mark a support ticket thread as 'completed'",
  description: "Marks a ticket as completed when someone adds :completed: to the ticket thread root message",
  workflow: `#/workflows/${CompletedReactionWorkflow.definition.callback_id}`,
  event: {
    event_type: TriggerEventTypes.ReactionAdded,
    channel_ids: ["C0A3PFLA9F1"],

    filter: {
      version: 1,
      root: {
        statement: "{{data.reaction}} == 'white_check_mark'"
      }
    },

  },
  inputs: {
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

export default CompletedReactionTrigger;


