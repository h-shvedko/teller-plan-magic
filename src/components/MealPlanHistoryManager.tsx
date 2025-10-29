import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Calendar, Clock, Star, TrendingUp, TrendingDown, Filter, Search, Archive, Download, Share2, Eye, BookOpen, BarChart3, Heart, DollarSign } from 'lucide-react';
import { PremiumFeaturesService, MealPlanHistory, HistoricalMeal } from '../lib/premiumFeatures';

const MealPlanHistoryManager: React.FC = () => {
  const [mealPlanHistory, setMealPlanHistory] = useState<MealPlanHistory[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MealPlanHistory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [plansPerPage] = useState(12);

  const service = new PremiumFeaturesService();

  useEffect(() => {
    loadMealPlanHistory();
  }, []);

  const loadMealPlanHistory = async () => {
    setIsLoading(true);
    try {
      const userId = 'current-user'; // Would come from auth context
      const history = await service.getMealPlanHistory(userId, 100); // Load up to 100 plans for premium users
      setMealPlanHistory(history);
    } catch (error) {
      console.error('Failed to load meal plan history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedPlans = mealPlanHistory
    .filter(plan => {
      const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = selectedStatus === 'all' || plan.status.toLowerCase() === selectedStatus;
      
      const matchesTimeRange = selectedTimeRange === 'all' || (() => {
        const planDate = new Date(plan.startDate);
        const now = new Date();
        const daysAgo = Math.floor((now.getTime() - planDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (selectedTimeRange) {
          case 'week': return daysAgo <= 7;
          case 'month': return daysAgo <= 30;
          case 'quarter': return daysAgo <= 90;
          case 'year': return daysAgo <= 365;
          default: return true;
        }
      })();
      
      return matchesSearch && matchesStatus && matchesTimeRange;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'oldest':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'rating':
          return b.userFeedback.overallRating - a.userFeedback.overallRating;
        case 'success':
          return b.successMetrics.successRate - a.successMetrics.successRate;
        case 'duration':
          return b.duration - a.duration;
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPlans.length / plansPerPage);
  const startIndex = (currentPage - 1) * plansPerPage;
  const paginatedPlans = filteredAndSortedPlans.slice(startIndex, startIndex + plansPerPage);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'default';
      case 'completed': return 'outline';
      case 'paused': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'draft': return 'secondary';
      default: return 'outline';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateOverallStats = () => {
    const completed = mealPlanHistory.filter(p => p.status === 'Completed');
    const totalPlans = completed.length;
    const avgSuccessRate = totalPlans > 0 
      ? completed.reduce((acc, p) => acc + p.successMetrics.successRate, 0) / totalPlans 
      : 0;
    const avgRating = totalPlans > 0
      ? completed.reduce((acc, p) => acc + p.userFeedback.overallRating, 0) / totalPlans
      : 0;
    const totalMealsCooked = completed.reduce((acc, p) => acc + p.successMetrics.cookedMeals, 0);
    
    return { totalPlans, avgSuccessRate, avgRating, totalMealsCooked };
  };

  const stats = calculateOverallStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your meal plan history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Archive className="h-8 w-8 text-blue-500" />
            Unlimited Meal Plan History
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Access your complete meal planning journey with detailed analytics and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Plans</p>
                <p className="text-3xl font-bold">{stats.totalPlans}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline">{mealPlanHistory.filter(p => p.status === 'Active').length} active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Success Rate</p>
                <p className={`text-3xl font-bold ${getSuccessRateColor(stats.avgSuccessRate)}`}>
                  {stats.avgSuccessRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Progress value={stats.avgSuccessRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.avgRating.toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2 flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i <= stats.avgRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Meals Cooked</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalMealsCooked}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">All-time total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search meal plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last 3 Months</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="success">Success Rate</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Advanced
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Meal Plans */}
      <div className="space-y-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg">{plan.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {plan.description}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(plan.status)}>
                        {plan.status}
                      </Badge>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(plan.startDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {plan.duration} days
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${getSuccessRateColor(plan.successMetrics.successRate)}`}>
                          {plan.successMetrics.successRate}%
                        </p>
                        <p className="text-xs text-muted-foreground">Success Rate</p>
                      </div>
                      <div className="text-center">
                        <div className="flex justify-center mb-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i <= plan.userFeedback.overallRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {plan.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedPlan(plan)}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          {selectedPlan && <MealPlanDetails plan={selectedPlan} />}
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {paginatedPlans.map((plan) => (
                  <div key={plan.id} className="p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-bold text-lg">{plan.title}</h3>
                          <Badge variant={getStatusColor(plan.status)}>
                            {plan.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span>{formatDate(plan.startDate)} - {formatDate(plan.endDate)}</span>
                          <span>{plan.duration} days</span>
                          <span className={getSuccessRateColor(plan.successMetrics.successRate)}>
                            {plan.successMetrics.successRate}% success
                          </span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i <= plan.userFeedback.overallRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedPlan(plan)}>
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            {selectedPlan && <MealPlanDetails plan={selectedPlan} />}
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + plansPerPage, filteredAndSortedPlans.length)} of {filteredAndSortedPlans.length} meal plans
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage <= 3 ? i + 1 : 
                currentPage >= totalPages - 2 ? totalPages - 4 + i : 
                currentPage - 2 + i;
              
              if (pageNum < 1 || pageNum > totalPages) return null;
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Detailed meal plan view component
const MealPlanDetails: React.FC<{ plan: MealPlanHistory }> = ({ plan }) => {
  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          {plan.title}
          <Badge variant={plan.status === 'Completed' ? 'default' : 'secondary'}>
            {plan.status}
          </Badge>
        </DialogTitle>
        <DialogDescription>{plan.description}</DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="meals">Meals</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{plan.duration}</div>
              <div className="text-sm text-muted-foreground">Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{plan.successMetrics.successRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{plan.successMetrics.cookedMeals}</div>
              <div className="text-sm text-muted-foreground">Meals Cooked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{plan.userFeedback.overallRating}</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Success Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cooking Success</span>
                      <span>{plan.successMetrics.successRate}%</span>
                    </div>
                    <Progress value={plan.successMetrics.successRate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cost Efficiency</span>
                      <span>{plan.successMetrics.costEfficiency}%</span>
                    </div>
                    <Progress value={plan.successMetrics.costEfficiency} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Time Efficiency</span>
                      <span>{plan.successMetrics.timeEfficiency}%</span>
                    </div>
                    <Progress value={plan.successMetrics.timeEfficiency} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Plan Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span>{new Date(plan.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Date:</span>
                    <span>{new Date(plan.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(plan.createdDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version:</span>
                    <span>v{plan.version}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {plan.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="meals" className="space-y-4">
          <div className="grid gap-4">
            {plan.meals.slice(0, 10).map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm font-medium">{new Date(meal.date).getDate()}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(meal.date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">{meal.recipeName}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">{meal.mealType}</Badge>
                      {meal.actuallyCooked ? (
                        <Badge variant="default" className="text-xs">Cooked</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Skipped</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {meal.actuallyCooked && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className={`h-3 w-3 ${meal.satisfactionRating >= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      <span>{meal.satisfactionRating}/5</span>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {meal.cookingTime} min • ${meal.actualCost?.toFixed(2) || meal.costEstimate.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
            {plan.meals.length > 10 && (
              <div className="text-center py-4">
                <Button variant="outline">View All {plan.meals.length} Meals</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nutritional Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Nutrition Score</span>
                      <span>{plan.nutritionSummary.nutritionScore}/10</span>
                    </div>
                    <Progress value={plan.nutritionSummary.nutritionScore * 10} className="h-2" />
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-2">Daily Averages:</p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Calories:</span>
                        <span>{plan.nutritionSummary.avgDailyCalories}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hydration:</span>
                        <span>{plan.nutritionSummary.hydration}L</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Macro Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Carbs</span>
                      <span>{plan.nutritionSummary.macroBreakdown.carbs}%</span>
                    </div>
                    <Progress value={plan.nutritionSummary.macroBreakdown.carbs} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Protein</span>
                      <span>{plan.nutritionSummary.macroBreakdown.protein}%</span>
                    </div>
                    <Progress value={plan.nutritionSummary.macroBreakdown.protein} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Fat</span>
                      <span>{plan.nutritionSummary.macroBreakdown.fat}%</span>
                    </div>
                    <Progress value={plan.nutritionSummary.macroBreakdown.fat} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{plan.userFeedback.overallRating}</div>
                    <div className="text-sm text-muted-foreground">Overall Rating</div>
                    <div className="flex justify-center mt-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i <= plan.userFeedback.overallRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{plan.userFeedback.difficulty}</div>
                    <div className="text-sm text-muted-foreground">Difficulty</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{plan.userFeedback.satisfaction}</div>
                    <div className="text-sm text-muted-foreground">Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${plan.userFeedback.wouldRecommend ? 'text-green-600' : 'text-red-600'}`}>
                      {plan.userFeedback.wouldRecommend ? 'Yes' : 'No'}
                    </div>
                    <div className="text-sm text-muted-foreground">Recommend</div>
                  </div>
                </div>
                
                {plan.userFeedback.comments && (
                  <div className="bg-muted p-4 rounded">
                    <h5 className="font-medium mb-2">Your Comments:</h5>
                    <p className="text-sm text-muted-foreground">{plan.userFeedback.comments}</p>
                  </div>
                )}
                
                {plan.userFeedback.improvements.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Suggested Improvements:</h5>
                    <div className="flex flex-wrap gap-2">
                      {plan.userFeedback.improvements.map((improvement) => (
                        <Badge key={improvement} variant="outline">{improvement}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Plan
        </Button>
        <Button variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button>
          <Heart className="h-4 w-4 mr-2" />
          Use as Template
        </Button>
      </DialogFooter>
    </div>
  );
};

export default MealPlanHistoryManager;