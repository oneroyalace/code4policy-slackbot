import type { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import SupportTicketWorkflow from "../workflows/support_ticket_workflow.ts";
/**
 * Triggers determine when workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/automation/triggers
 */
const supportTicketTrigger: Trigger<typeof supportTicketWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Support ticket trigger",
  description: "Trigger for support ticket",
  workflow: `#/workflows/${SupportTicketWorkflow.definition.callback_id}`,
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

export default supportTicketTrigger;
