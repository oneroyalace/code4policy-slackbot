import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import type SupportTicketDatastore from "../datastores/support_ticket_datastore.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */
export const SupportTicketFunctionDefinition = DefineFunction({
  callback_id: "support_ticket_function",
  title: "SupportTicket function",
  description: "A support_ticket function",
  source_file: "functions/support_ticket_function.ts",
  input_parameters: {
    properties: {
      message: {
        type: Schema.types.string,
        description: "Message to be posted",
      },
      user: {
        type: Schema.slack.types.user_id,
        description: "The user invoking the workflow",
      },
    },
    required: ["message", "user"],
  },
  output_parameters: {
    properties: {
      updatedMsg: {
        type: Schema.types.string,
        description: "Updated message to be posted",
      },
    },
    required: ["updatedMsg"],
  },
});

/**
 * SlackFunction takes in two arguments: the CustomFunction
 * definition (see above), as well as a function that contains
 * handler logic that's run when the function is executed.
 * https://api.slack.com/automation/functions/custom
 */
export default SlackFunction(
  SupportTicketFunctionDefinition,
  async ({ inputs, client }) => {
    const uuid = crypto.randomUUID();

    // inputs.user is set from the interactivity_context defined in support_ticket_trigger.ts
    // https://api.slack.com/automation/forms#add-interactivity
    const updatedMsg =
      `:wave: :+1: <@${inputs.user}> submitted the following message: \n\n>${inputs.message}`;

    const supportTicket = {
      original_msg: inputs.message,
      updated_msg: updatedMsg,
      object_id: uuid,
    };

    // Save the support_ticket object to the datastore
    // https://api.slack.com/automation/datastores
    const putResponse = await client.apps.datastore.put<
      typeof SupportTicketDatastore.definition
    >({
      datastore: "SupportTickets",
      item: supportTicket,
    });

    if (!putResponse.ok) {
      return {
        error: `Failed to put item into the datastore: ${putResponse.error}`,
      };
    }

    return { outputs: { updatedMsg } };
  },
);
