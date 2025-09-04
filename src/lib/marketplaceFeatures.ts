import { User } from '@supabase/supabase-js'

// Types and Interfaces
export interface ChefProfile {
  id: string
  userId: string
  displayName: string
  bio: string
  specialties: string[]
  socialMedia: {
    instagram?: string
    youtube?: string
    tiktok?: string
    website?: string
  }
  verification: {
    isVerified: boolean
    verificationLevel: 'basic' | 'professional' | 'celebrity'
    credentials: string[]
  }
  stats: {
    recipesPublished: number
    totalSales: number
    averageRating: number
    followerCount: number
  }
  revenue: {
    totalEarnings: number
    monthlyEarnings: number
    commissionsEarned: number
  }
  profileImage: string
  coverImage: string
  createdAt: Date
  updatedAt: Date
}

export interface MarketplaceRecipe {
  id: string
  chefId: string
  title: string
  description: string
  category: string
  cuisine: string
  difficulty: 'easy' | 'medium' | 'hard'
  prepTime: number
  cookTime: number
  servings: number
  ingredients: RecipeIngredient[]
  instructions: RecipeStep[]
  nutritionalInfo: NutritionalInfo
  images: string[]
  videoUrl?: string
  pricing: {
    isFree: boolean
    price?: number
    currency: string
    subscriptionTier?: 'basic' | 'premium' | 'exclusive'
  }
  licensing: RecipeLicense
  affiliateProducts: AffiliateProduct[]
  sponsorship?: SponsorshipInfo
  stats: {
    views: number
    purchases: number
    ratings: number
    averageRating: number
    bookmarks: number
  }
  tags: string[]
  isPublished: boolean
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface RecipeIngredient {
  id: string
  name: string
  amount: number
  unit: string
  category: string
  optional: boolean
  affiliateProducts?: AffiliateProduct[]
  substitutions?: string[]
}

export interface RecipeStep {
  id: string
  stepNumber: number
  instruction: string
  duration?: number
  temperature?: number
  images?: string[]
  tips?: string[]
  affiliateTools?: AffiliateProduct[]
}

export interface NutritionalInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  cholesterol: number
  vitamins: Record<string, number>
  minerals: Record<string, number>
}

export interface RecipeLicense {
  id: string
  type: 'exclusive' | 'non-exclusive' | 'creative-commons' | 'commercial'
  permissions: {
    canModify: boolean
    canRedistribute: boolean
    canCommercialUse: boolean
    requiresAttribution: boolean
  }
  restrictions: string[]
  royaltyRate?: number
  exclusivityPeriod?: number
  territory: 'worldwide' | 'regional'
  terms: string
}

export interface AffiliateProduct {
  id: string
  name: string
  brand: string
  category: 'ingredient' | 'tool' | 'appliance' | 'cookware'
  description: string
  imageUrl: string
  affiliateLinks: {
    amazon?: string
    walmart?: string
    target?: string
    williamssonoma?: string
    custom?: { name: string; url: string }[]
  }
  pricing: {
    price: number
    currency: string
    originalPrice?: number
    discount?: number
  }
  commission: {
    rate: number
    flatFee?: number
    cookieExpiry: number
  }
  availability: {
    inStock: boolean
    estimatedDelivery?: string
    regions: string[]
  }
  ratings: {
    averageRating: number
    reviewCount: number
  }
  tags: string[]
}

export interface SponsorshipInfo {
  id: string
  sponsorName: string
  sponsorLogo: string
  sponsorshipType: 'ingredient' | 'brand' | 'equipment' | 'event'
  campaignId: string
  displayRequirements: {
    showSponsorLogo: boolean
    mentionInDescription: boolean
    dedicatedCallout: boolean
    disclaimerText: string
  }
  compensation: {
    amount: number
    currency: string
    type: 'flat' | 'per-view' | 'per-click' | 'revenue-share'
  }
  performance: {
    impressions: number
    clicks: number
    conversions: number
    revenue: number
  }
  duration: {
    startDate: Date
    endDate: Date
  }
}

export interface MarketplaceStats {
  chefs: {
    totalChefs: number
    verifiedChefs: number
    topEarningChefs: ChefProfile[]
    newChefs: number
  }
  recipes: {
    totalRecipes: number
    paidRecipes: number
    freeRecipes: number
    topSellingRecipes: MarketplaceRecipe[]
    revenueByCategory: Record<string, number>
  }
  affiliate: {
    totalProducts: number
    totalCommissions: number
    topPerformingProducts: AffiliateProduct[]
    clickThroughRate: number
    conversionRate: number
  }
  sponsorships: {
    activeSponsors: number
    totalSponsorshipRevenue: number
    topSponsors: Array<{
      name: string
      totalSpent: number
      activeCompaigns: number
    }>
  }
}

// Mock Data
const mockChefProfiles: ChefProfile[] = [
  {
    id: 'chef1',
    userId: 'user1',
    displayName: 'Chef Maria Rodriguez',
    bio: 'James Beard Award winner specializing in modern Mexican cuisine with a focus on sustainable ingredients.',
    specialties: ['Mexican', 'Fusion', 'Vegetarian', 'Sustainable Cooking'],
    socialMedia: {
      instagram: '@chefmariarodriguez',
      youtube: 'ChefMariaChannel',
      website: 'www.mariarodriguezchef.com'
    },
    verification: {
      isVerified: true,
      verificationLevel: 'professional',
      credentials: ['Culinary Institute of America', 'James Beard Award 2022', '15 years restaurant experience']
    },
    stats: {
      recipesPublished: 89,
      totalSales: 15240,
      averageRating: 4.8,
      followerCount: 125000
    },
    revenue: {
      totalEarnings: 45600,
      monthlyEarnings: 3800,
      commissionsEarned: 2100
    },
    profileImage: 'https://example.com/chef-maria.jpg',
    coverImage: 'https://example.com/chef-maria-cover.jpg',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'chef2',
    userId: 'user2',
    displayName: 'Gordon Sinclair',
    bio: 'Michelin-starred chef and cookbook author known for innovative French techniques applied to comfort food.',
    specialties: ['French', 'Fine Dining', 'Comfort Food', 'Technique'],
    socialMedia: {
      instagram: '@gordonsinclair_chef',
      youtube: 'SinclairKitchen',
      website: 'www.gordonsinclair.com'
    },
    verification: {
      isVerified: true,
      verificationLevel: 'celebrity',
      credentials: ['Michelin Star Restaurant Owner', 'Published Author', '20+ years fine dining']
    },
    stats: {
      recipesPublished: 156,
      totalSales: 28900,
      averageRating: 4.9,
      followerCount: 340000
    },
    revenue: {
      totalEarnings: 89400,
      monthlyEarnings: 7200,
      commissionsEarned: 4300
    },
    profileImage: 'https://example.com/chef-gordon.jpg',
    coverImage: 'https://example.com/chef-gordon-cover.jpg',
    createdAt: new Date('2022-08-10'),
    updatedAt: new Date('2024-01-12')
  }
]

const mockAffiliateProducts: AffiliateProduct[] = [
  {
    id: 'aff1',
    name: 'Lodge Cast Iron Skillet 12-inch',
    brand: 'Lodge',
    category: 'cookware',
    description: 'Pre-seasoned cast iron skillet perfect for searing, frying, and baking.',
    imageUrl: 'https://example.com/lodge-skillet.jpg',
    affiliateLinks: {
      amazon: 'https://amazon.com/lodge-skillet?ref=tellerplan',
      walmart: 'https://walmart.com/lodge-skillet?ref=tellerplan',
      target: 'https://target.com/lodge-skillet?ref=tellerplan'
    },
    pricing: {
      price: 34.99,
      currency: 'USD',
      originalPrice: 44.99,
      discount: 22
    },
    commission: {
      rate: 8,
      cookieExpiry: 30
    },
    availability: {
      inStock: true,
      estimatedDelivery: '2-3 days',
      regions: ['US', 'CA']
    },
    ratings: {
      averageRating: 4.7,
      reviewCount: 12450
    },
    tags: ['cast-iron', 'versatile', 'durable', 'american-made']
  },
  {
    id: 'aff2',
    name: 'Organic Extra Virgin Olive Oil',
    brand: 'California Olive Ranch',
    category: 'ingredient',
    description: 'Cold-pressed organic extra virgin olive oil from California olives.',
    imageUrl: 'https://example.com/olive-oil.jpg',
    affiliateLinks: {
      amazon: 'https://amazon.com/organic-olive-oil?ref=tellerplan',
      walmart: 'https://walmart.com/organic-olive-oil?ref=tellerplan'
    },
    pricing: {
      price: 12.99,
      currency: 'USD',
      originalPrice: 15.99,
      discount: 19
    },
    commission: {
      rate: 5,
      cookieExpiry: 7
    },
    availability: {
      inStock: true,
      estimatedDelivery: '1-2 days',
      regions: ['US']
    },
    ratings: {
      averageRating: 4.5,
      reviewCount: 2890
    },
    tags: ['organic', 'cold-pressed', 'california', 'premium']
  }
]

const mockMarketplaceRecipes: MarketplaceRecipe[] = [
  {
    id: 'recipe1',
    chefId: 'chef1',
    title: 'Truffle Mushroom Risotto with Parmesan Crisps',
    description: 'A luxurious risotto featuring wild mushrooms and truffle oil, topped with crispy parmesan wafers.',
    category: 'Main Course',
    cuisine: 'Italian',
    difficulty: 'medium',
    prepTime: 15,
    cookTime: 35,
    servings: 4,
    ingredients: [
      {
        id: 'ing1',
        name: 'Arborio Rice',
        amount: 1.5,
        unit: 'cups',
        category: 'grains',
        optional: false,
        affiliateProducts: [],
        substitutions: ['Carnaroli rice', 'Bomba rice']
      }
    ],
    instructions: [
      {
        id: 'step1',
        stepNumber: 1,
        instruction: 'Heat the chicken broth in a saucepan and keep warm.',
        duration: 5,
        tips: ['Keep broth at a gentle simmer throughout cooking']
      }
    ],
    nutritionalInfo: {
      calories: 385,
      protein: 12,
      carbs: 58,
      fat: 14,
      fiber: 3,
      sugar: 4,
      sodium: 680,
      cholesterol: 25,
      vitamins: { 'Vitamin A': 8, 'Vitamin C': 2 },
      minerals: { 'Calcium': 15, 'Iron': 6 }
    },
    images: ['https://example.com/risotto1.jpg', 'https://example.com/risotto2.jpg'],
    videoUrl: 'https://youtube.com/watch?v=example',
    pricing: {
      isFree: false,
      price: 4.99,
      currency: 'USD',
      subscriptionTier: 'premium'
    },
    licensing: {
      id: 'license1',
      type: 'non-exclusive',
      permissions: {
        canModify: false,
        canRedistribute: false,
        canCommercialUse: true,
        requiresAttribution: true
      },
      restrictions: ['Cannot be republished without permission'],
      royaltyRate: 15,
      territory: 'worldwide',
      terms: 'Standard marketplace license agreement'
    },
    affiliateProducts: mockAffiliateProducts,
    stats: {
      views: 15420,
      purchases: 892,
      ratings: 156,
      averageRating: 4.7,
      bookmarks: 2340
    },
    tags: ['risotto', 'truffle', 'mushroom', 'italian', 'premium'],
    isPublished: true,
    publishedAt: new Date('2024-01-10'),
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-10')
  }
]

// Marketplace Service Class
export class MarketplaceService {
  // Chef Management
  static async getChefProfiles(): Promise<ChefProfile[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    return mockChefProfiles
  }

  static async getChefProfile(chefId: string): Promise<ChefProfile | null> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockChefProfiles.find(chef => chef.id === chefId) || null
  }

  static async createChefProfile(userId: string, profileData: Partial<ChefProfile>): Promise<ChefProfile> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newProfile: ChefProfile = {
      id: `chef_${Date.now()}`,
      userId,
      displayName: profileData.displayName || 'New Chef',
      bio: profileData.bio || '',
      specialties: profileData.specialties || [],
      socialMedia: profileData.socialMedia || {},
      verification: {
        isVerified: false,
        verificationLevel: 'basic',
        credentials: []
      },
      stats: {
        recipesPublished: 0,
        totalSales: 0,
        averageRating: 0,
        followerCount: 0
      },
      revenue: {
        totalEarnings: 0,
        monthlyEarnings: 0,
        commissionsEarned: 0
      },
      profileImage: profileData.profileImage || '',
      coverImage: profileData.coverImage || '',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return newProfile
  }

  static async updateChefProfile(chefId: string, updates: Partial<ChefProfile>): Promise<ChefProfile | null> {
    await new Promise(resolve => setTimeout(resolve, 800))
    const existingChef = mockChefProfiles.find(chef => chef.id === chefId)
    if (!existingChef) return null
    
    return { ...existingChef, ...updates, updatedAt: new Date() }
  }

  static async submitForVerification(chefId: string, credentials: string[]): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 1200))
    return {
      success: true,
      message: 'Verification request submitted. Review process typically takes 3-5 business days.'
    }
  }

  // Recipe Publishing
  static async publishRecipe(recipeData: Partial<MarketplaceRecipe>): Promise<MarketplaceRecipe> {
    await new Promise(resolve => setTimeout(resolve, 1500))
    const newRecipe: MarketplaceRecipe = {
      id: `recipe_${Date.now()}`,
      chefId: recipeData.chefId || '',
      title: recipeData.title || 'New Recipe',
      description: recipeData.description || '',
      category: recipeData.category || 'Main Course',
      cuisine: recipeData.cuisine || 'International',
      difficulty: recipeData.difficulty || 'medium',
      prepTime: recipeData.prepTime || 30,
      cookTime: recipeData.cookTime || 45,
      servings: recipeData.servings || 4,
      ingredients: recipeData.ingredients || [],
      instructions: recipeData.instructions || [],
      nutritionalInfo: recipeData.nutritionalInfo || {
        calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0,
        sodium: 0, cholesterol: 0, vitamins: {}, minerals: {}
      },
      images: recipeData.images || [],
      videoUrl: recipeData.videoUrl,
      pricing: recipeData.pricing || { isFree: true, currency: 'USD' },
      licensing: recipeData.licensing || {
        id: `license_${Date.now()}`,
        type: 'non-exclusive',
        permissions: { canModify: false, canRedistribute: false, canCommercialUse: false, requiresAttribution: true },
        restrictions: [],
        territory: 'worldwide',
        terms: 'Standard license'
      },
      affiliateProducts: recipeData.affiliateProducts || [],
      sponsorship: recipeData.sponsorship,
      stats: { views: 0, purchases: 0, ratings: 0, averageRating: 0, bookmarks: 0 },
      tags: recipeData.tags || [],
      isPublished: true,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return newRecipe
  }

  static async getMarketplaceRecipes(filters?: {
    category?: string
    cuisine?: string
    chefId?: string
    priceRange?: { min: number; max: number }
    difficulty?: string[]
    tags?: string[]
  }): Promise<MarketplaceRecipe[]> {
    await new Promise(resolve => setTimeout(resolve, 600))
    let recipes = [...mockMarketplaceRecipes]

    if (filters) {
      if (filters.category) recipes = recipes.filter(r => r.category === filters.category)
      if (filters.cuisine) recipes = recipes.filter(r => r.cuisine === filters.cuisine)
      if (filters.chefId) recipes = recipes.filter(r => r.chefId === filters.chefId)
      if (filters.difficulty?.length) recipes = recipes.filter(r => filters.difficulty!.includes(r.difficulty))
      if (filters.tags?.length) recipes = recipes.filter(r => 
        filters.tags!.some(tag => r.tags.includes(tag))
      )
      if (filters.priceRange) {
        recipes = recipes.filter(r => 
          !r.pricing.isFree && 
          r.pricing.price! >= filters.priceRange!.min && 
          r.pricing.price! <= filters.priceRange!.max
        )
      }
    }

    return recipes
  }

  static async purchaseRecipe(recipeId: string, userId: string): Promise<{ success: boolean; message: string; purchaseId?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      success: true,
      message: 'Recipe purchased successfully!',
      purchaseId: `purchase_${Date.now()}`
    }
  }

  // Affiliate Marketing
  static async getAffiliateProducts(category?: string): Promise<AffiliateProduct[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    if (category) {
      return mockAffiliateProducts.filter(product => product.category === category)
    }
    return mockAffiliateProducts
  }

  static async searchAffiliateProducts(query: string): Promise<AffiliateProduct[]> {
    await new Promise(resolve => setTimeout(resolve, 700))
    return mockAffiliateProducts.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )
  }

  static async trackAffiliateClick(productId: string, userId?: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    // Track click analytics
    console.log(`Affiliate click tracked: ${productId} by user ${userId || 'anonymous'}`)
  }

  static async getAffiliateStats(chefId?: string): Promise<{
    totalClicks: number
    totalConversions: number
    totalCommissions: number
    topProducts: AffiliateProduct[]
  }> {
    await new Promise(resolve => setTimeout(resolve, 800))
    return {
      totalClicks: 15420,
      totalConversions: 892,
      totalCommissions: 2340.50,
      topProducts: mockAffiliateProducts.slice(0, 5)
    }
  }

  // Sponsorship Management
  static async createSponsorship(sponsorshipData: Partial<SponsorshipInfo>): Promise<SponsorshipInfo> {
    await new Promise(resolve => setTimeout(resolve, 1200))
    return {
      id: `sponsor_${Date.now()}`,
      sponsorName: sponsorshipData.sponsorName || 'New Sponsor',
      sponsorLogo: sponsorshipData.sponsorLogo || '',
      sponsorshipType: sponsorshipData.sponsorshipType || 'brand',
      campaignId: `campaign_${Date.now()}`,
      displayRequirements: sponsorshipData.displayRequirements || {
        showSponsorLogo: true,
        mentionInDescription: true,
        dedicatedCallout: false,
        disclaimerText: 'This recipe is sponsored by our partner.'
      },
      compensation: sponsorshipData.compensation || {
        amount: 100,
        currency: 'USD',
        type: 'flat'
      },
      performance: { impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
      duration: {
        startDate: sponsorshipData.duration?.startDate || new Date(),
        endDate: sponsorshipData.duration?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    }
  }

  static async getActiveSponsors(): Promise<Array<{ name: string; totalSpent: number; activeCampaigns: number }>> {
    await new Promise(resolve => setTimeout(resolve, 600))
    return [
      { name: 'Williams Sonoma', totalSpent: 125000, activeCampaigns: 8 },
      { name: 'KitchenAid', totalSpent: 89000, activeCampaigns: 12 },
      { name: 'Whole Foods Market', totalSpent: 67000, activeCampaigns: 6 },
      { name: 'Sur La Table', totalSpent: 45000, activeCampaigns: 4 },
      { name: 'Blue Apron', totalSpent: 38000, activeCampaigns: 3 }
    ]
  }

  // Analytics & Reporting
  static async getMarketplaceStats(): Promise<MarketplaceStats> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      chefs: {
        totalChefs: 1247,
        verifiedChefs: 89,
        topEarningChefs: mockChefProfiles,
        newChefs: 23
      },
      recipes: {
        totalRecipes: 15420,
        paidRecipes: 3240,
        freeRecipes: 12180,
        topSellingRecipes: mockMarketplaceRecipes,
        revenueByCategory: {
          'Main Course': 145000,
          'Dessert': 89000,
          'Appetizer': 67000,
          'Beverage': 34000,
          'Side Dish': 23000
        }
      },
      affiliate: {
        totalProducts: 2340,
        totalCommissions: 89400,
        topPerformingProducts: mockAffiliateProducts,
        clickThroughRate: 3.2,
        conversionRate: 8.7
      },
      sponsorships: {
        activeSponsors: 23,
        totalSponsorshipRevenue: 456000,
        topSponsors: [
          { name: 'Williams Sonoma', totalSpent: 125000, activeCompaigns: 8 },
          { name: 'KitchenAid', totalSpent: 89000, activeCompaigns: 12 }
        ]
      }
    }
  }

  // Recipe Licensing
  static async createLicenseAgreement(licenseData: Partial<RecipeLicense>): Promise<RecipeLicense> {
    await new Promise(resolve => setTimeout(resolve, 800))
    return {
      id: `license_${Date.now()}`,
      type: licenseData.type || 'non-exclusive',
      permissions: licenseData.permissions || {
        canModify: false,
        canRedistribute: false,
        canCommercialUse: false,
        requiresAttribution: true
      },
      restrictions: licenseData.restrictions || [],
      royaltyRate: licenseData.royaltyRate,
      exclusivityPeriod: licenseData.exclusivityPeriod,
      territory: licenseData.territory || 'worldwide',
      terms: licenseData.terms || 'Standard marketplace license agreement'
    }
  }

  static async requestRecipeLicense(recipeId: string, licenseeInfo: {
    name: string
    email: string
    company?: string
    intendedUse: string
    licenseType: string
  }): Promise<{ success: boolean; licenseId: string; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 1200))
    return {
      success: true,
      licenseId: `license_req_${Date.now()}`,
      message: 'License request submitted. The chef will review and respond within 3-5 business days.'
    }
  }
}