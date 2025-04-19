import axios from "axios";
import { CsTradeItem, MannCoItem } from "./types.js";

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

export async function fetchMannCoItems(): Promise<MannCoItem[]> {
  try {
    // Using updated URL from the provided example - this appears to be working better
    const url =
      "https://mannco.store/items/get?quality=&class=&killstreak=&wear=&search=&price=&deals=&paint=&page=0&i=0&game=440&effect=&warpaints=&type=&parts=&spell=&festivized=&age=DESC&sold=&range=&stock=&skip=0";

    console.log(`Making request to MannCo API: ${url}`);

    // Headers exactly as in your working example
    const response = await axios.get(url, {
      headers: {
        accept: "*/*",
        "accept-language": "pt-BR,pt;q=0.9",
        priority: "u=1, i",
        "sec-ch-ua": '"Brave";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "x-requested-with": "XMLHttpRequest",
        // Note about cookies: In a real world scenario, you'd need to
        // refresh this cookie periodically as Cloudflare cookies expire
        cookie:
          "cf_clearance=izPr5vdAPDNjI7ceNZOibBDTxj23D8visB1awJJA_8k-1745081610-1.2.1.1-ZmBVTj5uY4S6x4lt.PPN0bSVEUlZxenX448zKhChT30p68V9T2c4pz66JEex75n865UzJMn.5gZ9TOYxzzakLeu70L2gU9GFT_vfwqbf3SDCz7.DMrBGufanmCg4o3CIhx__1ijp15sKrjmvDWelv0rSdbfwBZl6loXcoVNyB.bOpRS6KCuAEAm_qA3Bq7tONcnnG3PAkas5QFCT6WgtkrgS6rJRgogkQoCIn0LPqUJR28xYR8g5v72z61YVgD1pB6LIVQlHcOYnINFWjEINXYDOlDRGrJoO.zCxQmBbvqZM111uGxr9PFaJ8dIu6_OQm6sISd.9YD1x1QLDWjfyBUICEy.S_8X9SiMbKFtNNVM; game=440",
        Referer: "https://mannco.store/tf2?&page=1&age=DESC",
      },
      timeout: 30000,
    });

    console.log(`MannCo API response type: ${typeof response.data}`);

    if (!response.data) {
      console.error(`MannCo API returned empty data`);
      return [];
    }

    // Handle different possible response formats
    let items: MannCoItem[] = [];

    if (Array.isArray(response.data)) {
      items = response.data;
    } else if (typeof response.data === "object" && response.data.items && Array.isArray(response.data.items)) {
      items = response.data.items;
    } else {
      console.error(`MannCo API returned unexpected format. Response sample:`, JSON.stringify(response.data).substring(0, 200) + "...");
      return [];
    }

    console.log(`MannCo API request successful. Retrieved ${items.length} items.`);

    // Log a sample of the first item to verify data structure
    if (items.length > 0) {
      console.log(`Sample item data: ${JSON.stringify(items[0]).substring(0, 200)}...`);
    }

    return items;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`MannCo API request failed: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        if (error.response.status === 403) {
          console.error("Access forbidden (403). This is likely because we need a valid Cloudflare clearance cookie.");
          console.error("For educational purposes, this would typically require a real browser to solve the Cloudflare challenge.");
          console.error("As this is a school project, consider explaining the limitation or implementing alternative approaches.");
        }
      } else if (error.request) {
        console.error("Request was made but no response received");
      }
    } else {
      console.error(`Unexpected error when fetching MannCo items:`, error);
    }
    return [];
  }
}

// Note: For educational purposes only
// In a real-world implementation, you would need a solution to:
// 1. Obtain and periodically refresh the Cloudflare clearance cookie
// 2. Use a headless browser like Puppeteer to solve Cloudflare challenges
// 3. Or implement a proxy service that handles the Cloudflare challenge for you
