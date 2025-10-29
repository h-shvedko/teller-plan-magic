import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Lightbulb, Play, SkipForward, ArrowLeft, ArrowRight, CheckCircle,
  Star, ChefHat, Clock, DollarSign, Users, Utensils, TrendingUp,
  BookOpen, Award, Target, MessageCircle, Sparkles, Map
} from 'lucide-react';
import {
  improvedOnboardingService,
  TutorialStep,
  OnboardingProgress,
  CookingSkillAssessment,
  SampleMealPlan,
  UserPreference,
  OnboardingInsight
} from '@/lib/improvedOnboarding';
import { toast } from 'sonner';

interface OnboardingDashboardProps {
  userId: string;
  isNewUser?: boolean;
}

export function OnboardingDashboard({ userId, isNewUser = false }: OnboardingDashboardProps) {
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress | null>(null);
  const [currentTutorialStep, setCurrentTutorialStep] = useState<TutorialStep | null>(null);
  const [tutorialSteps, setTutorialSteps] = useState<TutorialStep[]>([]);
  const [showTutorial, setShowTutorial] = useState(isNewUser);
  
  // Skill Assessment State
  const [skillAssessment, setSkillAssessment] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [assessmentResults, setAssessmentResults] = useState<CookingSkillAssessment | null>(null);
  const [showSkillAssessment, setShowSkillAssessment] = useState(false);

  // Wizard State
  const [wizardSession, setWizardSession] = useState<any>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardData, setWizardData] = useState<any>({});

  // Sample Meal Plans State
  const [samplePlans, setSamplePlans] = useState<SampleMealPlan[]>([]);
  const [showSamplePlans, setShowSamplePlans] = useState(false);

  // User Preferences and Insights
  const [userPreferences, setUserPreferences] = useState<UserPreference[]>([]);
  const [onboardingInsights, setOnboardingInsights] = useState<OnboardingInsight[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeOnboarding();
  }, [userId, isNewUser]);

  const initializeOnboarding = async () => {
    try {
      setIsLoading(true);

      if (isNewUser) {
        // Initialize new user onboarding
        const progress = await improvedOnboardingService.initializeOnboarding(userId, 'first_time');
        const steps = await improvedOnboardingService.getTutorialSteps('first_time');
        
        setOnboardingProgress(progress);
        setTutorialSteps(steps);
        setCurrentTutorialStep(steps[0]);
        setShowTutorial(true);
      }

      // Load user preferences and insights
      const [preferences, insights, plans] = await Promise.all([
        improvedOnboardingService.getUserPreferences(userId),
        improvedOnboardingService.generateOnboardingInsights(userId),
        improvedOnboardingService.generatePersonalizedSamplePlans(userId)
      ]);

      setUserPreferences(preferences);
      setOnboardingInsights(insights);
      setSamplePlans(plans);
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      toast.error('Failed to load onboarding data');
    } finally {
      setIsLoading(false);
    }
  };

  // Tutorial Management
  const handleTutorialAction = async (action: 'next' | 'skip' | 'back' | 'complete') => {
    if (!currentTutorialStep || !onboardingProgress) return;

    try {
      let updatedProgress;
      
      if (action === 'next' || action === 'complete') {
        updatedProgress = await improvedOnboardingService.updateOnboardingProgress(
          userId, 
          currentTutorialStep.id, 
          'complete'
        );
      } else if (action === 'skip') {
        updatedProgress = await improvedOnboardingService.updateOnboardingProgress(
          userId, 
          currentTutorialStep.id, 
          'skip'
        );
      } else if (action === 'back') {
        updatedProgress = await improvedOnboardingService.updateOnboardingProgress(
          userId, 
          currentTutorialStep.id, 
          'back'
        );
      }

      setOnboardingProgress(updatedProgress);

      if (action === 'complete' || updatedProgress.currentStep >= tutorialSteps.length) {
        setShowTutorial(false);
        setShowSkillAssessment(true);
        toast.success('Tutorial completed! Let\'s assess your cooking skills.');
      } else {
        const nextStep = tutorialSteps[updatedProgress.currentStep];
        setCurrentTutorialStep(nextStep);
      }
    } catch (error) {
      console.error('Error handling tutorial action:', error);
      toast.error('Failed to update tutorial progress');
    }
  };

  // Skill Assessment Management
  const startSkillAssessment = async () => {
    try {
      const assessment = await improvedOnboardingService.initializeCookingSkillAssessment(userId);
      setSkillAssessment(assessment);
      setCurrentQuestion(assessment.questions[0]);
      setShowSkillAssessment(true);
    } catch (error) {
      console.error('Error starting skill assessment:', error);
      toast.error('Failed to start skill assessment');
    }
  };

  const submitSkillAnswer = async (answer: any) => {
    if (!skillAssessment || !currentQuestion) return;

    try {
      const result = await improvedOnboardingService.submitSkillAssessmentAnswer(
        skillAssessment.assessmentId,
        currentQuestion.id,
        answer
      );

      if (result.completed) {
        setAssessmentResults(result.assessment);
        setShowSkillAssessment(false);
        setShowSamplePlans(true);
        toast.success('Skill assessment completed! Here are some meal plans for you.');
      } else {
        setCurrentQuestion(result.nextQuestion);
      }
    } catch (error) {
      console.error('Error submitting skill answer:', error);
      toast.error('Failed to submit answer');
    }
  };

  // Wizard Management
  const startMealPlanWizard = async () => {
    try {
      const wizard = await improvedOnboardingService.startGuidedMealPlanWizard(userId);
      setWizardSession(wizard);
      setShowWizard(true);
    } catch (error) {
      console.error('Error starting meal plan wizard:', error);
      toast.error('Failed to start meal plan wizard');
    }
  };

  const updateWizardStep = async (stepData: any) => {
    if (!wizardSession) return;

    try {
      const updatedData = { ...wizardData, ...stepData };
      setWizardData(updatedData);
      
      await improvedOnboardingService.updateWizardStep(
        wizardSession.wizardId,
        wizardSession.currentStep + 1,
        updatedData
      );

      if (wizardSession.currentStep + 1 >= wizardSession.totalSteps) {
        setShowWizard(false);
        toast.success('Meal plan created successfully!');
      } else {
        setWizardSession({
          ...wizardSession,
          currentStep: wizardSession.currentStep + 1
        });
      }
    } catch (error) {
      console.error('Error updating wizard step:', error);
      toast.error('Failed to update wizard step');
    }
  };

  // Sample Meal Plan Management
  const applySamplePlan = async (planId: string) => {
    try {
      await improvedOnboardingService.applySampleMealPlan(userId, planId);
      setShowSamplePlans(false);
    } catch (error) {
      console.error('Error applying sample meal plan:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Setting up your personalized experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tutorial Overlay */}
      {showTutorial && currentTutorialStep && onboardingProgress && (
        <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                {currentTutorialStep.title}
              </DialogTitle>
              <DialogDescription>
                Step {onboardingProgress.currentStep + 1} of {onboardingProgress.totalSteps}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Progress 
                value={(onboardingProgress.currentStep / onboardingProgress.totalSteps) * 100} 
                className="w-full" 
              />
              <p className="text-sm">{currentTutorialStep.description}</p>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => handleTutorialAction('back')}
                  disabled={onboardingProgress.currentStep === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="flex gap-2">
                  {currentTutorialStep.skippable && (
                    <Button
                      variant="ghost"
                      onClick={() => handleTutorialAction('skip')}
                    >
                      <SkipForward className="h-4 w-4 mr-2" />
                      Skip
                    </Button>
                  )}
                  <Button onClick={() => handleTutorialAction('next')}>
                    {onboardingProgress.currentStep === onboardingProgress.totalSteps - 1 ? 'Complete' : 'Next'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Skill Assessment Modal */}
      {showSkillAssessment && currentQuestion && (
        <Dialog open={showSkillAssessment} onOpenChange={setShowSkillAssessment}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Cooking Skill Assessment
              </DialogTitle>
              <DialogDescription>
                Help us understand your cooking experience to provide personalized recommendations.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">{currentQuestion.question}</h3>
                
                {currentQuestion.type === 'scale' && (
                  <div className="space-y-3">
                    <RadioGroup onValueChange={(value) => submitSkillAnswer(parseInt(value))}>
                      {currentQuestion.options.map((option: any) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                          <Label htmlFor={`option-${option.value}`} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <span>{option.label}</span>
                              <div className="flex">
                                {[...Array(option.value)].map((_, i) => (
                                  <Star key={i} className="h-3 w-3 fill-current text-yellow-400" />
                                ))}
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {currentQuestion.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`option-${index}`}
                          onCheckedChange={(checked) => {
                            const selectedOptions = wizardData[currentQuestion.id] || [];
                            if (checked) {
                              submitSkillAnswer([...selectedOptions, option]);
                            } else {
                              submitSkillAnswer(selectedOptions.filter((o: string) => o !== option));
                            }
                          }}
                        />
                        <Label htmlFor={`option-${index}`} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                    <Button 
                      onClick={() => submitSkillAnswer(wizardData[currentQuestion.id] || [])}
                      className="w-full mt-4"
                    >
                      Next Question
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Sample Meal Plans Modal */}
      {showSamplePlans && (
        <Dialog open={showSamplePlans} onOpenChange={setShowSamplePlans}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Get Started with Sample Meal Plans
              </DialogTitle>
              <DialogDescription>
                Choose a meal plan to get started immediately. We've personalized these based on your preferences and skill level.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {samplePlans.map((plan) => (
                <Card key={plan.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{plan.title}</CardTitle>
                        <CardDescription className="text-sm">{plan.description}</CardDescription>
                      </div>
                      <Badge variant="outline">{plan.difficulty}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{plan.estimatedTime} min/day</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>${plan.estimatedCost}/week</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">Cuisines:</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.cuisineType.map((cuisine, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {cuisine}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Includes {plan.meals.length} meals:</p>
                      <div className="text-xs text-muted-foreground">
                        {plan.meals.slice(0, 2).map((meal, index) => (
                          <div key={index}>• {meal.recipeName}</div>
                        ))}
                        {plan.meals.length > 2 && <div>• +{plan.meals.length - 2} more meals</div>}
                      </div>
                    </div>

                    <Button 
                      onClick={() => applySamplePlan(plan.id)} 
                      className="w-full"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start This Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => setShowSamplePlans(false)}>
                I'll Create My Own Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Main Dashboard */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Map className="h-8 w-8" />
              Welcome to Teller Plan Magic
            </h1>
            <p className="text-muted-foreground">
              {isNewUser ? 'Let\'s get you started with personalized meal planning' : 'Continue your meal planning journey'}
            </p>
          </div>
        </div>

        {/* Onboarding Progress */}
        {onboardingProgress && !onboardingProgress.completedAt && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Getting Started Progress
              </CardTitle>
              <CardDescription>
                Complete these steps to get the most out of Teller Plan Magic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Onboarding Progress</span>
                <span className="text-sm text-muted-foreground">
                  {onboardingProgress.currentStep} of {onboardingProgress.totalSteps}
                </span>
              </div>
              <Progress 
                value={(onboardingProgress.currentStep / onboardingProgress.totalSteps) * 100} 
              />
              <div className="flex gap-2">
                <Button onClick={() => setShowTutorial(true)} variant="outline">
                  Continue Tutorial
                </Button>
                <Button onClick={startSkillAssessment} variant="outline">
                  Take Skill Assessment
                </Button>
                <Button onClick={startMealPlanWizard} variant="outline">
                  Create First Meal Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowSamplePlans(true)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5" />
                Sample Meal Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get started immediately with pre-designed meal plans tailored to your preferences.
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={startMealPlanWizard}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Map className="h-5 w-5" />
                Guided Meal Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Step-by-step wizard to create a personalized meal plan that fits your lifestyle.
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={startSkillAssessment}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5" />
                Skill Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Help us understand your cooking level to provide better recommendations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Insights and Preferences */}
        {(onboardingInsights.length > 0 || userPreferences.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {onboardingInsights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Personalized Insights
                  </CardTitle>
                  <CardDescription>
                    Discoveries about your cooking preferences and habits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {onboardingInsights.slice(0, 3).map((insight) => (
                    <Alert key={insight.id}>
                      <Lightbulb className="h-4 w-4" />
                      <AlertTitle>{insight.title}</AlertTitle>
                      <AlertDescription>
                        <p className="mb-2">{insight.description}</p>
                        {insight.recommendations.length > 0 && (
                          <div>
                            <p className="font-medium mb-1">Recommendations:</p>
                            <ul className="text-sm list-disc list-inside">
                              {insight.recommendations.slice(0, 2).map((rec, index) => (
                                <li key={index}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
                </CardContent>
              </Card>
            )}

            {userPreferences.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Your Preferences
                  </CardTitle>
                  <CardDescription>
                    What we've learned about your cooking preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userPreferences.slice(0, 6).map((pref) => (
                      <div key={pref.id} className="flex items-center justify-between">
                        <div>
                          <span className="font-medium capitalize">
                            {pref.preferenceType.replace('_', ' ')}:
                          </span>
                          <span className="ml-2 capitalize">{pref.preferenceValue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={pref.confidence * 100} 
                            className="w-16 h-2"
                          />
                          <Badge variant="outline" className="text-xs">
                            {Math.round(pref.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Skill Assessment Results */}
        {assessmentResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Your Cooking Skill Profile
              </CardTitle>
              <CardDescription>
                Based on your assessment, here's your cooking skill breakdown
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="default" className="text-base px-3 py-1">
                  {assessmentResults.overallLevel.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Overall Skill Level
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(assessmentResults.skillAreas).map(([skill, score]) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium capitalize">
                        {skill.replace('_', ' ')}
                      </span>
                      <span className="text-sm">{score}/10</span>
                    </div>
                    <Progress value={score * 10} className="h-2" />
                  </div>
                ))}
              </div>

              {assessmentResults.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Personalized Recommendations:</h4>
                  <ul className="text-sm space-y-1">
                    {assessmentResults.recommendations.slice(0, 3).map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Help and Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Need Help Getting Started?
            </CardTitle>
            <CardDescription>
              We're here to help you make the most of Teller Plan Magic
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button variant="outline" onClick={() => setShowTutorial(true)}>
              <BookOpen className="h-4 w-4 mr-2" />
              Restart Tutorial
            </Button>
            <Button variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline">
              <Utensils className="h-4 w-4 mr-2" />
              Browse Recipes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}