import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const HandleEyesReactionDefinition = DefineFunction({
  callback_id: "handle_eyes_reaction",
  title: "Handle :eyes: reaction",
  description: "If instructor reacts :eyes: on a ticket root message, set issue_status to in_review.",
  source_file: "functions/handle_eyes_reaction.ts",
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
  HandleEyesReactionDefinition,
  async ({ inputs, client }) => {
    console.log("heloooooo")
    const event = inputs.event;

    // Reaction metadata
    const reactorUserId = inputs.reactor_user_id;           // the user who reacted
    const channelId = inputs.channel_id;
    const messageTs = inputs.message_ts;

    console.log("reactor", reactorUserId)
    console.log("channel id1", channelId)
    console.log("message ts", messageTs)


    // 1) Verify the reactor is an instructor
    // Should load instructor IDs into an env file...


    // const instructorUsergroupId = Deno.env.get("INSTRUCTOR_USERGROUP_ID");
    const instructorIds = ["U05Q4KW9QRJ"]

    if (!instructorIds.includes(reactorUserId)) {
        return { outputs: {} }; // Ignore non-instructors
    } 
    console.log("Look i'm an instructor")

    // 2) Find the ticket record by channel_id + thread_root_ts.
    // TODO: if this stops working, change the primary key to a combo of channel id + truncated messageTs
    const q = await client.apps.datastore.query({
      datastore: "SupportTickets",
      expression: "#c = :c AND #t = :t",
      // expression: "#c = :c",
      expression_attributes: {
        "#c": "channel_id",
        "#t": "thread_root_ts",
      },
      expression_values: {
        ":c": channelId,
        ":t": messageTs,
      },
      limit: 1,
    });

    if (!q.ok) {
      return { error: `Datastore query failed: ${q.error}` };
    }

    const ticket = (q.items ?? [])[0];
    if (!ticket) {
      console.log(`not icket for channelId ${channelId}, messageTs ${messageTs}`)
      // Not a managed ticket
      return { outputs: {} };
    }

    console.log("found the ticket")

    const upd = await client.apps.datastore.update({
      datastore: "SupportTickets",
      item: {
        object_id: ticket.object_id,
        issue_status: "in_review",
      },
    });

    if (!upd.ok) {
      return { error: `Datastore update failed: ${upd.error}` };
    }

    await client.chat.postMessage({
      channel: channelId,
      thread_ts: messageTs,
      text: `<@${inputs.reactor_user_id}> is reviewing this support ticket!`,
    });

    return { outputs: {} };
  },
);

