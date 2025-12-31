import type { Trigger } from "deno-slack-api/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import ShowTicketsWorkflow from "../workflows/show_tickets_workflow.ts";

const ShowTicketsTrigger: Trigger<typeof ShowTicketsWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Show open tickets",
  description: "Display all open support tickets",
  workflow: `#/workflows/${ShowTicketsWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    },
    user: {
      value: TriggerContextData.Shortcut.user_id,
    },
  },
};

export default ShowTicketsTrigger;
