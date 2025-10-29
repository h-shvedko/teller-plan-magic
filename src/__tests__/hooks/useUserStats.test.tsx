import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUserStats } from '@/hooks/useUserStats';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { createMockUser, createMockRecipe, createMockMealPlan } from '@/test/fixtures';

// Mock dependencies
vi.mock('@/hooks/useAuth');
vi.mock('@/integrations/supabase/client');

const mockUseAuth = vi.mocked(useAuth);
const mockSupabase = vi.mocked(supabase);

describe('useUserStats', () => {
  const mockUser = createMockUser();
  const mockRecipes = [
    createMockRecipe({ id: '1', name: 'Recipe 1' }),
    createMockRecipe({ id: '2', name: 'Recipe 2' }),
  ];
  const mockMealPlans = [
    createMockMealPlan({ id: '1', name: 'Meal Plan 1' }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      userRole: null,
      isLoading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      isAdmin: false,
    });

    // Setup default successful responses
    mockSupabase.from.mockImplementation((table) => {
      const mockData = table === 'recipes' ? mockRecipes : mockMealPlans;
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnValue({
          data: mockData,
          error: null,
        }),
      } as any;
    });
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useUserStats());

    expect(result.current.loading).toBe(true);
    expect(result.current.stats).toEqual({
      totalRecipes: 0,
      totalMealPlans: 0,
      totalShoppingLists: 0,
    });
  });

  it('should load user stats successfully', async () => {
    const { result } = renderHook(() => useUserStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.stats).toEqual({
        totalRecipes: 2,
        totalMealPlans: 1,
        totalShoppingLists: 0,
      });
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('recipes');
    expect(mockSupabase.from).toHaveBeenCalledWith('meal_plans');
    expect(mockSupabase.from).toHaveBeenCalledWith('shopping_lists');
  });

  it('should handle no user case', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      userRole: null,
      isLoading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      isAdmin: false,
    });

    const { result } = renderHook(() => useUserStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.stats).toEqual({
        totalRecipes: 0,
        totalMealPlans: 0,
        totalShoppingLists: 0,
      });
    });

    // Should not make any API calls when no user
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    mockSupabase.from.mockImplementation((table) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnValue({
        data: null,
        error: { message: `Failed to fetch ${table}` },
      }),
    } as any));

    const { result } = renderHook(() => useUserStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.stats).toEqual({
        totalRecipes: 0,
        totalMealPlans: 0,
        totalShoppingLists: 0,
      });
    });
  });

  it('should handle partial API failures', async () => {
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'recipes') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnValue({
            data: null,
            error: { message: 'Failed to fetch recipes' },
          }),
        } as any;
      }
      
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnValue({
          data: table === 'meal_plans' ? mockMealPlans : [],
          error: null,
        }),
      } as any;
    });

    const { result } = renderHook(() => useUserStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.stats).toEqual({
        totalRecipes: 0, // Failed to load
        totalMealPlans: 1, // Loaded successfully
        totalShoppingLists: 0, // Empty array
      });
    });
  });

  it('should refresh stats when user changes', async () => {
    const { rerender } = renderHook(() => useUserStats());

    // Wait for initial load
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalled();
    });

    // Clear previous calls
    vi.clearAllMocks();

    // Change user
    const newUser = createMockUser({ id: 'user-456' });
    mockUseAuth.mockReturnValue({
      user: newUser,
      session: null,
      userRole: null,
      isLoading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      isAdmin: false,
    });

    rerender();

    // Should make new API calls for the new user
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('recipes');
      expect(mockSupabase.from).toHaveBeenCalledWith('meal_plans');
      expect(mockSupabase.from).toHaveBeenCalledWith('shopping_lists');
    });
  });

  it('should provide refreshStats function', async () => {
    const { result } = renderHook(() => useUserStats());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear previous calls
    vi.clearAllMocks();

    // Call refreshStats
    await result.current.refreshStats();

    // Should make new API calls
    expect(mockSupabase.from).toHaveBeenCalledWith('recipes');
    expect(mockSupabase.from).toHaveBeenCalledWith('meal_plans');
    expect(mockSupabase.from).toHaveBeenCalledWith('shopping_lists');
  });
});