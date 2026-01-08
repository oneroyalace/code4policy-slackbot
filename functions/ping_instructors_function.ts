import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const PingInstructorsFunctionDefinition = DefineFunction({
  callback_id: "ping_instructors",
  title: "Ping instructors",
  description: "Pings instructors when bot is mentioned with 'ping'",
  source_file: "functions/ping_instructors_function.ts",
  input_parameters: {
    properties: {
      channel_id: { type: Schema.slack.types.channel_id },
    },
    required: ["channel_id"],
  },
  output_parameters: {
    properties: {
      success: { type: Schema.types.boolean },
    },
    required: ["success"],
  },
});

export default SlackFunction(
  PingInstructorsFunctionDefinition,
  async ({ inputs, client }) => {
    const { channel_id } = inputs;

    const instructorIds = ["U0A21CGDNKB", // Asa
                           "U063HLRSPT6", // Aarushi
                           "UEWCD304A"]; // Dhrumil

    const instructorMentions = instructorIds.map(id => `<@${id}>`).join(" ");

    console.log(`Ping request in channel: ${channel_id}`);

    // Get bot user ID to check for mentions
    const authTest = await client.auth.test();
    if (!authTest.ok) {
      console.error("Failed to get bot user ID");
      return {
        outputs: {
          success: false,
        }
      };
    }
    const botUserId = authTest.user_id;
    console.log(`Bot user ID: ${botUserId}`);

    // Fetch recent messages in the channel
    const historyResponse = await client.conversations.history({
      channel: channel_id,
      limit: 50,
    });

    if (!historyResponse.ok || !historyResponse.messages) {
      console.error("Failed to fetch channel history");
      return {
        outputs: {
          success: false,
        }
      };
    }

    // Collect all messages to check (channel + thread replies)
    const allMessagesToCheck: any[] = [];

    if (historyResponse.messages) {
      allMessagesToCheck.push(...historyResponse.messages);

      // For each message with replies, fetch the thread
      for (const msg of historyResponse.messages) {
        if (msg.reply_count && msg.reply_count > 0) {
          const threadReplies = await client.conversations.replies({
            channel: channel_id,
            ts: msg.ts,
            limit: 50,
          });
          if (threadReplies.ok && threadReplies.messages) {
            // Skip the first message (it's the root, already in allMessagesToCheck)
            allMessagesToCheck.push(...threadReplies.messages.slice(1));
          }
        }
      }
    }

    // Sort by timestamp, newest first
    allMessagesToCheck.sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts));

    console.log(`Searching ${allMessagesToCheck.length} messages for ping mention`);

    // Find the most recent message that mentions the bot and contains "ping"
    const mentionMessage = allMessagesToCheck.find((msg: any) => {
      const isHumanMessage = !msg.bot_id && msg.subtype !== "bot_message";
      const mentionsBot = msg.text?.includes(`<@${botUserId}>`);
      const text = msg.text?.toLowerCase() || "";
      const containsPing = text.includes("ping");
      console.log(`Checking message ${msg.ts}: human=${isHumanMessage}, mentions=${mentionsBot}, ping=${containsPing}, text="${msg.text?.substring(0, 50)}"`);
      return isHumanMessage && mentionsBot && containsPing;
    });

    if (!mentionMessage) {
      console.log("No recent mention with 'ping' found");
      return {
        outputs: {
          success: false,
        }
      };
    }

    const message_ts = mentionMessage.ts;
    const user_id = mentionMessage.user;
    const threadRootTs = mentionMessage.thread_ts || message_ts;

    console.log(`Found ping mention: user=${user_id}, thread_ts=${threadRootTs}`);

    // Post the ping message in the thread
    const pingResponse = await client.chat.postMessage({
      channel: channel_id,
      thread_ts: threadRootTs,
      text: `:bell: <@${user_id}> is requesting instructor assistance! ${instructorMentions}`,
    });

    if (!pingResponse.ok) {
      console.error(`Failed to post ping message: ${pingResponse.error}`);
      return {
        outputs: {
          success: false,
        }
      };
    }

    return {
      outputs: {
        success: true,
      }
    };
  },
);
