import { Manifest } from "deno-slack-sdk/mod.ts";
import SupportTicketWorkflow from "./workflows/support_ticket_workflow.ts";
import EyesReactionWorkflow from "./workflows/eyes_reaction_workflow.ts";
import CompletedReactionWorkflow from "./workflows/completed_reaction_workflow.ts";
import ClaudeAssistantWorkflow from "./workflows/claude_assistant_workflow.ts";
import ShowTicketsWorkflow from "./workflows/show_tickets_workflow.ts";
// import Workflow from "./workflows/workflow.ts";
import SupportTicketDatastore from "./datastores/support_ticket_datastore.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "code4policy-bot",
  description: "A template for building Slack apps with Deno",
  icon: "assets/default_new_app_icon.png",
  workflows: [SupportTicketWorkflow, EyesReactionWorkflow, CompletedReactionWorkflow, ClaudeAssistantWorkflow, ShowTicketsWorkflow],
  outgoingDomains: ["api.anthropic.com"],
  datastores: [SupportTicketDatastore],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
    "reactions:read",
    "channels:history",
    "groups:history",
    "app_mentions:read",
  ],
});
