import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { ShowTicketsFunctionDefinition } from "../functions/show_tickets_function.ts";

const ShowTicketsWorkflow = DefineWorkflow({
  callback_id: "show_tickets_workflow",
  title: "Show open tickets",
  description: "Display all open support tickets",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
      user: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["interactivity", "channel", "user"],
  },
});

ShowTicketsWorkflow.addStep(ShowTicketsFunctionDefinition, {
  channel_id: ShowTicketsWorkflow.inputs.channel,
  user_id: ShowTicketsWorkflow.inputs.user,
});

export default ShowTicketsWorkflow;
