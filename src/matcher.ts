import { CsTradeItem, MannCoItem, MatchedItem } from "./types.js";
import config from "./config.js";

export function matchCsTradeItems(items: CsTradeItem[]): MatchedItem[] {
  const { watchTerms, maxPrice } = config.cs_trade;
  const results: MatchedItem[] = [];

  // Filter items by price first for efficiency (if maxPrice is specified)
  const pricedItems = maxPrice === null ? items : items.filter((item) => item.p <= maxPrice);

  for (const item of pricedItems) {
    for (const term of watchTerms) {
      if (item.n.toLowerCase().includes(term.toLowerCase())) {
        results.push({
          source: "cs_trade",
          name: item.n,
          price: item.p,
          id: item.id,
          matchedTerm: term,
          itemUrl: `https://cs.trade/trade#${item.id}`,
          // Generate image URL from CS.Trade class ID
          imageUrl: `https://community.akamai.steamstatic.com/economy/image/class/${item.a}/${item.c}/330x192`,
        });
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

  for (const item of pricedItems) {
    for (const term of watchTerms) {
      if (item.name.toLowerCase().includes(term.toLowerCase())) {
        results.push({
          source: "mann_co",
          name: item.name,
          price: item.price,
          id: item.id,
          imageUrl: `https://steamcommunity-a.akamaihd.net/economy/image/${item.image}/200fx200f`,
          itemUrl: `https://mannco.store/item/${item.url}`,
          matchedTerm: term,
        });
        break; // Once we match a term, no need to check other terms
      }
    }
  }

  return results;
}
