import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

/**
 * Datastores are a Slack-hosted location to store
 * and retrieve data for your app.
 * https://api.slack.com/automation/datastores
 */
const SupportTicketDatastore = DefineDatastore({
  name: "SupportTickets",
  primary_key: "object_id",
  attributes: {
    object_id: {
      type: Schema.types.string,
    },
    trying: {
      type: Schema.types.string,
    },
    happened: {
      type: Schema.types.string,
    },
    code_link: {
      type: Schema.types.string,
    },
    issue_status: {
      type: Schema.types.string,
      enum: [
        "issue_created",
        "in_review",
        "instructor_replied",
        "completed",
      ],
    },
  }
});

export default SupportTicketDatastore;
