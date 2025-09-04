// Types and Interfaces
export interface CacheConfig {
  redis: {
    host: string
    port: number
    password?: string
    db: number
    ttl: {
      recipes: number
      mealPlans: number
      users: number
      analytics: number
      marketplace: number
    }
  }
  memory: {
    maxSize: number
    ttl: number
  }
  cdn: {
    baseUrl: string
    imageTransforms: {
      thumbnail: string
      medium: string
      large: string
      webp: string
    }
  }
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  key: string
  tags: string[]
}

export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  memoryUsage: number
  redisConnections: number
  evictions: number
  operations: {
    gets: number
    sets: number
    deletes: number
  }
}

export interface QueryOptimization {
  indexStrategy: {
    recipes: string[]
    users: string[]
    mealPlans: string[]
    analytics: string[]
  }
  pagination: {
    defaultPageSize: number
    maxPageSize: number
  }
  prefetching: {
    relatedRecipes: boolean
    userPreferences: boolean
    popularContent: boolean
  }
}

// Cache Configuration
const defaultConfig: CacheConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    ttl: {
      recipes: 3600, // 1 hour
      mealPlans: 1800, // 30 minutes
      users: 300, // 5 minutes
      analytics: 900, // 15 minutes
      marketplace: 1800 // 30 minutes
    }
  },
  memory: {
    maxSize: 100 * 1024 * 1024, // 100MB
    ttl: 300 // 5 minutes
  },
  cdn: {
    baseUrl: process.env.CDN_BASE_URL || 'https://cdn.tellerplan.com',
    imageTransforms: {
      thumbnail: 'w_150,h_150,c_fill,f_auto,q_auto',
      medium: 'w_400,h_300,c_fill,f_auto,q_auto',
      large: 'w_800,h_600,c_fill,f_auto,q_auto',
      webp: 'f_webp,q_auto'
    }
  }
}

// In-Memory Cache Implementation
class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    memoryUsage: 0,
    redisConnections: 0,
    evictions: 0,
    operations: { gets: 0, sets: 0, deletes: 0 }
  }
  private maxSize: number

  constructor(maxSize: number = defaultConfig.memory.maxSize) {
    this.maxSize = maxSize
  }

  get<T>(key: string): T | null {
    this.stats.operations.gets++
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      this.updateHitRate()
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key)
      this.stats.misses++
      this.updateHitRate()
      return null
    }

    this.stats.hits++
    this.updateHitRate()
    return entry.data
  }

  set<T>(key: string, data: T, ttl: number = defaultConfig.memory.ttl, tags: string[] = []): void {
    this.stats.operations.sets++
    
    // Check memory usage and evict if necessary
    this.evictIfNecessary()

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key,
      tags
    }

    this.cache.set(key, entry)
    this.updateMemoryUsage()
  }

  delete(key: string): boolean {
    this.stats.operations.deletes++
    const result = this.cache.delete(key)
    this.updateMemoryUsage()
    return result
  }

  deleteByTag(tag: string): number {
    let deleted = 0
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key)
        deleted++
      }
    }
    this.updateMemoryUsage()
    return deleted
  }

  clear(): void {
    this.cache.clear()
    this.updateMemoryUsage()
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  private evictIfNecessary(): void {
    const currentSize = this.getCurrentSize()
    if (currentSize > this.maxSize * 0.9) { // Evict at 90% capacity
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp) // Sort by age
      
      const toEvict = Math.floor(entries.length * 0.1) // Evict oldest 10%
      for (let i = 0; i < toEvict; i++) {
        this.cache.delete(entries[i][0])
        this.stats.evictions++
      }
    }
  }

  private getCurrentSize(): number {
    return JSON.stringify(Array.from(this.cache.entries())).length
  }

  private updateMemoryUsage(): void {
    this.stats.memoryUsage = this.getCurrentSize()
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
  }
}

// Mock Redis Implementation (for development)
class MockRedisCache {
  private cache = new Map<string, string>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    memoryUsage: 0,
    redisConnections: 1,
    evictions: 0,
    operations: { gets: 0, sets: 0, deletes: 0 }
  }

  async get(key: string): Promise<string | null> {
    this.stats.operations.gets++
    await this.simulateLatency()
    
    const value = this.cache.get(key)
    if (value) {
      this.stats.hits++
    } else {
      this.stats.misses++
    }
    this.updateHitRate()
    
    return value || null
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    this.stats.operations.sets++
    await this.simulateLatency()
    
    this.cache.set(key, value)
    
    // Simulate TTL with setTimeout
    if (ttl) {
      setTimeout(() => {
        this.cache.delete(key)
      }, ttl * 1000)
    }
  }

  async del(key: string): Promise<number> {
    this.stats.operations.deletes++
    await this.simulateLatency()
    
    const existed = this.cache.has(key)
    this.cache.delete(key)
    return existed ? 1 : 0
  }

  async exists(key: string): Promise<boolean> {
    await this.simulateLatency()
    return this.cache.has(key)
  }

  async keys(pattern: string): Promise<string[]> {
    await this.simulateLatency()
    const regex = new RegExp(pattern.replace('*', '.*'))
    return Array.from(this.cache.keys()).filter(key => regex.test(key))
  }

  async flushall(): Promise<void> {
    await this.simulateLatency()
    this.cache.clear()
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  private async simulateLatency(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1 + Math.random() * 5))
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
  }
}

// CDN Service
export class CDNService {
  private baseUrl: string
  private transforms: CacheConfig['cdn']['imageTransforms']

  constructor(config: CacheConfig['cdn'] = defaultConfig.cdn) {
    this.baseUrl = config.baseUrl
    this.transforms = config.imageTransforms
  }

  getImageUrl(path: string, transform: keyof CacheConfig['cdn']['imageTransforms'] | string = 'medium'): string {
    const transformString = this.transforms[transform as keyof typeof this.transforms] || transform
    return `${this.baseUrl}/image/fetch/${transformString}/${encodeURIComponent(path)}`
  }

  getVideoUrl(path: string, quality: 'low' | 'medium' | 'high' = 'medium'): string {
    const qualityMap = {
      low: 'q_auto:low,f_mp4',
      medium: 'q_auto,f_mp4',
      high: 'q_auto:good,f_mp4'
    }
    return `${this.baseUrl}/video/upload/${qualityMap[quality]}/${path}`
  }

  preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = url
    })
  }

  generateSrcSet(basePath: string): string {
    return [
      `${this.getImageUrl(basePath, 'thumbnail')} 150w`,
      `${this.getImageUrl(basePath, 'medium')} 400w`,
      `${this.getImageUrl(basePath, 'large')} 800w`
    ].join(', ')
  }

  generateSizes(): string {
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  }
}

// Cache Manager
export class CacheManager {
  private memoryCache: MemoryCache
  private redisCache: MockRedisCache
  private config: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
    this.memoryCache = new MemoryCache(this.config.memory.maxSize)
    this.redisCache = new MockRedisCache()
  }

  // Recipe caching methods
  async getRecipe(id: string): Promise<any | null> {
    const key = `recipe:${id}`
    
    // Try memory cache first
    let recipe = this.memoryCache.get(key)
    if (recipe) return recipe

    // Try Redis cache
    const cached = await this.redisCache.get(key)
    if (cached) {
      recipe = JSON.parse(cached)
      // Store in memory cache for faster access
      this.memoryCache.set(key, recipe, this.config.memory.ttl, ['recipes'])
      return recipe
    }

    return null
  }

  async setRecipe(id: string, recipe: any): Promise<void> {
    const key = `recipe:${id}`
    const serialized = JSON.stringify(recipe)
    
    // Store in both caches
    this.memoryCache.set(key, recipe, this.config.memory.ttl, ['recipes'])
    await this.redisCache.set(key, serialized, this.config.redis.ttl.recipes)
  }

  async getPopularRecipes(category?: string): Promise<any[] | null> {
    const key = category ? `popular:recipes:${category}` : 'popular:recipes'
    
    let recipes = this.memoryCache.get(key)
    if (recipes) return recipes

    const cached = await this.redisCache.get(key)
    if (cached) {
      recipes = JSON.parse(cached)
      this.memoryCache.set(key, recipes, this.config.memory.ttl, ['recipes', 'popular'])
      return recipes
    }

    return null
  }

  async setPopularRecipes(recipes: any[], category?: string): Promise<void> {
    const key = category ? `popular:recipes:${category}` : 'popular:recipes'
    const serialized = JSON.stringify(recipes)
    
    this.memoryCache.set(key, recipes, this.config.memory.ttl, ['recipes', 'popular'])
    await this.redisCache.set(key, serialized, this.config.redis.ttl.recipes)
  }

  // User caching methods
  async getUserProfile(userId: string): Promise<any | null> {
    const key = `user:${userId}`
    
    let profile = this.memoryCache.get(key)
    if (profile) return profile

    const cached = await this.redisCache.get(key)
    if (cached) {
      profile = JSON.parse(cached)
      this.memoryCache.set(key, profile, this.config.memory.ttl, ['users'])
      return profile
    }

    return null
  }

  async setUserProfile(userId: string, profile: any): Promise<void> {
    const key = `user:${userId}`
    const serialized = JSON.stringify(profile)
    
    this.memoryCache.set(key, profile, this.config.memory.ttl, ['users'])
    await this.redisCache.set(key, serialized, this.config.redis.ttl.users)
  }

  // Meal plan caching methods
  async getMealPlan(id: string): Promise<any | null> {
    const key = `mealplan:${id}`
    
    let mealPlan = this.memoryCache.get(key)
    if (mealPlan) return mealPlan

    const cached = await this.redisCache.get(key)
    if (cached) {
      mealPlan = JSON.parse(cached)
      this.memoryCache.set(key, mealPlan, this.config.memory.ttl, ['mealPlans'])
      return mealPlan
    }

    return null
  }

  async setMealPlan(id: string, mealPlan: any): Promise<void> {
    const key = `mealplan:${id}`
    const serialized = JSON.stringify(mealPlan)
    
    this.memoryCache.set(key, mealPlan, this.config.memory.ttl, ['mealPlans'])
    await this.redisCache.set(key, serialized, this.config.redis.ttl.mealPlans)
  }

  // Analytics caching methods
  async getAnalytics(key: string): Promise<any | null> {
    const cacheKey = `analytics:${key}`
    
    let data = this.memoryCache.get(cacheKey)
    if (data) return data

    const cached = await this.redisCache.get(cacheKey)
    if (cached) {
      data = JSON.parse(cached)
      this.memoryCache.set(cacheKey, data, this.config.memory.ttl, ['analytics'])
      return data
    }

    return null
  }

  async setAnalytics(key: string, data: any): Promise<void> {
    const cacheKey = `analytics:${key}`
    const serialized = JSON.stringify(data)
    
    this.memoryCache.set(cacheKey, data, this.config.memory.ttl, ['analytics'])
    await this.redisCache.set(cacheKey, serialized, this.config.redis.ttl.analytics)
  }

  // Cache invalidation methods
  async invalidateRecipe(id: string): Promise<void> {
    const key = `recipe:${id}`
    this.memoryCache.delete(key)
    await this.redisCache.del(key)
  }

  async invalidateUser(userId: string): Promise<void> {
    const key = `user:${userId}`
    this.memoryCache.delete(key)
    await this.redisCache.del(key)
  }

  async invalidateByTag(tag: string): Promise<void> {
    this.memoryCache.deleteByTag(tag)
    
    // For Redis, we need to find and delete keys by pattern
    const keys = await this.redisCache.keys(`*${tag}*`)
    for (const key of keys) {
      await this.redisCache.del(key)
    }
  }

  async clearAll(): Promise<void> {
    this.memoryCache.clear()
    await this.redisCache.flushall()
  }

  // Stats and monitoring
  getCacheStats(): { memory: CacheStats; redis: CacheStats } {
    return {
      memory: this.memoryCache.getStats(),
      redis: this.redisCache.getStats()
    }
  }

  async healthCheck(): Promise<{ memory: boolean; redis: boolean }> {
    try {
      // Test memory cache
      const testKey = 'health_check_memory'
      this.memoryCache.set(testKey, 'ok', 1)
      const memoryOk = this.memoryCache.get(testKey) === 'ok'
      this.memoryCache.delete(testKey)

      // Test Redis cache
      const redisTestKey = 'health_check_redis'
      await this.redisCache.set(redisTestKey, 'ok', 1)
      const redisValue = await this.redisCache.get(redisTestKey)
      const redisOk = redisValue === 'ok'
      await this.redisCache.del(redisTestKey)

      return { memory: memoryOk, redis: redisOk }
    } catch (error) {
      return { memory: false, redis: false }
    }
  }
}

// Database Query Optimizer
export class DatabaseQueryOptimizer {
  private static readonly RECOMMENDED_INDEXES = {
    recipes: [
      'CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category)',
      'CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes(cuisine)',
      'CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty)',
      'CREATE INDEX IF NOT EXISTS idx_recipes_prep_time ON recipes(prep_time)',
      'CREATE INDEX IF NOT EXISTS idx_recipes_rating ON recipes(average_rating DESC)',
      'CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_recipes_chef_id ON recipes(chef_id)',
      'CREATE INDEX IF NOT EXISTS idx_recipes_tags ON recipes USING gin(tags)',
      'CREATE INDEX IF NOT EXISTS idx_recipes_search ON recipes USING gin(to_tsvector(\'english\', title || \' \' || description))'
    ],
    users: [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status)',
      'CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active_at DESC)'
    ],
    mealPlans: [
      'CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_meal_plans_created_at ON meal_plans(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_meal_plans_start_date ON meal_plans(start_date DESC)',
      'CREATE INDEX IF NOT EXISTS idx_meal_plans_status ON meal_plans(status)'
    ],
    analytics: [
      'CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON user_analytics(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON user_analytics(event_type)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON user_analytics(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_recipe_id ON recipe_analytics(recipe_id)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_date ON recipe_analytics(date DESC)'
    ]
  }

  static async optimizeQueries(supabaseClient: any): Promise<void> {
    try {
      // Create recommended indexes
      for (const [table, indexes] of Object.entries(this.RECOMMENDED_INDEXES)) {
        for (const indexQuery of indexes) {
          try {
            await supabaseClient.rpc('execute_sql', { sql: indexQuery })
          } catch (error) {
            console.warn(`Failed to create index for ${table}:`, error)
          }
        }
      }

      // Update table statistics for query planner
      await this.updateTableStatistics(supabaseClient)
    } catch (error) {
      console.error('Database optimization failed:', error)
    }
  }

  private static async updateTableStatistics(supabaseClient: any): Promise<void> {
    const tables = ['recipes', 'users', 'meal_plans', 'user_analytics', 'recipe_analytics']
    
    for (const table of tables) {
      try {
        await supabaseClient.rpc('execute_sql', { 
          sql: `ANALYZE ${table}` 
        })
      } catch (error) {
        console.warn(`Failed to analyze table ${table}:`, error)
      }
    }
  }

  static buildOptimizedQuery(
    table: string,
    filters: Record<string, any> = {},
    options: {
      limit?: number
      offset?: number
      orderBy?: string
      orderDirection?: 'asc' | 'desc'
      select?: string
    } = {}
  ): { query: string; params: any[] } {
    const {
      limit = 20,
      offset = 0,
      orderBy = 'created_at',
      orderDirection = 'desc',
      select = '*'
    } = options

    let query = `SELECT ${select} FROM ${table}`
    const params: any[] = []
    const whereClauses: string[] = []
    let paramIndex = 1

    // Build WHERE clauses
    for (const [field, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          whereClauses.push(`${field} = ANY($${paramIndex})`)
          params.push(value)
        } else if (typeof value === 'string' && value.includes('%')) {
          whereClauses.push(`${field} ILIKE $${paramIndex}`)
          params.push(value)
        } else {
          whereClauses.push(`${field} = $${paramIndex}`)
          params.push(value)
        }
        paramIndex++
      }
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`
    }

    // Add ordering
    query += ` ORDER BY ${orderBy} ${orderDirection.toUpperCase()}`

    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    return { query, params }
  }
}

// Progressive Image Loading Hook
export function useProgressiveImage(src: string, placeholder?: string): {
  src: string
  blur: boolean
  loading: boolean
  error: boolean
} {
  const [currentSrc, setCurrentSrc] = React.useState(placeholder || '')
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    const img = new Image()
    
    img.onload = () => {
      setCurrentSrc(src)
      setLoading(false)
      setError(false)
    }
    
    img.onerror = () => {
      setLoading(false)
      setError(true)
    }
    
    img.src = src
    
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return {
    src: currentSrc,
    blur: loading && !!placeholder,
    loading,
    error
  }
}

// Export instances
export const cacheManager = new CacheManager()
export const cdnService = new CDNService()

// Export React hook placeholder (would need actual React import in real implementation)
declare const React: any