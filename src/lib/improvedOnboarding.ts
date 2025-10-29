import { createClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'input' | 'wait';
  duration?: number;
  skippable: boolean;
  required: boolean;
  prerequisites?: string[];
  nextSteps?: string[];
}

export interface OnboardingProgress {
  userId: string;
  currentStep: number;
  completedSteps: string[];
  skippedSteps: string[];
  totalSteps: number;
  startedAt: Date;
  lastActiveAt: Date;
  completedAt?: Date;
  onboardingType: 'first_time' | 'feature_discovery' | 'skill_assessment';
}

export interface UserPreference {
  id: string;
  userId: string;
  preferenceType: 'cuisine' | 'dietary' | 'ingredient' | 'cooking_method' | 'meal_type' | 'difficulty' | 'time';
  preferenceValue: string;
  confidence: number;
  source: 'explicit' | 'implicit' | 'inferred';
  learnedAt: Date;
  lastUpdatedAt: Date;
  frequency: number;
  strength: number;
}

export interface CookingSkillAssessment {
  userId: string;
  overallLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  skillAreas: {
    knifework: number; // 1-10
    timing: number;
    seasoning: number;
    technique: number;
    equipment: number;
    nutrition: number;
    planning: number;
    creativity: number;
  };
  confidenceLevel: number;
  assessmentDate: Date;
  questionsAnswered: number;
  timeSpent: number;
  recommendations: string[];
}

export interface SampleMealPlan {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: '3_days' | '1_week' | '2_weeks';
  cuisineType: string[];
  dietaryRestrictions: string[];
  estimatedCost: number;
  estimatedTime: number;
  meals: {
    day: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    recipeName: string;
    prepTime: number;
    cookTime: number;
    ingredients: string[];
    instructions: string[];
    nutritionInfo: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }[];
  shoppingList: string[];
  tags: string[];
  popularity: number;
}

export interface PreferenceLearningEvent {
  userId: string;
  eventType: 'recipe_view' | 'recipe_cook' | 'recipe_rate' | 'recipe_save' | 'meal_plan_create' | 'search_query' | 'ingredient_select';
  targetId: string;
  targetType: 'recipe' | 'meal_plan' | 'ingredient' | 'cuisine';
  metadata: Record<string, any>;
  timestamp: Date;
  weight: number;
  confidence: number;
}

export interface OnboardingInsight {
  id: string;
  userId: string;
  insightType: 'preference_discovered' | 'skill_improved' | 'habit_formed' | 'engagement_opportunity';
  title: string;
  description: string;
  actionable: boolean;
  recommendations: string[];
  confidence: number;
  discoveredAt: Date;
  applied: boolean;
}

class ImprovedOnboardingService {
  private supabase = createClient();

  // Interactive Tutorial System
  async getTutorialSteps(tutorialType: 'first_time' | 'feature_discovery' = 'first_time'): Promise<TutorialStep[]> {
    const firstTimeTutorial: TutorialStep[] = [
      {
        id: 'welcome',
        title: 'Welcome to Teller Plan Magic!',
        description: 'Let\'s take a quick tour to help you get started with meal planning.',
        target: 'body',
        position: 'center',
        duration: 3000,
        skippable: true,
        required: false
      },
      {
        id: 'dashboard_overview',
        title: 'Your Dashboard',
        description: 'This is your personal dashboard where you can see your meal plans, recent activity, and quick actions.',
        target: '[data-tutorial="dashboard"]',
        position: 'bottom',
        skippable: true,
        required: false
      },
      {
        id: 'create_meal_plan',
        title: 'Create Your First Meal Plan',
        description: 'Click here to start creating your first meal plan. We\'ll guide you through the process!',
        target: '[data-tutorial="create-meal-plan"]',
        position: 'bottom',
        action: 'click',
        skippable: false,
        required: true
      },
      {
        id: 'recipe_browser',
        title: 'Browse Recipes',
        description: 'Explore our extensive recipe collection. You can filter by cuisine, dietary preferences, and cooking time.',
        target: '[data-tutorial="recipes"]',
        position: 'right',
        skippable: true,
        required: false
      },
      {
        id: 'shopping_lists',
        title: 'Automatic Shopping Lists',
        description: 'We automatically generate shopping lists from your meal plans. You can also optimize them by store layout!',
        target: '[data-tutorial="shopping"]',
        position: 'left',
        skippable: true,
        required: false
      },
      {
        id: 'preferences',
        title: 'Customize Your Preferences',
        description: 'Set your dietary preferences, favorite cuisines, and cooking skill level to get personalized recommendations.',
        target: '[data-tutorial="preferences"]',
        position: 'top',
        action: 'click',
        skippable: false,
        required: true
      },
      {
        id: 'completion',
        title: 'You\'re All Set!',
        description: 'Great job! You\'re now ready to start your meal planning journey. Don\'t forget to check out our sample meal plans for inspiration.',
        target: 'body',
        position: 'center',
        duration: 4000,
        skippable: true,
        required: false
      }
    ];

    const featureDiscoveryTutorial: TutorialStep[] = [
      {
        id: 'ai_suggestions',
        title: 'AI-Powered Suggestions',
        description: 'Our AI learns from your preferences to suggest personalized recipes and meal plans.',
        target: '[data-tutorial="ai-suggestions"]',
        position: 'bottom',
        skippable: true,
        required: false
      },
      {
        id: 'social_sharing',
        title: 'Share with Friends & Family',
        description: 'Share your favorite recipes and collaborate on meal plans with your family.',
        target: '[data-tutorial="sharing"]',
        position: 'left',
        skippable: true,
        required: false
      },
      {
        id: 'analytics',
        title: 'Track Your Progress',
        description: 'See your cooking statistics, success rates, and discover patterns in your meal planning.',
        target: '[data-tutorial="analytics"]',
        position: 'right',
        skippable: true,
        required: false
      }
    ];

    return tutorialType === 'first_time' ? firstTimeTutorial : featureDiscoveryTutorial;
  }

  async initializeOnboarding(userId: string, onboardingType: 'first_time' | 'feature_discovery' | 'skill_assessment'): Promise<OnboardingProgress> {
    try {
      const tutorialSteps = await this.getTutorialSteps(onboardingType === 'skill_assessment' ? 'first_time' : onboardingType);
      
      const progress: OnboardingProgress = {
        userId,
        currentStep: 0,
        completedSteps: [],
        skippedSteps: [],
        totalSteps: tutorialSteps.length,
        startedAt: new Date(),
        lastActiveAt: new Date(),
        onboardingType
      };

      const { error } = await this.supabase
        .from('onboarding_progress')
        .upsert({
          user_id: progress.userId,
          current_step: progress.currentStep,
          completed_steps: progress.completedSteps,
          skipped_steps: progress.skippedSteps,
          total_steps: progress.totalSteps,
          started_at: progress.startedAt.toISOString(),
          last_active_at: progress.lastActiveAt.toISOString(),
          onboarding_type: progress.onboardingType
        });

      if (error) {
        throw new Error(`Failed to initialize onboarding: ${error.message}`);
      }

      return progress;
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      throw error;
    }
  }

  async updateOnboardingProgress(
    userId: string, 
    stepId: string, 
    action: 'complete' | 'skip' | 'back'
  ): Promise<OnboardingProgress> {
    try {
      const { data: currentProgress, error: fetchError } = await this.supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError || !currentProgress) {
        throw new Error('Onboarding progress not found');
      }

      let updatedProgress: OnboardingProgress = {
        userId: currentProgress.user_id,
        currentStep: currentProgress.current_step,
        completedSteps: currentProgress.completed_steps || [],
        skippedSteps: currentProgress.skipped_steps || [],
        totalSteps: currentProgress.total_steps,
        startedAt: new Date(currentProgress.started_at),
        lastActiveAt: new Date(),
        onboardingType: currentProgress.onboarding_type,
        completedAt: currentProgress.completed_at ? new Date(currentProgress.completed_at) : undefined
      };

      if (action === 'complete') {
        if (!updatedProgress.completedSteps.includes(stepId)) {
          updatedProgress.completedSteps.push(stepId);
        }
        updatedProgress.currentStep = Math.min(updatedProgress.currentStep + 1, updatedProgress.totalSteps);
        
        if (updatedProgress.currentStep >= updatedProgress.totalSteps) {
          updatedProgress.completedAt = new Date();
        }
      } else if (action === 'skip') {
        if (!updatedProgress.skippedSteps.includes(stepId)) {
          updatedProgress.skippedSteps.push(stepId);
        }
        updatedProgress.currentStep = Math.min(updatedProgress.currentStep + 1, updatedProgress.totalSteps);
      } else if (action === 'back') {
        updatedProgress.currentStep = Math.max(updatedProgress.currentStep - 1, 0);
      }

      const { error: updateError } = await this.supabase
        .from('onboarding_progress')
        .update({
          current_step: updatedProgress.currentStep,
          completed_steps: updatedProgress.completedSteps,
          skipped_steps: updatedProgress.skippedSteps,
          last_active_at: updatedProgress.lastActiveAt.toISOString(),
          completed_at: updatedProgress.completedAt?.toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        throw new Error(`Failed to update onboarding progress: ${updateError.message}`);
      }

      return updatedProgress;
    } catch (error) {
      console.error('Error updating onboarding progress:', error);
      throw error;
    }
  }

  // Guided Meal Plan Creation Wizard
  async startGuidedMealPlanWizard(userId: string): Promise<{
    wizardId: string;
    currentStep: number;
    totalSteps: number;
    stepData: any;
  }> {
    const wizardSteps = [
      { id: 'goals', title: 'What are your meal planning goals?', type: 'multiple_choice' },
      { id: 'dietary', title: 'Any dietary preferences or restrictions?', type: 'checkboxes' },
      { id: 'cuisines', title: 'Favorite cuisines?', type: 'rating_grid' },
      { id: 'cooking_time', title: 'How much time can you spend cooking?', type: 'slider' },
      { id: 'budget', title: 'What\'s your weekly food budget?', type: 'input' },
      { id: 'household', title: 'Who are you cooking for?', type: 'stepper' },
      { id: 'review', title: 'Review your preferences', type: 'summary' },
      { id: 'generate', title: 'Generate your meal plan', type: 'processing' }
    ];

    const wizardId = `wizard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { error } = await this.supabase
      .from('guided_wizard_sessions')
      .insert({
        wizard_id: wizardId,
        user_id: userId,
        wizard_type: 'meal_plan_creation',
        current_step: 0,
        total_steps: wizardSteps.length,
        step_data: {},
        started_at: new Date().toISOString()
      });

    if (error) {
      throw new Error(`Failed to start guided wizard: ${error.message}`);
    }

    return {
      wizardId,
      currentStep: 0,
      totalSteps: wizardSteps.length,
      stepData: wizardSteps[0]
    };
  }

  async updateWizardStep(wizardId: string, stepIndex: number, data: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('guided_wizard_sessions')
        .update({
          current_step: stepIndex,
          step_data: data,
          last_updated_at: new Date().toISOString()
        })
        .eq('wizard_id', wizardId);

      if (error) {
        throw new Error(`Failed to update wizard step: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating wizard step:', error);
      throw error;
    }
  }

  // Preference Learning Through Usage
  async recordPreferenceLearningEvent(event: PreferenceLearningEvent): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('preference_learning_events')
        .insert({
          user_id: event.userId,
          event_type: event.eventType,
          target_id: event.targetId,
          target_type: event.targetType,
          metadata: event.metadata,
          timestamp: event.timestamp.toISOString(),
          weight: event.weight,
          confidence: event.confidence
        });

      if (error) {
        console.error('Failed to record preference learning event:', error);
      }

      // Process the event for preference inference
      await this.processPreferenceLearning(event);
    } catch (error) {
      console.error('Error recording preference learning event:', error);
    }
  }

  private async processPreferenceLearning(event: PreferenceLearningEvent): Promise<void> {
    try {
      // Analyze the event and infer preferences
      const inferredPreferences = await this.analyzeEventForPreferences(event);
      
      for (const preference of inferredPreferences) {
        await this.updateUserPreference(preference);
      }
    } catch (error) {
      console.error('Error processing preference learning:', error);
    }
  }

  private async analyzeEventForPreferences(event: PreferenceLearningEvent): Promise<UserPreference[]> {
    const preferences: UserPreference[] = [];
    
    // Analyze event metadata to extract preference signals
    if (event.eventType === 'recipe_view' || event.eventType === 'recipe_cook') {
      if (event.metadata.cuisine) {
        preferences.push({
          id: `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: event.userId,
          preferenceType: 'cuisine',
          preferenceValue: event.metadata.cuisine,
          confidence: event.confidence,
          source: 'implicit',
          learnedAt: event.timestamp,
          lastUpdatedAt: event.timestamp,
          frequency: 1,
          strength: event.weight
        });
      }
      
      if (event.metadata.difficulty) {
        preferences.push({
          id: `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: event.userId,
          preferenceType: 'difficulty',
          preferenceValue: event.metadata.difficulty,
          confidence: event.confidence,
          source: 'implicit',
          learnedAt: event.timestamp,
          lastUpdatedAt: event.timestamp,
          frequency: 1,
          strength: event.weight
        });
      }
      
      if (event.metadata.cookingTime) {
        preferences.push({
          id: `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: event.userId,
          preferenceType: 'time',
          preferenceValue: event.metadata.cookingTime,
          confidence: event.confidence,
          source: 'implicit',
          learnedAt: event.timestamp,
          lastUpdatedAt: event.timestamp,
          frequency: 1,
          strength: event.weight
        });
      }
    }
    
    return preferences;
  }

  private async updateUserPreference(preference: UserPreference): Promise<void> {
    try {
      // Check if preference already exists
      const { data: existingPreferences, error: fetchError } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', preference.userId)
        .eq('preference_type', preference.preferenceType)
        .eq('preference_value', preference.preferenceValue);

      if (fetchError) {
        console.error('Error fetching existing preferences:', fetchError);
        return;
      }

      if (existingPreferences && existingPreferences.length > 0) {
        // Update existing preference
        const existing = existingPreferences[0];
        const updatedFrequency = existing.frequency + preference.frequency;
        const updatedStrength = (existing.strength * existing.frequency + preference.strength) / updatedFrequency;
        const updatedConfidence = Math.min(existing.confidence + preference.confidence * 0.1, 1.0);

        await this.supabase
          .from('user_preferences')
          .update({
            frequency: updatedFrequency,
            strength: updatedStrength,
            confidence: updatedConfidence,
            last_updated_at: preference.lastUpdatedAt.toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Create new preference
        await this.supabase
          .from('user_preferences')
          .insert({
            id: preference.id,
            user_id: preference.userId,
            preference_type: preference.preferenceType,
            preference_value: preference.preferenceValue,
            confidence: preference.confidence,
            source: preference.source,
            learned_at: preference.learnedAt.toISOString(),
            last_updated_at: preference.lastUpdatedAt.toISOString(),
            frequency: preference.frequency,
            strength: preference.strength
          });
      }
    } catch (error) {
      console.error('Error updating user preference:', error);
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreference[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .order('confidence', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch user preferences: ${error.message}`);
      }

      return data?.map(pref => ({
        id: pref.id,
        userId: pref.user_id,
        preferenceType: pref.preference_type,
        preferenceValue: pref.preference_value,
        confidence: pref.confidence,
        source: pref.source,
        learnedAt: new Date(pref.learned_at),
        lastUpdatedAt: new Date(pref.last_updated_at),
        frequency: pref.frequency,
        strength: pref.strength
      })) || [];
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return [];
    }
  }

  // Cooking Skill Assessment
  async initializeCookingSkillAssessment(userId: string): Promise<{
    assessmentId: string;
    questions: any[];
    currentQuestion: number;
    totalQuestions: number;
  }> {
    const questions = [
      {
        id: 'knife_skills',
        category: 'knifework',
        question: 'How comfortable are you with knife techniques?',
        type: 'scale',
        options: [
          { value: 1, label: 'I struggle with basic chopping' },
          { value: 5, label: 'I can dice onions and chop vegetables efficiently' },
          { value: 10, label: 'I can julienne, brunoise, and handle advanced knife cuts' }
        ]
      },
      {
        id: 'timing_management',
        category: 'timing',
        question: 'How well can you manage cooking multiple dishes at once?',
        type: 'scale',
        options: [
          { value: 1, label: 'I cook one thing at a time' },
          { value: 5, label: 'I can manage 2-3 dishes with some planning' },
          { value: 10, label: 'I easily coordinate complex multi-course meals' }
        ]
      },
      {
        id: 'seasoning_taste',
        category: 'seasoning',
        question: 'How confident are you with seasoning and adjusting flavors?',
        type: 'scale',
        options: [
          { value: 1, label: 'I follow recipes exactly' },
          { value: 5, label: 'I can adjust salt, pepper, and basic seasonings' },
          { value: 10, label: 'I can balance complex flavor profiles by taste' }
        ]
      },
      {
        id: 'cooking_techniques',
        category: 'technique',
        question: 'Which cooking techniques can you perform confidently?',
        type: 'multiple_choice',
        options: [
          'Basic sautéing and boiling',
          'Roasting and grilling',
          'Braising and stewing',
          'Baking and pastry basics',
          'Advanced techniques (sous vide, fermentation, etc.)'
        ]
      },
      {
        id: 'equipment_knowledge',
        category: 'equipment',
        question: 'How familiar are you with kitchen equipment?',
        type: 'scale',
        options: [
          { value: 1, label: 'Basic pots, pans, and utensils' },
          { value: 5, label: 'Stand mixer, food processor, various specialty tools' },
          { value: 10, label: 'Professional-grade equipment and specialty appliances' }
        ]
      },
      {
        id: 'nutrition_awareness',
        category: 'nutrition',
        question: 'How well do you understand nutrition in cooking?',
        type: 'scale',
        options: [
          { value: 1, label: 'I don\'t think much about nutrition' },
          { value: 5, label: 'I understand basic nutrition and try to cook healthy' },
          { value: 10, label: 'I can plan nutritionally balanced meals and adapt recipes' }
        ]
      },
      {
        id: 'meal_planning',
        category: 'planning',
        question: 'How do you approach meal planning and prep?',
        type: 'scale',
        options: [
          { value: 1, label: 'I decide what to cook each day' },
          { value: 5, label: 'I plan meals for the week and do some prep' },
          { value: 10, label: 'I efficiently batch cook and meal prep for weeks' }
        ]
      },
      {
        id: 'recipe_creativity',
        category: 'creativity',
        question: 'How often do you modify recipes or create your own?',
        type: 'scale',
        options: [
          { value: 1, label: 'I always follow recipes exactly' },
          { value: 5, label: 'I sometimes substitute ingredients or adjust recipes' },
          { value: 10, label: 'I regularly create my own recipes and improvise' }
        ]
      }
    ];

    const assessmentId = `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { error } = await this.supabase
      .from('cooking_skill_assessments')
      .insert({
        assessment_id: assessmentId,
        user_id: userId,
        started_at: new Date().toISOString(),
        current_question: 0,
        total_questions: questions.length,
        questions: questions,
        answers: {}
      });

    if (error) {
      throw new Error(`Failed to initialize skill assessment: ${error.message}`);
    }

    return {
      assessmentId,
      questions,
      currentQuestion: 0,
      totalQuestions: questions.length
    };
  }

  async submitSkillAssessmentAnswer(
    assessmentId: string,
    questionId: string,
    answer: any
  ): Promise<{ nextQuestion?: any; completed?: boolean; assessment?: CookingSkillAssessment }> {
    try {
      const { data: assessmentData, error: fetchError } = await this.supabase
        .from('cooking_skill_assessments')
        .select('*')
        .eq('assessment_id', assessmentId)
        .single();

      if (fetchError || !assessmentData) {
        throw new Error('Assessment not found');
      }

      const answers = { ...assessmentData.answers, [questionId]: answer };
      const currentQuestion = assessmentData.current_question + 1;
      const completed = currentQuestion >= assessmentData.total_questions;

      if (completed) {
        const assessment = await this.calculateSkillAssessment(assessmentData.user_id, answers, assessmentData.questions);
        
        await this.supabase
          .from('cooking_skill_assessments')
          .update({
            answers,
            current_question: currentQuestion,
            completed_at: new Date().toISOString(),
            assessment_results: assessment
          })
          .eq('assessment_id', assessmentId);

        return { completed: true, assessment };
      } else {
        await this.supabase
          .from('cooking_skill_assessments')
          .update({
            answers,
            current_question: currentQuestion
          })
          .eq('assessment_id', assessmentId);

        return { 
          nextQuestion: assessmentData.questions[currentQuestion],
          completed: false
        };
      }
    } catch (error) {
      console.error('Error submitting skill assessment answer:', error);
      throw error;
    }
  }

  private async calculateSkillAssessment(userId: string, answers: any, questions: any[]): Promise<CookingSkillAssessment> {
    const skillAreas = {
      knifework: 0,
      timing: 0,
      seasoning: 0,
      technique: 0,
      equipment: 0,
      nutrition: 0,
      planning: 0,
      creativity: 0
    };

    let totalScore = 0;
    let questionCount = 0;

    questions.forEach(question => {
      const answer = answers[question.id];
      if (answer !== undefined) {
        let score = 0;
        
        if (question.type === 'scale') {
          score = answer;
        } else if (question.type === 'multiple_choice' && Array.isArray(answer)) {
          score = (answer.length / question.options.length) * 10;
        }
        
        skillAreas[question.category as keyof typeof skillAreas] = score;
        totalScore += score;
        questionCount++;
      }
    });

    const averageScore = totalScore / questionCount;
    let overallLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    
    if (averageScore <= 3) overallLevel = 'beginner';
    else if (averageScore <= 6) overallLevel = 'intermediate';
    else if (averageScore <= 8) overallLevel = 'advanced';
    else overallLevel = 'expert';

    const recommendations = this.generateSkillRecommendations(skillAreas, overallLevel);

    const assessment: CookingSkillAssessment = {
      userId,
      overallLevel,
      skillAreas,
      confidenceLevel: averageScore / 10,
      assessmentDate: new Date(),
      questionsAnswered: questionCount,
      timeSpent: 0, // Would track actual time in real implementation
      recommendations
    };

    // Store the assessment
    await this.supabase
      .from('user_skill_profiles')
      .upsert({
        user_id: userId,
        overall_level: assessment.overallLevel,
        skill_areas: assessment.skillAreas,
        confidence_level: assessment.confidenceLevel,
        assessment_date: assessment.assessmentDate.toISOString(),
        questions_answered: assessment.questionsAnswered,
        recommendations: assessment.recommendations
      });

    return assessment;
  }

  private generateSkillRecommendations(skillAreas: any, overallLevel: string): string[] {
    const recommendations: string[] = [];

    // General recommendations based on overall level
    if (overallLevel === 'beginner') {
      recommendations.push('Start with simple one-pot meals and basic cooking techniques');
      recommendations.push('Focus on mastering knife skills and basic seasoning');
      recommendations.push('Try our beginner-friendly meal plans with detailed instructions');
    } else if (overallLevel === 'intermediate') {
      recommendations.push('Challenge yourself with more complex flavor combinations');
      recommendations.push('Experiment with different cooking methods like braising or roasting');
      recommendations.push('Try batch cooking to improve your meal planning efficiency');
    } else if (overallLevel === 'advanced') {
      recommendations.push('Explore international cuisines and advanced techniques');
      recommendations.push('Focus on presentation and plating skills');
      recommendations.push('Consider teaching others or sharing your recipes');
    } else {
      recommendations.push('Experiment with molecular gastronomy or fermentation');
      recommendations.push('Create your own signature dishes and cooking style');
      recommendations.push('Consider professional culinary development');
    }

    // Specific recommendations based on weak areas
    Object.entries(skillAreas).forEach(([skill, score]) => {
      if ((score as number) < 4) {
        switch (skill) {
          case 'knifework':
            recommendations.push('Practice basic knife cuts with online tutorials');
            break;
          case 'timing':
            recommendations.push('Start with simple multi-component meals to improve timing');
            break;
          case 'seasoning':
            recommendations.push('Taste as you go and keep notes on successful seasoning combinations');
            break;
          case 'technique':
            recommendations.push('Master one cooking technique at a time through focused practice');
            break;
          case 'equipment':
            recommendations.push('Learn about essential kitchen tools and their proper use');
            break;
          case 'nutrition':
            recommendations.push('Study basic nutrition principles to make healthier cooking choices');
            break;
          case 'planning':
            recommendations.push('Start meal planning one week at a time with simple recipes');
            break;
          case 'creativity':
            recommendations.push('Begin by making small modifications to recipes you love');
            break;
        }
      }
    });

    return recommendations;
  }

  // Sample Meal Plans for Immediate Value
  async getSampleMealPlans(): Promise<SampleMealPlan[]> {
    const samplePlans: SampleMealPlan[] = [
      {
        id: 'beginner_week_1',
        title: 'Easy Start: Your First Week',
        description: 'Perfect for cooking beginners with simple, delicious recipes that build confidence.',
        difficulty: 'beginner',
        duration: '1_week',
        cuisineType: ['American', 'Italian'],
        dietaryRestrictions: [],
        estimatedCost: 75,
        estimatedTime: 30,
        meals: [
          {
            day: 1,
            mealType: 'dinner',
            recipeName: 'Simple Spaghetti with Marinara',
            prepTime: 10,
            cookTime: 20,
            ingredients: ['spaghetti', 'marinara sauce', 'parmesan cheese', 'olive oil', 'garlic'],
            instructions: [
              'Boil water and cook spaghetti according to package directions',
              'Heat marinara sauce in a pan with minced garlic',
              'Combine pasta and sauce, top with parmesan'
            ],
            nutritionInfo: { calories: 480, protein: 18, carbs: 75, fat: 12 }
          },
          {
            day: 2,
            mealType: 'dinner',
            recipeName: 'Sheet Pan Chicken and Vegetables',
            prepTime: 15,
            cookTime: 30,
            ingredients: ['chicken breast', 'broccoli', 'carrots', 'olive oil', 'salt', 'pepper'],
            instructions: [
              'Preheat oven to 425°F',
              'Toss chicken and vegetables with olive oil and seasonings',
              'Bake for 25-30 minutes until chicken is cooked through'
            ],
            nutritionInfo: { calories: 380, protein: 32, carbs: 18, fat: 18 }
          }
        ],
        shoppingList: ['spaghetti', 'marinara sauce', 'parmesan cheese', 'olive oil', 'garlic', 'chicken breast', 'broccoli', 'carrots', 'salt', 'pepper'],
        tags: ['beginner-friendly', 'quick-meals', 'family-friendly'],
        popularity: 95
      },
      {
        id: 'budget_conscious_week',
        title: 'Budget-Friendly Week',
        description: 'Delicious, nutritious meals that won\'t break the bank. Perfect for students and budget-conscious families.',
        difficulty: 'beginner',
        duration: '1_week',
        cuisineType: ['American', 'Mexican'],
        dietaryRestrictions: [],
        estimatedCost: 45,
        estimatedTime: 25,
        meals: [
          {
            day: 1,
            mealType: 'dinner',
            recipeName: 'Bean and Rice Bowl',
            prepTime: 10,
            cookTime: 15,
            ingredients: ['brown rice', 'black beans', 'onion', 'garlic', 'cumin', 'lime'],
            instructions: [
              'Cook rice according to package directions',
              'Sauté onion and garlic, add beans and cumin',
              'Serve over rice with lime juice'
            ],
            nutritionInfo: { calories: 320, protein: 14, carbs: 58, fat: 4 }
          }
        ],
        shoppingList: ['brown rice', 'black beans', 'onion', 'garlic', 'cumin', 'lime'],
        tags: ['budget-friendly', 'vegetarian', 'meal-prep'],
        popularity: 88
      },
      {
        id: 'family_favorites',
        title: 'Family Favorites Week',
        description: 'Kid-approved meals that adults love too. Perfect for busy families with varying tastes.',
        difficulty: 'intermediate',
        duration: '1_week',
        cuisineType: ['American', 'Italian', 'Mexican'],
        dietaryRestrictions: [],
        estimatedCost: 85,
        estimatedTime: 40,
        meals: [
          {
            day: 1,
            mealType: 'dinner',
            recipeName: 'Homemade Pizza Night',
            prepTime: 20,
            cookTime: 15,
            ingredients: ['pizza dough', 'tomato sauce', 'mozzarella cheese', 'pepperoni', 'vegetables'],
            instructions: [
              'Roll out pizza dough on baking sheet',
              'Spread sauce and add toppings',
              'Bake at 450°F for 12-15 minutes'
            ],
            nutritionInfo: { calories: 420, protein: 22, carbs: 45, fat: 16 }
          }
        ],
        shoppingList: ['pizza dough', 'tomato sauce', 'mozzarella cheese', 'pepperoni', 'vegetables'],
        tags: ['family-friendly', 'kid-approved', 'interactive-cooking'],
        popularity: 92
      }
    ];

    // Store sample meal plans in database for easy access
    try {
      for (const plan of samplePlans) {
        await this.supabase
          .from('sample_meal_plans')
          .upsert({
            id: plan.id,
            title: plan.title,
            description: plan.description,
            difficulty: plan.difficulty,
            duration: plan.duration,
            cuisine_types: plan.cuisineType,
            dietary_restrictions: plan.dietaryRestrictions,
            estimated_cost: plan.estimatedCost,
            estimated_time: plan.estimatedTime,
            meals: plan.meals,
            shopping_list: plan.shoppingList,
            tags: plan.tags,
            popularity: plan.popularity
          });
      }
    } catch (error) {
      console.error('Error storing sample meal plans:', error);
    }

    return samplePlans;
  }

  async generatePersonalizedSamplePlans(userId: string): Promise<SampleMealPlan[]> {
    try {
      const preferences = await this.getUserPreferences(userId);
      const skillAssessment = await this.getUserSkillAssessment(userId);
      const basePlans = await this.getSampleMealPlans();

      // Filter and customize based on user preferences and skill level
      return basePlans.filter(plan => {
        if (skillAssessment && plan.difficulty !== skillAssessment.overallLevel && 
            Math.abs(['beginner', 'intermediate', 'advanced', 'expert'].indexOf(plan.difficulty) - 
                    ['beginner', 'intermediate', 'advanced', 'expert'].indexOf(skillAssessment.overallLevel)) > 1) {
          return false;
        }

        // Check cuisine preferences
        const cuisinePrefs = preferences.filter(p => p.preferenceType === 'cuisine');
        if (cuisinePrefs.length > 0) {
          const userCuisines = cuisinePrefs.map(p => p.preferenceValue.toLowerCase());
          const planCuisines = plan.cuisineType.map(c => c.toLowerCase());
          if (!planCuisines.some(pc => userCuisines.includes(pc))) {
            return false;
          }
        }

        return true;
      }).slice(0, 3); // Return top 3 personalized plans
    } catch (error) {
      console.error('Error generating personalized sample plans:', error);
      return await this.getSampleMealPlans();
    }
  }

  async applySampleMealPlan(userId: string, samplePlanId: string): Promise<string> {
    try {
      const { data: samplePlan, error } = await this.supabase
        .from('sample_meal_plans')
        .select('*')
        .eq('id', samplePlanId)
        .single();

      if (error || !samplePlan) {
        throw new Error('Sample meal plan not found');
      }

      // Create a new meal plan based on the sample
      const newMealPlanId = `meal_plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await this.supabase
        .from('meal_plans')
        .insert({
          id: newMealPlanId,
          user_id: userId,
          title: `My ${samplePlan.title}`,
          description: `Based on: ${samplePlan.description}`,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          meals: samplePlan.meals,
          shopping_list: samplePlan.shopping_list,
          estimated_cost: samplePlan.estimated_cost,
          created_from_sample: samplePlanId
        });

      toast.success('Sample meal plan applied successfully!');
      return newMealPlanId;
    } catch (error) {
      console.error('Error applying sample meal plan:', error);
      toast.error('Failed to apply sample meal plan');
      throw error;
    }
  }

  // Helper methods
  private async getUserSkillAssessment(userId: string): Promise<CookingSkillAssessment | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_skill_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        userId: data.user_id,
        overallLevel: data.overall_level,
        skillAreas: data.skill_areas,
        confidenceLevel: data.confidence_level,
        assessmentDate: new Date(data.assessment_date),
        questionsAnswered: data.questions_answered,
        timeSpent: 0,
        recommendations: data.recommendations
      };
    } catch (error) {
      console.error('Error getting user skill assessment:', error);
      return null;
    }
  }

  async generateOnboardingInsights(userId: string): Promise<OnboardingInsight[]> {
    const insights: OnboardingInsight[] = [];
    
    try {
      const preferences = await this.getUserPreferences(userId);
      const skillAssessment = await this.getUserSkillAssessment(userId);
      
      // Generate insights based on onboarding data
      if (preferences.length > 0) {
        const topCuisines = preferences
          .filter(p => p.preferenceType === 'cuisine')
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 3);
        
        if (topCuisines.length > 0) {
          insights.push({
            id: `insight_cuisine_${Date.now()}`,
            userId,
            insightType: 'preference_discovered',
            title: 'Cuisine Preferences Identified',
            description: `We've identified your top cuisine preferences: ${topCuisines.map(c => c.preferenceValue).join(', ')}`,
            actionable: true,
            recommendations: [
              'Explore more recipes from these cuisines',
              'Try fusion recipes combining your favorite flavors',
              'Join cooking classes for your preferred cuisines'
            ],
            confidence: topCuisines.reduce((sum, c) => sum + c.confidence, 0) / topCuisines.length,
            discoveredAt: new Date(),
            applied: false
          });
        }
      }
      
      if (skillAssessment) {
        const weakestSkill = Object.entries(skillAssessment.skillAreas)
          .sort(([,a], [,b]) => a - b)[0];
        
        insights.push({
          id: `insight_skill_${Date.now()}`,
          userId,
          insightType: 'skill_improved',
          title: 'Skill Development Opportunity',
          description: `Your ${weakestSkill[0]} skills could use some improvement`,
          actionable: true,
          recommendations: skillAssessment.recommendations,
          confidence: 0.9,
          discoveredAt: new Date(),
          applied: false
        });
      }
      
    } catch (error) {
      console.error('Error generating onboarding insights:', error);
    }
    
    return insights;
  }
}

export const improvedOnboardingService = new ImprovedOnboardingService();