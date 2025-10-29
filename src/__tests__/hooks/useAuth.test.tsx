import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { createMockUser } from '@/test/fixtures';

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client');

const mockSupabase = vi.mocked(supabase);

describe('useAuth', () => {
  const mockUser = createMockUser();
  const mockSession = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
  };

  const mockAuthStateChange = vi.fn();
  const mockUnsubscribe = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
    
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnValue({
        data: [],
        error: null,
      }),
    } as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('AuthProvider', () => {
    it('should provide authentication context', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.userRole).toBeNull();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAdmin).toBe(false);
      expect(typeof result.current.signIn).toBe('function');
      expect(typeof result.current.signUp).toBe('function');
      expect(typeof result.current.signOut).toBe('function');
    });

    it('should handle authentication state changes', async () => {
      let authCallback: any;
      
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Simulate sign in
      act(() => {
        authCallback('SIGNED_IN', mockSession);
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.session).toEqual(mockSession);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle user roles fetching', async () => {
      const mockRoles = [{ role: 'administrator' }];
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnValue({
          data: mockRoles,
          error: null,
        }),
      } as any);

      let authCallback: any;
      
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        authCallback('SIGNED_IN', mockSession);
      });

      await waitFor(() => {
        expect(result.current.isAdmin).toBe(true);
        expect(result.current.userRole).toBe('administrator');
      });
    });

    it('should handle sign out', async () => {
      let authCallback: any;
      
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // First sign in
      act(() => {
        authCallback('SIGNED_IN', mockSession);
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      // Then sign out
      act(() => {
        authCallback('SIGNED_OUT', null);
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.session).toBeNull();
        expect(result.current.userRole).toBeNull();
        expect(result.current.isAdmin).toBe(false);
      });
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockAuthResponse = {
        data: { user: mockUser, session: mockSession },
        error: null,
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue(mockAuthResponse);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.signIn('test@example.com', 'password');
        expect(response.error).toBeNull();
      });

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('should handle sign in error', async () => {
      const mockError = {
        message: 'Invalid login credentials',
        code: 'invalid_credentials',
      };

      const mockAuthResponse = {
        data: { user: null, session: null },
        error: mockError,
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue(mockAuthResponse);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.signIn('test@example.com', 'wrong-password');
        expect(response.error).toEqual(mockError);
      });
    });
  });

  describe('signUp', () => {
    it('should sign up user successfully', async () => {
      const mockAuthResponse = {
        data: { user: mockUser, session: mockSession },
        error: null,
      };

      mockSupabase.auth.signUp.mockResolvedValue(mockAuthResponse);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.signUp('test@example.com', 'password', 'John', 'Doe');
        expect(response.error).toBeNull();
      });

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          data: {
            first_name: 'John',
            last_name: 'Doe',
          },
        },
      });
    });

    it('should handle sign up error', async () => {
      const mockError = {
        message: 'User already registered',
        code: 'user_already_exists',
      };

      const mockAuthResponse = {
        data: { user: null, session: null },
        error: mockError,
      };

      mockSupabase.auth.signUp.mockResolvedValue(mockAuthResponse);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.signUp('existing@example.com', 'password');
        expect(response.error).toEqual(mockError);
      });
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('useAuth hook without provider', () => {
    it('should throw error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });
  });
});