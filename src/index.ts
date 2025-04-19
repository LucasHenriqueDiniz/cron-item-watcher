import { fetchCsTradeItems, fetchMannCoItems } from "./api.js";
import { loadStoredData, saveStoredData, findNewCsTradeItems, findNewMannCoItems, updateStoredData } from "./dataStorage.js";
import { matchCsTradeItems, matchMannCoItems } from "./matcher.js";
import { sendDiscordNotification } from "./notifier.js";
import config from "./config.js";

async function main() {
  console.log("Starting item watcher...");

  // Load stored data
  const storedData = loadStoredData();
  console.log(`Last update: ${storedData.lastUpdate}`);

  // Fetch current items
  const newMatchedItems = [];

  // Process CS.Trade items if enabled
  if (config.cs_trade.enabled) {
    console.log("Fetching CS.Trade items...");
    const csTradeItems = await fetchCsTradeItems();

    if (csTradeItems.length > 0) {
      // Find new items
      const newCsTradeItems = findNewCsTradeItems(csTradeItems, storedData.cs_trade);
      console.log(`Found ${newCsTradeItems.length} new CS.Trade items`);

      // Match against watch terms
      if (newCsTradeItems.length > 0) {
        const matchedItems = matchCsTradeItems(newCsTradeItems);
        console.log(`Matched ${matchedItems.length} CS.Trade items`);
        newMatchedItems.push(...matchedItems);

        // Update stored data with new items
        Object.assign(storedData, updateStoredData(storedData, newCsTradeItems, []));
      }
    }
  }

  // Process MannCo items if enabled
  if (config.mann_co.enabled) {
    console.log("Fetching MannCo items...");
    const mannCoItems = await fetchMannCoItems();

    if (mannCoItems.length > 0) {
      // Find new items
      const newMannCoItems = findNewMannCoItems(mannCoItems, storedData.mann_co);
      console.log(`Found ${newMannCoItems.length} new MannCo items`);

      // Match against watch terms
      if (newMannCoItems.length > 0) {
        const matchedItems = matchMannCoItems(newMannCoItems);
        console.log(`Matched ${matchedItems.length} MannCo items`);
        newMatchedItems.push(...matchedItems);

        // Update stored data with new items
        Object.assign(storedData, updateStoredData(storedData, [], newMannCoItems));
      }
    }
  }

  // Send notifications if there are matches
  if (newMatchedItems.length > 0) {
    console.log(`Sending notifications for ${newMatchedItems.length} matched items`);
    await sendDiscordNotification(newMatchedItems);
  } else {
    console.log("No new matches to notify");
  }

  // Save updated data
  saveStoredData(storedData);
  console.log("Item watcher finished");
}

main().catch((error) => {
  console.error("Error in main:", error);
  process.exit(1);
});
