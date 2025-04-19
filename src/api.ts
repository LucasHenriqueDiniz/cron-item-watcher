import axios from "axios";
import { CsTradeItem, MannCoItem } from "./types.js";
import config from "./config.js";
import { scrapeMannCoItems } from "./mannco-scraper.js";

export async function fetchCsTradeItems(): Promise<CsTradeItem[]> {
  try {
    const timestamp = Date.now();
    const url = `https://cdn.cs.trade:8443/api/getInventoryCmp?order_by=price_desc&bot=all&_=${timestamp}`;

    console.log(`Making request to CS.Trade API: ${url}`);

    const response = await axios.get(url, {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "sec-ch-ua": '"Brave";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        Referer: "https://cs.trade/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      },
      timeout: 30000,
    });

    // Log the structure of the response to understand it
    console.log(`CS.Trade API response structure: keys = ${Object.keys(response.data)}`);

    // Check if the response is the expected format (an object with inventory array)
    if (response.data && response.data.inventory && Array.isArray(response.data.inventory)) {
      const inventory = response.data.inventory;
      console.log(`CS.Trade API request successful. Retrieved ${inventory.length} items from inventory array.`);

      // Log a sample of the first item to verify data structure
      if (inventory.length > 0) {
        console.log(`Sample item data: ${JSON.stringify(inventory[0]).substring(0, 200)}...`);
      }

      return inventory;
    } else {
      console.error(`CS.Trade API returned unexpected data format.`);
      console.log(`Response data type: ${typeof response.data}`);
      console.log(`Response sample: ${JSON.stringify(response.data).substring(0, 300)}...`);
      return [];
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`CS.Trade API request failed: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
      } else if (error.request) {
        console.error("Request was made but no response received");
      }
    } else {
      console.error(`Unexpected error when fetching CS.Trade items:`, error);
    }
    return [];
  }
}

/**
 * Fetch MannCo items using web scraping
 */
export async function fetchMannCoItems(): Promise<MannCoItem[]> {
  // Check if any games are enabled for MannCo
  const anyGameEnabled = Object.values(config.mann_co.watchGames).some((enabled) => enabled);

  if (!config.mann_co.enabled || !anyGameEnabled) {
    console.log("MannCo.store is disabled or no games are enabled in config");
    return [];
  }

  console.log("Fetching MannCo items using web scraping");

  try {
    console.log("Starting MannCo scraping...");

    // Add retry mechanism for robustness
    let retries = 0;
    const maxRetries = 3;
    let items: MannCoItem[] = [];

    while (retries < maxRetries) {
      try {
        items = await scrapeMannCoItems();
        if (items.length > 0) break;

        retries++;
        console.log(`Scraping attempt ${retries} produced 0 items. ${maxRetries - retries} retries left.`);

        // Wait before retrying
        if (retries < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      } catch (innerError) {
        retries++;
        console.error(`Scraping attempt ${retries} failed:`, innerError);

        if (retries < maxRetries) {
          console.log(`Will retry in 5 seconds. ${maxRetries - retries} retries left.`);
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    if (items.length === 0 && retries === maxRetries) {
      console.warn(`MannCo scraping failed after ${maxRetries} attempts.`);
    }

    return items;
  } catch (error) {
    console.error("Error fetching MannCo items:", error);
    return [];
  }
}
