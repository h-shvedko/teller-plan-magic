import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Auth } from '@/pages/Auth';
import { AuthProvider } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { render } from '@testing-library/react';
import { createMockUser, createMockAuthResponse } from '@/test/fixtures';

// Mock Supabase
vi.mock('@/integrations/supabase/client');
const mockSupabase = vi.mocked(supabase);

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderAuthFlow = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Auth />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default auth state change mock
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    // Setup default user roles query
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnValue({
        data: [],
        error: null,
      }),
    } as any);
  });

  describe('Sign Up Flow', () => {
    it('should complete successful sign up flow', async () => {
      const mockUser = createMockUser();
      const mockSession = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      renderAuthFlow();

      // Fill out sign up form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });

      // Submit form
      const signUpButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(signUpButton);

      await waitFor(() => {
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          options: {
            data: {
              first_name: 'John',
              last_name: 'Doe',
            },
          },
        });
      });
    });

    it('should handle sign up validation errors', async () => {
      renderAuthFlow();

      // Try to submit form without filling required fields
      const signUpButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(signUpButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      // Should not call API with invalid data
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    });

    it('should handle password mismatch', async () => {
      renderAuthFlow();

      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'different' } });

      const signUpButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(signUpButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should handle sign up API errors', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'User already registered',
          code: 'user_already_exists',
        },
      });

      renderAuthFlow();

      // Fill form with valid data
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'existing@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });

      const signUpButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(signUpButton);

      await waitFor(() => {
        expect(screen.getByText(/user already registered/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sign In Flow', () => {
    it('should complete successful sign in flow', async () => {
      const mockUser = createMockUser();
      const mockSession = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      renderAuthFlow();

      // Switch to sign in tab
      const signInTab = screen.getByRole('tab', { name: /sign in/i });
      fireEvent.click(signInTab);

      // Fill out sign in form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Submit form
      const signInButton = screen.getByRole('button', { name: /^sign in$/i });
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should handle invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Invalid login credentials',
          code: 'invalid_credentials',
        },
      });

      renderAuthFlow();

      // Switch to sign in tab
      const signInTab = screen.getByRole('tab', { name: /sign in/i });
      fireEvent.click(signInTab);

      // Fill form with invalid credentials
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' },
      });

      const signInButton = screen.getByRole('button', { name: /^sign in$/i });
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument();
      });
    });

    it('should handle sign in validation errors', async () => {
      renderAuthFlow();

      // Switch to sign in tab
      const signInTab = screen.getByRole('tab', { name: /sign in/i });
      fireEvent.click(signInTab);

      // Try to submit without filling fields
      const signInButton = screen.getByRole('button', { name: /^sign in$/i });
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication State Management', () => {
    it('should handle authentication state changes', async () => {
      const mockUser = createMockUser();
      const mockSession = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
      };

      let authCallback: any;
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      renderAuthFlow();

      // Simulate successful authentication
      authCallback('SIGNED_IN', mockSession);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should handle sign out flow', async () => {
      let authCallback: any;
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      renderAuthFlow();

      // Simulate sign out
      authCallback('SIGNED_OUT', null);

      await waitFor(() => {
        // Should redirect to auth page or show sign in form
        expect(screen.getByRole('tab', { name: /sign in/i })).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      renderAuthFlow();

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      });
    });

    it('should validate password strength', async () => {
      renderAuthFlow();

      const passwordInput = screen.getByLabelText(/^password$/i);
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });
    });
  });
});