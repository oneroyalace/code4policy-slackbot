import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const ShowTicketsFunctionDefinition = DefineFunction({
  callback_id: "show_tickets_function",
  title: "Show open tickets",
  description: "Display all tickets with status 'issue_created' or 'in_review'",
  source_file: "functions/show_tickets_function.ts",
  input_parameters: {
    properties: {
      channel_id: { type: Schema.slack.types.channel_id },
      user_id: { type: Schema.slack.types.user_id },
    },
    required: ["channel_id", "user_id"],
  },
  output_parameters: {
    properties: {
      message: {
        type: Schema.types.string,
        description: "Formatted ticket list",
      },
    },
    required: ["message"],
  },
});

export default SlackFunction(
  ShowTicketsFunctionDefinition,
  async ({ inputs, client }) => {
    console.log("Fetching open tickets...");

    // Query all tickets in the channel
    const allTickets = await client.apps.datastore.query({
      datastore: "SupportTickets",
      expression: "#c = :c",
      expression_attributes: {
        "#c": "channel_id",
      },
      expression_values: {
        ":c": inputs.channel_id,
      },
    });

    if (!allTickets.ok) {
      return { error: `Failed to query tickets: ${allTickets.error}` };
    }

    // Filter for open tickets (issue_created or in_review)
    const openTickets = (allTickets.items ?? []).filter((ticket: any) => {
      return ticket.issue_status === "issue_created" ||
             ticket.issue_status === "in_review";
    });

    console.log(`Found ${openTickets.length} open tickets`);

    // Format the message
    let message = "";

    if (openTickets.length === 0) {
      message = ":white_check_mark: *No open tickets!* All caught up.";
    } else {
      message = `:clipboard: *Open Support Tickets* (${openTickets.length})\n\n`;

      openTickets.forEach((ticket: any, index: number) => {
        const statusEmoji = ticket.issue_status === "in_review" ? ":eyes:" : ":new:";
        const threadLink = `https://slack.com/app_redirect?channel=${inputs.channel_id}&message_ts=${ticket.thread_root_ts}`;

        message += `${index + 1}. ${statusEmoji} *${ticket.issue_status}*\n`;
        message += `   _Trying:_ ${ticket.trying}\n`;
        message += `   _Issue:_ ${ticket.happened}\n`;
        message += `   <${threadLink}|View thread>\n\n`;
      });
    }

    // Post the message
    await client.chat.postMessage({
      channel: inputs.channel_id,
      text: message,
    });

    return { outputs: { message } };
  },
);
