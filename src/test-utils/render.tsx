import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { mockUser } from '@/test/mocks/supabase';

// Mock AuthContext
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const mockAuthValue = {
    user: mockUser,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    isAdmin: false,
  };

  return React.createElement(AuthProvider as any, { value: mockAuthValue }, children);
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  user?: typeof mockUser | null;
  isAdmin?: boolean;
  queryClient?: QueryClient;
}

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  const {
    initialEntries = ['/'],
    user = mockUser,
    isAdmin = false,
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const authValue = {
      user,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      isAdmin,
    };

    return (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <div data-testid="mock-auth-provider">
            {React.createElement('div', { 
              'data-auth-user': user?.id,
              'data-auth-admin': isAdmin.toString()
            }, children)}
          </div>
          <Toaster />
        </QueryClientProvider>
      </BrowserRouter>
    );
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };