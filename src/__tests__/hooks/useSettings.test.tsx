import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSettings } from '@/hooks/useSettings';
import { supabase } from '@/integrations/supabase/client';
import { createMockSettings } from '@/test/fixtures';

// Mock Supabase client
vi.mock('@/integrations/supabase/client');

const mockSupabase = vi.mocked(supabase);

describe('useSettings', () => {
  const mockSettings = createMockSettings();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default successful responses for all settings tables
    mockSupabase.from.mockImplementation((table) => {
      const mockData = mockSettings[table as keyof typeof mockSettings] || [];
      return {
        select: vi.fn().mockReturnValue({
          data: mockData,
          error: null,
        }),
      } as any;
    });
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.loading).toBe(true);
    expect(result.current.settings).toEqual({
      cuisines: [],
      dietaryPreferences: [],
      healthGoals: [],
      cookingStyles: [],
    });
  });

  it('should load settings successfully', async () => {
    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.settings).toEqual(mockSettings);
    });

    // Verify all settings tables were queried
    expect(mockSupabase.from).toHaveBeenCalledWith('cuisines');
    expect(mockSupabase.from).toHaveBeenCalledWith('dietary_preferences');
    expect(mockSupabase.from).toHaveBeenCalledWith('health_goals');
    expect(mockSupabase.from).toHaveBeenCalledWith('cooking_styles');
  });

  it('should handle partial loading errors gracefully', async () => {
    // Make one of the queries fail
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'cuisines') {
        return {
          select: vi.fn().mockReturnValue({
            data: null,
            error: { message: 'Failed to fetch cuisines' },
          }),
        } as any;
      }
      
      const mockData = mockSettings[table as keyof typeof mockSettings] || [];
      return {
        select: vi.fn().mockReturnValue({
          data: mockData,
          error: null,
        }),
      } as any;
    });

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      // Should still load other settings even if one fails
      expect(result.current.settings.cuisines).toEqual([]);
      expect(result.current.settings.dietaryPreferences).toEqual(mockSettings.dietaryPreferences);
      expect(result.current.settings.healthGoals).toEqual(mockSettings.healthGoals);
      expect(result.current.settings.cookingStyles).toEqual(mockSettings.cookingStyles);
    });
  });

  it('should handle complete loading failure', async () => {
    // Make all queries fail
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        data: null,
        error: { message: 'Database connection failed' },
      }),
    } as any);

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.settings).toEqual({
        cuisines: [],
        dietaryPreferences: [],
        healthGoals: [],
        cookingStyles: [],
      });
    });
  });

  it('should not reload settings on re-render', async () => {
    const { result, rerender } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear previous calls
    vi.clearAllMocks();

    // Re-render the hook
    rerender();

    // Should not make new API calls
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it('should handle empty response data', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        data: [],
        error: null,
      }),
    } as any);

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.settings).toEqual({
        cuisines: [],
        dietaryPreferences: [],
        healthGoals: [],
        cookingStyles: [],
      });
    });
  });
});