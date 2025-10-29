// Admin Business Intelligence Service
// Comprehensive business analytics, A/B testing, lifecycle analysis, churn prediction, and feature usage tracking

export interface UserEngagementAnalytics {
  userId: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  metrics: {
    // Core Engagement
    totalSessions: number;
    averageSessionDuration: number;
    pageViews: number;
    uniquePageViews: number;
    bounceRate: number;
    
    // Feature Usage
    featuresUsed: Array<{
      feature: string;
      usageCount: number;
      timeSpent: number;
      lastUsed: Date;
    }>;
    
    // Cooking Activity
    cookingSessions: number;
    recipesViewed: number;
    recipesCooked: number;
    mealPlansCreated: number;
    shoppingListsGenerated: number;
    
    // Social Engagement
    recipesShared: number;
    reviewsWritten: number;
    ratingsGiven: number;
    communityInteractions: number;
    
    // Subscription Engagement
    subscriptionTier: 'free' | 'premium' | 'pro';
    premiumFeaturesUsed: number;
    billingIssues: number;
    supportTickets: number;
  };
  engagementScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface ABTestExperiment {
  id: string;
  name: string;
  description: string;
  feature: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  targetAudience: {
    percentage: number;
    criteria: Array<{
      type: 'user_tier' | 'signup_date' | 'usage_level' | 'location' | 'custom';
      operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
      value: string | number;
    }>;
  };
  variants: Array<{
    id: string;
    name: string;
    description: string;
    trafficAllocation: number;
    configuration: Record<string, any>;
  }>;
  metrics: {
    primaryMetric: string;
    secondaryMetrics: string[];
    successCriteria: Array<{
      metric: string;
      operator: 'increase' | 'decrease';
      threshold: number;
      significance: number;
    }>;
  };
  results?: ABTestResults;
}

export interface ABTestResults {
  experimentId: string;
  totalParticipants: number;
  variants: Array<{
    variantId: string;
    participants: number;
    conversionRate: number;
    metrics: Record<string, {
      value: number;
      confidenceInterval: [number, number];
      pValue: number;
      significant: boolean;
    }>;
  }>;
  winner?: string;
  confidence: number;
  recommendations: string[];
  insights: string[];
}

export interface CustomerLifecycleStage {
  stage: 'prospect' | 'new_user' | 'active' | 'engaged' | 'champion' | 'at_risk' | 'churned';
  description: string;
  criteria: Record<string, any>;
  averageDuration: number;
  conversionRateToNext: number;
}

export interface CustomerLifecycleAnalysis {
  userId: string;
  currentStage: CustomerLifecycleStage['stage'];
  stageHistory: Array<{
    stage: CustomerLifecycleStage['stage'];
    enteredAt: Date;
    exitedAt?: Date;
    duration: number;
  }>;
  journey: {
    signupDate: Date;
    firstActivity: Date;
    firstCook: Date;
    firstSubscription?: Date;
    lastActivity: Date;
    totalLifetimeValue: number;
    predictedLifetimeValue: number;
  };
  segmentation: {
    userType: 'casual_cook' | 'meal_planner' | 'recipe_collector' | 'social_cook' | 'premium_user';
    engagementLevel: 'low' | 'medium' | 'high';
    valueSegment: 'low_value' | 'medium_value' | 'high_value' | 'vip';
  };
  nextBestActions: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high';
    expectedImpact: number;
    reasoning: string;
  }>;
}

export interface ChurnPredictionModel {
  userId: string;
  churnProbability: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timeToChurn: number; // days
  riskFactors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  protectiveFactors: Array<{
    factor: string;
    strength: number;
    description: string;
  }>;
  recommendedInterventions: Array<{
    intervention: string;
    priority: 'low' | 'medium' | 'high';
    expectedImpact: number;
    effort: 'low' | 'medium' | 'high';
    description: string;
  }>;
}

export interface RetentionAnalysis {
  cohort: string;
  timeframe: 'daily' | 'weekly' | 'monthly';
  data: Array<{
    period: number;
    usersRetained: number;
    retentionRate: number;
    cumulativeRetention: number;
  }>;
  averageRetentionRate: number;
  retentionBenchmark: number;
  insights: {
    dropOffPeriods: number[];
    strongRetentionPeriods: number[];
    recommendations: string[];
  };
}

export interface FeatureUsageAnalytics {
  feature: string;
  category: 'core' | 'premium' | 'social' | 'ai' | 'integration';
  usage: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    powerUsers: number;
    adoptionRate: number;
    usageFrequency: number;
    averageSessionsPerUser: number;
    timeSpentPerSession: number;
  };
  trends: {
    dailyActiveUsers: Array<{ date: Date; count: number }>;
    weeklyActiveUsers: Array<{ date: Date; count: number }>;
    monthlyActiveUsers: Array<{ date: Date; count: number }>;
    adoptionTrend: 'growing' | 'stable' | 'declining';
    usageTrend: 'increasing' | 'stable' | 'decreasing';
  };
  userSegmentation: {
    byTier: Record<string, number>;
    byEngagement: Record<string, number>;
    byLifecycleStage: Record<string, number>;
  };
  performance: {
    loadTime: number;
    errorRate: number;
    satisfactionScore: number;
    npsScore: number;
  };
  businessImpact: {
    revenueAttribution: number;
    conversionImpact: number;
    retentionImpact: number;
    engagementBoost: number;
  };
}

export interface BusinessMetricsDashboard {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newSignups: number;
    churnRate: number;
    monthlyRecurringRevenue: number;
    averageRevenuePerUser: number;
    customerLifetimeValue: number;
    netPromoterScore: number;
  };
  growth: {
    userGrowthRate: number;
    revenueGrowthRate: number;
    engagementGrowthRate: number;
    retentionImprovement: number;
  };
  health: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    featureAdoptionRate: number;
    customerSatisfaction: number;
  };
  risks: {
    usersAtRisk: number;
    revenueAtRisk: number;
    supportTicketTrend: 'improving' | 'stable' | 'worsening';
    systemHealth: 'healthy' | 'warning' | 'critical';
  };
}

class AdminBusinessIntelligenceService {
  // Mock data for development
  private mockUsers = [
    {
      userId: 'user-001',
      tier: 'premium',
      signupDate: new Date('2024-01-15'),
      lastActivity: new Date('2024-03-10'),
      totalSessions: 45,
      cookingSessions: 23,
      subscriptionValue: 299
    },
    {
      userId: 'user-002', 
      tier: 'free',
      signupDate: new Date('2024-02-20'),
      lastActivity: new Date('2024-03-12'),
      totalSessions: 12,
      cookingSessions: 8,
      subscriptionValue: 0
    },
    {
      userId: 'user-003',
      tier: 'pro',
      signupDate: new Date('2023-11-10'),
      lastActivity: new Date('2024-03-11'),
      totalSessions: 89,
      cookingSessions: 56,
      subscriptionValue: 599
    }
  ];

  private mockExperiments: ABTestExperiment[] = [
    {
      id: 'exp-001',
      name: 'Recipe Card Redesign',
      description: 'Testing new recipe card layout with improved visual hierarchy',
      feature: 'recipe_cards',
      status: 'running',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-31'),
      targetAudience: {
        percentage: 50,
        criteria: [
          { type: 'user_tier', operator: 'equals', value: 'free' },
          { type: 'signup_date', operator: 'greater_than', value: '2024-01-01' }
        ]
      },
      variants: [
        {
          id: 'control',
          name: 'Current Design',
          description: 'Existing recipe card layout',
          trafficAllocation: 50,
          configuration: { layout: 'current' }
        },
        {
          id: 'variant_a',
          name: 'New Visual Layout',
          description: 'Enhanced visual hierarchy with larger images',
          trafficAllocation: 50,
          configuration: { layout: 'enhanced', imageSize: 'large' }
        }
      ],
      metrics: {
        primaryMetric: 'recipe_click_rate',
        secondaryMetrics: ['time_on_recipe', 'recipe_save_rate', 'cooking_conversion'],
        successCriteria: [
          { metric: 'recipe_click_rate', operator: 'increase', threshold: 15, significance: 0.95 }
        ]
      }
    }
  ];

  async getUserEngagementAnalytics(
    userId?: string,
    timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly' = 'monthly'
  ): Promise<UserEngagementAnalytics[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const users = userId ? this.mockUsers.filter(u => u.userId === userId) : this.mockUsers;

    return users.map(user => ({
      userId: user.userId,
      timeframe,
      metrics: {
        totalSessions: user.totalSessions,
        averageSessionDuration: 15 + Math.random() * 20,
        pageViews: user.totalSessions * (3 + Math.random() * 5),
        uniquePageViews: Math.floor(user.totalSessions * (2 + Math.random() * 3)),
        bounceRate: 20 + Math.random() * 30,
        
        featuresUsed: [
          { feature: 'recipe_browser', usageCount: 25, timeSpent: 450, lastUsed: new Date() },
          { feature: 'meal_planner', usageCount: 15, timeSpent: 320, lastUsed: new Date() },
          { feature: 'shopping_lists', usageCount: 18, timeSpent: 180, lastUsed: new Date() },
          { feature: 'cooking_timer', usageCount: user.cookingSessions, timeSpent: 120, lastUsed: new Date() }
        ],
        
        cookingSessions: user.cookingSessions,
        recipesViewed: Math.floor(user.totalSessions * 2.5),
        recipesCooked: user.cookingSessions,
        mealPlansCreated: Math.floor(user.totalSessions * 0.3),
        shoppingListsGenerated: Math.floor(user.totalSessions * 0.4),
        
        recipesShared: Math.floor(user.cookingSessions * 0.1),
        reviewsWritten: Math.floor(user.cookingSessions * 0.2),
        ratingsGiven: Math.floor(user.cookingSessions * 0.6),
        communityInteractions: Math.floor(user.totalSessions * 0.1),
        
        subscriptionTier: user.tier as 'free' | 'premium' | 'pro',
        premiumFeaturesUsed: user.tier !== 'free' ? Math.floor(Math.random() * 10) + 5 : 0,
        billingIssues: Math.floor(Math.random() * 2),
        supportTickets: Math.floor(Math.random() * 3)
      },
      engagementScore: this.calculateEngagementScore(user),
      riskLevel: this.calculateRiskLevel(user),
      recommendations: this.generateRecommendations(user)
    }));
  }

  async getABTestExperiments(): Promise<ABTestExperiment[]> {
    return [...this.mockExperiments];
  }

  async createABTestExperiment(experiment: Omit<ABTestExperiment, 'id'>): Promise<string> {
    const newExperiment: ABTestExperiment = {
      ...experiment,
      id: `exp-${Date.now()}`
    };
    
    this.mockExperiments.push(newExperiment);
    return newExperiment.id;
  }

  async getABTestResults(experimentId: string): Promise<ABTestResults | null> {
    const experiment = this.mockExperiments.find(exp => exp.id === experimentId);
    if (!experiment) return null;

    // Mock results for running/completed experiments
    if (experiment.status === 'running' || experiment.status === 'completed') {
      return {
        experimentId,
        totalParticipants: 2500,
        variants: experiment.variants.map(variant => ({
          variantId: variant.id,
          participants: Math.floor(2500 * variant.trafficAllocation / 100),
          conversionRate: 12 + Math.random() * 8,
          metrics: {
            recipe_click_rate: {
              value: 15.2 + Math.random() * 5,
              confidenceInterval: [13.1, 18.3],
              pValue: 0.03,
              significant: true
            },
            time_on_recipe: {
              value: 125 + Math.random() * 30,
              confidenceInterval: [110, 145],
              pValue: 0.12,
              significant: false
            }
          }
        })),
        winner: Math.random() > 0.5 ? 'variant_a' : 'control',
        confidence: 85 + Math.random() * 10,
        recommendations: [
          'Deploy winning variant to 100% of users',
          'Monitor long-term engagement metrics',
          'Consider testing additional visual improvements'
        ],
        insights: [
          'New design shows 18% improvement in click-through rate',
          'Higher engagement among mobile users',
          'No negative impact on conversion rates'
        ]
      };
    }

    return null;
  }

  async getCustomerLifecycleAnalysis(userId?: string): Promise<CustomerLifecycleAnalysis[]> {
    const users = userId ? this.mockUsers.filter(u => u.userId === userId) : this.mockUsers;

    return users.map(user => {
      const daysSinceSignup = Math.floor((new Date().getTime() - user.signupDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysSinceLastActivity = Math.floor((new Date().getTime() - user.lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      let currentStage: CustomerLifecycleStage['stage'];
      if (daysSinceLastActivity > 30) currentStage = 'churned';
      else if (daysSinceLastActivity > 14) currentStage = 'at_risk';
      else if (user.cookingSessions > 20 && user.tier !== 'free') currentStage = 'champion';
      else if (user.cookingSessions > 10) currentStage = 'engaged';
      else if (user.totalSessions > 5) currentStage = 'active';
      else currentStage = 'new_user';

      return {
        userId: user.userId,
        currentStage,
        stageHistory: [
          { stage: 'prospect', enteredAt: new Date(user.signupDate.getTime() - 24 * 60 * 60 * 1000), duration: 1 },
          { stage: 'new_user', enteredAt: user.signupDate, duration: 7 },
          { stage: 'active', enteredAt: new Date(user.signupDate.getTime() + 7 * 24 * 60 * 60 * 1000), duration: 14 },
          { stage: currentStage, enteredAt: new Date(user.signupDate.getTime() + 21 * 24 * 60 * 60 * 1000), duration: daysSinceSignup - 21 }
        ],
        journey: {
          signupDate: user.signupDate,
          firstActivity: new Date(user.signupDate.getTime() + 2 * 60 * 60 * 1000),
          firstCook: new Date(user.signupDate.getTime() + 3 * 24 * 60 * 60 * 1000),
          firstSubscription: user.tier !== 'free' ? new Date(user.signupDate.getTime() + 14 * 24 * 60 * 60 * 1000) : undefined,
          lastActivity: user.lastActivity,
          totalLifetimeValue: user.subscriptionValue,
          predictedLifetimeValue: user.subscriptionValue + (user.tier !== 'free' ? 500 : 100)
        },
        segmentation: {
          userType: this.determineUserType(user),
          engagementLevel: user.totalSessions > 30 ? 'high' : user.totalSessions > 10 ? 'medium' : 'low',
          valueSegment: user.subscriptionValue > 500 ? 'vip' : user.subscriptionValue > 200 ? 'high_value' : user.subscriptionValue > 0 ? 'medium_value' : 'low_value'
        },
        nextBestActions: this.generateNextBestActions(user, currentStage)
      };
    });
  }

  async getChurnPrediction(userId?: string): Promise<ChurnPredictionModel[]> {
    const users = userId ? this.mockUsers.filter(u => u.userId === userId) : this.mockUsers;

    return users.map(user => {
      const daysSinceLastActivity = Math.floor((new Date().getTime() - user.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      const engagementScore = this.calculateEngagementScore(user);
      
      let churnProbability: number;
      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      
      if (daysSinceLastActivity > 21) {
        churnProbability = 85 + Math.random() * 10;
        riskLevel = 'critical';
      } else if (daysSinceLastActivity > 14) {
        churnProbability = 60 + Math.random() * 20;
        riskLevel = 'high';
      } else if (engagementScore < 40) {
        churnProbability = 30 + Math.random() * 20;
        riskLevel = 'medium';
      } else {
        churnProbability = 5 + Math.random() * 15;
        riskLevel = 'low';
      }

      return {
        userId: user.userId,
        churnProbability,
        riskLevel,
        timeToChurn: Math.max(1, 45 - daysSinceLastActivity * 2),
        riskFactors: [
          { factor: 'Low recent activity', impact: daysSinceLastActivity * 0.05, description: `${daysSinceLastActivity} days since last activity` },
          { factor: 'Low cooking engagement', impact: (20 - user.cookingSessions) * 0.02, description: `Only ${user.cookingSessions} cooking sessions` },
          { factor: 'No premium features', impact: user.tier === 'free' ? 0.15 : 0, description: 'Free tier user with limited feature access' }
        ].filter(factor => factor.impact > 0),
        protectiveFactors: [
          { factor: 'Subscription active', strength: user.tier !== 'free' ? 0.3 : 0, description: `Active ${user.tier} subscription` },
          { factor: 'High session count', strength: user.totalSessions > 30 ? 0.25 : 0, description: `${user.totalSessions} total sessions` },
          { factor: 'Regular cooking', strength: user.cookingSessions > 15 ? 0.2 : 0, description: `${user.cookingSessions} cooking sessions` }
        ].filter(factor => factor.strength > 0),
        recommendedInterventions: this.generateChurnInterventions(user, riskLevel)
      };
    });
  }

  async getRetentionAnalysis(cohort: string = 'all', timeframe: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<RetentionAnalysis> {
    // Generate mock retention data
    const periods = timeframe === 'daily' ? 30 : timeframe === 'weekly' ? 12 : 6;
    const data = [];
    
    let retentionRate = 100;
    for (let period = 0; period <= periods; period++) {
      if (period === 0) {
        data.push({
          period,
          usersRetained: 1000,
          retentionRate: 100,
          cumulativeRetention: 100
        });
      } else {
        // Simulate typical retention decay
        const decay = period === 1 ? 25 : period <= 3 ? 10 : period <= 6 ? 5 : 2;
        retentionRate = Math.max(15, retentionRate - decay - Math.random() * 5);
        
        data.push({
          period,
          usersRetained: Math.floor(1000 * retentionRate / 100),
          retentionRate,
          cumulativeRetention: retentionRate
        });
      }
    }

    return {
      cohort,
      timeframe,
      data,
      averageRetentionRate: data.reduce((sum, d) => sum + d.retentionRate, 0) / data.length,
      retentionBenchmark: 45, // Industry benchmark
      insights: {
        dropOffPeriods: [1, 3], // Periods with significant drop-off
        strongRetentionPeriods: [6, 12], // Periods with good retention
        recommendations: [
          'Focus on improving Day 1 and Week 1 onboarding experience',
          'Implement targeted engagement campaigns for users in periods 2-4',
          'Create milestone rewards to improve long-term retention'
        ]
      }
    };
  }

  async getFeatureUsageAnalytics(feature?: string): Promise<FeatureUsageAnalytics[]> {
    const features = [
      'recipe_browser', 'meal_planner', 'shopping_lists', 'cooking_timer', 
      'social_sharing', 'ai_recommendations', 'voice_commands', 'barcode_scanner'
    ];

    const featuresToAnalyze = feature ? [feature] : features;

    return featuresToAnalyze.map(featureName => {
      const totalUsers = 1000 + Math.floor(Math.random() * 2000);
      const activeUsers = Math.floor(totalUsers * (0.3 + Math.random() * 0.4));
      
      return {
        feature: featureName,
        category: this.getFeatureCategory(featureName),
        usage: {
          totalUsers,
          activeUsers,
          newUsers: Math.floor(activeUsers * 0.2),
          powerUsers: Math.floor(activeUsers * 0.1),
          adoptionRate: (activeUsers / totalUsers) * 100,
          usageFrequency: 2 + Math.random() * 5,
          averageSessionsPerUser: 3 + Math.random() * 4,
          timeSpentPerSession: 60 + Math.random() * 120
        },
        trends: {
          dailyActiveUsers: this.generateTrendData(activeUsers * 0.1, 30),
          weeklyActiveUsers: this.generateTrendData(activeUsers * 0.4, 12),
          monthlyActiveUsers: this.generateTrendData(activeUsers, 6),
          adoptionTrend: Math.random() > 0.6 ? 'growing' : Math.random() > 0.3 ? 'stable' : 'declining',
          usageTrend: Math.random() > 0.5 ? 'increasing' : Math.random() > 0.3 ? 'stable' : 'decreasing'
        },
        userSegmentation: {
          byTier: {
            free: Math.floor(activeUsers * 0.6),
            premium: Math.floor(activeUsers * 0.3),
            pro: Math.floor(activeUsers * 0.1)
          },
          byEngagement: {
            low: Math.floor(activeUsers * 0.4),
            medium: Math.floor(activeUsers * 0.4),
            high: Math.floor(activeUsers * 0.2)
          },
          byLifecycleStage: {
            new_user: Math.floor(activeUsers * 0.2),
            active: Math.floor(activeUsers * 0.4),
            engaged: Math.floor(activeUsers * 0.3),
            champion: Math.floor(activeUsers * 0.1)
          }
        },
        performance: {
          loadTime: 0.5 + Math.random() * 1.5,
          errorRate: Math.random() * 2,
          satisfactionScore: 3.5 + Math.random() * 1.5,
          npsScore: 20 + Math.random() * 60
        },
        businessImpact: {
          revenueAttribution: Math.random() * 50000,
          conversionImpact: Math.random() * 20,
          retentionImpact: Math.random() * 15,
          engagementBoost: Math.random() * 25
        }
      };
    });
  }

  async getBusinessMetricsDashboard(): Promise<BusinessMetricsDashboard> {
    return {
      overview: {
        totalUsers: 15432,
        activeUsers: 8965,
        newSignups: 342,
        churnRate: 5.2,
        monthlyRecurringRevenue: 89500,
        averageRevenuePerUser: 29.50,
        customerLifetimeValue: 425,
        netPromoterScore: 67
      },
      growth: {
        userGrowthRate: 12.5,
        revenueGrowthRate: 18.2,
        engagementGrowthRate: 8.7,
        retentionImprovement: 3.2
      },
      health: {
        dailyActiveUsers: 3200,
        weeklyActiveUsers: 8965,
        monthlyActiveUsers: 15432,
        averageSessionDuration: 18.5,
        featureAdoptionRate: 45.8,
        customerSatisfaction: 4.2
      },
      risks: {
        usersAtRisk: 876,
        revenueAtRisk: 12500,
        supportTicketTrend: 'improving',
        systemHealth: 'healthy'
      }
    };
  }

  // Helper methods
  private calculateEngagementScore(user: any): number {
    const sessionScore = Math.min(user.totalSessions * 2, 100);
    const cookingScore = Math.min(user.cookingSessions * 4, 100);
    const tierBonus = user.tier === 'pro' ? 20 : user.tier === 'premium' ? 10 : 0;
    
    return Math.min(100, (sessionScore + cookingScore) / 2 + tierBonus);
  }

  private calculateRiskLevel(user: any): 'low' | 'medium' | 'high' | 'critical' {
    const daysSinceLastActivity = Math.floor((new Date().getTime() - user.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastActivity > 21) return 'critical';
    if (daysSinceLastActivity > 14) return 'high';
    if (daysSinceLastActivity > 7 && user.totalSessions < 10) return 'medium';
    return 'low';
  }

  private generateRecommendations(user: any): string[] {
    const recommendations = [];
    const daysSinceLastActivity = Math.floor((new Date().getTime() - user.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastActivity > 7) {
      recommendations.push('Send re-engagement email with personalized recipe suggestions');
    }
    
    if (user.tier === 'free' && user.totalSessions > 20) {
      recommendations.push('Offer premium trial to highly engaged free user');
    }
    
    if (user.cookingSessions < 5) {
      recommendations.push('Provide cooking tutorial and easy starter recipes');
    }
    
    return recommendations;
  }

  private determineUserType(user: any): 'casual_cook' | 'meal_planner' | 'recipe_collector' | 'social_cook' | 'premium_user' {
    if (user.tier !== 'free') return 'premium_user';
    if (user.cookingSessions / user.totalSessions > 0.7) return 'casual_cook';
    if (user.totalSessions > 30) return 'recipe_collector';
    return 'casual_cook';
  }

  private generateNextBestActions(user: any, stage: string): Array<{ action: string; priority: 'low' | 'medium' | 'high'; expectedImpact: number; reasoning: string }> {
    const actions = [];
    
    if (stage === 'new_user') {
      actions.push({
        action: 'Send onboarding email series',
        priority: 'high',
        expectedImpact: 25,
        reasoning: 'New users need guidance to discover core features'
      });
    }
    
    if (user.tier === 'free' && user.totalSessions > 15) {
      actions.push({
        action: 'Offer premium trial',
        priority: 'medium',
        expectedImpact: 40,
        reasoning: 'Engaged free users are prime candidates for conversion'
      });
    }
    
    return actions;
  }

  private generateChurnInterventions(user: any, riskLevel: string): Array<{ intervention: string; priority: 'low' | 'medium' | 'high'; expectedImpact: number; effort: 'low' | 'medium' | 'high'; description: string }> {
    const interventions = [];
    
    if (riskLevel === 'critical' || riskLevel === 'high') {
      interventions.push({
        intervention: 'Personal outreach campaign',
        priority: 'high',
        expectedImpact: 45,
        effort: 'medium',
        description: 'Send personalized email with special offers and check-in'
      });
    }
    
    interventions.push({
      intervention: 'Feature recommendation engine',
      priority: 'medium',
      expectedImpact: 25,
      effort: 'low',
      description: 'Suggest unused features that match user behavior patterns'
    });
    
    return interventions;
  }

  private getFeatureCategory(feature: string): 'core' | 'premium' | 'social' | 'ai' | 'integration' {
    const categoryMap: Record<string, 'core' | 'premium' | 'social' | 'ai' | 'integration'> = {
      recipe_browser: 'core',
      meal_planner: 'core',
      shopping_lists: 'core',
      cooking_timer: 'core',
      social_sharing: 'social',
      ai_recommendations: 'ai',
      voice_commands: 'premium',
      barcode_scanner: 'integration'
    };
    
    return categoryMap[feature] || 'core';
  }

  private generateTrendData(baseValue: number, periods: number): Array<{ date: Date; count: number }> {
    const data = [];
    const now = new Date();
    
    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const variation = 0.8 + Math.random() * 0.4; // ±20% variation
      data.push({
        date,
        count: Math.floor(baseValue * variation)
      });
    }
    
    return data;
  }
}

export const adminBusinessIntelligenceService = new AdminBusinessIntelligenceService();