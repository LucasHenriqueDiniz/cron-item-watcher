import { MatchedItem, GAME_EMOJIS, MESSAGE_EMOJIS } from "./types.js";
import config from "./config.js";
import { Webhook, MessageBuilder } from "discord-webhook-node";

export async function sendDiscordNotification(items: MatchedItem[]): Promise<void> {
  if (items.length === 0) {
    console.log("No items to notify about");
    return;
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("Discord webhook URL not found in environment variables");
    return;
  }

  const hook = new Webhook(webhookUrl);
  hook.setUsername(config.discord.username);
  hook.setAvatar(config.discord.avatarUrl);

  console.log(`Sending notifications for ${items.length} items`);

  // Send individual messages for each item
  for (const item of items) {
    try {
      const source = item.source === "cs_trade" ? "CS.Trade" : "MannCo.Store";
      const game = item.game || "unknown";

      // Get the game emoji (custom Discord emoji or fallback to Unicode emoji)
      const gameEmoji = GAME_EMOJIS[game as keyof typeof GAME_EMOJIS] || GAME_EMOJIS.unknown;

      function messageEmoji(emoji: string): string {
        return MESSAGE_EMOJIS[emoji as keyof typeof MESSAGE_EMOJIS] || MESSAGE_EMOJIS.unknown;
      }

      // Add MannCo coins emoji if it's a MannCo item
      const priceEmoji = item.source === "mann_co" ? `${GAME_EMOJIS.mannco} ` : "";

      // Add effect to title if available
      const effectPrefix = item.effect ? `★ ${item.effect} - ` : "";

      // Create embed with custom emojis
      const embed = new MessageBuilder()
        .setTitle(`${messageEmoji("blue_dot")} {gameEmoji} ${effectPrefix}${item.name} ${messageEmoji("blue_dot")}`)
        .setDescription(`Found a new ${item.matchedTerm} item on **${source}**! ${messageEmoji(item.source)}`)
        .setColor(item.source === "cs_trade" ? 0xff9900 : 0x3498db)
        .setTimestamp();

      // Add price field with currency emoji
      embed.addField("Price", `${priceEmoji}$${item.price.toFixed(2)}`, true);

      // Add matched term field
      embed.addField("Matched Term", item.matchedTerm, true);

      // Add effect field if available
      if (item.effect) {
        embed.addField("Effect", item.effect, true);
      }

      // Add game field with custom emoji
      embed.addField("Game", `${gameEmoji} ${game.toUpperCase()}`, true);

      // Add view button as a component
      // Discord components can't be added through discord-webhook-node directly,
      // so we need to manipulate the JSON directly
      if (item.itemUrl) {
        // Create a JSON structure that includes both embed and components
        const webhookData = {
          embeds: [embed.embeds[0] || {}],
          components: [
            {
              type: 1, // Action Row
              components: [
                {
                  type: 2, // Button
                  style: 5, // Link style
                  label: `View on ${source}`,
                  url: item.itemUrl,
                },
              ],
            },
          ],
        };

        // Instead of using the embed directly, we'll use the raw webhook data
        await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookData),
        });

        console.log(`Sent notification with button for ${item.name}`);
      } else {
        // Fallback to regular embed if no URL is available
        if (item.imageUrl) {
          embed.setImage(item.imageUrl);
        }

        if (item.effectUrl) {
          embed.setThumbnail(item.effectUrl);
        }

        // Add footer with game emoji
        embed.setFooter(`${gameEmoji} ${source} • Item ID: ${item.id}`);

        // Send through discord-webhook-node
        await hook.send(embed);
        console.log(`Sent notification for ${item.name}`);
      }

      // Add a small delay between messages to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error sending notification for ${item.name}:`, error);
    }
  }

  console.log("Notifications sent successfully");
}
