import { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type Recipe = Tables['recipes']['Row'];
type MealPlan = Tables['meal_plans']['Row'];
type Profile = Tables['profiles']['Row'];

export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00.000Z',
  user_metadata: {},
  app_metadata: {},
  ...overrides,
});

export const createMockProfile = (overrides: Partial<Profile> = {}): Profile => ({
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'user',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
  ...overrides,
});

export const createMockRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
  id: 'recipe-123',
  name: 'Test Recipe',
  description: 'A delicious test recipe',
  cuisine: 'Italian',
  difficulty: 'intermediate',
  prep_time: 15,
  cook_time: 30,
  servings: 4,
  is_public: true,
  created_by: 'user-123',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
  image_url: null,
  instructions: 'Test instructions',
  dietary_tags: ['vegetarian'],
  meal_type: 'dinner',
  ...overrides,
});

export const createMockMealPlan = (overrides: Partial<MealPlan> = {}): MealPlan => ({
  id: 'meal-plan-123',
  name: 'Test Meal Plan',
  week_start_date: '2023-01-01',
  is_active: true,
  user_id: 'user-123',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
  ...overrides,
});

export const createMockSettings = () => ({
  cuisines: [
    { id: '1', name: 'Italian', description: 'Italian cuisine' },
    { id: '2', name: 'Mexican', description: 'Mexican cuisine' },
  ],
  dietaryPreferences: [
    { id: '1', name: 'Vegetarian', description: 'No meat' },
    { id: '2', name: 'Vegan', description: 'No animal products' },
  ],
  healthGoals: [
    { id: '1', name: 'Weight Loss', description: 'Lose weight' },
    { id: '2', name: 'Muscle Gain', description: 'Build muscle' },
  ],
  cookingStyles: [
    { id: '1', name: 'Quick & Easy', description: 'Fast cooking' },
    { id: '2', name: 'Gourmet', description: 'Fine dining' },
  ],
});

// Mock API responses
export const createMockApiResponse = <T>(data: T, error: any = null) => ({
  data,
  error,
  count: Array.isArray(data) ? data.length : 1,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK',
});

export const createMockErrorResponse = (message = 'Test error') => ({
  data: null,
  error: {
    message,
    details: 'Test error details',
    hint: 'Test error hint',
    code: 'TEST_ERROR',
  },
  count: null,
  status: 400,
  statusText: 'Bad Request',
});

// Form data fixtures
export const createMockFormData = {
  recipe: {
    name: 'Test Recipe',
    description: 'A test recipe',
    cuisine: 'Italian',
    prep_time: '15',
    cook_time: '30',
    servings: '4',
    difficulty: 'intermediate',
    ingredients: 'Test ingredients',
    instructions: 'Test instructions',
  },
  mealPlan: {
    name: 'Test Meal Plan',
    week_start_date: '2023-01-01',
    is_active: true,
    meals: [],
  },
  auth: {
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    fullName: 'Test User',
  },
};