import type { Trigger } from "deno-slack-api/types.ts";
import { TriggerTypes, TriggerEventTypes } from "deno-slack-api/mod.ts";
import PingInstructorsWorkflow from "../workflows/ping_instructors_workflow.ts";

/**
 * Event trigger that fires when the bot is mentioned.
 * Users can type "@code4policy-bot ping" to ping instructors in a thread.
 */
const PingInstructorsTrigger: Trigger<typeof PingInstructorsWorkflow.definition> = {
  type: TriggerTypes.Event,
  name: "Ping instructors on app mention",
  description: "Pings instructors when bot is mentioned with 'ping'",
  workflow: `#/workflows/${PingInstructorsWorkflow.definition.callback_id}`,
  event: {
    event_type: TriggerEventTypes.AppMentioned,
    all_resources: true,
    filter: {
      version: 1,
      root: {
        statement: "{{data.text}} CONTAINS ping",
      },
    },
  },
  inputs: {
    channel: {
      value: "{{data.channel_id}}",
    },
  },
};

export default PingInstructorsTrigger;
