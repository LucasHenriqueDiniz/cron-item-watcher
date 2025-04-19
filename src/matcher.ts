import { CsTradeItem, MannCoItem, MatchedItem } from "./types.js";
import config from "./config.js";

export function matchCsTradeItems(items: CsTradeItem[]): MatchedItem[] {
  const { watchTerms, maxPrice } = config.cs_trade;
  const results: MatchedItem[] = [];

  // Filter items by price first for efficiency (if maxPrice is specified)
  const pricedItems = maxPrice === null ? items : items.filter((item) => item.p <= maxPrice);

  console.log(`Checking ${pricedItems.length} CS.Trade items against ${watchTerms.length} watch terms`);

  for (const item of pricedItems) {
    for (const term of watchTerms) {
      // Make sure item.n exists and is a string before using includes
      if (item.n && typeof item.n === "string" && item.n.toLowerCase().includes(term.toLowerCase())) {
        const matchedItem: MatchedItem = {
          source: "cs_trade",
          name: item.n,
          price: item.p,
          id: item.id,
          matchedTerm: term,
          itemUrl: `https://cs.trade/trade#${item.id}`,
        };

        // Use default class-based image URL if item.c exists, otherwise try different format if available
        if (item.c) {
          matchedItem.imageUrl = `https://community.akamai.steamstatic.com/economy/image/class/${item.a || "730"}/${item.c}/330x192`;
        }

        results.push(matchedItem);
        console.log(`Matched CS.Trade item: ${item.n} (ID: ${item.id}) with term: ${term}`);
        break; // Once we match a term, no need to check other terms
      }
    }
  }

  return results;
}

export function matchMannCoItems(items: MannCoItem[]): MatchedItem[] {
  const { watchTerms, maxPrice } = config.mann_co;
  const results: MatchedItem[] = [];

  // Filter items by price first for efficiency (if maxPrice is specified)
  const pricedItems = maxPrice === null ? items : items.filter((item) => item.price <= maxPrice);

  console.log(`Checking ${pricedItems.length} MannCo items against ${watchTerms.length} watch terms`);

  for (const item of pricedItems) {
    for (const term of watchTerms) {
      if (item.name && typeof item.name === "string" && item.name.toLowerCase().includes(term.toLowerCase())) {
        results.push({
          source: "mann_co",
          name: item.name,
          price: item.price,
          id: item.id,
          imageUrl: item.image ? `https://steamcommunity-a.akamaihd.net/economy/image/${item.image}/200fx200f` : undefined,
          itemUrl: `https://mannco.store/item/${item.url}`,
          matchedTerm: term,
        });
        console.log(`Matched MannCo item: ${item.name} (ID: ${item.id}) with term: ${term}`);
        break; // Once we match a term, no need to check other terms
      }
    }
  }

  return results;
}
