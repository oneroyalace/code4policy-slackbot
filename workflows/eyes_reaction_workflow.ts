import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { HandleEyesReactionDefinition } from "../functions/handle_eyes_reaction.ts";

const EyesReactionWorkflow = DefineWorkflow({
  callback_id: "eyes_reaction_workflow",
  title: "Handle :eyes: on ticket",
  description: "Updates SupportTicket.issue_status when an instructor reacts with :eyes: on a ticket root.",
  input_parameters: {
    properties: {
      user: { type: Schema.slack.types.user_id },
      channel: { type: Schema.slack.types.channel_id },
      message_ts: { type: Schema.types.string },
    },
    required: ["reactor_user_id", "channel_id", "message_ts"],
  },
});

EyesReactionWorkflow.addStep(HandleEyesReactionDefinition, {
  reactor_user_id: EyesReactionWorkflow.inputs.user,
  channel_id: EyesReactionWorkflow.inputs.channel,
  message_ts: EyesReactionWorkflow.inputs.message_ts,
});

export default EyesReactionWorkflow;
