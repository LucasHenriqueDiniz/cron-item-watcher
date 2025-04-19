import axios from "axios";
import { CsTradeItem, MannCoItem } from "./types.js";

export async function fetchCsTradeItems(): Promise<CsTradeItem[]> {
  try {
    const timestamp = Date.now();
    const url = `https://cdn.cs.trade:8443/api/getInventoryCmp?order_by=price_desc&bot=all&_=${timestamp}`;

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
    });

    console.log(`CS.Trade API returned ${response.data.length} items`);
    return response.data;
  } catch (error) {
    console.error("Error fetching CS.Trade items:", error);
    return [];
  }
}

export async function fetchMannCoItems(): Promise<MannCoItem[]> {
  try {
    // MannCo returns in ASC order with a limit of 50 items
    const url =
      "https://mannco.store/items/filters?quality=&class=&killstreak=&wear=&search=&price=DESC&deals=&paint=&page=1&i=0&game=440&effect=&warpaints=&type=&parts=&spell=&festivized=&age=DESC&sold=&range=&stock=&skip=50";

    const response = await axios.get(url, {
      headers: {
        accept: "*/*",
        "sec-ch-ua": '"Brave";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "x-requested-with": "XMLHttpRequest",
        Referer: "https://mannco.store/tf2?&page=1&age=DESC",
      },
    });

    console.log(`MannCo API returned ${response.data.length} items`);
    return response.data;
  } catch (error) {
    console.error("Error fetching MannCo items:", error);
    return [];
  }
}
