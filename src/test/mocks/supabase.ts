import { vi } from 'vitest';

// Mock user data
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00.000Z',
  user_metadata: {},
  app_metadata: {},
};

// Mock session data
export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
};

// Mock auth response
export const mockAuthResponse = {
  data: {
    user: mockUser,
    session: mockSession,
  },
  error: null,
};

// Mock database responses
export const mockRecipe = {
  id: 'recipe-123',
  name: 'Test Recipe',
  description: 'A test recipe',
  cuisine: 'Italian',
  difficulty: 'intermediate',
  prep_time: 15,
  cook_time: 30,
  servings: 4,
  is_public: true,
  created_by: 'user-123',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
};

export const mockMealPlan = {
  id: 'meal-plan-123',
  name: 'Test Meal Plan',
  week_start_date: '2023-01-01',
  is_active: true,
  user_id: 'user-123',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
};

export const mockProfile = {
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'user',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
};

// Mock Supabase client
export const createMockSupabaseClient = () => ({
  auth: {
    signUp: vi.fn().mockResolvedValue(mockAuthResponse),
    signInWithPassword: vi.fn().mockResolvedValue(mockAuthResponse),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: mockRecipe, error: null }),
    order: vi.fn().mockReturnThis(),
  })),
  functions: {
    invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
  },
});

// Mock data responses
export const mockSupabaseResponse = {
  data: [mockRecipe],
  error: null,
  count: 1,
  status: 200,
  statusText: 'OK',
};

export const mockSupabaseError = {
  data: null,
  error: {
    message: 'Test error',
    details: 'Test error details',
    hint: 'Test error hint',
    code: 'TEST_ERROR',
  },
  count: null,
  status: 400,
  statusText: 'Bad Request',
};