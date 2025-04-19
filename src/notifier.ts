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

  // Send individual messages for each item
  for (const item of items) {
    try {
      const source = item.source === "cs_trade" ? "CS.Trade" : "MannCo.Store";

      const embed = new MessageBuilder()
        .setTitle(`New Match: ${item.name}`)
        .setDescription(`Found a new ${item.matchedTerm} item on ${source}!`)
        .setColor(item.source === "cs_trade" ? 0xff9900 : 0x3498db)
        .setTimestamp();

      // Add price field
      embed.addField("Price", `$${item.price.toFixed(2)}`, true);

      // Add matched term field
      embed.addField("Matched Term", item.matchedTerm, true);

      // Add view button (as a field with link)
      if (item.itemUrl) {
        embed.addField("View Item", `[Click here to view on ${source}](${item.itemUrl})`);
      }

      // Set the item's image
      if (item.imageUrl) {
        embed.setThumbnail(item.imageUrl);
        // Also set as main image for better visibility
        embed.setImage(item.imageUrl);
      }

      // Add source info in footer
      embed.setFooter(`Source: ${source} • Item ID: ${item.id}`);

      await hook.send(embed);
      console.log(`Sent notification for ${item.name}`);

      // Add a small delay between messages to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error sending notification for ${item.name}:`, error);
    }
  }

  console.log("Notifications sent successfully");
}
