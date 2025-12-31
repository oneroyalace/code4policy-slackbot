import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const HandleCompletedReactionDefinition = DefineFunction({
  callback_id: "handle_completed_reaction",
  title: "Handle :Completed: reaction",
  description: "If instructor reacts :Completed: on a ticket root message, set issue_status to completed.",
  source_file: "functions/handle_completed_reaction.ts",
  input_parameters: {
    properties: {
      reactor_user_id: {type: Schema.slack.types.user_id},
      channel_id: {type: Schema.slack.types.channel_id},
      message_ts: { type: Schema.types.string},
    },
    required: ["reactor_user_id", "channel_id", "message_ts"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

function isTruthy(x: unknown): boolean {
  return !!x;
}

export default SlackFunction(
  HandleCompletedReactionDefinition,
  async ({ inputs, client }) => {
    console.log("heloooooo")
    const event = inputs.event;

    // Reaction metadata
    const reactorUserId = inputs.reactor_user_id;         
    const channelId = inputs.channel_id;
    const messageTs = inputs.message_ts;

    console.log("reactor", reactorUserId)
    console.log("channel id1", channelId)
    console.log("message ts", messageTs)




    // // Chekc whether person who posted reaction  is instructor
    // // TODO: store instructor ids in an environmetn variable
    // const instructorIds = ["U05Q4KW9QRJ"]

    // if (!instructorIds.includes(reactorUserId)) {
    //     return { outputs: {} }; // Ignore non-instructors
    // } 
    // console.log("Look i'm an instructor")

    // 2) Find the ticket record by channel_id + thread_root_ts.
    // Note: Slack's datastore AND query doesn't work reliably, so we query by channel
    // and find the matching timestamp in code
    console.log(`Looking for ticket: channel=${channelId}, thread_root_ts=${messageTs}`);

    const allInChannel = await client.apps.datastore.query({
      datastore: "SupportTickets",
      expression: "#c = :c",
      expression_attributes: {
        "#c": "channel_id",
      },
      expression_values: {
        ":c": channelId,
      },
    });

    if (!allInChannel.ok) {
      return { error: `Datastore query failed: ${allInChannel.error}` };
    }

    // Find the ticket with matching timestamp
    const ticket = (allInChannel.items ?? []).find((item: any) => {
      return item.thread_root_ts === messageTs;
    });

    if (!ticket) {
      console.log(`No ticket found for channelId ${channelId}, thread_root_ts ${messageTs}`)
      // Not a managed ticket
      return { outputs: {} };
    }

    console.log("found the ticket")

    const upd = await client.apps.datastore.update({
      datastore: "SupportTickets",
      item: {
        object_id: ticket.object_id,
        issue_status: "completed",
      },
    });

    if (!upd.ok) {
      return { error: `Datastore update failed: ${upd.error}` };
    }

    await client.chat.postMessage({
      channel: channelId,
      thread_ts: messageTs,
      text: `<@${inputs.reactor_user_id}> marked this issue completed!`,
    });

    return { outputs: {} };
  },
);


