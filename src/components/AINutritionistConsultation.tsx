import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Calendar, Clock, User, Brain, Target, TrendingUp, Heart, Activity, BookOpen, Video, MessageSquare, Award } from 'lucide-react';
import { PremiumFeaturesService, AINutritionistConsultation, UserNutritionProfile, NutritionGoal, HealthMetrics } from '../lib/premiumFeatures';

const AINutritionistConsultation: React.FC = () => {
  const [consultations, setConsultations] = useState<AINutritionistConsultation[]>([]);
  const [userProfile, setUserProfile] = useState<UserNutritionProfile | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoal[]>([]);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedConsultationType, setSelectedConsultationType] = useState('Initial Assessment');
  const [preferredDate, setPreferredDate] = useState('');
  const [consultationNotes, setConsultationNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const service = new PremiumFeaturesService();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const userId = 'current-user'; // Would come from auth context
      const [profile, metrics, goals] = await Promise.all([
        service.getUserNutritionProfile(userId),
        service.getCurrentHealthMetrics(userId),
        service.getUserNutritionGoals(userId)
      ]);
      
      setUserProfile(profile);
      setHealthMetrics(metrics);
      setNutritionGoals(goals);
      
      // Load previous consultations (mock data)
      setConsultations([
        {
          id: 'consultation-001',
          userId,
          sessionDate: '2024-03-15T14:00:00Z',
          duration: 60,
          consultationType: 'Initial Assessment',
          status: 'Completed',
          nutritionistId: 'ai-nutritionist-001',
          userProfile: profile,
          goals,
          currentMetrics: metrics,
          recommendations: [
            {
              id: 'rec-001',
              category: 'Macronutrients',
              title: 'Increase Protein Intake',
              description: 'Based on your activity level and goals, aim for 1.2g protein per kg body weight.',
              rationale: 'Higher protein intake will support muscle maintenance and increase satiety.',
              priority: 'High',
              actionItems: [
                'Add lean protein to each meal',
                'Consider a protein shake post-workout',
                'Include Greek yogurt as snacks'
              ],
              expectedOutcomes: [
                'Improved muscle maintenance',
                'Better satiety between meals',
                'Enhanced recovery from exercise'
              ],
              timeframe: '2-4 weeks',
              monitoringMetrics: ['Protein intake tracking', 'Satiety levels', 'Energy levels'],
              resources: ['High-protein recipe collection', 'Protein timing guide']
            }
          ],
          mealPlanAdjustments: [],
          followUpActions: [
            {
              id: 'action-001',
              description: 'Track protein intake for 2 weeks',
              dueDate: '2024-03-29',
              priority: 'High',
              completed: true
            }
          ],
          notes: 'Great progress on hydration goals. Focus on protein timing around workouts.',
          rating: 5,
          feedback: 'Extremely helpful consultation. Clear actionable advice.',
          summaryReport: {
            id: 'summary-001',
            consultationId: 'consultation-001',
            keyFindings: [
              'Adequate caloric intake for current goals',
              'Protein intake below optimal range',
              'Excellent hydration habits',
              'Good micronutrient diversity'
            ],
            recommendations: [
              'Increase protein to 82g daily',
              'Time protein intake around workouts',
              'Continue current hydration practices'
            ],
            actionPlan: [
              'Week 1-2: Focus on adding protein to each meal',
              'Week 3-4: Optimize protein timing',
              'Ongoing: Monitor energy and satiety levels'
            ],
            nextSteps: 'Schedule follow-up in 4 weeks to assess progress and adjust plan',
            followUpDate: '2024-04-12'
          }
        }
      ]);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookConsultation = async () => {
    if (!preferredDate) return;

    try {
      const consultation = await service.scheduleNutritionistConsultation(
        'current-user',
        selectedConsultationType,
        preferredDate
      );
      
      setConsultations([consultation, ...consultations]);
      setShowBookingDialog(false);
      setPreferredDate('');
      setConsultationNotes('');
    } catch (error) {
      console.error('Failed to book consultation:', error);
    }
  };

  const getGoalProgress = (goal: NutritionGoal) => {
    if (goal.targetValue === 0) return 0;
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your nutrition profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-blue-500" />
          AI Nutritionist Consultation
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get personalized nutrition guidance from our AI nutritionist. 
          Tailored recommendations based on your goals, health metrics, and lifestyle.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Calendar className="h-5 w-5" />
              Book Consultation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule AI Nutritionist Consultation</DialogTitle>
              <DialogDescription>
                Book a personalized nutrition consultation tailored to your goals and health profile.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="consultation-type">Consultation Type</Label>
                <Select value={selectedConsultationType} onValueChange={setSelectedConsultationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Initial Assessment">Initial Assessment (60 min)</SelectItem>
                    <SelectItem value="Follow-up">Follow-up Session (30 min)</SelectItem>
                    <SelectItem value="Meal Plan Review">Meal Plan Review (45 min)</SelectItem>
                    <SelectItem value="Goal Adjustment">Goal Adjustment (30 min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="preferred-date">Preferred Date & Time</Label>
                <Input
                  id="preferred-date"
                  type="datetime-local"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific topics you'd like to discuss..."
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleBookConsultation} disabled={!preferredDate}>
                Schedule Consultation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Button variant="outline" size="lg" className="gap-2">
          <MessageSquare className="h-5 w-5" />
          Quick Questions
        </Button>
        
        <Button variant="outline" size="lg" className="gap-2">
          <BookOpen className="h-5 w-5" />
          Nutrition Library
        </Button>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="health">Health Metrics</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Health Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Health Score</p>
                    <p className={`text-3xl font-bold ${getHealthScoreColor(healthMetrics?.energyLevel || 0)}`}>
                      {healthMetrics?.energyLevel || 0}/10
                    </p>
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Energy Level</span>
                    <span>{healthMetrics?.energyLevel}/10</span>
                  </div>
                  <Progress value={(healthMetrics?.energyLevel || 0) * 10} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Goals</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {nutritionGoals.filter(g => g.status === 'In Progress').length}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {Math.round(
                        nutritionGoals
                          .filter(g => g.status === 'In Progress')
                          .reduce((acc, goal) => acc + getGoalProgress(goal), 0) /
                        Math.max(nutritionGoals.filter(g => g.status === 'In Progress').length, 1)
                      )}%
                    </span>
                  </div>
                  <Progress 
                    value={
                      nutritionGoals
                        .filter(g => g.status === 'In Progress')
                        .reduce((acc, goal) => acc + getGoalProgress(goal), 0) /
                      Math.max(nutritionGoals.filter(g => g.status === 'In Progress').length, 1)
                    } 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Consultations</p>
                    <p className="text-3xl font-bold text-green-600">
                      {consultations.filter(c => c.status === 'Completed').length}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Avg Rating</span>
                    <span>
                      {consultations.length > 0
                        ? (consultations
                            .filter(c => c.rating)
                            .reduce((acc, c) => acc + (c.rating || 0), 0) /
                          consultations.filter(c => c.rating).length).toFixed(1)
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Next: {consultations.find(c => c.status === 'Scheduled') ? 'Scheduled' : 'None planned'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Today's AI Recommendations
              </CardTitle>
              <CardDescription>
                Personalized suggestions based on your current health metrics and goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    Hydration Focus
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    You're doing great with hydration! Continue your current intake of 2.5L daily.
                  </p>
                  <Badge variant="default" className="text-xs">Continue</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    Energy Boost
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Try adding complex carbs to your morning routine to improve afternoon energy.
                  </p>
                  <Badge variant="secondary" className="text-xs">Try This</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-green-500" />
                    Stress Management
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Consider magnesium-rich foods like leafy greens to help with stress levels.
                  </p>
                  <Badge variant="outline" className="text-xs">Suggested</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-500" />
                    Recovery Support
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Post-workout protein timing could be optimized for better recovery.
                  </p>
                  <Badge variant="destructive" className="text-xs">Important</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Goals Progress</CardTitle>
              <CardDescription>Track your progress towards your nutrition and health objectives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {nutritionGoals.map((goal) => (
                  <div key={goal.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{goal.type}</h4>
                        <p className="text-sm text-muted-foreground">
                          Target: {goal.targetValue} {goal.unit} by {goal.timeline}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {goal.currentValue}/{goal.targetValue}
                        </p>
                        <Badge variant={
                          goal.status === 'Achieved' ? 'default' :
                          goal.status === 'In Progress' ? 'secondary' : 'outline'
                        }>
                          {goal.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <Progress value={getGoalProgress(goal)} className="h-3" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-sm mb-2">Strategies:</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {goal.strategies.map((strategy, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-primary rounded-full" />
                              {strategy}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-sm mb-2">Milestones:</h5>
                        <div className="space-y-1">
                          {goal.milestones.map((milestone) => (
                            <div key={milestone.id} className="flex items-center justify-between text-sm">
                              <span className={milestone.achieved ? 'line-through text-muted-foreground' : ''}>
                                {milestone.description}
                              </span>
                              <Badge variant={milestone.achieved ? 'default' : 'outline'} className="text-xs">
                                {milestone.achieved ? 'Done' : 'Pending'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          {userProfile && healthMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Health Metrics</CardTitle>
                  <CardDescription>Latest recorded health indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Weight</p>
                        <p className="text-xl font-bold">{healthMetrics.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Body Fat</p>
                        <p className="text-xl font-bold">{healthMetrics.bodyFatPercentage}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Muscle Mass</p>
                        <p className="text-xl font-bold">{healthMetrics.muscleMass} kg</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">RHR</p>
                        <p className="text-xl font-bold">{healthMetrics.restingHeartRate} bpm</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Energy Level</span>
                          <span>{healthMetrics.energyLevel}/10</span>
                        </div>
                        <Progress value={healthMetrics.energyLevel * 10} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Sleep Quality</span>
                          <span>{healthMetrics.sleepScore}/10</span>
                        </div>
                        <Progress value={healthMetrics.sleepScore * 10} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Stress Level</span>
                          <span>{healthMetrics.stressLevel}/10</span>
                        </div>
                        <Progress value={healthMetrics.stressLevel * 10} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Nutrition Profile</CardTitle>
                  <CardDescription>Your dietary preferences and restrictions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-sm mb-2">Dietary Restrictions</p>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.dietaryRestrictions.map((restriction) => (
                          <Badge key={restriction} variant="outline">{restriction}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium text-sm mb-2">Allergies</p>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.allergies.map((allergy) => (
                          <Badge key={allergy} className="bg-red-100 text-red-800">{allergy}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium text-sm mb-2">Cultural Preferences</p>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.culturalPreferences.map((preference) => (
                          <Badge key={preference} className="bg-blue-100 text-blue-800">{preference}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Activity Level</p>
                        <p className="font-medium">{userProfile.activityLevel}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cooking Skill</p>
                        <p className="font-medium">{userProfile.cookingSkill}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="consultations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {consultations.map((consultation) => (
              <Card key={consultation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {consultation.consultationType}
                    </CardTitle>
                    <Badge variant={
                      consultation.status === 'Completed' ? 'default' :
                      consultation.status === 'Scheduled' ? 'secondary' : 'outline'
                    }>
                      {consultation.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {new Date(consultation.sessionDate).toLocaleDateString()} at{' '}
                    {new Date(consultation.sessionDate).toLocaleTimeString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {consultation.duration} minutes
                      </div>
                      {consultation.rating && (
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-yellow-500" />
                          {consultation.rating}/5 stars
                        </div>
                      )}
                    </div>
                    
                    {consultation.summaryReport.keyFindings.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Key Findings:</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {consultation.summaryReport.keyFindings.slice(0, 3).map((finding, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                              {finding}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {consultation.notes && (
                      <div className="bg-muted p-3 rounded text-sm">
                        <p className="font-medium mb-1">Nutritionist Notes:</p>
                        <p className="text-muted-foreground">{consultation.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <BookOpen className="h-3 w-3" />
                        View Report
                      </Button>
                      {consultation.recordingUrl && (
                        <Button variant="outline" size="sm" className="gap-2">
                          <Video className="h-3 w-3" />
                          Recording
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {consultations[0]?.recommendations.map((recommendation) => (
            <Card key={recommendation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{recommendation.title}</CardTitle>
                  <Badge variant={
                    recommendation.priority === 'Critical' ? 'destructive' :
                    recommendation.priority === 'High' ? 'secondary' :
                    recommendation.priority === 'Medium' ? 'outline' : 'outline'
                  }>
                    {recommendation.priority} Priority
                  </Badge>
                </div>
                <CardDescription>{recommendation.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <h5 className="font-medium text-sm mb-1">Why this matters:</h5>
                    <p className="text-sm text-muted-foreground">{recommendation.rationale}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-2">Action Items:</h5>
                    <ul className="space-y-1">
                      {recommendation.actionItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-2">Expected Outcomes:</h5>
                    <ul className="space-y-1">
                      {recommendation.expectedOutcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-green-700">
                          <TrendingUp className="h-3 w-3 mt-1 flex-shrink-0" />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Timeline: {recommendation.timeframe}</span>
                    <span>Category: {recommendation.category}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AINutritionistConsultation;