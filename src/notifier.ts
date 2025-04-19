import { MatchedItem, GAME_EMOJIS } from "./types.js";
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

      // Get the game emoji
      const gameEmoji = GAME_EMOJIS[game as keyof typeof GAME_EMOJIS] || GAME_EMOJIS.unknown;

      // Add game emoji to the game display
      const gameDisplay = item.game ? ` ${gameEmoji} ${item.game.toUpperCase()}` : "";

      // Add effect to title if available
      const effectPrefix = item.effect ? `${item.effect} ` : "";

      const embed = new MessageBuilder()
        .setTitle(`New Match: ${effectPrefix}${item.name}${gameDisplay}`)
        .setDescription(`Found a new ${item.matchedTerm} item on ${source}!`)
        .setColor(item.source === "cs_trade" ? 0xff9900 : 0x3498db)
        .setTimestamp();

      // Add price field - ensure proper dollar format
      embed.addField("Price", `$${item.price.toFixed(2)}`, true);

      // Add matched term field
      embed.addField("Matched Term", item.matchedTerm, true);

      // Add effect field if available
      if (item.effect) {
        const effectText = item.effectUrl ? `[${item.effect}](${item.effectUrl})` : item.effect;
        embed.addField("Effect", effectText, true);
      }

      // Add game field with emoji if available
      if (item.game) {
        embed.addField("Game", `${gameEmoji} ${item.game.toUpperCase()}`, true);
      }

      // Add view button (as a field with link)
      if (item.itemUrl) {
        embed.addField("View Item", `[Click here to view on ${source}](${item.itemUrl})`);
      }

      // Add thumbnail of effect if available instead of main item image
      if (item.effectUrl) {
        embed.setThumbnail(item.effectUrl);

        // Use item image as main image
        if (item.imageUrl) {
          embed.setImage(item.imageUrl);
        }
      } else if (item.imageUrl) {
        // If no effect image, use item image as thumbnail and main image
        embed.setThumbnail(item.imageUrl);
        embed.setImage(item.imageUrl);
      }

      // Add source info in footer with game emoji
      const footerText = item.game ? `${gameEmoji} ${source} • Game: ${item.game.toUpperCase()} • Item ID: ${item.id}` : `${source} • Item ID: ${item.id}`;

      embed.setFooter(footerText);

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
