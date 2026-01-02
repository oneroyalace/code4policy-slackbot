import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const ShowTicketsFunctionDefinition = DefineFunction({
  callback_id: "show_tickets_function",
  title: "Show open tickets",
  description: "Display all tickets with status 'issue_created' or 'in_review'",
  source_file: "functions/show_tickets_function.ts",
  input_parameters: {
    properties: {
      channel_id:asdf
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
      sd
    });
sdf
    if (!allTickets.ok) {
      return { error: `Failed to query tickets: ${allTickets.error}` };
    }

    // Filter for open tickets (issue_created or in_review)
    let openTickets = (allTickets.items ?? []).filter((ticket: any) => {
      return ticket.issue_status === "issue_created" ||
             ticket.issue_status === "in_review";
    });
asdfa
    // Sort by timestamp (oldest first)
    openTickets = openTickets.sort((a: any, b: any) => {
      return parseFloat(a.thread_root_ts) - parseFloat(b.thread_root_ts);
    });

    console.log(`Found ${openTickets.length} open tickets`);

    // Format the message
    let message = "";

    if (openTickets.length === 0) {
      message = ":white_check_mark: *No open tickets!* All caught up.";
    } else {
      message = `:clipboard: *Open Support Tickets* (${openTickets.length})\n\n`;

      for (const [index, ticket] of openTickets.entries()) {
        try {
          const statusEmoji = ticket.issue_status === "in_review" ? ":eyes:" : ":new:";

          // Convert timestamp to human-readable format
          const timestamp = parseFloat(ticket.thread_root_ts);
          const date = new Date(timestamp * 1000);
          const humanDate = date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });

          // Get permalink for the thread
          const permalink = await client.chat.getPermalink({
            channel: ticket.channel_id,
            message_ts: ticket.thread_root_ts,
          });

          if (!permalink.ok) {
            console.log(`Failed to get permalink for ticket ${index + 1}: ${permalink.error}`);
          }

          const threadLink = permalink.ok ? permalink.permalink : "#";

          // Handle missing user field for old tickets
          const userMention = ticket.user ? `<@${ticket.user}>` : "Unknown user";

          message += `${index + 1}. Ticket opened by ${userMention} at ${humanDate} in <#${ticket.channel_id}>\n`;
          message += `   Status: ${statusEmoji} *${ticket.issue_status}*\n`;
          message += `   _Trying:_ ${ticket.trying}\n`;
          message += `   _Issue:_ ${ticket.happened}\n`;
          message += `   <${threadLink}|View thread>\n`;
          message += `   ───\n\n`;
        } catch (error) {
          console.log(`Error formatting ticket ${index + 1}:`, error);
          // Continue with other tickets
        }
      }
    }

    // Post the message
    console.log("Posting message to channel...");
    const postResult = await client.chat.postMessage({
      channel: inputs.channel_id,
      text: message,
    });

    if (!postResult.ok) {
      console.log(`Failed to post message: ${postResult.error}`);
      return { error: `Failed to post message: ${postResult.error}` };
    }

    console.log("Successfully posted message");
    return { outputs: { message } };
  },
);
