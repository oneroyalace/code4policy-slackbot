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
    // const ev = inputs.event as any;

    // // Reaction metadata
    // const reaction = ev.reaction;            // "eyes"
    // const reactorUserId = ev.user;           // the user who reacted
    // const item = ev.item;                    // { channel, ts, type: "message" }
    // const channelId = item?.channel;
    // const reactedTs = item?.ts;

    // // Defensive checks
    // if (reaction !== "eyes" || !reactorUserId || !channelId || !reactedTs) {
    //   return { outputs: {} };
    // }

    // /**
    //  * IMPORTANT: We assume instructors react :eyes: on the *thread root* message.
    //  * In that convention, reactedTs === thread_root_ts.
    //  *
    //  * If instructors react on a reply inside the thread, you would need to:
    //  * - fetch that message
    //  * - read its thread_ts (root)
    //  * That is doable, but keep the policy “react on root” for simplicity.
    //  */

    // // 1) Verify the reactor is an instructor
    // // Recommended: store INSTRUCTOR_USERGROUP_ID in env and check membership.
    // const instructorUsergroupId = Deno.env.get("INSTRUCTOR_USERGROUP_ID");
    // if (instructorUsergroupId) {
    //   const ug = await client.usergroups.users.list({ usergroup: instructorUsergroupId });
    //   const members = new Set((ug.users ?? []).filter(isTruthy));
    //   if (!members.has(reactorUserId)) {
    //     return { outputs: {} }; // Ignore non-instructors
    //   }
    // } else {
    //   // If you don't set INSTRUCTOR_USERGROUP_ID, you probably want to fail closed.
    //   // Change to `return { outputs: {} }` if you want "anyone can eyes-triage".
    //   return { outputs: {} };
    // }

    // // 2) Find the ticket record by channel_id + thread_root_ts.
    // // Your datastore primary key is object_id, so we query on the two attributes.
    // const q = await client.apps.datastore.query({
    //   datastore: "SupportTickets",
    //   expression: "#c = :c AND #t = :t",
    //   expression_attributes: {
    //     "#c": "channel_id",
    //     "#t": "thread_root_ts",
    //   },
    //   expression_values: {
    //     ":c": channelId,
    //     ":t": reactedTs,
    //   },
    //   limit: 1,
    // });

    // if (!q.ok) {
    //   return { error: `Datastore query failed: ${q.error}` };
    // }

    // const ticket = (q.items ?? [])[0];
    // if (!ticket) {
    //   // Not a managed ticket
    //   return { outputs: {} };
    // }

    // // 3) Update status if not already in_review (idempotent)
    // if (ticket.issue_status === "in_review") {
    //   return { outputs: {} };
    // }

    // const upd = await client.apps.datastore.update({
    //   datastore: "SupportTickets",
    //   item: {
    //     object_id: ticket.object_id,
    //     issue_status: "in_review",
    //   },
    // });

    // if (!upd.ok) {
    //   return { error: `Datastore update failed: ${upd.error}` };
    // }

    // // Optional: acknowledge in-thread (comment out if you prefer silent updates)
    // // await client.chat.postMessage({
    // //   channel: channelId,
    // //   thread_ts: reactedTs,
    // //   text: "Marked *In review* (instructor triage).",
    // // });

    return { outputs: {} };
  },
);

