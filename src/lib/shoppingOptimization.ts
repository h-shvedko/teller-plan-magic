// Shopping List Optimization and Intelligence Library
// Provides comprehensive shopping list features including price comparison, substitutions, pantry management, optimization, and bulk buying

export interface PriceComparison {
  store_name: string;
  store_id: string;
  price_per_unit: number;
  unit: string;
  total_price: number;
  discount_percentage?: number;
  is_on_sale: boolean;
  availability: 'in_stock' | 'limited' | 'out_of_stock';
  distance_km?: number;
  delivery_available: boolean;
  pickup_available: boolean;
  last_updated: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimated_price: number;
  priority: 'essential' | 'important' | 'optional';
  recipe_source?: string[];
  pantry_check?: boolean;
  substitution_available?: boolean;
}

export interface StoreLayout {
  store_id: string;
  store_name: string;
  aisles: {
    aisle_number: number;
    aisle_name: string;
    categories: string[];
    typical_order: number;
  }[];
  entrance_location: 'front' | 'side' | 'back';
  checkout_location: 'front' | 'distributed';
  special_sections: {
    name: string;
    location: string;
    categories: string[];
  }[];
}

export interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiration_date?: string;
  purchase_date: string;
  storage_location: string;
  minimum_threshold: number;
  reorder_quantity: number;
  estimated_price: number;
  barcode?: string;
  notes?: string;
}

export interface BulkBuyingRecommendation {
  item_name: string;
  current_quantity: number;
  recommended_quantity: number;
  savings_percentage: number;
  savings_amount: number;
  storage_requirements: string;
  shelf_life_days: number;
  usage_frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
  cost_per_use_current: number;
  cost_per_use_bulk: number;
  reason: string;
  bulk_store_recommendations: string[];
}

export interface OptimizedShoppingList {
  items: ShoppingItem[];
  estimated_total: number;
  estimated_time_minutes: number;
  store_route: {
    aisle_number: number;
    aisle_name: string;
    items: ShoppingItem[];
    estimated_time_minutes: number;
  }[];
  money_saving_tips: string[];
  substitution_suggestions: {
    original_item: string;
    substitute_item: string;
    price_difference: number;
    availability_better: boolean;
  }[];
  bulk_opportunities: BulkBuyingRecommendation[];
}

// Store Database - Major grocery chains with basic info
export const GROCERY_STORES: { [key: string]: StoreLayout } = {
  'walmart': {
    store_id: 'walmart',
    store_name: 'Walmart',
    entrance_location: 'front',
    checkout_location: 'front',
    aisles: [
      { aisle_number: 1, aisle_name: 'Fresh Produce', categories: ['fruits', 'vegetables', 'herbs'], typical_order: 1 },
      { aisle_number: 2, aisle_name: 'Bakery & Deli', categories: ['bread', 'pastries', 'deli_meats'], typical_order: 2 },
      { aisle_number: 3, aisle_name: 'Meat & Seafood', categories: ['beef', 'chicken', 'pork', 'fish'], typical_order: 3 },
      { aisle_number: 4, aisle_name: 'Dairy & Eggs', categories: ['milk', 'cheese', 'yogurt', 'eggs'], typical_order: 4 },
      { aisle_number: 5, aisle_name: 'Pantry Staples', categories: ['rice', 'pasta', 'canned_goods', 'oils'], typical_order: 5 },
      { aisle_number: 6, aisle_name: 'Snacks & Beverages', categories: ['chips', 'cookies', 'sodas', 'juices'], typical_order: 6 },
      { aisle_number: 7, aisle_name: 'Frozen Foods', categories: ['frozen_vegetables', 'ice_cream', 'frozen_meals'], typical_order: 7 },
      { aisle_number: 8, aisle_name: 'Health & Beauty', categories: ['vitamins', 'toiletries', 'pharmacy'], typical_order: 8 }
    ],
    special_sections: [
      { name: 'Pharmacy', location: 'back_right', categories: ['prescriptions', 'otc_medicines'] },
      { name: 'Customer Service', location: 'front_right', categories: ['returns', 'money_orders'] }
    ]
  },
  'kroger': {
    store_id: 'kroger',
    store_name: 'Kroger',
    entrance_location: 'front',
    checkout_location: 'front',
    aisles: [
      { aisle_number: 1, aisle_name: 'Produce', categories: ['fruits', 'vegetables', 'herbs', 'organic'], typical_order: 1 },
      { aisle_number: 2, aisle_name: 'Floral & Bakery', categories: ['flowers', 'bread', 'cakes'], typical_order: 2 },
      { aisle_number: 3, aisle_name: 'Deli & Prepared Foods', categories: ['deli_meats', 'prepared_meals', 'rotisserie'], typical_order: 3 },
      { aisle_number: 4, aisle_name: 'Meat & Seafood', categories: ['beef', 'chicken', 'pork', 'fish', 'shellfish'], typical_order: 4 },
      { aisle_number: 5, aisle_name: 'Dairy', categories: ['milk', 'cheese', 'yogurt', 'butter'], typical_order: 5 },
      { aisle_number: 6, aisle_name: 'Natural & Organic', categories: ['organic_foods', 'gluten_free', 'health_foods'], typical_order: 6 },
      { aisle_number: 7, aisle_name: 'Grocery', categories: ['canned_goods', 'pasta', 'rice', 'condiments'], typical_order: 7 },
      { aisle_number: 8, aisle_name: 'Frozen', categories: ['frozen_vegetables', 'ice_cream', 'frozen_dinners'], typical_order: 8 }
    ],
    special_sections: [
      { name: 'Starbucks', location: 'front_left', categories: ['coffee', 'pastries'] },
      { name: 'Pharmacy', location: 'back_center', categories: ['prescriptions', 'health_products'] }
    ]
  }
};

// Price comparison functionality
export function comparePrices(itemName: string, quantity: number, unit: string): PriceComparison[] {
  // Mock price data - in real implementation would connect to grocery APIs
  const mockPrices: PriceComparison[] = [
    {
      store_name: 'Walmart',
      store_id: 'walmart',
      price_per_unit: 2.98,
      unit: 'lb',
      total_price: quantity * 2.98,
      is_on_sale: false,
      availability: 'in_stock',
      distance_km: 2.5,
      delivery_available: true,
      pickup_available: true,
      last_updated: new Date().toISOString()
    },
    {
      store_name: 'Kroger',
      store_id: 'kroger',
      price_per_unit: 3.49,
      unit: 'lb',
      total_price: quantity * 3.49,
      discount_percentage: 15,
      is_on_sale: true,
      availability: 'in_stock',
      distance_km: 1.8,
      delivery_available: true,
      pickup_available: true,
      last_updated: new Date().toISOString()
    },
    {
      store_name: 'Target',
      store_id: 'target',
      price_per_unit: 3.29,
      unit: 'lb',
      total_price: quantity * 3.29,
      is_on_sale: false,
      availability: 'limited',
      distance_km: 3.2,
      delivery_available: false,
      pickup_available: true,
      last_updated: new Date().toISOString()
    }
  ];

  return mockPrices.sort((a, b) => a.total_price - b.total_price);
}

// Smart ingredient substitutions
export const INGREDIENT_SUBSTITUTIONS = {
  'ground_beef': [
    { substitute: 'ground_turkey', price_factor: 0.9, health_benefit: 'Lower fat content', availability_factor: 1.1 },
    { substitute: 'ground_chicken', price_factor: 0.85, health_benefit: 'Lean protein', availability_factor: 1.0 },
    { substitute: 'plant_based_ground', price_factor: 1.4, health_benefit: 'Vegan option', availability_factor: 0.8 }
  ],
  'butter': [
    { substitute: 'margarine', price_factor: 0.7, health_benefit: 'Lower cholesterol', availability_factor: 1.2 },
    { substitute: 'coconut_oil', price_factor: 1.3, health_benefit: 'Natural option', availability_factor: 0.9 },
    { substitute: 'olive_oil', price_factor: 1.1, health_benefit: 'Heart healthy', availability_factor: 1.0 }
  ],
  'heavy_cream': [
    { substitute: 'half_and_half', price_factor: 0.8, health_benefit: 'Lower calories', availability_factor: 1.1 },
    { substitute: 'coconut_cream', price_factor: 1.2, health_benefit: 'Dairy free', availability_factor: 0.7 },
    { substitute: 'greek_yogurt', price_factor: 0.9, health_benefit: 'High protein', availability_factor: 1.0 }
  ]
};

export function findSubstitutions(itemName: string): Array<{
  substitute: string;
  price_factor: number;
  health_benefit: string;
  availability_factor: number;
}> {
  const normalizedName = itemName.toLowerCase().replace(/\s+/g, '_');
  return INGREDIENT_SUBSTITUTIONS[normalizedName as keyof typeof INGREDIENT_SUBSTITUTIONS] || [];
}

// Pantry management
export function checkPantryAvailability(shoppingItems: ShoppingItem[], pantryItems: PantryItem[]): ShoppingItem[] {
  return shoppingItems.map(item => {
    const pantryMatch = pantryItems.find(pantryItem => 
      pantryItem.name.toLowerCase() === item.name.toLowerCase() &&
      pantryItem.quantity >= item.quantity
    );
    
    if (pantryMatch) {
      return {
        ...item,
        pantry_check: true,
        quantity: Math.max(0, item.quantity - pantryMatch.quantity)
      };
    }
    
    return { ...item, pantry_check: false };
  }).filter(item => item.quantity > 0);
}

export function getLowStockItems(pantryItems: PantryItem[]): PantryItem[] {
  return pantryItems.filter(item => item.quantity <= item.minimum_threshold);
}

export function getExpiringItems(pantryItems: PantryItem[], daysAhead: number = 7): PantryItem[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + daysAhead);
  
  return pantryItems.filter(item => {
    if (!item.expiration_date) return false;
    return new Date(item.expiration_date) <= cutoffDate;
  });
}

// Store layout optimization
export function optimizeShoppingRoute(items: ShoppingItem[], storeId: string): OptimizedShoppingList {
  const store = GROCERY_STORES[storeId];
  if (!store) {
    throw new Error(`Store ${storeId} not found`);
  }

  // Categorize items by aisle
  const itemsByAisle: { [key: number]: ShoppingItem[] } = {};
  let uncategorizedItems: ShoppingItem[] = [];

  items.forEach(item => {
    let assigned = false;
    for (const aisle of store.aisles) {
      if (aisle.categories.includes(item.category)) {
        if (!itemsByAisle[aisle.aisle_number]) {
          itemsByAisle[aisle.aisle_number] = [];
        }
        itemsByAisle[aisle.aisle_number].push(item);
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      uncategorizedItems.push(item);
    }
  });

  // Create optimized route
  const route = store.aisles
    .filter(aisle => itemsByAisle[aisle.aisle_number])
    .sort((a, b) => a.typical_order - b.typical_order)
    .map(aisle => ({
      aisle_number: aisle.aisle_number,
      aisle_name: aisle.aisle_name,
      items: itemsByAisle[aisle.aisle_number],
      estimated_time_minutes: Math.ceil(itemsByAisle[aisle.aisle_number].length * 1.5) // 1.5 min per item
    }));

  // Add uncategorized items to the last aisle
  if (uncategorizedItems.length > 0 && route.length > 0) {
    route[route.length - 1].items.push(...uncategorizedItems);
    route[route.length - 1].estimated_time_minutes += Math.ceil(uncategorizedItems.length * 1.5);
  }

  const estimatedTotal = items.reduce((sum, item) => sum + item.estimated_price, 0);
  const estimatedTime = route.reduce((sum, aisle) => sum + aisle.estimated_time_minutes, 0) + 10; // +10 for checkout

  // Generate substitution suggestions
  const substitutionSuggestions = items.map(item => {
    const subs = findSubstitutions(item.name);
    return subs.map(sub => ({
      original_item: item.name,
      substitute_item: sub.substitute,
      price_difference: (sub.price_factor - 1) * item.estimated_price,
      availability_better: sub.availability_factor > 1
    }));
  }).flat();

  // Generate money saving tips
  const moneySavingTips = [
    'Check store flyers for weekly deals before shopping',
    'Use store loyalty cards and apps for exclusive discounts',
    'Buy generic/store brands when quality is comparable',
    'Shop perimeter first for fresh items, then move to packaged goods',
    'Stick to your list to avoid impulse purchases'
  ];

  // Generate bulk buying recommendations
  const bulkOpportunities = generateBulkBuyingRecommendations(items);

  return {
    items,
    estimated_total: estimatedTotal,
    estimated_time_minutes: estimatedTime,
    store_route: route,
    money_saving_tips: moneySavingTips,
    substitution_suggestions: substitutionSuggestions.slice(0, 5), // Top 5 suggestions
    bulk_opportunities: bulkOpportunities
  };
}

// Bulk buying recommendations
export function generateBulkBuyingRecommendations(items: ShoppingItem[]): BulkBuyingRecommendation[] {
  const bulkCandidates = items.filter(item => 
    ['rice', 'pasta', 'canned_goods', 'toilet_paper', 'detergent'].includes(item.category)
  );

  return bulkCandidates.map(item => {
    const bulkSavings = calculateBulkSavings(item);
    return {
      item_name: item.name,
      current_quantity: item.quantity,
      recommended_quantity: Math.max(item.quantity * 3, 10), // At least 3x or 10 units
      savings_percentage: bulkSavings.savings_percentage,
      savings_amount: bulkSavings.savings_amount,
      storage_requirements: getBulkStorageRequirements(item.category),
      shelf_life_days: getShelfLifeDays(item.category),
      usage_frequency: getUsageFrequency(item.category),
      cost_per_use_current: item.estimated_price / item.quantity,
      cost_per_use_bulk: bulkSavings.bulk_cost_per_use,
      reason: bulkSavings.reason,
      bulk_store_recommendations: ['Costco', 'Sam\'s Club', 'BJ\'s Wholesale']
    };
  }).filter(rec => rec.savings_percentage >= 10); // Only show if 10%+ savings
}

function calculateBulkSavings(item: ShoppingItem) {
  // Mock bulk pricing calculation
  const bulkMultiplier = Math.max(3, Math.floor(10 / item.quantity));
  const bulkDiscount = Math.min(0.25, 0.05 * bulkMultiplier); // Up to 25% discount
  const regularCost = item.estimated_price;
  const bulkCost = regularCost * bulkMultiplier * (1 - bulkDiscount);
  const savings = (regularCost * bulkMultiplier) - bulkCost;
  
  return {
    savings_percentage: Math.round(bulkDiscount * 100),
    savings_amount: savings,
    bulk_cost_per_use: bulkCost / (item.quantity * bulkMultiplier),
    reason: `Buying ${bulkMultiplier}x quantity saves ${bulkDiscount * 100}% through bulk pricing`
  };
}

function getBulkStorageRequirements(category: string): string {
  const requirements: { [key: string]: string } = {
    'rice': 'Cool, dry pantry space in airtight container',
    'pasta': 'Pantry shelf space, keep in original packaging',
    'canned_goods': 'Pantry or basement storage, room temperature',
    'toilet_paper': 'Dry storage area, linen closet or utility room',
    'detergent': 'Laundry room or utility closet, away from heat'
  };
  return requirements[category] || 'Standard pantry storage';
}

function getShelfLifeDays(category: string): number {
  const shelfLives: { [key: string]: number } = {
    'rice': 1095, // 3 years
    'pasta': 730, // 2 years
    'canned_goods': 1095, // 3 years
    'toilet_paper': 1825, // 5 years
    'detergent': 365 // 1 year
  };
  return shelfLives[category] || 365;
}

function getUsageFrequency(category: string): 'daily' | 'weekly' | 'monthly' | 'occasional' {
  const frequencies: { [key: string]: 'daily' | 'weekly' | 'monthly' | 'occasional' } = {
    'rice': 'weekly',
    'pasta': 'weekly', 
    'canned_goods': 'monthly',
    'toilet_paper': 'daily',
    'detergent': 'weekly'
  };
  return frequencies[category] || 'monthly';
}

// Shopping list analytics
export function calculateShoppingSavings(originalList: ShoppingItem[], optimizedList: OptimizedShoppingList): {
  total_savings: number;
  time_saved_minutes: number;
  substitution_savings: number;
  bulk_savings: number;
  route_efficiency_improvement: number;
} {
  const originalTotal = originalList.reduce((sum, item) => sum + item.estimated_price, 0);
  const optimizedTotal = optimizedList.estimated_total;
  
  const substitutionSavings = optimizedList.substitution_suggestions
    .reduce((sum, sub) => sum + Math.abs(Math.min(0, sub.price_difference)), 0);
    
  const bulkSavings = optimizedList.bulk_opportunities
    .reduce((sum, bulk) => sum + bulk.savings_amount, 0);

  return {
    total_savings: originalTotal - optimizedTotal + substitutionSavings + bulkSavings,
    time_saved_minutes: Math.max(0, (originalList.length * 2) - optimizedList.estimated_time_minutes),
    substitution_savings: substitutionSavings,
    bulk_savings: bulkSavings,
    route_efficiency_improvement: Math.round(((originalList.length * 2) - optimizedList.estimated_time_minutes) / (originalList.length * 2) * 100)
  };
}