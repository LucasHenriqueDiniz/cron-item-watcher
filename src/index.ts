import { fetchCsTradeItems, fetchMannCoItems } from "./api.js";
import { loadStoredData, saveStoredData, findNewCsTradeItems, findNewMannCoItems, updateStoredData } from "./dataStorage.js";
import { matchCsTradeItems, matchMannCoItems } from "./matcher.js";
import { sendDiscordNotification } from "./notifier.js";
import config from "./config.js";

// Check for required environment variables
function checkEnvironment() {
  console.log("Checking environment variables...");
  const requiredEnvVars = ["DISCORD_WEBHOOK_URL"];
  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    return false;
  }

  // Warn about optional but recommended variables
  if (!process.env.MANNCO_COOKIE) {
    console.warn("MANNCO_COOKIE environment variable not set. MannCo.store requests might be blocked by Cloudflare.");
  }

  console.log("All required environment variables are present");
  return true;
}

async function main() {
  console.log("========================================");
  console.log(`Starting item watcher at ${new Date().toISOString()}`);
  console.log("========================================");

  // Log configuration
  console.log("Current configuration:");
  console.log(`- CS.Trade enabled: ${config.cs_trade.enabled}`);
  if (config.cs_trade.enabled) {
    const enabledGames = Object.entries(config.cs_trade.watchGames)
      .filter(([_, enabled]) => enabled)
      .map(([game]) => game.toUpperCase());

    console.log(`  * Watch games: ${enabledGames.join(", ")}`);
    console.log(`  * Watch terms: ${config.cs_trade.watchTerms.join(", ")}`);
    console.log(`  * Ignore terms: ${config.cs_trade.ignoredTerms.join(", ")}`);
    console.log(`  * Max price: ${config.cs_trade.maxPrice !== null ? `$${config.cs_trade.maxPrice}` : "No limit"}`);
  }

  console.log(`- MannCo enabled: ${config.mann_co.enabled}`);
  if (config.mann_co.enabled) {
    const enabledGames = Object.entries(config.mann_co.watchGames)
      .filter(([_, enabled]) => enabled)
      .map(([game]) => game.toUpperCase());

    console.log(`  * Watch games: ${enabledGames.join(", ")}`);
    console.log(`  * Watch terms: ${config.mann_co.watchTerms.join(", ")}`);
    console.log(`  * Ignore terms: ${config.mann_co.ignoredTerms.join(", ")}`);
    console.log(`  * Max price: ${config.mann_co.maxPrice !== null ? `$${config.mann_co.maxPrice}` : "No limit"}`);
  }

  // Check environment variables before proceeding
  if (!checkEnvironment()) {
    console.error("Cannot proceed due to missing environment variables");
    process.exit(1);
  }

  try {
    // Load stored data
    const storedData = loadStoredData();
    console.log(`Last update: ${storedData.lastUpdate}`);

    // Fetch current items
    const newMatchedItems = [];

    // Process CS.Trade items if enabled
    if (config.cs_trade.enabled) {
      console.log("\n--- Processing CS.Trade items ---");
      try {
        const csTradeItems = await fetchCsTradeItems();

        if (csTradeItems && csTradeItems.length > 0) {
          // Find new items
          const newCsTradeItems = findNewCsTradeItems(csTradeItems, storedData.cs_trade);
          console.log(`Found ${newCsTradeItems.length} new or updated CS.Trade items out of ${csTradeItems.length} total items`);

          // Match against watch terms
          if (newCsTradeItems.length > 0) {
            const matchedItems = matchCsTradeItems(newCsTradeItems);
            console.log(`Matched ${matchedItems.length} CS.Trade items against watch terms`);
            newMatchedItems.push(...matchedItems);

            // Update stored data with new items
            Object.assign(storedData, updateStoredData(storedData, newCsTradeItems, []));
          } else {
            console.log("No new CS.Trade items to process");
          }
        } else {
          console.warn("No CS.Trade items retrieved or invalid response format");
        }
      } catch (error) {
        console.error("Error processing CS.Trade items:", error);
      }
    }

    // Process MannCo items if enabled
    if (config.mann_co.enabled) {
      console.log("\n--- Processing MannCo items ---");
      try {
        const mannCoItems = await fetchMannCoItems();

        if (mannCoItems && mannCoItems.length > 0) {
          // Find new items
          const newMannCoItems = findNewMannCoItems(mannCoItems, storedData.mann_co);
          console.log(`Found ${newMannCoItems.length} new or updated MannCo items out of ${mannCoItems.length} total items`);

          // Match against watch terms
          if (newMannCoItems.length > 0) {
            const matchedItems = matchMannCoItems(newMannCoItems);
            console.log(`Matched ${matchedItems.length} MannCo items against watch terms`);
            newMatchedItems.push(...matchedItems);

            // Update stored data with new items
            Object.assign(storedData, updateStoredData(storedData, [], newMannCoItems));
          } else {
            console.log("No new MannCo items to process");
          }
        } else {
          console.warn("No MannCo items retrieved or invalid response format");
        }
      } catch (error) {
        console.error("Error processing MannCo items:", error);
      }
    }

    // Send notifications if there are matches
    if (newMatchedItems.length > 0) {
      console.log(`\n--- Sending notifications for ${newMatchedItems.length} matched items ---`);
      try {
        await sendDiscordNotification(newMatchedItems);
      } catch (error) {
        console.error("Error sending notifications:", error);
      }
    } else {
      console.log("\n--- No new matches to notify ---");
    }

    // Save updated data (even if there was an error, save what we have)
    saveStoredData(storedData);
    console.log("\n========================================");
    console.log(`Item watcher finished at ${new Date().toISOString()}`);
    console.log("========================================");
  } catch (error) {
    console.error("Critical error in main process:", error);
    process.exit(1);
  }
}

// Add unhandled error listeners to catch any unexpected errors
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

main().catch((error) => {
  console.error("Fatal error in main:", error);
  process.exit(1);
});
