# Teller Plan Magic - Claude Code Assistant Context

## Project Overview
A React-based meal planning application built with TypeScript, Vite, and Supabase. The app allows users to create meal plans, manage recipes, generate shopping lists, and handle subscription-based features with Stripe integration.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: Tanstack Query, React Context
- **Payment Processing**: Stripe
- **Internationalization**: i18next
- **Charts**: Recharts

## Architecture
```
src/
├── components/
│   ├── ui/                    # Reusable UI components (Shadcn/ui)
│   ├── dashboard/            # Dashboard-specific components
│   └── [other components]    # Feature-specific components
├── pages/                    # Route components
├── hooks/                    # Custom React hooks
├── integrations/supabase/    # Supabase client and types
├── lib/                      # Utility functions
└── utils/                    # Additional utilities
```

## Key Features
- User authentication with role-based access (admin/user)
- Subscription management with Stripe
- Meal planning and recipe management
- Shopping list generation
- Dashboard with analytics
- Multi-language support
- Admin panel for user and payment management

## Development Commands
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # Run ESLint
npm run preview      # Preview production build
npm run test         # Run tests with Vitest
npm run test:run     # Run tests once
npm run test:ui      # Run tests with UI
```

## Database Schema
The application uses Supabase with the following key tables:
- `users` - User profiles and authentication
- `user_roles` - Role-based access control
- `meal_plans` - User meal planning data
- `recipes` - Recipe database
- `shopping_lists` - Generated shopping lists
- Payment and subscription tables managed by Stripe webhooks

## Environment Setup
The application uses environment variables for configuration. Copy `.env.example` to `.env` and configure:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

## Authentication Flow
- Uses Supabase Auth with email/password
- Role-based access control with `user_roles` table
- Protected routes with `ProtectedRoute` component
- Admin routes require `administrator` role

## Payment Integration
- Stripe checkout integration via Supabase Edge Functions
- Customer portal for subscription management
- Webhook handling for payment events
- Subscription status checking

## Code Style Guidelines
- TypeScript strict mode enabled
- ESLint configuration with React hooks rules
- Proper error handling with toast notifications
- Shadcn/ui component patterns
- React Query for server state management
- Context providers for global state
- Comprehensive test setup with Vitest

## Testing
- Test framework: Vitest with React Testing Library
- Test files: `src/test/*.test.tsx`
- Run tests: `npm run test`
- Mocked dependencies: Supabase client, toast notifications

## Recent Improvements (Applied)
- ✅ Enabled TypeScript strict mode
- ✅ Fixed all explicit 'any' type usage with proper types
- ✅ Fixed React hook dependency warnings
- ✅ Moved hardcoded credentials to environment variables
- ✅ Removed console.log statements
- ✅ Fixed Fast Refresh warnings in UI components
- ✅ Added comprehensive test setup with Vitest
- ✅ Removed duplicate files
- ✅ All ESLint errors and warnings resolved