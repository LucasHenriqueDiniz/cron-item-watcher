import { fetchCsTradeItems, fetchMannCoItems } from "./api.js";
import { loadStoredData, saveStoredData, findNewCsTradeItems, findNewMannCoItems, updateStoredData, cleanupOldItems } from "./dataStorage.js";
import { matchCsTradeItems, matchMannCoItems } from "./matcher.js";
import { sendDiscordNotification } from "./notifier.js";
import config from "./config.js";
import { initDatabase } from "./database.js";

// Export a function that can be called by the server
export async function runItemCheck(csTradeOnly = false, manncoOnly = false) {
  return await main(csTradeOnly, manncoOnly);
}

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

  console.log("All required environment variables are present");  return true;
}

async function main(csTradeOnly = false, manncoOnly = false) {
  console.log("========================================");
  console.log(`Starting item watcher at ${new Date().toISOString()}`);
  console.log("========================================");

  // Initialize database before proceeding
  try {
    console.log("Initializing database...");
    await initDatabase();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    return;
  }

  // If called from command line, use flags
  if (!csTradeOnly && !manncoOnly) {
    const args = process.argv.slice(2);
    csTradeOnly = args.includes("--cs-trade-only");
    manncoOnly = args.includes("--mannco-only");
  }

  // If neither flag is set, run both as usual
  const runCsTrade = csTradeOnly || (!csTradeOnly && !manncoOnly);
  const runMannCo = manncoOnly || (!csTradeOnly && !manncoOnly);

  console.log(`Running modes: CS.Trade: ${runCsTrade ? "YES" : "NO"}, MannCo: ${runMannCo ? "YES" : "NO"}`);

  // Validate configuration before proceeding
  if (!config) {
    console.error("Configuration is missing or invalid!");
    process.exit(1);
  }

  if (!config.cs_trade || !config.mann_co || !config.discord) {
    console.error("Configuration is incomplete! Missing required sections.");
    process.exit(1);
  }

  // Log configuration
  console.log("Current configuration:", config);
  console.log(`- CS.Trade enabled: ${config?.cs_trade?.enabled}`);

  // Check if CS.Trade configuration exists and is enabled
  if (config?.cs_trade?.enabled) {
    // Safely check if watchGames exists before trying to use Object.entries
    if (config.cs_trade.watchGames) {
      const enabledGames = Object.entries(config.cs_trade.watchGames)
        .filter(([_, enabled]) => enabled)
        .map(([game]) => game.toUpperCase());

      console.log(`  * Watch games: ${enabledGames.join(", ")}`);
    } else {
      console.error("CS.Trade watchGames configuration is missing or invalid");
    }

    // Safely log other configuration values
    if (config.cs_trade.watchTerms) {
      console.log(`  * Watch terms: ${config.cs_trade.watchTerms.join(", ")}`);
    }

    if (config.cs_trade.ignoredTerms) {
      console.log(`  * Ignore terms: ${config.cs_trade.ignoredTerms.join(", ")}`);
    }

    console.log(`  * Max price: ${config.cs_trade.maxPrice !== null ? `$${config.cs_trade.maxPrice}` : "No limit"}`);
    console.log(`  * Min price: ${config.cs_trade.minPrice !== null ? `$${config.cs_trade.minPrice}` : "No limit"}`);
  }

  console.log(`- MannCo enabled: ${config?.mann_co?.enabled}`);

  // Check if MannCo configuration exists and is enabled
  if (config?.mann_co?.enabled) {
    // Safely check if watchGames exists before trying to use Object.entries
    if (config.mann_co.watchGames) {
      const enabledGames = Object.entries(config.mann_co.watchGames)
        .filter(([_, enabled]) => enabled)
        .map(([game]) => game.toUpperCase());

      console.log(`  * Watch games: ${enabledGames.join(", ")}`);
    } else {
      console.error("MannCo watchGames configuration is missing or invalid");
    }

    // Safely log other configuration values
    if (config.mann_co.watchTerms) {
      console.log(`  * Watch terms: ${config.mann_co.watchTerms.join(", ")}`);
    }

    if (config.mann_co.ignoredTerms) {
      console.log(`  * Ignore terms: ${config.mann_co.ignoredTerms.join(", ")}`);
    }

    console.log(`  * Max price: ${config.mann_co.maxPrice !== null ? `$${config.mann_co.maxPrice}` : "No limit"}`);
    console.log(`  * Min price: ${config.mann_co.minPrice !== null ? `$${config.mann_co.minPrice}` : "No limit"}`);
  }

  // Check environment variables before proceeding
  if (!checkEnvironment()) {
    console.error("Cannot proceed due to missing environment variables");
    process.exit(1);
  }

  try {
    // Load stored data
    const storedData = await loadStoredData();
    console.log(`Last update: ${storedData.lastUpdate}`);

    // Fetch current items
    const newMatchedItems = [];

    // Process CS.Trade items if enabled
    if (runCsTrade && config?.cs_trade?.enabled) {
      console.log("\n--- Processing CS.Trade items ---");
      try {
        const csTradeItems = await fetchCsTradeItems();

        if (csTradeItems && csTradeItems.length > 0) {
          // Find new items - removido o segundo parâmetro que não é mais necessário
          const newCsTradeItems = await findNewCsTradeItems(csTradeItems);
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

          // Periodically clean up old items (once a day, adjusted probability)
          if (Math.random() < 0.1) {
            console.log("Running periodic cleanup of old items...");
            await cleanupOldItems(30); // Keep last 30 days of data
          }
        } else {
          console.warn("No CS.Trade items retrieved or invalid response format");
        }
      } catch (error) {
        console.error("Error processing CS.Trade items:", error);
      }
    }

    // Process MannCo items if enabled
    if (runMannCo && config?.mann_co?.enabled) {
      console.log("\n--- Processing MannCo items ---");
      try {
        const mannCoItems = await fetchMannCoItems();

        if (mannCoItems && mannCoItems.length > 0) {
          // Find new items - adicionando await aqui
          const newMannCoItems = await findNewMannCoItems(mannCoItems);
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
    await saveStoredData(storedData); // Adicionando await aqui também
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
