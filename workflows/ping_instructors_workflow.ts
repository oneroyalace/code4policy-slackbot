import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { PingInstructorsFunctionDefinition } from "../functions/ping_instructors_function.ts";

/**
 * Workflow that pings instructors when the bot is mentioned with "ping"
 */
const PingInstructorsWorkflow = DefineWorkflow({
  callback_id: "ping_instructors_workflow",
  title: "Ping instructors",
  description: "Pings instructors when bot is mentioned with 'ping'",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["channel"],
  },
});

// Call the custom function to ping instructors
PingInstructorsWorkflow.addStep(PingInstructorsFunctionDefinition, {
  channel_id: PingInstructorsWorkflow.inputs.channel,
});

export default PingInstructorsWorkflow;
