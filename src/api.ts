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
      },
      // Set reasonable timeout
      timeout: 30000,
    });

    if (!response.data || !Array.isArray(response.data)) {
      console.error(
        `CS.Trade API returned invalid data format. Response:`,
        typeof response.data === "object" ? JSON.stringify(response.data).substring(0, 200) + "..." : response.data
      );
      return [];
    }

    console.log(`CS.Trade API request successful. Retrieved ${response.data.length} items.`);
    // Log a sample of the first item to verify data structure
    if (response.data.length > 0) {
      console.log(`Sample item data: ${JSON.stringify(response.data[0]).substring(0, 200)}...`);
    }

    return response.data;
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
    // MannCo returns in ASC order with a limit of 50 items
    const url =
      "https://mannco.store/items/filters?quality=&class=&killstreak=&wear=&search=&price=DESC&deals=&paint=&page=1&i=0&game=440&effect=&warpaints=&type=&parts=&spell=&festivized=&age=DESC&sold=&range=&stock=&skip=50";

    console.log(`Making request to MannCo API: ${url}`);

    const response = await axios.get(url, {
      headers: {
        accept: "*/*",
        "sec-ch-ua": '"Brave";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "x-requested-with": "XMLHttpRequest",
        Referer: "https://mannco.store/tf2?&page=1&age=DESC",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      },
      // Set reasonable timeout
      timeout: 30000,
    });

    if (!response.data || !Array.isArray(response.data)) {
      console.error(
        `MannCo API returned invalid data format. Response:`,
        typeof response.data === "object" ? JSON.stringify(response.data).substring(0, 200) + "..." : response.data
      );
      return [];
    }

    console.log(`MannCo API request successful. Retrieved ${response.data.length} items.`);
    // Log a sample of the first item to verify data structure
    if (response.data.length > 0) {
      console.log(`Sample item data: ${JSON.stringify(response.data[0]).substring(0, 200)}...`);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`MannCo API request failed: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        if (error.response.status === 403) {
          console.error("Access forbidden. The API might be blocking requests from GitHub Actions servers.");
          console.error("Consider adding more realistic browser headers or implementing a delay between requests.");
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
