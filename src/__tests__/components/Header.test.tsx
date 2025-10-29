import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { render } from '@/test-utils/render';
import { createMockUser } from '@/test/fixtures';

// Mock the useAuth hook
vi.mock('@/hooks/useAuth');
const mockUseAuth = vi.mocked(useAuth);

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render logo and navigation for unauthenticated user', () => {
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

    render(<Header />);

    expect(screen.getByText('Teller Plan Magic')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('should render user navigation for authenticated user', () => {
    const mockUser = createMockUser();
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

    render(<Header />);

    expect(screen.getByText('Teller Plan Magic')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /recipes/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /meal plans/i })).toBeInTheDocument();
    
    // User menu should be present
    expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument();
  });

  it('should render admin navigation for admin user', () => {
    const mockUser = createMockUser();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      userRole: 'administrator',
      isLoading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      isAdmin: true,
    });

    render(<Header />);

    expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument();
  });

  it('should handle sign out', async () => {
    const mockSignOut = vi.fn();
    const mockUser = createMockUser();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      userRole: 'user',
      isLoading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: mockSignOut,
      isAdmin: false,
    });

    render(<Header />);

    // Open user menu
    const userMenuButton = screen.getByRole('button', { name: /user menu/i });
    fireEvent.click(userMenuButton);

    // Click sign out
    const signOutButton = screen.getByRole('menuitem', { name: /sign out/i });
    fireEvent.click(signOutButton);

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should show loading state', () => {
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

    render(<Header />);

    expect(screen.getByText('Teller Plan Magic')).toBeInTheDocument();
    // Should show loading indicator or skeleton
    expect(screen.getByTestId('header-loading')).toBeInTheDocument();
  });

  it('should toggle mobile menu', () => {
    const mockUser = createMockUser();
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

    render(<Header />);

    // Mobile menu button should be present
    const mobileMenuButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(mobileMenuButton).toBeInTheDocument();

    // Click to open mobile menu
    fireEvent.click(mobileMenuButton);

    // Mobile menu should be visible
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
  });

  it('should display user email in user menu', () => {
    const mockUser = createMockUser({ email: 'test@example.com' });
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

    render(<Header />);

    // Open user menu
    const userMenuButton = screen.getByRole('button', { name: /user menu/i });
    fireEvent.click(userMenuButton);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should handle navigation correctly', () => {
    const mockUser = createMockUser();
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

    render(<Header />);

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    const recipesLink = screen.getByRole('link', { name: /recipes/i });
    const mealPlansLink = screen.getByRole('link', { name: /meal plans/i });

    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(recipesLink).toHaveAttribute('href', '/recipes');
    expect(mealPlansLink).toHaveAttribute('href', '/meal-plans');
  });
});