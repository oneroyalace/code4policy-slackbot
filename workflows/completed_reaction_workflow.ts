import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { HandleCompletedReactionDefinition } from "../functions/handle_completed_reaction.ts";

const CompletedReactionWorkflow = DefineWorkflow({
  callback_id: "completed_reaction_workflow",
  title: "Handle :completed: on ticket",
  description: "Updates SupportTicket.issue_status when an instructor reacts with :completed: on a ticket root.",
  input_parameters: {
    properties: {
      user: { type: Schema.slack.types.user_id },
      channel: { type: Schema.slack.types.channel_id },
      message_ts: { type: Schema.types.string },
    },
    required: ["reactor_user_id", "channel_id", "message_ts"],
  },
});

CompletedReactionWorkflow.addStep(HandleCompletedReactionDefinition, {
  reactor_user_id: CompletedReactionWorkflow.inputs.user,
  channel_id: CompletedReactionWorkflow.inputs.channel,
  message_ts: CompletedReactionWorkflow.inputs.message_ts,
});

export default CompletedReactionWorkflow;

