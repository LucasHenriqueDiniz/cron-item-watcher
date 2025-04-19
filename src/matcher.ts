import { CsTradeItem, MannCoItem, MatchedItem, GAME_IDS } from "./types.js";
import config from "./config.js";

/**
 * Check if the item belongs to one of the watched games for CS.Trade
 */
function isWatchedCsTradedGame(appId: string): boolean {
  // Defensive check for config structure
  if (!config?.cs_trade?.watchGames) {
    console.error("CS.Trade watchGames configuration is missing");
    return false;
  }

  const watchGames = config.cs_trade.watchGames;
  if (appId === GAME_IDS.tf2 && watchGames.tf2) return true;
  if (appId === GAME_IDS.cs2 && watchGames.cs2) return true;
  if (appId === GAME_IDS.dota2 && watchGames.dota2) return true;
  if (appId === GAME_IDS.rust && watchGames.rust) return true;
  return false;
}

/**
 * Get the game name for a given app ID
 */
function getGameName(appId: string): string {
  if (appId === GAME_IDS.tf2) return "tf2";
  if (appId === GAME_IDS.cs2) return "cs2";
  if (appId === GAME_IDS.dota2) return "dota2";
  if (appId === GAME_IDS.rust) return "rust";
  return "unknown";
}

/**
 * Check if the item name contains any ignored terms
 */
function containsIgnoredTerm(name: string, ignoredTerms: string[]): boolean {
  return ignoredTerms.some((term) => name.toLowerCase().includes(term.toLowerCase()));
}

export function matchCsTradeItems(items: CsTradeItem[]): MatchedItem[] {
  // Ensure config is properly structured
  if (!config?.cs_trade?.watchTerms || !config?.cs_trade?.ignoredTerms) {
    console.error("CS.Trade configuration is incomplete");
    return [];
  }

  const { watchTerms, ignoredTerms, maxPrice } = config.cs_trade;
  const results: MatchedItem[] = [];

  // Filter items by game, price, and ignore terms
  const filteredItems = items.filter((item) => {
    // Check if it's a watched game
    if (!isWatchedCsTradedGame(item.a)) return false;

    // Check price if maxPrice is specified
    if (maxPrice !== null && item.p > maxPrice) return false;

    // Check if it contains ignored terms
    if (item.n && typeof item.n === "string" && containsIgnoredTerm(item.n, ignoredTerms)) {
      return false;
    }

    return true;
  });

  console.log(`Checking ${filteredItems.length} CS.Trade items (after filtering) against ${watchTerms.length} watch terms`);

  for (const item of filteredItems) {
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
          game: getGameName(item.a),
        };

        // Use default class-based image URL if item.c exists
        if (item.c) {
          matchedItem.imageUrl = `https://community.akamai.steamstatic.com/economy/image/class/${item.a}/${item.c}/330x192`;
        }

        results.push(matchedItem);
        console.log(`Matched CS.Trade item: ${item.n} (ID: ${item.id}, Game: ${matchedItem.game}) with term: ${term}`);
        break; // Once we match a term, no need to check other terms
      }
    }
  }

  return results;
}

export function matchMannCoItems(items: MannCoItem[]): MatchedItem[] {
  // Ensure config is properly structured
  if (!config?.mann_co?.watchTerms || !config?.mann_co?.ignoredTerms || !config?.mann_co?.watchGames) {
    console.error("MannCo configuration is incomplete");
    return [];
  }

  const { watchTerms, ignoredTerms, maxPrice, watchGames } = config.mann_co;
  const results: MatchedItem[] = [];

  // Filter by game, price, and ignored terms
  const filteredItems = items.filter((item) => {
    // Check if it's from an enabled game
    const gameName = item._game || "tf2"; // Default to tf2 if not specified
    if (
      (gameName === "tf2" && !watchGames.tf2) ||
      (gameName === "cs2" && !watchGames.cs2) ||
      (gameName === "dota2" && !watchGames.dota2) ||
      (gameName === "rust" && !watchGames.rust)
    ) {
      return false;
    }

    // Check price if maxPrice is specified
    if (maxPrice !== null && item.price > maxPrice) return false;

    // Check if it contains ignored terms
    if (item.name && typeof item.name === "string" && containsIgnoredTerm(item.name, ignoredTerms)) {
      return false;
    }

    return true;
  });

  console.log(`Checking ${filteredItems.length} MannCo items (after filtering) against ${watchTerms.length} watch terms`);

  for (const item of filteredItems) {
    for (const term of watchTerms) {
      if (item.name && typeof item.name === "string" && item.name.toLowerCase().includes(term.toLowerCase())) {
        // Use the _game property we added during scraping
        const game = item._game || "tf2"; // Default to tf2 if not specified

        results.push({
          source: "mann_co",
          name: item.name,
          price: item.price,
          id: item.id,
          imageUrl: item.image ? `https://steamcommunity-a.akamaihd.net/economy/image/${item.image}/200fx200f` : undefined,
          itemUrl: `https://mannco.store/item/${item.url}`,
          matchedTerm: term,
          game: game,
        });
        console.log(`Matched MannCo item: ${item.name} (ID: ${item.id}, Game: ${game}) with term: ${term}`);
        break; // Once we match a term, no need to check other terms
      }
    }
  }

  return results;
}
