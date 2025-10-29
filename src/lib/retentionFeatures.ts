import { createClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CookingStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCookingDate: Date;
  streakStartDate: Date;
  totalCookingDays: number;
  streakType: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  streakRewards: StreakReward[];
}

export interface StreakReward {
  id: string;
  streakLength: number;
  rewardType: 'badge' | 'recipe_unlock' | 'feature_access' | 'discount';
  rewardValue: string;
  description: string;
  claimed: boolean;
  claimedAt?: Date;
}

export interface HabitTracker {
  userId: string;
  habitType: 'meal_planning' | 'cooking' | 'recipe_rating' | 'grocery_shopping' | 'meal_prep';
  targetFrequency: 'daily' | 'weekly' | 'monthly';
  currentProgress: number;
  targetProgress: number;
  habitStartDate: Date;
  lastActivityDate: Date;
  completionRate: number;
  motivationalMessage: string;
  reminderSettings: ReminderSettings;
}

export interface ReminderSettings {
  enabled: boolean;
  reminderType: 'push' | 'email' | 'both';
  reminderTime: string; // HH:MM format
  reminderDays: number[]; // 0-6 (Sunday-Saturday)
  customMessage?: string;
  snoozeCount: number;
  maxSnooze: number;
}

export interface WeeklyReminder {
  id: string;
  userId: string;
  reminderType: 'meal_planning' | 'grocery_shopping' | 'meal_prep' | 'recipe_discovery';
  scheduledFor: Date;
  sentAt?: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  content: {
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
  };
  priority: 'low' | 'medium' | 'high';
  recurring: boolean;
}

export interface SeasonalChallenge {
  id: string;
  title: string;
  description: string;
  season: 'spring' | 'summer' | 'fall' | 'winter';
  challengeType: 'cooking' | 'ingredient' | 'cuisine' | 'skill' | 'social';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  startDate: Date;
  endDate: Date;
  participants: number;
  maxParticipants?: number;
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward[];
  leaderboard: LeaderboardEntry[];
  tags: string[];
  isActive: boolean;
}

export interface ChallengeRequirement {
  id: string;
  description: string;
  type: 'cook_recipes' | 'try_ingredients' | 'complete_challenges' | 'share_recipes' | 'rate_recipes';
  target: number;
  timeframe: 'daily' | 'weekly' | 'challenge_duration';
  optional: boolean;
}

export interface ChallengeReward {
  id: string;
  rewardType: 'badge' | 'recipe_collection' | 'feature_unlock' | 'discount' | 'title';
  rewardValue: string;
  description: string;
  tier: 'participation' | 'completion' | 'excellence' | 'winner';
  requirement: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  rank: number;
  progress: ChallengeProgress;
  lastUpdated: Date;
}

export interface ChallengeProgress {
  challengeId: string;
  userId: string;
  requirements: { [requirementId: string]: number };
  completedRequirements: string[];
  totalScore: number;
  isCompleted: boolean;
  completedAt?: Date;
  rewards: string[];
}

export interface UserChallenge {
  challengeId: string;
  userId: string;
  joinedAt: Date;
  progress: ChallengeProgress;
  isCompleted: boolean;
  completedAt?: Date;
  rank?: number;
}

export interface CookingMilestone {
  id: string;
  title: string;
  description: string;
  category: 'cooking_count' | 'recipe_variety' | 'skill_improvement' | 'social_engagement' | 'time_saved' | 'cost_savings';
  threshold: number;
  unit: string;
  badge: MilestoneBadge;
  celebrationMessage: string;
  rewards: MilestoneReward[];
  isRepeatable: boolean;
  nextMilestone?: string;
}

export interface MilestoneBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
}

export interface MilestoneReward {
  type: 'recipe_unlock' | 'feature_access' | 'discount' | 'title' | 'customization';
  value: string;
  description: string;
  duration?: number; // in days
}

export interface UserMilestone {
  userId: string;
  milestoneId: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  celebrationShown: boolean;
  rewardsClaimed: boolean;
  claimedAt?: Date;
}

export interface ReferralProgram {
  id: string;
  userId: string;
  referralCode: string;
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
  availableRewards: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  tierProgress: number;
  referrals: Referral[];
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId?: string;
  referredEmail: string;
  referralCode: string;
  status: 'pending' | 'signed_up' | 'activated' | 'expired';
  sentAt: Date;
  signedUpAt?: Date;
  activatedAt?: Date;
  expiresAt: Date;
  reward: ReferralReward;
  claimed: boolean;
  claimedAt?: Date;
}

export interface ReferralReward {
  referrerReward: {
    type: 'credits' | 'premium_days' | 'feature_unlock' | 'discount';
    value: number;
    description: string;
  };
  referredReward: {
    type: 'credits' | 'premium_days' | 'feature_unlock' | 'discount';
    value: number;
    description: string;
  };
}

export interface RetentionInsight {
  userId: string;
  insightType: 'streak_motivation' | 'habit_improvement' | 'challenge_recommendation' | 'milestone_near' | 'referral_opportunity';
  title: string;
  description: string;
  actionable: boolean;
  actions: string[];
  priority: 'low' | 'medium' | 'high';
  generatedAt: Date;
  acknowledged: boolean;
}

class RetentionFeaturesService {
  private supabase = createClient();

  // Cooking Streaks and Habit Tracking
  async trackCookingActivity(userId: string, activityType: 'cooking' | 'meal_planning' | 'recipe_rating'): Promise<CookingStreak> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get current streak data
      const { data: existingStreak, error: fetchError } = await this.supabase
        .from('cooking_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('streak_type', 'daily')
        .single();

      let streak: CookingStreak;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (fetchError || !existingStreak) {
        // Create new streak
        streak = {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastCookingDate: today,
          streakStartDate: today,
          totalCookingDays: 1,
          streakType: 'daily',
          isActive: true,
          streakRewards: []
        };
      } else {
        const lastCookingDate = new Date(existingStreak.last_cooking_date);
        lastCookingDate.setHours(0, 0, 0, 0);

        if (lastCookingDate.getTime() === today.getTime()) {
          // Already cooked today, no streak change
          return this.mapStreakFromDb(existingStreak);
        } else if (lastCookingDate.getTime() === yesterday.getTime()) {
          // Consecutive day, extend streak
          streak = {
            userId: existingStreak.user_id,
            currentStreak: existingStreak.current_streak + 1,
            longestStreak: Math.max(existingStreak.longest_streak, existingStreak.current_streak + 1),
            lastCookingDate: today,
            streakStartDate: new Date(existingStreak.streak_start_date),
            totalCookingDays: existingStreak.total_cooking_days + 1,
            streakType: 'daily',
            isActive: true,
            streakRewards: existingStreak.streak_rewards || []
          };
        } else {
          // Streak broken, start new one
          streak = {
            userId: existingStreak.user_id,
            currentStreak: 1,
            longestStreak: existingStreak.longest_streak,
            lastCookingDate: today,
            streakStartDate: today,
            totalCookingDays: existingStreak.total_cooking_days + 1,
            streakType: 'daily',
            isActive: true,
            streakRewards: []
          };
        }
      }

      // Update or insert streak
      const { error: upsertError } = await this.supabase
        .from('cooking_streaks')
        .upsert({
          user_id: streak.userId,
          current_streak: streak.currentStreak,
          longest_streak: streak.longestStreak,
          last_cooking_date: streak.lastCookingDate.toISOString(),
          streak_start_date: streak.streakStartDate.toISOString(),
          total_cooking_days: streak.totalCookingDays,
          streak_type: streak.streakType,
          is_active: streak.isActive,
          streak_rewards: streak.streakRewards
        });

      if (upsertError) {
        throw new Error(`Failed to update cooking streak: ${upsertError.message}`);
      }

      // Check for streak rewards
      await this.checkStreakRewards(userId, streak.currentStreak);

      // Update habits
      await this.updateHabitProgress(userId, activityType);

      return streak;
    } catch (error) {
      console.error('Error tracking cooking activity:', error);
      throw error;
    }
  }

  private async checkStreakRewards(userId: string, streakLength: number): Promise<void> {
    const rewardMilestones = [7, 14, 30, 60, 100, 365];
    
    for (const milestone of rewardMilestones) {
      if (streakLength === milestone) {
        const reward: StreakReward = {
          id: `streak_${milestone}_${Date.now()}`,
          streakLength: milestone,
          rewardType: milestone >= 100 ? 'feature_access' : milestone >= 30 ? 'recipe_unlock' : 'badge',
          rewardValue: this.getStreakRewardValue(milestone),
          description: this.getStreakRewardDescription(milestone),
          claimed: false
        };

        await this.supabase
          .from('streak_rewards')
          .insert({
            id: reward.id,
            user_id: userId,
            streak_length: reward.streakLength,
            reward_type: reward.rewardType,
            reward_value: reward.rewardValue,
            description: reward.description,
            claimed: reward.claimed
          });

        toast.success(`🔥 ${milestone}-day streak achieved! You've earned: ${reward.description}`);
      }
    }
  }

  private getStreakRewardValue(milestone: number): string {
    switch (milestone) {
      case 7: return 'weekly_warrior_badge';
      case 14: return 'consistent_cook_badge';
      case 30: return 'master_chef_recipes';
      case 60: return 'advanced_features_unlock';
      case 100: return 'centurion_badge';
      case 365: return 'legendary_chef_status';
      default: return 'streak_badge';
    }
  }

  private getStreakRewardDescription(milestone: number): string {
    switch (milestone) {
      case 7: return 'Weekly Warrior Badge';
      case 14: return 'Consistent Cook Badge';
      case 30: return 'Master Chef Recipe Collection';
      case 60: return 'Advanced Features Unlock';
      case 100: return 'Centurion Chef Badge';
      case 365: return 'Legendary Chef Status';
      default: return 'Cooking Streak Badge';
    }
  }

  async updateHabitProgress(userId: string, habitType: string): Promise<void> {
    try {
      const { data: habit, error } = await this.supabase
        .from('habit_trackers')
        .select('*')
        .eq('user_id', userId)
        .eq('habit_type', habitType)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching habit:', error);
        return;
      }

      const today = new Date();
      const currentProgress = habit ? habit.current_progress + 1 : 1;
      const completionRate = habit ? 
        (currentProgress / Math.max(habit.target_progress, 1)) * 100 : 
        (currentProgress / this.getDefaultTargetProgress(habitType)) * 100;

      const habitData = {
        user_id: userId,
        habit_type: habitType,
        target_frequency: habit?.target_frequency || 'weekly',
        current_progress: currentProgress,
        target_progress: habit?.target_progress || this.getDefaultTargetProgress(habitType),
        habit_start_date: habit?.habit_start_date || today.toISOString(),
        last_activity_date: today.toISOString(),
        completion_rate: Math.min(completionRate, 100),
        motivational_message: this.getMotivationalMessage(habitType, completionRate),
        reminder_settings: habit?.reminder_settings || this.getDefaultReminderSettings()
      };

      await this.supabase
        .from('habit_trackers')
        .upsert(habitData);
    } catch (error) {
      console.error('Error updating habit progress:', error);
    }
  }

  private getDefaultTargetProgress(habitType: string): number {
    switch (habitType) {
      case 'cooking': return 5; // 5 times per week
      case 'meal_planning': return 1; // Once per week
      case 'recipe_rating': return 3; // 3 times per week
      case 'grocery_shopping': return 1; // Once per week
      case 'meal_prep': return 2; // Twice per week
      default: return 3;
    }
  }

  private getDefaultReminderSettings(): ReminderSettings {
    return {
      enabled: true,
      reminderType: 'push',
      reminderTime: '18:00',
      reminderDays: [0, 2, 4], // Sunday, Tuesday, Thursday
      snoozeCount: 0,
      maxSnooze: 3
    };
  }

  private getMotivationalMessage(habitType: string, completionRate: number): string {
    if (completionRate >= 90) {
      return `Excellent work on your ${habitType.replace('_', ' ')} habit! You're crushing it! 🔥`;
    } else if (completionRate >= 70) {
      return `Great progress on ${habitType.replace('_', ' ')}! Keep up the momentum! 💪`;
    } else if (completionRate >= 50) {
      return `You're halfway there with ${habitType.replace('_', ' ')}! Don't give up! 🌟`;
    } else {
      return `Let's get back on track with ${habitType.replace('_', ' ')}. You've got this! 🚀`;
    }
  }

  // Weekly Meal Planning Reminders
  async scheduleWeeklyReminders(userId: string): Promise<void> {
    try {
      const reminders = [
        {
          reminderType: 'meal_planning',
          scheduledFor: this.getNextSunday(18, 0), // Sunday 6 PM
          content: {
            title: '📝 Plan Your Week!',
            message: 'Take 15 minutes to plan your meals for the upcoming week. Your future self will thank you!',
            actionUrl: '/meal-plans/create',
            actionText: 'Start Planning'
          },
          priority: 'high'
        },
        {
          reminderType: 'grocery_shopping',
          scheduledFor: this.getNextWeekday(1, 10, 0), // Monday 10 AM
          content: {
            title: '🛒 Shopping List Ready!',
            message: 'Your grocery list is ready based on this week\'s meal plan. Don\'t forget any ingredients!',
            actionUrl: '/shopping-lists',
            actionText: 'View List'
          },
          priority: 'medium'
        },
        {
          reminderType: 'meal_prep',
          scheduledFor: this.getNextWeekday(0, 14, 0), // Sunday 2 PM
          content: {
            title: '🥘 Prep Time!',
            message: 'Sunday prep session time! Prepare ingredients and batch cook for an easier week.',
            actionUrl: '/meal-prep',
            actionText: 'Start Prepping'
          },
          priority: 'medium'
        },
        {
          reminderType: 'recipe_discovery',
          scheduledFor: this.getNextWeekday(3, 20, 0), // Wednesday 8 PM
          content: {
            title: '✨ Discover New Recipes',
            message: 'Midweek inspiration time! Discover new recipes to keep your cooking exciting.',
            actionUrl: '/recipes/discover',
            actionText: 'Explore Recipes'
          },
          priority: 'low'
        }
      ];

      for (const reminder of reminders) {
        await this.supabase
          .from('weekly_reminders')
          .upsert({
            id: `${reminder.reminderType}_${userId}_${Date.now()}`,
            user_id: userId,
            reminder_type: reminder.reminderType,
            scheduled_for: reminder.scheduledFor.toISOString(),
            content: reminder.content,
            priority: reminder.priority,
            recurring: true,
            acknowledged: false
          });
      }
    } catch (error) {
      console.error('Error scheduling weekly reminders:', error);
    }
  }

  private getNextSunday(hour: number, minute: number): Date {
    const now = new Date();
    const nextSunday = new Date();
    const daysUntilSunday = (7 - now.getDay()) % 7;
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(hour, minute, 0, 0);
    
    if (nextSunday <= now) {
      nextSunday.setDate(nextSunday.getDate() + 7);
    }
    
    return nextSunday;
  }

  private getNextWeekday(weekday: number, hour: number, minute: number): Date {
    const now = new Date();
    const nextDate = new Date();
    const daysUntilWeekday = (weekday - now.getDay() + 7) % 7;
    nextDate.setDate(now.getDate() + daysUntilWeekday);
    nextDate.setHours(hour, minute, 0, 0);
    
    if (nextDate <= now) {
      nextDate.setDate(nextDate.getDate() + 7);
    }
    
    return nextDate;
  }

  // Seasonal Meal Challenges
  async createSeasonalChallenge(challenge: Omit<SeasonalChallenge, 'id' | 'participants' | 'leaderboard'>): Promise<SeasonalChallenge> {
    try {
      const challengeId = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newChallenge: SeasonalChallenge = {
        ...challenge,
        id: challengeId,
        participants: 0,
        leaderboard: []
      };

      const { error } = await this.supabase
        .from('seasonal_challenges')
        .insert({
          id: newChallenge.id,
          title: newChallenge.title,
          description: newChallenge.description,
          season: newChallenge.season,
          challenge_type: newChallenge.challengeType,
          difficulty: newChallenge.difficulty,
          start_date: newChallenge.startDate.toISOString(),
          end_date: newChallenge.endDate.toISOString(),
          max_participants: newChallenge.maxParticipants,
          requirements: newChallenge.requirements,
          rewards: newChallenge.rewards,
          tags: newChallenge.tags,
          is_active: newChallenge.isActive
        });

      if (error) {
        throw new Error(`Failed to create seasonal challenge: ${error.message}`);
      }

      return newChallenge;
    } catch (error) {
      console.error('Error creating seasonal challenge:', error);
      throw error;
    }
  }

  async getActiveSeasonalChallenges(): Promise<SeasonalChallenge[]> {
    try {
      const currentSeason = this.getCurrentSeason();
      const { data, error } = await this.supabase
        .from('seasonal_challenges')
        .select('*')
        .eq('is_active', true)
        .eq('season', currentSeason)
        .gte('end_date', new Date().toISOString());

      if (error) {
        throw new Error(`Failed to fetch seasonal challenges: ${error.message}`);
      }

      return data?.map(challenge => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        season: challenge.season,
        challengeType: challenge.challenge_type,
        difficulty: challenge.difficulty,
        startDate: new Date(challenge.start_date),
        endDate: new Date(challenge.end_date),
        participants: challenge.participants || 0,
        maxParticipants: challenge.max_participants,
        requirements: challenge.requirements || [],
        rewards: challenge.rewards || [],
        leaderboard: challenge.leaderboard || [],
        tags: challenge.tags || [],
        isActive: challenge.is_active
      })) || [];
    } catch (error) {
      console.error('Error fetching seasonal challenges:', error);
      return [];
    }
  }

  async joinChallenge(userId: string, challengeId: string): Promise<UserChallenge> {
    try {
      const userChallenge: UserChallenge = {
        challengeId,
        userId,
        joinedAt: new Date(),
        progress: {
          challengeId,
          userId,
          requirements: {},
          completedRequirements: [],
          totalScore: 0,
          isCompleted: false,
          rewards: []
        },
        isCompleted: false
      };

      const { error } = await this.supabase
        .from('user_challenges')
        .insert({
          challenge_id: userChallenge.challengeId,
          user_id: userChallenge.userId,
          joined_at: userChallenge.joinedAt.toISOString(),
          progress: userChallenge.progress
        });

      if (error) {
        throw new Error(`Failed to join challenge: ${error.message}`);
      }

      // Update participant count
      await this.supabase.rpc('increment_challenge_participants', { 
        challenge_id: challengeId 
      });

      toast.success('Successfully joined the seasonal challenge!');
      return userChallenge;
    } catch (error) {
      console.error('Error joining challenge:', error);
      throw error;
    }
  }

  private getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'fall';
    return 'winter';
  }

  // Cooking Milestone Celebrations
  async checkMilestones(userId: string): Promise<UserMilestone[]> {
    try {
      const milestones = await this.getAvailableMilestones();
      const userStats = await this.getUserStats(userId);
      const completedMilestones: UserMilestone[] = [];

      for (const milestone of milestones) {
        const currentValue = userStats[milestone.category] || 0;
        const progress = Math.min((currentValue / milestone.threshold) * 100, 100);
        
        const { data: existingMilestone } = await this.supabase
          .from('user_milestones')
          .select('*')
          .eq('user_id', userId)
          .eq('milestone_id', milestone.id)
          .single();

        if (!existingMilestone && progress >= 100) {
          // New milestone achieved
          const userMilestone: UserMilestone = {
            userId,
            milestoneId: milestone.id,
            progress: 100,
            isCompleted: true,
            completedAt: new Date(),
            celebrationShown: false,
            rewardsClaimed: false
          };

          await this.supabase
            .from('user_milestones')
            .insert({
              user_id: userMilestone.userId,
              milestone_id: userMilestone.milestoneId,
              progress: userMilestone.progress,
              is_completed: userMilestone.isCompleted,
              completed_at: userMilestone.completedAt?.toISOString(),
              celebration_shown: userMilestone.celebrationShown,
              rewards_claimed: userMilestone.rewardsClaimed
            });

          completedMilestones.push(userMilestone);
          
          // Trigger celebration
          await this.triggerMilestoneCelebration(userId, milestone);
        } else if (existingMilestone && !existingMilestone.is_completed && progress >= 100) {
          // Existing milestone now completed
          await this.supabase
            .from('user_milestones')
            .update({
              is_completed: true,
              completed_at: new Date().toISOString(),
              progress: 100
            })
            .eq('user_id', userId)
            .eq('milestone_id', milestone.id);

          await this.triggerMilestoneCelebration(userId, milestone);
        }
      }

      return completedMilestones;
    } catch (error) {
      console.error('Error checking milestones:', error);
      return [];
    }
  }

  private async getAvailableMilestones(): Promise<CookingMilestone[]> {
    return [
      {
        id: 'first_recipe',
        title: 'First Recipe',
        description: 'Cook your very first recipe',
        category: 'cooking_count',
        threshold: 1,
        unit: 'recipes',
        badge: {
          id: 'first_recipe_badge',
          name: 'First Steps',
          icon: '🍳',
          color: '#10b981',
          rarity: 'common',
          description: 'Your journey begins!'
        },
        celebrationMessage: 'Congratulations on cooking your first recipe! 🎉',
        rewards: [
          {
            type: 'recipe_unlock',
            value: 'beginner_collection',
            description: 'Unlocked: Beginner Recipe Collection'
          }
        ],
        isRepeatable: false,
        nextMilestone: 'recipe_explorer'
      },
      {
        id: 'recipe_explorer',
        title: 'Recipe Explorer',
        description: 'Cook 10 different recipes',
        category: 'recipe_variety',
        threshold: 10,
        unit: 'unique recipes',
        badge: {
          id: 'explorer_badge',
          name: 'Recipe Explorer',
          icon: '🗺️',
          color: '#3b82f6',
          rarity: 'rare',
          description: 'Exploring the culinary world!'
        },
        celebrationMessage: 'Amazing! You\'ve explored 10 different recipes! 🌟',
        rewards: [
          {
            type: 'feature_access',
            value: 'advanced_search',
            description: 'Unlocked: Advanced Recipe Search'
          }
        ],
        isRepeatable: false,
        nextMilestone: 'culinary_adventurer'
      },
      {
        id: 'streak_master',
        title: 'Streak Master',
        description: 'Maintain a 30-day cooking streak',
        category: 'cooking_count',
        threshold: 30,
        unit: 'consecutive days',
        badge: {
          id: 'streak_master_badge',
          name: 'Streak Master',
          icon: '🔥',
          color: '#f59e0b',
          rarity: 'epic',
          description: 'Consistency is key!'
        },
        celebrationMessage: 'Incredible dedication! 30 days of consistent cooking! 🔥',
        rewards: [
          {
            type: 'title',
            value: 'Consistent Chef',
            description: 'Earned Title: Consistent Chef'
          },
          {
            type: 'customization',
            value: 'flame_theme',
            description: 'Unlocked: Flame Theme'
          }
        ],
        isRepeatable: true,
        nextMilestone: 'centurion_chef'
      }
    ];
  }

  private async getUserStats(userId: string): Promise<Record<string, number>> {
    // This would fetch actual user statistics from the database
    // For now, returning mock data structure
    return {
      cooking_count: 0,
      recipe_variety: 0,
      skill_improvement: 0,
      social_engagement: 0,
      time_saved: 0,
      cost_savings: 0
    };
  }

  private async triggerMilestoneCelebration(userId: string, milestone: CookingMilestone): Promise<void> {
    // This would trigger various celebration mechanisms
    toast.success(milestone.celebrationMessage, {
      duration: 5000,
      action: {
        label: 'View Badge',
        onClick: () => {
          // Navigate to badges/achievements page
        }
      }
    });

    // Could also trigger:
    // - Confetti animation
    // - Sound effects
    // - Push notifications
    // - Social sharing prompts
    // - Email celebration
  }

  // Referral Program
  async createReferralProgram(userId: string): Promise<ReferralProgram> {
    try {
      const referralCode = this.generateReferralCode(userId);
      
      const program: ReferralProgram = {
        id: `referral_${userId}`,
        userId,
        referralCode,
        totalReferrals: 0,
        successfulReferrals: 0,
        pendingReferrals: 0,
        totalRewards: 0,
        availableRewards: 0,
        tier: 'bronze',
        tierProgress: 0,
        referrals: []
      };

      const { error } = await this.supabase
        .from('referral_programs')
        .upsert({
          id: program.id,
          user_id: program.userId,
          referral_code: program.referralCode,
          total_referrals: program.totalReferrals,
          successful_referrals: program.successfulReferrals,
          pending_referrals: program.pendingReferrals,
          total_rewards: program.totalRewards,
          available_rewards: program.availableRewards,
          tier: program.tier,
          tier_progress: program.tierProgress
        });

      if (error) {
        throw new Error(`Failed to create referral program: ${error.message}`);
      }

      return program;
    } catch (error) {
      console.error('Error creating referral program:', error);
      throw error;
    }
  }

  async sendReferral(userId: string, email: string): Promise<Referral> {
    try {
      const { data: program } = await this.supabase
        .from('referral_programs')
        .select('referral_code')
        .eq('user_id', userId)
        .single();

      if (!program) {
        throw new Error('Referral program not found');
      }

      const referral: Referral = {
        id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        referrerId: userId,
        referredEmail: email,
        referralCode: program.referral_code,
        status: 'pending',
        sentAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        reward: {
          referrerReward: {
            type: 'premium_days',
            value: 30,
            description: '30 days of premium access'
          },
          referredReward: {
            type: 'premium_days',
            value: 14,
            description: '14 days free premium trial'
          }
        },
        claimed: false
      };

      const { error } = await this.supabase
        .from('referrals')
        .insert({
          id: referral.id,
          referrer_id: referral.referrerId,
          referred_email: referral.referredEmail,
          referral_code: referral.referralCode,
          status: referral.status,
          sent_at: referral.sentAt.toISOString(),
          expires_at: referral.expiresAt.toISOString(),
          reward: referral.reward,
          claimed: referral.claimed
        });

      if (error) {
        throw new Error(`Failed to send referral: ${error.message}`);
      }

      // Update pending referrals count
      await this.supabase.rpc('increment_pending_referrals', { 
        user_id: userId 
      });

      // In a real implementation, this would send an email
      toast.success(`Referral sent to ${email}!`);

      return referral;
    } catch (error) {
      console.error('Error sending referral:', error);
      throw error;
    }
  }

  private generateReferralCode(userId: string): string {
    const userHash = userId.substring(0, 8);
    const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `CHEF${userHash.toUpperCase()}${randomPart}`;
  }

  async getReferralProgram(userId: string): Promise<ReferralProgram | null> {
    try {
      const { data: program, error } = await this.supabase
        .from('referral_programs')
        .select(`
          *,
          referrals (*)
        `)
        .eq('user_id', userId)
        .single();

      if (error || !program) {
        return null;
      }

      return {
        id: program.id,
        userId: program.user_id,
        referralCode: program.referral_code,
        totalReferrals: program.total_referrals,
        successfulReferrals: program.successful_referrals,
        pendingReferrals: program.pending_referrals,
        totalRewards: program.total_rewards,
        availableRewards: program.available_rewards,
        tier: program.tier,
        tierProgress: program.tier_progress,
        referrals: program.referrals?.map((ref: any) => ({
          id: ref.id,
          referrerId: ref.referrer_id,
          referredUserId: ref.referred_user_id,
          referredEmail: ref.referred_email,
          referralCode: ref.referral_code,
          status: ref.status,
          sentAt: new Date(ref.sent_at),
          signedUpAt: ref.signed_up_at ? new Date(ref.signed_up_at) : undefined,
          activatedAt: ref.activated_at ? new Date(ref.activated_at) : undefined,
          expiresAt: new Date(ref.expires_at),
          reward: ref.reward,
          claimed: ref.claimed,
          claimedAt: ref.claimed_at ? new Date(ref.claimed_at) : undefined
        })) || []
      };
    } catch (error) {
      console.error('Error getting referral program:', error);
      return null;
    }
  }

  // Helper methods
  async getUserStreakData(userId: string): Promise<CookingStreak | null> {
    try {
      const { data, error } = await this.supabase
        .from('cooking_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('streak_type', 'daily')
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapStreakFromDb(data);
    } catch (error) {
      console.error('Error getting user streak data:', error);
      return null;
    }
  }

  private mapStreakFromDb(data: any): CookingStreak {
    return {
      userId: data.user_id,
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      lastCookingDate: new Date(data.last_cooking_date),
      streakStartDate: new Date(data.streak_start_date),
      totalCookingDays: data.total_cooking_days,
      streakType: data.streak_type,
      isActive: data.is_active,
      streakRewards: data.streak_rewards || []
    };
  }

  async generateRetentionInsights(userId: string): Promise<RetentionInsight[]> {
    const insights: RetentionInsight[] = [];
    
    try {
      const [streakData, habits, challenges] = await Promise.all([
        this.getUserStreakData(userId),
        this.getUserHabits(userId),
        this.getUserChallenges(userId)
      ]);

      // Streak motivation insights
      if (streakData && streakData.currentStreak > 0) {
        if (streakData.currentStreak >= 7) {
          insights.push({
            userId,
            insightType: 'streak_motivation',
            title: 'Amazing Streak!',
            description: `You're on a ${streakData.currentStreak}-day cooking streak! Keep it up!`,
            actionable: true,
            actions: ['Cook today to continue streak', 'Share your progress with friends'],
            priority: 'high',
            generatedAt: new Date(),
            acknowledged: false
          });
        }
      }

      // Challenge recommendations
      const activeChallenges = await this.getActiveSeasonalChallenges();
      if (activeChallenges.length > 0 && challenges.length === 0) {
        insights.push({
          userId,
          insightType: 'challenge_recommendation',
          title: 'New Seasonal Challenge Available!',
          description: `Join the ${activeChallenges[0].title} challenge and compete with other home cooks!`,
          actionable: true,
          actions: ['View available challenges', 'Join a challenge'],
          priority: 'medium',
          generatedAt: new Date(),
          acknowledged: false
        });
      }

      return insights;
    } catch (error) {
      console.error('Error generating retention insights:', error);
      return [];
    }
  }

  private async getUserHabits(userId: string): Promise<HabitTracker[]> {
    try {
      const { data, error } = await this.supabase
        .from('habit_trackers')
        .select('*')
        .eq('user_id', userId);

      if (error || !data) {
        return [];
      }

      return data.map((habit: any) => ({
        userId: habit.user_id,
        habitType: habit.habit_type,
        targetFrequency: habit.target_frequency,
        currentProgress: habit.current_progress,
        targetProgress: habit.target_progress,
        habitStartDate: new Date(habit.habit_start_date),
        lastActivityDate: new Date(habit.last_activity_date),
        completionRate: habit.completion_rate,
        motivationalMessage: habit.motivational_message,
        reminderSettings: habit.reminder_settings
      }));
    } catch (error) {
      console.error('Error getting user habits:', error);
      return [];
    }
  }

  private async getUserChallenges(userId: string): Promise<UserChallenge[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', userId);

      if (error || !data) {
        return [];
      }

      return data.map((challenge: any) => ({
        challengeId: challenge.challenge_id,
        userId: challenge.user_id,
        joinedAt: new Date(challenge.joined_at),
        progress: challenge.progress,
        isCompleted: challenge.is_completed,
        completedAt: challenge.completed_at ? new Date(challenge.completed_at) : undefined,
        rank: challenge.rank
      }));
    } catch (error) {
      console.error('Error getting user challenges:', error);
      return [];
    }
  }
}

export const retentionFeaturesService = new RetentionFeaturesService();