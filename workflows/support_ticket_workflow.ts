import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { SupportTicketFunctionDefinition } from "../functions/support_ticket_function.ts";

/**
 * A workflow is a set of steps that are executed in order.
 * Each step in a workflow is a function.
 * https://api.slack.com/automation/workflows
 *
 * This workflow uses interactivity. Learn more at:
 * https://api.slack.com/automation/forms#add-interactivity
 */
const SupportTicketWorkflow = DefineWorkflow({
  callback_id: "support_ticket_workflow",
  title: "Support ticket workflow",
  description: "Support ticket workflow",
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

/**
 * 1) Open a modal (Slack “form”) to collect the three required fields.
 * This renders as a modal to the user who invoked the shortcut.
 */
const intakeForm = SupportTicketWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Create help ticket",
    interactivity: SupportTicketWorkflow.inputs.interactivity,
    submit_label: "Create",
    description: "Answer briefly — we’ll follow up for details in-thread.",
    fields: {
      required: ["trying", "happened", "code_link"],
      elements: [
        {
          name: "trying",
          title: "What were you trying to do?",
          type: Schema.types.string,
          long: true,
        },
        {
          name: "happened",
          title: "What happened instead?",
          type: Schema.types.string,
          long: true,
        },
        {
          name: "code_link",
          title: "Link to code (or say where you posted a screenshot)",
          type: Schema.types.string,
        },
      ],
    },
  },
);

/**
 * Custom functions are reusable building blocks
 * of automation deployed to Slack infrastructure. They
 * accept inputs, perform calculations, and provide
 * outputs, just like typical programmatic functions.
 * https://api.slack.com/automation/functions/custom
 */
const supportTicketFunctionStep = SupportTicketWorkflow.addStep(SupportTicketFunctionDefinition, {
  trying: intakeForm.outputs.fields.trying,
  happened: intakeForm.outputs.fields.happened,
  code_link: intakeForm.outputs.fields.code_link,
  user: SupportTicketWorkflow.inputs.user,
});

/**
 * SendMessage is a Slack function. These are
 * Slack-native actions, like creating a channel or sending
 * a message and can be used alongside custom functions in a workflow.
 * https://api.slack.com/automation/functions
 */
const supportThreadRoot = SupportTicketWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: SupportTicketWorkflow.inputs.channel,
  message: `:thread: New support ticket from <@${SupportTicketWorkflow.inputs.user}>`,
});

SupportTicketWorkflow.addStep( Schema.slack.functions.ReplyInThread, {
    message_context:supportThreadRoot.outputs.message_context,
    reply_broadcast: false,
    message: `
  *Details*: 

*_Requester_* <@${SupportTicketWorkflow.inputs.user}>
*_What were you trying to do?_*
${intakeForm.outputs.fields.trying}

*_What happened instead?_*
${intakeForm.outputs.fields.happened}

*_Code / screenshot_*
${intakeForm.outputs.fields.code_link} `,
});


export default SupportTicketWorkflow;
