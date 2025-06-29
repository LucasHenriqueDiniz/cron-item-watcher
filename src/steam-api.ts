import axios from 'axios';
import { MannCoItem } from './types.js';

// Interface for Steam inventory item
interface SteamInventoryItem {
  appid: number;
  contextid: string;
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
  descriptions: Array<{
    type: string;
    value: string;
    color?: string;
  }>;
  market_hash_name: string;
  market_name: string;
  market_tradable_restriction?: number;
  marketable: number;
  tradable: number;
  tags?: Array<{
    category: string;
    internal_name: string;
    localized_category_name: string;
    localized_tag_name: string;
    color?: string;
  }>;
  icon_url: string;
  icon_url_large?: string;
  name_color?: string;
}

interface SteamInventoryResponse {
  assets: SteamInventoryItem[];
  descriptions: any[];
  success: number;
  rwgrsn: number;
}

/**
 * Fetches the TF2 inventory for a specified Steam ID
 * 
 * @param steamId The SteamID64 to fetch inventory from
 * @returns Promise with inventory items or null if failed
 */
async function fetchSteamInventory(steamId: string): Promise<SteamInventoryItem[] | null> {
  const appId = '440'; // TF2
  const contextId = '2';
  const language = 'english';
  const count = '5000';

  try {
    const url = `https://steamcommunity.com/inventory/${steamId}/${appId}/${contextId}?l=${language}&count=${count}`;
    
    console.log(`Fetching Steam inventory for ID: ${steamId}`);
    const response = await axios.get<SteamInventoryResponse>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (response.data && response.data.success === 1 && response.data.assets) {
      console.log(`Successfully fetched ${response.data.assets.length} items from Steam inventory for ID: ${steamId}`);
      return response.data.assets;
    } else {
      console.error(`Failed to fetch Steam inventory for ID: ${steamId}`, response.data);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching Steam inventory for ID: ${steamId}:`, error);
    return null;
  }
}

/**
 * Fetches TF2 items from multiple Steam bot inventories
 * 
 * @param steamIds Array of Steam IDs to check
 * @returns Array of MannCoItem objects
 */
export async function fetchSteamBotInventories(steamIds: string[]): Promise<MannCoItem[]> {
  const allItems: MannCoItem[] = [];
  let uniqueId = 1;
  
  console.log(`Starting to fetch items from ${steamIds.length} Steam bot inventories`);
  
  // Process each Steam ID
  for (const steamId of steamIds) {
    try {
      const inventoryItems = await fetchSteamInventory(steamId);
      
      if (!inventoryItems) {
        console.warn(`No items found for Steam ID: ${steamId}`);
        continue;
      }
      
      // Convert Steam inventory items to MannCoItem format
      for (const item of inventoryItems) {
        if (item.tradable !== 1) continue; // Skip untradable items
        
        // Extract effect if exists (usually in descriptions)
        let effect: string | undefined;
        let effectId: number | undefined;
        let price: number | undefined;
        
        // Extract unusual effect info from descriptions
        if (item.descriptions) {
          for (const desc of item.descriptions) {
            if (desc.value.includes('Unusual Effect:')) {
              effect = desc.value.replace('Unusual Effect: ', '').trim();
              
              // Extract effect ID if possible
              const effectIdMatch = desc.value.match(/Unusual Effect: (.+) \((\d+)\)/);
              if (effectIdMatch && effectIdMatch[2]) {
                effectId = parseInt(effectIdMatch[2], 10);
              }
            }
            
            // Try to find price information (not always available)
            if (desc.value.includes('$') || desc.value.includes('€')) {
              const priceMatch = desc.value.match(/\$([\d.]+)/);
              if (priceMatch && priceMatch[1]) {
                price = parseFloat(priceMatch[1]);
              }
            }
          }
        }
        
        // Use a fallback price if not found
        if (!price) price = 0;
        
        // Generate a unique ID for this item
        const id = `${steamId}_${item.classid}_${item.instanceid}_${uniqueId++}`;
        
        // Create the MannCoItem object
        const mannCoItem: MannCoItem = {
          id: parseInt(id.replace(/\D/g, '').slice(0, 8), 10), // Create a numeric ID
          name: item.market_hash_name || item.market_name,
          price: price,
          image: `https://steamcommunity-a.akamaihd.net/economy/image/${item.icon_url}`,
          imageUrl: `https://steamcommunity-a.akamaihd.net/economy/image/${item.icon_url}`,
          itemUrl: `https://steamcommunity.com/profiles/${steamId}/inventory/#${item.appid}_${item.contextid}_${item.assetid}`,
          game: 'tf2',
          effect: effect,
          effectId: effectId,
          steamId: steamId,
          assetId: item.assetid,
          classId: item.classid,
          instanceId: item.instanceid
        };
        
        allItems.push(mannCoItem);
      }
      
      console.log(`Processed ${inventoryItems.length} items from Steam ID: ${steamId}`);
    } catch (error) {
      console.error(`Error processing Steam ID: ${steamId}:`, error);
    }
    
    // Add a small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`Total TF2 items found from Steam bots: ${allItems.length}`);
  return allItems;
}

// Function to get Steam bot IDs from environment variable
export function getSteamBotIds(): string[] {
  const steamBotIdsEnv = process.env.STEAM_BOT_IDS || '';
  return steamBotIdsEnv
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0);
}
