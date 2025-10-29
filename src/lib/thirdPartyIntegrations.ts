// Third-party integrations for grocery delivery, fitness tracking, calendar, smart appliances, and barcode scanning

// Types for various integrations
export interface GroceryDeliveryService {
  id: string;
  name: string;
  logoUrl: string;
  available: boolean;
  deliveryTime: string;
  minimumOrder: number;
  deliveryFee: number;
  serviceUrl: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  brand?: string;
  size: string;
  price: number;
  image?: string;
  category: string;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
  nutritionInfo?: NutritionInfo;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  servingSize: string;
}

export interface DeliveryOrder {
  id: string;
  serviceId: string;
  items: GroceryItem[];
  totalPrice: number;
  deliveryFee: number;
  estimatedDelivery: Date;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  trackingUrl?: string;
}

// Fitness App Integration Types
export interface FitnessApp {
  id: string;
  name: string;
  logoUrl: string;
  connected: boolean;
  apiEndpoint: string;
  supportedMetrics: string[];
}

export interface FitnessGoals {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  weeklyWeightGoal: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export interface FitnessData {
  date: Date;
  caloriesConsumed: number;
  caloriesBurned: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  weight?: number;
  steps?: number;
  activeMinutes?: number;
}

// Calendar Integration Types
export interface CalendarProvider {
  id: string;
  name: string;
  logoUrl: string;
  connected: boolean;
  calendars: Calendar[];
}

export interface Calendar {
  id: string;
  name: string;
  color: string;
  readOnly: boolean;
  selected: boolean;
}

export interface MealEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  calendarId: string;
  mealPlanId?: string;
  recipeId?: string;
  reminders: number[]; // minutes before event
  location?: string;
}

// Smart Kitchen Appliances Types
export interface SmartAppliance {
  id: string;
  name: string;
  type: 'oven' | 'refrigerator' | 'dishwasher' | 'coffee_maker' | 'slow_cooker' | 'air_fryer' | 'instant_pot';
  brand: string;
  model: string;
  connected: boolean;
  status: 'offline' | 'idle' | 'running' | 'error';
  capabilities: ApplianceCapability[];
  currentProgram?: CookingProgram;
}

export interface ApplianceCapability {
  name: string;
  description: string;
  parameters: string[];
}

export interface CookingProgram {
  id: string;
  name: string;
  temperature?: number;
  duration: number; // in minutes
  steps?: CookingStep[];
  status: 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
}

export interface CookingStep {
  id: string;
  instruction: string;
  duration: number;
  temperature?: number;
  completed: boolean;
}

// Barcode Scanning Types
export interface BarcodeProduct {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  image?: string;
  nutritionInfo: NutritionInfo;
  ingredients: string[];
  allergens: string[];
  expirationDate?: Date;
  purchaseDate?: Date;
  location?: string;
}

export interface PantryItem extends BarcodeProduct {
  id: string;
  quantity: number;
  unit: string;
  addedDate: Date;
  lastUpdated: Date;
  lowStockThreshold: number;
  notes?: string;
}

// Service Classes

// Grocery Delivery Integration
export class GroceryDeliveryIntegration {
  private readonly INSTACART_API_KEY = import.meta.env.VITE_INSTACART_API_KEY || 'mock_instacart_key';
  private readonly AMAZON_FRESH_API_KEY = import.meta.env.VITE_AMAZON_FRESH_API_KEY || 'mock_amazon_fresh_key';

  private services: GroceryDeliveryService[] = [
    {
      id: 'instacart',
      name: 'Instacart',
      logoUrl: '/logos/instacart.png',
      available: true,
      deliveryTime: '1-2 hours',
      minimumOrder: 35,
      deliveryFee: 3.99,
      serviceUrl: 'https://api.instacart.com',
    },
    {
      id: 'amazon_fresh',
      name: 'Amazon Fresh',
      logoUrl: '/logos/amazon-fresh.png',
      available: true,
      deliveryTime: '2-4 hours',
      minimumOrder: 25,
      deliveryFee: 4.99,
      serviceUrl: 'https://api.amazonfresh.com',
    },
    {
      id: 'walmart_grocery',
      name: 'Walmart Grocery',
      logoUrl: '/logos/walmart.png',
      available: true,
      deliveryTime: '3-5 hours',
      minimumOrder: 35,
      deliveryFee: 7.95,
      serviceUrl: 'https://api.walmart.com/grocery',
    },
  ];

  async getAvailableServices(zipCode: string): Promise<GroceryDeliveryService[]> {
    // Mock implementation - in real app would check service availability by location
    return this.services.filter(service => service.available);
  }

  async searchProducts(serviceId: string, query: string): Promise<GroceryItem[]> {
    // Mock product search results
    const mockProducts: GroceryItem[] = [
      {
        id: 'prod-1',
        name: 'Organic Bananas',
        brand: 'Organic Valley',
        size: '2 lbs',
        price: 2.99,
        category: 'Produce',
        availability: 'in_stock',
        image: '/images/bananas.jpg',
        nutritionInfo: {
          calories: 105,
          protein: 1.3,
          carbs: 27,
          fat: 0.4,
          fiber: 3.1,
          sugar: 14,
          sodium: 1,
          servingSize: '1 medium (118g)',
        },
      },
      {
        id: 'prod-2',
        name: 'Grass-Fed Ground Beef',
        brand: 'Nature\'s Promise',
        size: '1 lb',
        price: 8.99,
        category: 'Meat',
        availability: 'low_stock',
        image: '/images/ground-beef.jpg',
        nutritionInfo: {
          calories: 250,
          protein: 26,
          carbs: 0,
          fat: 17,
          fiber: 0,
          sugar: 0,
          sodium: 75,
          servingSize: '4 oz (113g)',
        },
      },
    ];

    // Filter by query
    return mockProducts.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  async addToCart(serviceId: string, items: GroceryItem[]): Promise<{ success: boolean; cartUrl?: string }> {
    // Mock cart addition
    const service = this.services.find(s => s.id === serviceId);
    if (!service) {
      return { success: false };
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      cartUrl: `${service.serviceUrl}/cart`,
    };
  }

  async createOrder(serviceId: string, items: GroceryItem[], deliveryAddress: string): Promise<DeliveryOrder> {
    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    const service = this.services.find(s => s.id === serviceId)!;

    return {
      id: `order-${Date.now()}`,
      serviceId,
      items,
      totalPrice,
      deliveryFee: service.deliveryFee,
      estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      status: 'pending',
      trackingUrl: `${service.serviceUrl}/track/order-${Date.now()}`,
    };
  }

  async getOrderStatus(orderId: string): Promise<DeliveryOrder | null> {
    // Mock order status check
    return null;
  }
}

// Fitness Apps Integration
export class FitnessAppsIntegration {
  private readonly MYFITNESSPAL_API_KEY = import.meta.env.VITE_MYFITNESSPAL_API_KEY || 'mock_mfp_key';
  private readonly FITBIT_API_KEY = import.meta.env.VITE_FITBIT_API_KEY || 'mock_fitbit_key';
  private readonly APPLE_HEALTH_API_KEY = import.meta.env.VITE_APPLE_HEALTH_API_KEY || 'mock_apple_health_key';

  private apps: FitnessApp[] = [
    {
      id: 'myfitnesspal',
      name: 'MyFitnessPal',
      logoUrl: '/logos/myfitnesspal.png',
      connected: false,
      apiEndpoint: 'https://api.myfitnesspal.com/v1',
      supportedMetrics: ['calories', 'macros', 'weight', 'nutrition'],
    },
    {
      id: 'fitbit',
      name: 'Fitbit',
      logoUrl: '/logos/fitbit.png',
      connected: false,
      apiEndpoint: 'https://api.fitbit.com/1',
      supportedMetrics: ['calories', 'steps', 'weight', 'sleep', 'heart_rate'],
    },
    {
      id: 'apple_health',
      name: 'Apple Health',
      logoUrl: '/logos/apple-health.png',
      connected: false,
      apiEndpoint: 'https://developer.apple.com/healthkit',
      supportedMetrics: ['calories', 'macros', 'weight', 'steps', 'nutrition'],
    },
  ];

  async getAvailableApps(): Promise<FitnessApp[]> {
    return [...this.apps];
  }

  async connectApp(appId: string, authToken: string): Promise<{ success: boolean; error?: string }> {
    const app = this.apps.find(a => a.id === appId);
    if (!app) {
      return { success: false, error: 'App not found' };
    }

    // Mock authentication process
    await new Promise(resolve => setTimeout(resolve, 1500));

    app.connected = true;
    return { success: true };
  }

  async disconnectApp(appId: string): Promise<void> {
    const app = this.apps.find(a => a.id === appId);
    if (app) {
      app.connected = false;
    }
  }

  async syncFitnessData(appId: string, startDate: Date, endDate: Date): Promise<FitnessData[]> {
    const app = this.apps.find(a => a.id === appId);
    if (!app || !app.connected) {
      throw new Error('App not connected');
    }

    // Mock fitness data
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const data: FitnessData[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      data.push({
        date,
        caloriesConsumed: 1800 + Math.random() * 400,
        caloriesBurned: 400 + Math.random() * 300,
        macros: {
          protein: 80 + Math.random() * 40,
          carbs: 200 + Math.random() * 100,
          fat: 60 + Math.random() * 30,
        },
        weight: 70 + Math.random() * 2,
        steps: 8000 + Math.random() * 4000,
        activeMinutes: 30 + Math.random() * 60,
      });
    }

    return data;
  }

  async sendNutritionData(appId: string, nutritionData: NutritionInfo, mealName: string): Promise<void> {
    const app = this.apps.find(a => a.id === appId);
    if (!app || !app.connected) {
      throw new Error('App not connected');
    }

    // Mock sending nutrition data to fitness app
    console.log(`Sending nutrition data to ${app.name}:`, { nutritionData, mealName });
  }

  async getFitnessGoals(appId: string): Promise<FitnessGoals> {
    // Mock fitness goals
    return {
      dailyCalories: 2000,
      dailyProtein: 150,
      dailyCarbs: 250,
      dailyFat: 67,
      weeklyWeightGoal: -0.5, // lose 0.5 lbs per week
      activityLevel: 'moderate',
    };
  }
}

// Calendar Integration
export class CalendarIntegration {
  private readonly GOOGLE_CALENDAR_API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY || 'mock_google_cal_key';
  private readonly OUTLOOK_API_KEY = import.meta.env.VITE_OUTLOOK_API_KEY || 'mock_outlook_key';
  private readonly APPLE_CALENDAR_API_KEY = import.meta.env.VITE_APPLE_CALENDAR_API_KEY || 'mock_apple_cal_key';

  private providers: CalendarProvider[] = [
    {
      id: 'google',
      name: 'Google Calendar',
      logoUrl: '/logos/google-calendar.png',
      connected: false,
      calendars: [],
    },
    {
      id: 'outlook',
      name: 'Outlook Calendar',
      logoUrl: '/logos/outlook.png',
      connected: false,
      calendars: [],
    },
    {
      id: 'apple',
      name: 'Apple Calendar',
      logoUrl: '/logos/apple-calendar.png',
      connected: false,
      calendars: [],
    },
  ];

  async getProviders(): Promise<CalendarProvider[]> {
    return [...this.providers];
  }

  async connectProvider(providerId: string, authToken: string): Promise<{ success: boolean; error?: string }> {
    const provider = this.providers.find(p => p.id === providerId);
    if (!provider) {
      return { success: false, error: 'Provider not found' };
    }

    // Mock authentication and calendar loading
    await new Promise(resolve => setTimeout(resolve, 2000));

    provider.connected = true;
    provider.calendars = [
      {
        id: `${providerId}-primary`,
        name: 'Primary',
        color: '#3b82f6',
        readOnly: false,
        selected: true,
      },
      {
        id: `${providerId}-meal-planning`,
        name: 'Meal Planning',
        color: '#10b981',
        readOnly: false,
        selected: true,
      },
    ];

    return { success: true };
  }

  async createMealEvent(providerId: string, calendarId: string, event: Omit<MealEvent, 'id'>): Promise<MealEvent> {
    const provider = this.providers.find(p => p.id === providerId);
    if (!provider || !provider.connected) {
      throw new Error('Provider not connected');
    }

    // Mock event creation
    const mealEvent: MealEvent = {
      id: `event-${Date.now()}`,
      ...event,
    };

    return mealEvent;
  }

  async updateMealEvent(providerId: string, eventId: string, updates: Partial<MealEvent>): Promise<void> {
    // Mock event update
    console.log(`Updating event ${eventId} in ${providerId}:`, updates);
  }

  async deleteMealEvent(providerId: string, eventId: string): Promise<void> {
    // Mock event deletion
    console.log(`Deleting event ${eventId} from ${providerId}`);
  }

  async getMealEvents(providerId: string, calendarId: string, startDate: Date, endDate: Date): Promise<MealEvent[]> {
    // Mock events retrieval
    return [
      {
        id: 'event-1',
        title: 'Dinner - Pasta with Marinara',
        description: 'Home-cooked Italian dinner',
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
        calendarId,
        reminders: [15], // 15 minutes before
        location: 'Home Kitchen',
      },
    ];
  }
}

// Smart Kitchen Appliances Integration
export class SmartAppliancesIntegration {
  private readonly SAMSUNG_SMARTTHINGS_API_KEY = import.meta.env.VITE_SAMSUNG_SMARTTHINGS_API_KEY || 'mock_samsung_key';
  private readonly LG_THINQ_API_KEY = import.meta.env.VITE_LG_THINQ_API_KEY || 'mock_lg_key';
  private readonly WHIRLPOOL_API_KEY = import.meta.env.VITE_WHIRLPOOL_API_KEY || 'mock_whirlpool_key';

  private appliances: SmartAppliance[] = [
    {
      id: 'oven-samsung-1',
      name: 'Kitchen Oven',
      type: 'oven',
      brand: 'Samsung',
      model: 'NV75K5571RS',
      connected: false,
      status: 'offline',
      capabilities: [
        {
          name: 'Preheat',
          description: 'Preheat oven to specified temperature',
          parameters: ['temperature', 'duration'],
        },
        {
          name: 'Cook',
          description: 'Start cooking with specified program',
          parameters: ['program', 'temperature', 'duration'],
        },
      ],
    },
    {
      id: 'fridge-lg-1',
      name: 'Smart Refrigerator',
      type: 'refrigerator',
      brand: 'LG',
      model: 'LMXS30776S',
      connected: false,
      status: 'offline',
      capabilities: [
        {
          name: 'Temperature Control',
          description: 'Adjust refrigerator and freezer temperatures',
          parameters: ['compartment', 'temperature'],
        },
        {
          name: 'Inventory Tracking',
          description: 'Track items in refrigerator',
          parameters: ['items', 'expiration_dates'],
        },
      ],
    },
  ];

  async discoverAppliances(): Promise<SmartAppliance[]> {
    // Mock appliance discovery
    await new Promise(resolve => setTimeout(resolve, 3000));
    return [...this.appliances];
  }

  async connectAppliance(applianceId: string): Promise<{ success: boolean; error?: string }> {
    const appliance = this.appliances.find(a => a.id === applianceId);
    if (!appliance) {
      return { success: false, error: 'Appliance not found' };
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    appliance.connected = true;
    appliance.status = 'idle';

    return { success: true };
  }

  async startCookingProgram(applianceId: string, program: Omit<CookingProgram, 'id'>): Promise<CookingProgram> {
    const appliance = this.appliances.find(a => a.id === applianceId);
    if (!appliance || !appliance.connected) {
      throw new Error('Appliance not connected');
    }

    const cookingProgram: CookingProgram = {
      id: `program-${Date.now()}`,
      ...program,
      status: 'running',
      startTime: new Date(),
      endTime: new Date(Date.now() + program.duration * 60 * 1000),
    };

    appliance.currentProgram = cookingProgram;
    appliance.status = 'running';

    return cookingProgram;
  }

  async getApplianceStatus(applianceId: string): Promise<SmartAppliance | null> {
    return this.appliances.find(a => a.id === applianceId) || null;
  }

  async sendRecipeToAppliance(applianceId: string, recipe: any): Promise<{ success: boolean; program?: CookingProgram }> {
    const appliance = this.appliances.find(a => a.id === applianceId);
    if (!appliance || !appliance.connected) {
      return { success: false };
    }

    // Extract cooking instructions and convert to appliance program
    const program: CookingProgram = {
      id: `recipe-program-${Date.now()}`,
      name: recipe.name,
      temperature: 350, // Default temperature
      duration: recipe.cookTime || 30, // Default duration
      status: 'scheduled',
      steps: recipe.instructions?.map((instruction: string, index: number) => ({
        id: `step-${index}`,
        instruction,
        duration: Math.ceil(recipe.cookTime / recipe.instructions.length) || 10,
        completed: false,
      })) || [],
    };

    return { success: true, program };
  }
}

// Barcode Scanning Integration
export class BarcodeScanningIntegration {
  private readonly OPENFOODFACTS_API_KEY = import.meta.env.VITE_OPENFOODFACTS_API_KEY || 'mock_off_key';
  private readonly BARCODE_LOOKUP_API_KEY = import.meta.env.VITE_BARCODE_LOOKUP_API_KEY || 'mock_barcode_key';
  private readonly USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY || 'mock_usda_key';

  async scanBarcode(barcodeData: string): Promise<BarcodeProduct | null> {
    // Mock barcode scanning - in real app would use camera API
    return this.lookupProduct(barcodeData);
  }

  async lookupProduct(barcode: string): Promise<BarcodeProduct | null> {
    // Mock product database lookup
    const mockProducts: { [key: string]: BarcodeProduct } = {
      '012345678901': {
        barcode: '012345678901',
        name: 'Organic Whole Milk',
        brand: 'Horizon Organic',
        category: 'Dairy',
        image: '/images/milk.jpg',
        nutritionInfo: {
          calories: 150,
          protein: 8,
          carbs: 12,
          fat: 8,
          fiber: 0,
          sugar: 12,
          sodium: 125,
          servingSize: '1 cup (240ml)',
        },
        ingredients: ['Organic Grade A Milk', 'Vitamin D3'],
        allergens: ['Milk'],
      },
      '123456789012': {
        barcode: '123456789012',
        name: 'Whole Wheat Bread',
        brand: 'Dave\'s Killer Bread',
        category: 'Bakery',
        image: '/images/bread.jpg',
        nutritionInfo: {
          calories: 110,
          protein: 5,
          carbs: 22,
          fat: 2,
          fiber: 5,
          sugar: 5,
          sodium: 170,
          servingSize: '1 slice (28g)',
        },
        ingredients: ['Organic whole wheat flour', 'Water', 'Organic cane sugar', 'Yeast'],
        allergens: ['Wheat', 'Gluten'],
      },
    };

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

    return mockProducts[barcode] || null;
  }

  async addToPantry(product: BarcodeProduct, quantity: number, unit: string, location?: string): Promise<PantryItem> {
    const pantryItem: PantryItem = {
      ...product,
      id: `pantry-${Date.now()}`,
      quantity,
      unit,
      addedDate: new Date(),
      lastUpdated: new Date(),
      lowStockThreshold: 1,
      location: location || 'Pantry',
    };

    return pantryItem;
  }

  async updatePantryItem(itemId: string, updates: Partial<PantryItem>): Promise<void> {
    // Mock pantry item update
    console.log(`Updating pantry item ${itemId}:`, updates);
  }

  async removePantryItem(itemId: string): Promise<void> {
    // Mock pantry item removal
    console.log(`Removing pantry item ${itemId}`);
  }

  async getPantryItems(): Promise<PantryItem[]> {
    // Mock pantry items list
    return [
      {
        id: 'pantry-1',
        barcode: '012345678901',
        name: 'Organic Whole Milk',
        brand: 'Horizon Organic',
        category: 'Dairy',
        nutritionInfo: {
          calories: 150,
          protein: 8,
          carbs: 12,
          fat: 8,
          fiber: 0,
          sugar: 12,
          sodium: 125,
          servingSize: '1 cup (240ml)',
        },
        ingredients: ['Organic Grade A Milk', 'Vitamin D3'],
        allergens: ['Milk'],
        quantity: 1,
        unit: 'gallon',
        addedDate: new Date(),
        lastUpdated: new Date(),
        lowStockThreshold: 1,
        location: 'Refrigerator',
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      },
    ];
  }

  async getLowStockItems(): Promise<PantryItem[]> {
    const allItems = await this.getPantryItems();
    return allItems.filter(item => item.quantity <= item.lowStockThreshold);
  }

  async getExpiringItems(daysAhead: number = 7): Promise<PantryItem[]> {
    const allItems = await this.getPantryItems();
    const expirationThreshold = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    
    return allItems.filter(item => 
      item.expirationDate && item.expirationDate <= expirationThreshold
    );
  }

  // Camera barcode scanning (for web)
  async startCameraScanning(): Promise<{ success: boolean; error?: string }> {
    if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
      return { success: false, error: 'Camera not supported' };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Camera permission denied' };
    }
  }

  async stopCameraScanning(): Promise<void> {
    // Mock camera stop
    console.log('Stopping camera scanning');
  }
}

// Export service instances
export const groceryDeliveryService = new GroceryDeliveryIntegration();
export const fitnessAppsService = new FitnessAppsIntegration();
export const calendarService = new CalendarIntegration();
export const smartAppliancesService = new SmartAppliancesIntegration();
export const barcodeScanningService = new BarcodeScanningIntegration();