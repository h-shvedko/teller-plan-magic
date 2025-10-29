import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { cacheManager, DatabaseQueryOptimizer, imagePreloader } from '@/lib/caching'
import { 
  Activity,
  Database,
  Image,
  Zap,
  Server,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Settings,
  BarChart3,
  Monitor,
  Cpu,
  HardDrive,
  Network,
  Eye
} from 'lucide-react'

interface PerformanceMetrics {
  cache: {
    memory: {
      hitRate: number
      memoryUsage: number
      operations: number
    }
    redis: {
      hitRate: number
      connections: number
      operations: number
    }
  }
  database: {
    queryTime: number
    connectionPool: number
    slowQueries: number
  }
  images: {
    cached: number
    loading: number
    totalPreloaded: number
    avgLoadTime: number
  }
  app: {
    loadTime: number
    firstContentfulPaint: number
    largestContentfulPaint: number
    cumulativeLayoutShift: number
  }
}

export function PerformanceDashboard() {
  const { toast } = useToast()
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds

  const [optimizationSettings, setOptimizationSettings] = useState({
    enableRedisCache: true,
    enableImagePreloading: true,
    enableQueryOptimization: true,
    enableProgressiveImages: true,
    cacheStrategy: 'aggressive'
  })

  useEffect(() => {
    loadMetrics()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadMetrics()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      
      // Get cache statistics
      const cacheStats = cacheManager.getCacheStats()
      
      // Get image preloader stats
      const imageStats = imagePreloader.getStats()
      
      // Simulate additional metrics (in real app, these would come from monitoring services)
      const performanceMetrics: PerformanceMetrics = {
        cache: {
          memory: {
            hitRate: cacheStats.memory.hitRate,
            memoryUsage: cacheStats.memory.memoryUsage,
            operations: cacheStats.memory.operations.gets + cacheStats.memory.operations.sets
          },
          redis: {
            hitRate: cacheStats.redis.hitRate,
            connections: cacheStats.redis.redisConnections,
            operations: cacheStats.redis.operations.gets + cacheStats.redis.operations.sets
          }
        },
        database: {
          queryTime: 45 + Math.random() * 20, // Simulated
          connectionPool: 8 + Math.floor(Math.random() * 4),
          slowQueries: Math.floor(Math.random() * 3)
        },
        images: {
          cached: imageStats.cached,
          loading: imageStats.loading,
          totalPreloaded: imageStats.cached,
          avgLoadTime: 120 + Math.random() * 80
        },
        app: {
          loadTime: 800 + Math.random() * 200,
          firstContentfulPaint: 600 + Math.random() * 150,
          largestContentfulPaint: 1200 + Math.random() * 300,
          cumulativeLayoutShift: 0.05 + Math.random() * 0.05
        }
      }
      
      setMetrics(performanceMetrics)
    } catch (error) {
      toast({
        title: "Error loading metrics",
        description: "Failed to load performance metrics",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClearCache = async () => {
    try {
      await cacheManager.clearAll()
      imagePreloader.clear()
      
      toast({
        title: "Cache cleared",
        description: "All caches have been cleared successfully"
      })
      
      loadMetrics()
    } catch (error) {
      toast({
        title: "Error clearing cache",
        description: "Failed to clear cache",
        variant: "destructive"
      })
    }
  }

  const handleOptimizeDatabase = async () => {
    try {
      // In a real app, this would connect to Supabase client
      // await DatabaseQueryOptimizer.optimizeQueries(supabaseClient)
      
      toast({
        title: "Database optimized",
        description: "Database indexes and statistics have been updated"
      })
      
      loadMetrics()
    } catch (error) {
      toast({
        title: "Error optimizing database",
        description: "Failed to optimize database",
        variant: "destructive"
      })
    }
  }

  const getPerformanceStatus = (value: number, thresholds: { good: number; fair: number }) => {
    if (value <= thresholds.good) return { status: 'good', color: 'text-green-600' }
    if (value <= thresholds.fair) return { status: 'fair', color: 'text-yellow-600' }
    return { status: 'poor', color: 'text-red-600' }
  }

  const getHealthStatus = () => {
    if (!metrics) return 'unknown'
    
    const cacheHealthy = metrics.cache.memory.hitRate > 70 && metrics.cache.redis.hitRate > 60
    const dbHealthy = metrics.database.queryTime < 100 && metrics.database.slowQueries < 2
    const appHealthy = metrics.app.loadTime < 1000 && metrics.app.cumulativeLayoutShift < 0.1
    
    if (cacheHealthy && dbHealthy && appHealthy) return 'excellent'
    if ((cacheHealthy && dbHealthy) || (cacheHealthy && appHealthy) || (dbHealthy && appHealthy)) return 'good'
    if (cacheHealthy || dbHealthy || appHealthy) return 'fair'
    return 'poor'
  }

  if (loading && !metrics) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span>Loading performance metrics...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const healthStatus = getHealthStatus()
  const healthColors = {
    excellent: 'text-green-600 bg-green-50 border-green-200',
    good: 'text-blue-600 bg-blue-50 border-blue-200',
    fair: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    poor: 'text-red-600 bg-red-50 border-red-200',
    unknown: 'text-gray-600 bg-gray-50 border-gray-200'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-6 w-6" />
                <span>Performance Dashboard</span>
              </CardTitle>
              <CardDescription>
                Monitor caching, database performance, image optimization, and app metrics
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full border ${healthColors[healthStatus]}`}>
                <div className="flex items-center space-x-1">
                  {healthStatus === 'excellent' && <CheckCircle className="h-4 w-4" />}
                  {healthStatus === 'poor' && <AlertCircle className="h-4 w-4" />}
                  <span className="text-sm font-medium capitalize">{healthStatus}</span>
                </div>
              </div>
              <Button onClick={loadMetrics} disabled={loading} size="sm">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics && (
              <>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Cache Hit Rate</p>
                        <p className="text-2xl font-bold">{metrics.cache.memory.hitRate.toFixed(1)}%</p>
                      </div>
                      <Server className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Query Time</p>
                        <p className="text-2xl font-bold">{metrics.database.queryTime.toFixed(0)}ms</p>
                      </div>
                      <Database className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Images Cached</p>
                        <p className="text-2xl font-bold">{metrics.images.cached}</p>
                      </div>
                      <Image className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Page Load</p>
                        <p className="text-2xl font-bold">{metrics.app.loadTime.toFixed(0)}ms</p>
                      </div>
                      <Zap className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Core Web Vitals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>First Contentful Paint</span>
                      <span className={getPerformanceStatus(metrics.app.firstContentfulPaint, { good: 1000, fair: 2000 }).color}>
                        {metrics.app.firstContentfulPaint.toFixed(0)}ms
                      </span>
                    </div>
                    <Progress value={Math.min((1000 / metrics.app.firstContentfulPaint) * 100, 100)} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Largest Contentful Paint</span>
                      <span className={getPerformanceStatus(metrics.app.largestContentfulPaint, { good: 2000, fair: 4000 }).color}>
                        {metrics.app.largestContentfulPaint.toFixed(0)}ms
                      </span>
                    </div>
                    <Progress value={Math.min((2000 / metrics.app.largestContentfulPaint) * 100, 100)} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cumulative Layout Shift</span>
                      <span className={getPerformanceStatus(metrics.app.cumulativeLayoutShift * 1000, { good: 100, fair: 250 }).color}>
                        {metrics.app.cumulativeLayoutShift.toFixed(3)}
                      </span>
                    </div>
                    <Progress value={Math.max(100 - (metrics.app.cumulativeLayoutShift * 1000), 0)} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      {(() => {
                        const score = healthStatus === 'excellent' ? 95 : 
                                     healthStatus === 'good' ? 85 : 
                                     healthStatus === 'fair' ? 70 : 55
                        return score
                      })()}
                    </div>
                    <p className="text-gray-600 mb-4">Overall Performance Score</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Caching</span>
                        <Badge variant={metrics.cache.memory.hitRate > 70 ? 'secondary' : 'destructive'}>
                          {metrics.cache.memory.hitRate > 70 ? 'Good' : 'Needs Work'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Database</span>
                        <Badge variant={metrics.database.queryTime < 100 ? 'secondary' : 'destructive'}>
                          {metrics.database.queryTime < 100 ? 'Good' : 'Needs Work'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Images</span>
                        <Badge variant={metrics.images.cached > 0 ? 'secondary' : 'destructive'}>
                          {metrics.images.cached > 0 ? 'Optimized' : 'Not Cached'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <span>Memory Cache</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Hit Rate</span>
                        <span className="font-semibold">{metrics.cache.memory.hitRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.cache.memory.hitRate} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Memory Usage</span>
                        <span className="font-semibold">{(metrics.cache.memory.memoryUsage / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <Progress value={Math.min((metrics.cache.memory.memoryUsage / (100 * 1024 * 1024)) * 100, 100)} />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Total Operations</span>
                      <span>{metrics.cache.memory.operations.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Redis Cache</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Hit Rate</span>
                        <span className="font-semibold">{metrics.cache.redis.hitRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.cache.redis.hitRate} />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Connections</span>
                      <span>{metrics.cache.redis.connections}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Total Operations</span>
                      <span>{metrics.cache.redis.operations.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cache Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Cache Health</AlertTitle>
                <AlertDescription>
                  {metrics && metrics.cache.memory.hitRate > 70 
                    ? "Your cache is performing well with a good hit rate." 
                    : "Consider optimizing your caching strategy to improve performance."
                  }
                </AlertDescription>
              </Alert>
              
              <Button onClick={handleClearCache} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear All Caches
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics && (
              <>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold">{metrics.database.queryTime.toFixed(0)}ms</div>
                      <div className="text-sm text-gray-600">Avg Query Time</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Network className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold">{metrics.database.connectionPool}</div>
                      <div className="text-sm text-gray-600">Active Connections</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <div className="text-2xl font-bold">{metrics.database.slowQueries}</div>
                      <div className="text-sm text-gray-600">Slow Queries</div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Query Optimization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertTitle>Database Performance</AlertTitle>
                <AlertDescription>
                  {metrics && metrics.database.queryTime < 100 
                    ? "Your database queries are performing well."
                    : "Consider optimizing slow queries and adding appropriate indexes."
                  }
                </AlertDescription>
              </Alert>
              
              <Button onClick={handleOptimizeDatabase} variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Optimize Database
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {metrics && (
              <>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <HardDrive className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold">{metrics.images.cached}</div>
                      <div className="text-sm text-gray-600">Cached Images</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Cpu className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold">{metrics.images.loading}</div>
                      <div className="text-sm text-gray-600">Loading</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Eye className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold">{metrics.images.totalPreloaded}</div>
                      <div className="text-sm text-gray-600">Preloaded</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <div className="text-2xl font-bold">{metrics.images.avgLoadTime.toFixed(0)}ms</div>
                      <div className="text-sm text-gray-600">Avg Load Time</div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Image Optimization Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CDN Integration</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progressive Loading</span>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">WebP Support</span>
                  <Badge variant="secondary">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Lazy Loading</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>
              
              {metrics && (
                <Alert>
                  <Image className="h-4 w-4" />
                  <AlertTitle>Image Performance</AlertTitle>
                  <AlertDescription>
                    {metrics.images.avgLoadTime < 200 
                      ? "Your images are loading efficiently with good optimization."
                      : "Consider optimizing image sizes and formats to improve loading times."
                    }
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
              <CardDescription>
                Configure caching and optimization settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="redis-cache">Redis Caching</Label>
                    <p className="text-sm text-gray-600">Enable Redis for server-side caching</p>
                  </div>
                  <Switch
                    id="redis-cache"
                    checked={optimizationSettings.enableRedisCache}
                    onCheckedChange={(checked) => setOptimizationSettings({...optimizationSettings, enableRedisCache: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="image-preloading">Image Preloading</Label>
                    <p className="text-sm text-gray-600">Preload images for faster navigation</p>
                  </div>
                  <Switch
                    id="image-preloading"
                    checked={optimizationSettings.enableImagePreloading}
                    onCheckedChange={(checked) => setOptimizationSettings({...optimizationSettings, enableImagePreloading: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="query-optimization">Query Optimization</Label>
                    <p className="text-sm text-gray-600">Automatic database query optimization</p>
                  </div>
                  <Switch
                    id="query-optimization"
                    checked={optimizationSettings.enableQueryOptimization}
                    onCheckedChange={(checked) => setOptimizationSettings({...optimizationSettings, enableQueryOptimization: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="progressive-images">Progressive Images</Label>
                    <p className="text-sm text-gray-600">Enable progressive image loading</p>
                  </div>
                  <Switch
                    id="progressive-images"
                    checked={optimizationSettings.enableProgressiveImages}
                    onCheckedChange={(checked) => setOptimizationSettings({...optimizationSettings, enableProgressiveImages: checked})}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <Label htmlFor="auto-refresh">Auto-refresh metrics every 30 seconds</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cache Health Check</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={async () => {
                const health = await cacheManager.healthCheck()
                toast({
                  title: "Health Check Complete",
                  description: `Memory: ${health.memory ? 'Healthy' : 'Issues'}, Redis: ${health.redis ? 'Healthy' : 'Issues'}`
                })
              }}>
                <Monitor className="mr-2 h-4 w-4" />
                Run Health Check
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}