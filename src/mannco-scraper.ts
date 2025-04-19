import puppeteer from "puppeteer";
import { MannCoItem, GAME_IDS, MANNCO_GAME_URLS } from "./types.js";
import config from "./config.js";

interface GameConfig {
  id: string;
  name: string;
  url: string;
}

/**
 * Scrape MannCo.store for items using Puppeteer to bypass Cloudflare
 */
export async function scrapeMannCoItems(): Promise<MannCoItem[]> {
  console.log("Starting MannCo.store scraping with Puppeteer");

  // Configure enabled games
  const enabledGames: GameConfig[] = [];
  if (config.mann_co.watchGames.tf2) {
    enabledGames.push({ id: GAME_IDS.tf2, name: "tf2", url: MANNCO_GAME_URLS.tf2 });
  }
  if (config.mann_co.watchGames.cs2) {
    enabledGames.push({ id: GAME_IDS.cs2, name: "cs2", url: MANNCO_GAME_URLS.cs2 });
  }
  if (config.mann_co.watchGames.dota2) {
    enabledGames.push({ id: GAME_IDS.dota2, name: "dota2", url: MANNCO_GAME_URLS.dota2 });
  }
  if (config.mann_co.watchGames.rust) {
    enabledGames.push({ id: GAME_IDS.rust, name: "rust", url: MANNCO_GAME_URLS.rust });
  }

  if (enabledGames.length === 0) {
    console.log("No games enabled for MannCo.store scraping");
    return [];
  }

  console.log(`Will scrape MannCo.store for games: ${enabledGames.map((g) => g.name.toUpperCase()).join(", ")}`);

  // Launch browser with headless mode
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--window-size=1920x1080",
    ],
    ...(process.env.PUPPETEER_EXECUTABLE_PATH ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH } : {}),
  });

  const allItems: MannCoItem[] = [];

  try {
    // For each enabled game
    for (const game of enabledGames) {
      const gameItems = await scrapeGameItems(browser, game);
      console.log(`Retrieved ${gameItems.length} items for ${game.name.toUpperCase()}`);
      allItems.push(...gameItems);
    }
  } catch (error) {
    console.error("Error during MannCo scraping:", error);
  } finally {
    await browser.close();
    console.log("Browser closed");
  }

  console.log(`Total MannCo items scraped: ${allItems.length}`);
  return allItems;
}

/**
 * Scrape items for a specific game by loading page 5 which triggers multiple API calls
 */
async function scrapeGameItems(browser: puppeteer.Browser, game: GameConfig): Promise<MannCoItem[]> {
  console.log(`Scraping MannCo items for ${game.name}`);
  const page = await browser.newPage();
  const apiResponses: MannCoItem[][] = [];

  try {
    // Configure browser for better stealth
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36");
    await page.setViewport({ width: 1920, height: 1080 });

    // Setup network interception before navigation
    await setupApiInterception(page, game, apiResponses);

    // Navigate to page 5 to get multiple API calls
    const gameUrl = `https://mannco.store/${game.url}?&page=5&age=DESC`;
    console.log(`Navigating to ${gameUrl}`);

    // Navigate and wait for network to be idle
    await page.goto(gameUrl, { waitUntil: "networkidle0", timeout: 90000 });
    console.log("Page loaded completely");

    // Wait for a bit to ensure all API calls are finished
    console.log("Waiting for additional API calls to complete...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Combine all items from the API responses
    const allItems = apiResponses.flat().map((item) => ({
      ...item,
      _game: game.name,
    }));

    if (allItems.length === 0) {
      console.error(`Failed to retrieve any items for ${game.name} via API`);
    }

    console.log(`Collected ${allItems.length} items from ${apiResponses.length} API calls`);
    return allItems;
  } catch (error) {
    console.error(`Error scraping ${game.name} items:`, error);
    return [];
  } finally {
    await page.close();
  }
}

/**
 * Setup interception of API calls to capture item data
 */
async function setupApiInterception(page: puppeteer.Page, game: GameConfig, apiResponses: MannCoItem[][]): Promise<void> {
  // Setup request interception
  await page.setRequestInterception(true);

  // Add a timeout to ensure the function doesn't hang indefinitely
  const timeoutPromise = new Promise<void>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`API interception timeout for ${game.name} after 120 seconds`));
    }, 120000); // 2-minute timeout
  });

  try {
    // Track which skip values we've seen to avoid duplicates
    const processedSkipValues = new Set<string>();

    // Create a promise that will resolve once we've collected data
    const interceptPromise = new Promise<void>((resolve) => {
      // Listen for API responses
      page.on("response", async (response) => {
        const url = response.url();

        // Only process items/get API calls
        if (url.includes("https://mannco.store/items/get?") && url.includes(`game=${game.id}`)) {
          try {
            // Extract the skip parameter from the URL
            const skipMatch = url.match(/skip=(\d+)/);
            const skipValue = skipMatch ? skipMatch[1] : "unknown";

            // Only process each skip value once
            if (processedSkipValues.has(skipValue)) {
              return;
            }

            processedSkipValues.add(skipValue);
            console.log(`Processing API response for ${game.name} with skip=${skipValue}, URL: ${url.substring(0, 100)}...`);

            // Get the response data
            const responseText = await response.text();
            const responseData = JSON.parse(responseText);

            // Handle different response formats
            let items: MannCoItem[] = [];
            if (Array.isArray(responseData)) {
              items = responseData;
            } else if (typeof responseData === "object" && responseData.items && Array.isArray(responseData.items)) {
              items = responseData.items;
            } else {
              console.warn(`Unexpected response format for skip=${skipValue}, cannot extract items`);
              return;
            }

            // Convert price format from mannco (cents to dollars) and ensure effect_url is properly set
            items = items.map((item) => ({
              ...item,
              price: item.price / 100, // Convert from cents to dollars
              effect_url: item.effect_url || undefined, // Ensure effect_url is properly set if present
            }));

            console.log(`Extracted ${items.length} items from API call with skip=${skipValue}`);

            // Add to our collection of responses
            apiResponses.push(items);

            // Log sample of first item
            if (items.length > 0) {
              const sample = JSON.stringify(items[0]).substring(0, 150) + "...";
              console.log(`Sample item for skip=${skipValue}: ${sample}`);
            }

            // If we've collected at least one page of data, resolve the promise
            if (apiResponses.length > 0) {
              resolve();
            }
          } catch (error) {
            console.error(`Error processing API response for ${game.name}:`, error);
          }
        }
      });
    });

    // Wait for either interception success or timeout
    await Promise.race([interceptPromise, timeoutPromise]);
  } catch (error) {
    console.error(`Error during API interception for ${game.name}:`, error);
  } finally {
    // Allow all requests to continue
    page.on("request", (request) => {
      request.continue();
    });

    console.log(`Network interception set up for ${game.name}`);
  }
}
