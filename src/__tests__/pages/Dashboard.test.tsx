import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { Dashboard } from '@/pages/Dashboard';
import { useAuth } from '@/hooks/useAuth';
import { useUserStats } from '@/hooks/useUserStats';
import { useSubscription } from '@/hooks/useSubscription';
import { render } from '@/test-utils/render';
import { createMockUser } from '@/test/fixtures';

// Mock hooks
vi.mock('@/hooks/useAuth');
vi.mock('@/hooks/useUserStats');
vi.mock('@/hooks/useSubscription');

const mockUseAuth = vi.mocked(useAuth);
const mockUseUserStats = vi.mocked(useUserStats);
const mockUseSubscription = vi.mocked(useSubscription);

describe('Dashboard', () => {
  const mockUser = createMockUser();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      userRole: 'user',
      isLoading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      isAdmin: false,
    });

    mockUseUserStats.mockReturnValue({
      loading: false,
      stats: {
        totalRecipes: 5,
        totalMealPlans: 3,
        totalShoppingLists: 2,
      },
      refreshStats: vi.fn(),
    });

    mockUseSubscription.mockReturnValue({
      subscription: {
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
      },
      isLoading: false,
      error: null,
      checkSubscription: vi.fn(),
    });
  });

  it('should render dashboard with user stats', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
      expect(screen.getByText('Total Recipes')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Total Meal Plans')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Total Shopping Lists')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    mockUseUserStats.mockReturnValue({
      loading: true,
      stats: {
        totalRecipes: 0,
        totalMealPlans: 0,
        totalShoppingLists: 0,
      },
      refreshStats: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
  });

  it('should show subscription status for free user', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Free Plan')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /upgrade to premium/i })).toBeInTheDocument();
    });
  });

  it('should show subscription status for premium user', async () => {
    mockUseSubscription.mockReturnValue({
      subscription: {
        subscribed: true,
        subscription_tier: 'premium',
        subscription_end: '2024-12-31',
      },
      isLoading: false,
      error: null,
      checkSubscription: vi.fn(),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Premium Plan')).toBeInTheDocument();
      expect(screen.getByText(/expires.*2024-12-31/i)).toBeInTheDocument();
    });
  });

  it('should show quick actions', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /create new recipe/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /create meal plan/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /view all recipes/i })).toBeInTheDocument();
    });
  });

  it('should handle auth loading state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      userRole: null,
      isLoading: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      isAdmin: false,
    });

    render(<Dashboard />);

    expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
  });

  it('should redirect unauthenticated users', () => {
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

    render(<Dashboard />);

    // Should show some kind of redirect or unauthorized message
    expect(screen.getByText(/please sign in/i)).toBeInTheDocument();
  });

  it('should show recent activity section', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });

  it('should handle subscription loading', () => {
    mockUseSubscription.mockReturnValue({
      subscription: null,
      isLoading: true,
      error: null,
      checkSubscription: vi.fn(),
    });

    render(<Dashboard />);

    // Should show loading state for subscription section
    expect(screen.getByTestId('subscription-loading')).toBeInTheDocument();
  });

  it('should handle subscription error', async () => {
    mockUseSubscription.mockReturnValue({
      subscription: null,
      isLoading: false,
      error: 'Failed to load subscription',
      checkSubscription: vi.fn(),
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load subscription/i)).toBeInTheDocument();
    });
  });

  it('should show user welcome message with correct name', async () => {
    const customUser = createMockUser({
      user_metadata: { first_name: 'John', last_name: 'Doe' }
    });

    mockUseAuth.mockReturnValue({
      user: customUser,
      session: null,
      userRole: 'user',
      isLoading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      isAdmin: false,
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Welcome back, John Doe!')).toBeInTheDocument();
    });
  });
});