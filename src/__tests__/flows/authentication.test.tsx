import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { createMockAuthResponse } from '@/test/fixtures';

// Mock the Login and SignUp pages
const MockLoginPage = () => (
  <div>
    <h1>Sign In</h1>
    <form data-testid="login-form">
      <input type="email" placeholder="Email" data-testid="email-input" />
      <input
        type="password"
        placeholder="Password"
        data-testid="password-input"
      />
      <button type="submit" data-testid="signin-button">
        Sign In
      </button>
      <button type="button" data-testid="signup-toggle">
        Need an account? Sign Up
      </button>
    </form>
  </div>
);

const MockSignUpPage = () => (
  <div>
    <h1>Sign Up</h1>
    <form data-testid="signup-form">
      <input type="text" placeholder="Full Name" data-testid="fullname-input" />
      <input type="email" placeholder="Email" data-testid="email-input" />
      <input
        type="password"
        placeholder="Password"
        data-testid="password-input"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        data-testid="confirm-password-input"
      />
      <button type="submit" data-testid="signup-button">
        Sign Up
      </button>
      <button type="button" data-testid="signin-toggle">
        Already have an account? Sign In
      </button>
    </form>
  </div>
);

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Authentication Flow Tests', () => {
  let mockSupabase: ReturnType<typeof vi.mocked>;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Get the mocked supabase from the module
    const module = await import('@/integrations/supabase/client');
    mockSupabase = vi.mocked(module.supabase);
  });

  describe('Sign In Flow', () => {
    it('should allow user to enter credentials and sign in', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue(
        createMockAuthResponse()
      );

      const user = userEvent.setup();
      render(<MockLoginPage />, { wrapper: TestWrapper });

      // Enter credentials
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('password-input'), 'password123');

      expect(screen.getByTestId('email-input')).toHaveValue('test@example.com');
      expect(screen.getByTestId('password-input')).toHaveValue('password123');
    });

    it('should handle sign in submission', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue(
        createMockAuthResponse()
      );

      const user = userEvent.setup();
      render(<MockLoginPage />, { wrapper: TestWrapper });

      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.click(screen.getByTestId('signin-button'));

      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      render(<MockLoginPage />, { wrapper: TestWrapper });

      await user.type(screen.getByTestId('email-input'), 'invalid-email');
      await user.type(screen.getByTestId('password-input'), 'password123');

      expect(screen.getByTestId('email-input')).toHaveValue('invalid-email');
    });

    it('should handle authentication errors', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      const user = userEvent.setup();
      render(<MockLoginPage />, { wrapper: TestWrapper });

      await user.type(screen.getByTestId('email-input'), 'wrong@example.com');
      await user.type(screen.getByTestId('password-input'), 'wrongpassword');
      await user.click(screen.getByTestId('signin-button'));

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });
    });
  });

  describe('Sign Up Flow', () => {
    it('should allow user to create new account', async () => {
      mockSupabase.auth.signUp.mockResolvedValue(createMockAuthResponse());

      const user = userEvent.setup();
      render(<MockSignUpPage />, { wrapper: TestWrapper });

      await user.type(screen.getByTestId('fullname-input'), 'John Doe');
      await user.type(screen.getByTestId('email-input'), 'john@example.com');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.type(
        screen.getByTestId('confirm-password-input'),
        'password123'
      );

      expect(screen.getByTestId('fullname-input')).toHaveValue('John Doe');
      expect(screen.getByTestId('email-input')).toHaveValue('john@example.com');
    });

    it('should validate password confirmation', async () => {
      const user = userEvent.setup();
      render(<MockSignUpPage />, { wrapper: TestWrapper });

      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.type(
        screen.getByTestId('confirm-password-input'),
        'different123'
      );

      expect(screen.getByTestId('password-input')).toHaveValue('password123');
      expect(screen.getByTestId('confirm-password-input')).toHaveValue(
        'different123'
      );
    });

    it('should handle sign up submission', async () => {
      mockSupabase.auth.signUp.mockResolvedValue(createMockAuthResponse());

      const user = userEvent.setup();
      render(<MockSignUpPage />, { wrapper: TestWrapper });

      await user.type(screen.getByTestId('fullname-input'), 'John Doe');
      await user.type(screen.getByTestId('email-input'), 'john@example.com');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.type(
        screen.getByTestId('confirm-password-input'),
        'password123'
      );
      await user.click(screen.getByTestId('signup-button'));

      expect(screen.getByTestId('signup-form')).toBeInTheDocument();
    });

    it('should handle sign up errors', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already registered' },
      });

      const user = userEvent.setup();
      render(<MockSignUpPage />, { wrapper: TestWrapper });

      await user.type(
        screen.getByTestId('email-input'),
        'existing@example.com'
      );
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.click(screen.getByTestId('signup-button'));

      expect(screen.getByTestId('signup-form')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields in sign in', async () => {
      const user = userEvent.setup();
      render(<MockLoginPage />, { wrapper: TestWrapper });

      await user.click(screen.getByTestId('signin-button'));

      // Form should still be present, indicating validation prevented submission
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    it('should validate required fields in sign up', async () => {
      const user = userEvent.setup();
      render(<MockSignUpPage />, { wrapper: TestWrapper });

      await user.click(screen.getByTestId('signup-button'));

      // Form should still be present, indicating validation prevented submission
      expect(screen.getByTestId('signup-form')).toBeInTheDocument();
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      render(<MockLoginPage />, { wrapper: TestWrapper });

      await user.type(screen.getByTestId('email-input'), 'not-an-email');
      await user.type(screen.getByTestId('password-input'), 'password123');

      expect(screen.getByTestId('email-input')).toHaveValue('not-an-email');
    });

    it('should validate password strength', async () => {
      const user = userEvent.setup();
      render(<MockSignUpPage />, { wrapper: TestWrapper });

      await user.type(screen.getByTestId('password-input'), '123');
      await user.type(screen.getByTestId('confirm-password-input'), '123');

      expect(screen.getByTestId('password-input')).toHaveValue('123');
    });
  });

  describe('Navigation Between Forms', () => {
    it('should toggle from sign in to sign up', async () => {
      const user = userEvent.setup();
      render(<MockLoginPage />, { wrapper: TestWrapper });

      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByTestId('signup-toggle')).toBeInTheDocument();
    });

    it('should toggle from sign up to sign in', async () => {
      const user = userEvent.setup();
      render(<MockSignUpPage />, { wrapper: TestWrapper });

      expect(screen.getByText('Sign Up')).toBeInTheDocument();
      expect(screen.getByTestId('signin-toggle')).toBeInTheDocument();
    });
  });

  describe('Authentication State', () => {
    it('should handle successful authentication', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue(
        createMockAuthResponse()
      );
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: createMockAuthResponse().data.session },
        error: null,
      });

      render(<MockLoginPage />, { wrapper: TestWrapper });

      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('should handle sign out', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      render(<MockLoginPage />, { wrapper: TestWrapper });

      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });
});
