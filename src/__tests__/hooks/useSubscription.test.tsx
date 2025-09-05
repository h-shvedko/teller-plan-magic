import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { createMockUser } from '@/test/fixtures';

// Mock hooks and dependencies
vi.mock('@/hooks/useAuth');
vi.mock('@/integrations/supabase/client');

const mockUseAuth = vi.mocked(useAuth);
const mockSupabase = vi.mocked(supabase);

describe('useSubscription', () => {
  const mockUser = createMockUser();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
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

    const { result } = renderHook(() => useSubscription());

    expect(result.current.subscription).toBeNull();
    expect(result.current.isLoading).toBe(false); // Should be false when no user
    expect(result.current.error).toBeNull();
  });

  it('should check subscription when user is present', async () => {
    const mockSubscriptionData = {
      subscribed: true,
      subscription_tier: 'premium',
      subscription_end: '2024-12-31',
    };

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

    mockSupabase.functions.invoke.mockResolvedValue({
      data: mockSubscriptionData,
      error: null,
    });

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.subscription).toEqual(mockSubscriptionData);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('check-subscription');
  });

  it('should handle subscription check error', async () => {
    const mockError = new Error('Subscription check failed');

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

    mockSupabase.functions.invoke.mockRejectedValue(mockError);

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.subscription).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Subscription check failed');
    });
  });

  it('should handle no subscription data', async () => {
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

    mockSupabase.functions.invoke.mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.subscription).toEqual({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should re-check subscription when user changes', async () => {
    const { rerender } = renderHook(() => useSubscription());

    // Initially no user
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

    rerender();

    expect(mockSupabase.functions.invoke).not.toHaveBeenCalled();

    // Then user appears
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

    mockSupabase.functions.invoke.mockResolvedValue({
      data: {
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
      },
      error: null,
    });

    rerender();

    await waitFor(() => {
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('check-subscription');
    });
  });

  it('should provide checkSubscription function for manual refresh', async () => {
    const mockSubscriptionData = {
      subscribed: true,
      subscription_tier: 'basic',
      subscription_end: '2024-06-30',
    };

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

    mockSupabase.functions.invoke.mockResolvedValue({
      data: mockSubscriptionData,
      error: null,
    });

    const { result } = renderHook(() => useSubscription());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Clear previous calls
    vi.clearAllMocks();

    // Manually refresh
    await act(async () => {
      await result.current.checkSubscription();
    });

    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('check-subscription');
  });
});