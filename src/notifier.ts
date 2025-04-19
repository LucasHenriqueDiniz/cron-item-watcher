import { MatchedItem } from "./types.js";
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

  // Group items by source
  const csTradeItems = items.filter((item) => item.source === "cs_trade");
  const mannCoItems = items.filter((item) => item.source === "mann_co");

  // Create and send embeds for CS.Trade items
  if (csTradeItems.length > 0) {
    const embed = new MessageBuilder().setTitle("New CS.Trade Matches").setColor(0xff9900).setTimestamp();

    for (const item of csTradeItems) {
      embed.addField(`${item.name} - $${item.price.toFixed(2)}`, `Matched term: ${item.matchedTerm}\n${item.itemUrl ? `[View Item](${item.itemUrl})` : ""}`);
    }

    await hook.send(embed);
  }

  // Create and send embeds for MannCo items
  if (mannCoItems.length > 0) {
    const embed = new MessageBuilder().setTitle("New MannCo.Store Matches").setColor(0x3498db).setTimestamp();

    for (const item of mannCoItems) {
      embed.addField(`${item.name} - $${item.price.toFixed(2)}`, `Matched term: ${item.matchedTerm}\n${item.itemUrl ? `[View Item](${item.itemUrl})` : ""}`);

      if (item.imageUrl) {
        // Add thumbnail for first item only to avoid oversized embeds
        if (!embed.embeds[0].thumbnail) {
          embed.setThumbnail(item.imageUrl);
        }
      }
    }

    await hook.send(embed);
  }

  console.log("Notifications sent successfully");
}
