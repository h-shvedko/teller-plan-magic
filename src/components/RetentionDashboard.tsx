import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Flame, 
  Target, 
  Calendar, 
  Trophy, 
  Users, 
  Gift,
  CheckCircle,
  Star,
  TrendingUp,
  Award,
  Share2,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';
import {
  retentionService,
  type CookingStreak,
  type HabitTracker,
  type WeeklyReminder,
  type SeasonalChallenge,
  type CookingMilestone,
  type ReferralProgram
} from '@/lib/retentionFeatures';

export default function RetentionDashboard() {
  const [cookingStreak, setCookingStreak] = useState<CookingStreak | null>(null);
  const [habitTrackers, setHabitTrackers] = useState<HabitTracker[]>([]);
  const [weeklyReminder, setWeeklyReminder] = useState<WeeklyReminder | null>(null);
  const [challenges, setChallenges] = useState<SeasonalChallenge[]>([]);
  const [milestones, setMilestones] = useState<CookingMilestone[]>([]);
  const [referralProgram, setReferralProgram] = useState<ReferralProgram | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRetentionData();
  }, []);

  const loadRetentionData = async () => {
    try {
      setLoading(true);
      
      const [
        streak,
        habits,
        reminder,
        activeChallenges,
        userMilestones,
        referral
      ] = await Promise.all([
        retentionService.getCurrentStreak('user-123'),
        retentionService.getHabitTrackers('user-123'),
        retentionService.getUserWeeklyReminder('user-123'),
        retentionService.getActiveChallenges(),
        retentionService.getUserMilestones('user-123'),
        retentionService.getUserReferralData('user-123')
      ]);

      setCookingStreak(streak);
      setHabitTrackers(habits);
      setWeeklyReminder(reminder);
      setChallenges(activeChallenges);
      setMilestones(userMilestones);
      setReferralProgram(referral);
    } catch (error) {
      toast.error('Failed to load retention data');
      console.error('Error loading retention data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCookingActivityTracked = async () => {
    try {
      const updatedStreak = await retentionService.trackCookingActivity('user-123');
      setCookingStreak(updatedStreak);
      
      if (updatedStreak.currentStreak > (cookingStreak?.currentStreak || 0)) {
        toast.success(`🔥 Cooking streak: ${updatedStreak.currentStreak} days!`);
      }
    } catch (error) {
      toast.error('Failed to track cooking activity');
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await retentionService.joinChallenge('user-123', challengeId);
      toast.success('Successfully joined challenge!');
      loadRetentionData();
    } catch (error) {
      toast.error('Failed to join challenge');
    }
  };

  const handleUpdateReminder = async (reminderData: Partial<WeeklyReminder>) => {
    try {
      const updated = await retentionService.updateWeeklyReminder('user-123', reminderData);
      setWeeklyReminder(updated);
      toast.success('Reminder settings updated');
    } catch (error) {
      toast.error('Failed to update reminder settings');
    }
  };

  const handleShareReferral = async () => {
    try {
      if (referralProgram?.referralCode) {
        await navigator.clipboard.writeText(
          `Join Teller Plan Magic with my referral code: ${referralProgram.referralCode}`
        );
        toast.success('Referral code copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to copy referral code');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-pulse">Loading retention data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Retention Dashboard</h1>
        <p className="text-muted-foreground">
          Track your cooking journey, build habits, and celebrate achievements
        </p>
      </div>

      <Tabs defaultValue="streaks" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="streaks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Cooking Streak
              </CardTitle>
              <CardDescription>
                Keep cooking daily to maintain your streak and earn rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cookingStreak ? (
                <>
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold text-orange-500">
                      {cookingStreak.currentStreak}
                    </div>
                    <div className="text-lg text-muted-foreground">
                      {cookingStreak.currentStreak === 1 ? 'day' : 'days'} current streak
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Best: {cookingStreak.longestStreak} days
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Total Cooking Days</Label>
                      <div className="text-2xl font-bold">{cookingStreak.totalCookingDays}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Streak Level</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Level {cookingStreak.streakLevel}</Badge>
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                    </div>
                  </div>

                  {cookingStreak.rewards.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Available Rewards</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {cookingStreak.rewards.map((reward, index) => (
                          <Badge key={index} variant="outline" className="text-green-600">
                            <Gift className="h-3 w-3 mr-1" />
                            {reward.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button onClick={handleCookingActivityTracked} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Log Today's Cooking
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-muted-foreground">No cooking streak yet</div>
                  <Button onClick={handleCookingActivityTracked}>
                    Start Your Cooking Streak
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="habits" className="space-y-6">
          <div className="grid gap-4">
            {habitTrackers.map((habit) => (
              <Card key={habit.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    {habit.name}
                  </CardTitle>
                  <CardDescription>{habit.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {habit.currentProgress} / {habit.targetValue} {habit.unit}
                      </span>
                    </div>
                    <Progress 
                      value={(habit.currentProgress / habit.targetValue) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold">{habit.streakDays}</div>
                      <div className="text-xs text-muted-foreground">Streak Days</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{habit.completedDays}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">
                        {Math.round((habit.completedDays / Math.max(habit.totalDays, 1)) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant={habit.isActive ? "default" : "secondary"}>
                      {habit.isActive ? "Active" : "Paused"}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {habit.frequency}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {habitTrackers.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="text-muted-foreground">No habit trackers yet</div>
                  <Button className="mt-4" onClick={() => toast.info('Habit creation coming soon!')}>
                    Create Your First Habit
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-500" />
                Weekly Meal Planning Reminders
              </CardTitle>
              <CardDescription>
                Set up reminders to help you stay on track with meal planning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {weeklyReminder ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enabled">Enable Reminders</Label>
                    <Switch
                      id="enabled"
                      checked={weeklyReminder.enabled}
                      onCheckedChange={(enabled) => 
                        handleUpdateReminder({ enabled })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="day">Reminder Day</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={weeklyReminder.dayOfWeek}
                      onChange={(e) => 
                        handleUpdateReminder({ dayOfWeek: e.target.value })
                      }
                    >
                      <option value="sunday">Sunday</option>
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                      <option value="saturday">Saturday</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Reminder Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={weeklyReminder.time}
                      onChange={(e) => 
                        handleUpdateReminder({ time: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Custom Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Enter a custom reminder message..."
                      value={weeklyReminder.customMessage || ''}
                      onChange={(e) => 
                        handleUpdateReminder({ customMessage: e.target.value })
                      }
                    />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Next reminder: {new Date(weeklyReminder.nextReminderDate).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-muted-foreground mb-4">No reminders set up yet</div>
                  <Button onClick={() => 
                    retentionService.scheduleWeeklyReminders('user-123', 'sunday', '09:00')
                      .then(() => loadRetentionData())
                  }>
                    Set Up Weekly Reminders
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="grid gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    {challenge.name}
                  </CardTitle>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{challenge.season}</Badge>
                    <Badge variant="outline">{challenge.difficulty}</Badge>
                    <Badge variant={challenge.isActive ? "default" : "secondary"}>
                      {challenge.isActive ? "Active" : "Ended"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Participants</span>
                      <span>{challenge.participantCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Duration</span>
                      <span>
                        {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {challenge.rewards.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Rewards</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {challenge.rewards.map((reward, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {reward.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={() => handleJoinChallenge(challenge.id)}
                    disabled={!challenge.isActive}
                    className="w-full"
                  >
                    {challenge.isActive ? 'Join Challenge' : 'Challenge Ended'}
                  </Button>
                </CardContent>
              </Card>
            ))}

            {challenges.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="text-muted-foreground">No active challenges</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Check back soon for new seasonal challenges!
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6">
          <div className="grid gap-4">
            {milestones.map((milestone) => (
              <Card key={milestone.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    {milestone.name}
                  </CardTitle>
                  <CardDescription>{milestone.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {milestone.currentProgress} / {milestone.targetValue} {milestone.unit}
                      </span>
                    </div>
                    <Progress 
                      value={(milestone.currentProgress / milestone.targetValue) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={milestone.achieved ? "default" : "outline"}>
                        {milestone.achieved ? "Achieved" : "In Progress"}
                      </Badge>
                      <Badge variant="outline">{milestone.category}</Badge>
                    </div>
                    {milestone.achieved && milestone.achievedDate && (
                      <div className="text-sm text-muted-foreground">
                        {new Date(milestone.achievedDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {milestone.reward && (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">
                          Reward: {milestone.reward.title}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {milestones.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="text-muted-foreground">No milestones yet</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Start cooking to unlock achievements!
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {referralProgram && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              Referral Program
            </CardTitle>
            <CardDescription>
              Invite friends and earn rewards together
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
              <div className="text-lg font-mono font-bold text-indigo-700">
                {referralProgram.referralCode}
              </div>
              <div className="text-sm text-indigo-600 mt-1">Your Referral Code</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {referralProgram.totalReferrals}
                </div>
                <div className="text-sm text-muted-foreground">Friends Referred</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {referralProgram.rewardsEarned}
                </div>
                <div className="text-sm text-muted-foreground">Rewards Earned</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Tier</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{referralProgram.currentTier}</Badge>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </div>

            <Button onClick={handleShareReferral} className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              Share Referral Code
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}