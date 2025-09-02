# Teller Plan Magic - Project Structure

## Overview
A comprehensive React-based meal planning application with AI integration, subscription management, and advanced meal preparation features.

## Root Directory Structure
```
teller-plan-magic/
├── .claude/                      # Claude Code configuration
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore patterns
├── CLAUDE.md                     # Development context and instructions
├── TODO.md                       # Feature roadmap and improvement tasks
├── STRUCTURE.md                  # This file - project structure overview
├── README.md                     # Project documentation
├── package.json                  # Node.js dependencies and scripts
├── package-lock.json             # Dependency lock file
├── bun.lockb                     # Bun package manager lock file
├── components.json               # Shadcn/ui components configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── vite.config.ts                # Vite build configuration
├── vite.config.test.ts           # Vite test configuration
├── tsconfig.json                 # TypeScript configuration
├── tsconfig.app.json             # TypeScript app configuration
├── tsconfig.node.json            # TypeScript Node configuration
├── eslint.config.js              # ESLint configuration
├── index.html                    # Main HTML entry point
├── public/                       # Static assets
├── src/                          # Source code
├── db/                           # Database migrations (legacy)
└── supabase/                     # Supabase configuration and functions
```

## Source Code Structure (`src/`)
```
src/
├── main.tsx                      # Application entry point
├── App.tsx                       # Root application component
├── App.css                       # Global application styles
├── index.css                     # Global CSS imports and base styles
├── vite-env.d.ts                 # Vite environment types
├── i18n.ts                       # Internationalization configuration
├── assets/                       # Static assets
│   └── hero-tellerplan.jpg       # Hero image
├── components/                   # React components
│   ├── Header.tsx                # Main navigation header
│   ├── ContactForm.tsx           # Contact form component
│   ├── LanguageSwitcher.tsx      # Language selection component
│   ├── ProtectedRoute.tsx        # Authentication guard component
│   ├── SignatureGradient.tsx     # Branded gradient component
│   ├── UserMenu.tsx              # User account menu
│   ├── MealPlanTemplateSelector.tsx    # v1.1: Template selection interface
│   ├── SeasonalMealPlanning.tsx        # v1.1: Seasonal ingredient planning
│   ├── MealPlanCalendar.tsx            # v1.1: Calendar-based meal scheduling
│   ├── BatchCookingOptimizer.tsx       # v1.1: Batch cooking optimization
│   ├── ai/                       # AI-powered components
│   │   ├── AIMealPlanSuggestion.tsx    # AI meal plan generation
│   │   └── AIRecipeSuggestion.tsx      # AI recipe suggestions
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── ActivityChart.tsx     # User activity visualization
│   │   ├── CuisineChart.tsx      # Cuisine preference charts
│   │   ├── RecentActivity.tsx    # Recent activity feed
│   │   ├── StatCard.tsx          # Dashboard statistics cards
│   │   └── SubscriptionWidget.tsx # Subscription status widget
│   └── ui/                       # Reusable UI components (Shadcn/ui)
│       ├── accordion.tsx         # Collapsible content sections
│       ├── alert-dialog.tsx      # Modal alert dialogs
│       ├── alert.tsx             # Alert notifications
│       ├── aspect-ratio.tsx      # Responsive aspect ratio containers
│       ├── avatar.tsx            # User avatar components
│       ├── badge.tsx             # Label and status badges
│       ├── breadcrumb.tsx        # Navigation breadcrumbs
│       ├── button.tsx            # Button components with variants
│       ├── calendar.tsx          # Date picker calendar
│       ├── card.tsx              # Content cards with headers/footers
│       ├── carousel.tsx          # Image/content carousels
│       ├── chart.tsx             # Data visualization charts
│       ├── checkbox.tsx          # Checkbox form controls
│       ├── collapsible.tsx       # Expandable/collapsible content
│       ├── command.tsx           # Command palette interface
│       ├── context-menu.tsx      # Right-click context menus
│       ├── dialog.tsx            # Modal dialogs
│       ├── drawer.tsx            # Side panel drawers
│       ├── dropdown-menu.tsx     # Dropdown menus
│       ├── form.tsx              # Form validation components
│       ├── hover-card.tsx        # Hover preview cards
│       ├── input.tsx             # Text input components
│       ├── input-otp.tsx         # OTP/PIN input fields
│       ├── label.tsx             # Form field labels
│       ├── menubar.tsx           # Menu bar navigation
│       ├── navigation-menu.tsx   # Complex navigation menus
│       ├── pagination.tsx        # Page navigation controls
│       ├── popover.tsx           # Floating popover content
│       ├── progress.tsx          # Progress bars and indicators
│       ├── radio-group.tsx       # Radio button groups
│       ├── resizable.tsx         # Resizable panels/containers
│       ├── scroll-area.tsx       # Custom scrollable areas
│       ├── select.tsx            # Dropdown selection controls
│       ├── separator.tsx         # Visual content separators
│       ├── sheet.tsx             # Side sheets/panels
│       ├── sidebar.tsx           # Application sidebars
│       ├── skeleton.tsx          # Loading skeleton placeholders
│       ├── slider.tsx            # Range slider controls
│       ├── sonner.tsx            # Toast notification system
│       ├── switch.tsx            # Toggle switch controls
│       ├── table.tsx             # Data tables
│       ├── tabs.tsx              # Tabbed interfaces
│       ├── textarea.tsx          # Multi-line text inputs
│       ├── toast.tsx             # Toast notification components
│       ├── toaster.tsx           # Toast notification container
│       ├── toggle.tsx            # Toggle button controls
│       ├── toggle-group.tsx      # Grouped toggle controls
│       ├── tooltip.tsx           # Hover tooltips
│       └── use-toast.ts          # Toast notification hook
├── hooks/                        # Custom React hooks
│   ├── useAuth.tsx               # Authentication state management
│   ├── useSettings.tsx           # Application settings management
│   ├── useSubscription.tsx       # Subscription status management
│   ├── useSubscriptionAccess.tsx # Subscription feature access control
│   ├── useUserStats.tsx          # User statistics and analytics
│   ├── use-mobile.tsx            # Mobile device detection
│   └── use-toast.ts              # Toast notifications (duplicate)
├── integrations/                 # External service integrations
│   └── supabase/                 # Supabase backend integration
│       ├── client.ts             # Supabase client configuration
│       └── types.ts              # Supabase database type definitions
├── lib/                          # Utility libraries and business logic
│   ├── createAdminUser.ts        # Admin user creation utilities
│   ├── recipes.ts                # Recipe data structures and utilities
│   ├── utils.ts                  # General utility functions
│   └── mealPlanTemplates.ts      # v1.1: Meal plan templates and seasonal logic
├── pages/                        # Route-based page components
│   ├── Index.tsx                 # Landing page
│   ├── Auth.tsx                  # Authentication page
│   ├── Dashboard.tsx             # User dashboard with preferences
│   ├── MealPlans.tsx             # Meal plan management
│   ├── Recipes.tsx               # Recipe collection management
│   ├── CreateMealPlan.tsx        # Meal plan creation wizard
│   ├── CreateRecipe.tsx          # Recipe creation form
│   ├── Shopping.tsx              # Shopping list generation
│   ├── ShoppingLists.tsx         # Shopping list management
│   ├── Plan.tsx                  # Legacy meal planning
│   ├── Onboarding.tsx            # User onboarding flow
│   ├── AdminDashboard.tsx        # Admin panel with analytics
│   ├── AdminPayments.tsx         # Payment management interface
│   ├── Contact.tsx               # Contact form page
│   ├── Privacy.tsx               # Privacy policy
│   ├── Imprint.tsx               # Legal imprint
│   ├── NotFound.tsx              # 404 error page
│   └── index/                    # Landing page sections
│       ├── Hero.tsx              # Hero section component
│       ├── FAQ.tsx               # Frequently asked questions
│       └── Pricing.tsx           # Pricing plans display
└── utils/                        # Additional utilities
    └── createAdminUser.ts        # Admin user creation (duplicate)
```

## Supabase Backend Structure (`supabase/`)
```
supabase/
├── README.md                     # Supabase setup documentation
├── config.toml                   # Supabase project configuration
├── functions/                    # Edge Functions (serverless)
│   ├── ai-meal-plan-suggestions/ # AI-powered meal plan generation
│   │   └── index.ts
│   ├── ai-recipe-suggestions/    # AI-powered recipe suggestions
│   │   └── index.ts
│   ├── check-subscription/       # Subscription status validation
│   │   └── index.ts
│   ├── create-admin-user/        # Admin user creation endpoint
│   │   └── index.ts
│   ├── create-checkout/          # Stripe checkout session creation
│   │   └── index.ts
│   ├── customer-portal/          # Stripe customer portal access
│   │   └── index.ts
│   ├── manage-user-roles/        # User role management
│   │   └── index.ts
│   └── send-contact-email/       # Contact form email handling
│       └── index.ts
└── migrations/                   # Database schema migrations
    ├── 20250814055316_*.sql      # Initial schema setup
    ├── 20250814055354_*.sql      # User roles and permissions
    ├── 20250815071224_*.sql      # Recipe and meal plan tables
    ├── 20250816110430_*.sql      # Shopping list functionality
    ├── 20250816115559_*.sql      # User preferences
    ├── 20250816121538_*.sql      # Subscription integration
    ├── 20250816121813_*.sql      # Payment tracking
    ├── 20250817162751_*.sql      # Analytics and stats
    ├── 20250817165554_*.sql      # Settings and lookups
    ├── 20250817165611_*.sql      # Recipe ingredients
    ├── 20250817170248_*.sql      # Meal plan details
    ├── 20250817174216_*.sql      # Shopping list items
    └── 20250818151453_*.sql      # OpenAI API call logging
```

## Key Architecture Patterns

### Component Organization
- **UI Components**: Located in `src/components/ui/` following Shadcn/ui patterns
- **Feature Components**: Organized by functionality (dashboard/, ai/, etc.)
- **Page Components**: Route-based components in `src/pages/`
- **Custom Hooks**: Centralized state management in `src/hooks/`

### Data Flow
1. **Authentication**: `useAuth` hook manages user state
2. **API Integration**: Supabase client for all backend operations
3. **State Management**: React Context + Tanstack Query for server state
4. **Form Handling**: React Hook Form with Zod validation

### New v1.1 Features Architecture
- **Meal Plan Templates**: Template-based approach with predefined configurations
- **Seasonal Planning**: Season-aware ingredient suggestions and recipe matching
- **Calendar Integration**: Date-based meal scheduling with status tracking
- **Batch Cooking**: Optimization algorithms for time and effort savings

### Backend Architecture
- **Database**: PostgreSQL via Supabase with Row Level Security (RLS)
- **Authentication**: Supabase Auth with role-based access control
- **API**: Supabase Edge Functions for serverless operations
- **AI Integration**: OpenAI API through secure edge functions
- **Payments**: Stripe integration with webhook handling

### Security Considerations
- Row Level Security (RLS) on all database tables
- JWT-based authentication with automatic token refresh
- API keys managed through environment variables
- Admin functions protected by role-based access control

### Performance Optimizations
- Code splitting by route
- Lazy loading of heavy components
- Optimistic updates for better UX
- Caching strategies for frequently accessed data

### Development Workflow
- TypeScript strict mode for type safety
- ESLint for code quality enforcement
- Vitest for unit and integration testing
- Git-based version control with feature branches

## Database Schema Overview

### Core Tables
- `profiles` - User account information and preferences
- `user_roles` - Role-based access control (admin/user)
- `user_preferences` - Meal planning preferences and dietary restrictions
- `meal_plans` - User-created meal plans with metadata
- `recipes` - Recipe database with ingredients and instructions
- `shopping_lists` - Generated shopping lists with items
- `payments` - Stripe payment transaction records
- `openai_api_calls` - AI usage tracking and cost monitoring

### Lookup Tables
- `cuisines` - Available cuisine types
- `dietary_preferences` - Dietary restriction options
- `health_goals` - Health and wellness objectives
- `cooking_styles` - Cooking complexity preferences

## Configuration Files

### Build Configuration
- `vite.config.ts` - Main build configuration with plugins
- `vite.config.test.ts` - Test environment configuration
- `tailwind.config.ts` - Tailwind CSS customization
- `postcss.config.js` - CSS processing configuration

### TypeScript Configuration
- `tsconfig.json` - Base TypeScript configuration
- `tsconfig.app.json` - Application-specific TypeScript settings
- `tsconfig.node.json` - Node.js environment TypeScript settings

### Quality Assurance
- `eslint.config.js` - Code linting rules and plugins
- `.gitignore` - Version control exclusions
- `components.json` - Shadcn/ui component generation settings

## Deployment Architecture
- **Frontend**: Static site deployment (Vercel/Netlify compatible)
- **Backend**: Supabase hosted PostgreSQL and Edge Functions
- **CDN**: Static asset delivery through Supabase Storage
- **Analytics**: Built-in usage tracking and user behavior analysis
- **Monitoring**: Error tracking and performance monitoring integration

## Development Guidelines
- Follow TypeScript strict mode requirements
- Use Shadcn/ui components for consistency
- Implement proper error handling with toast notifications
- Maintain responsive design principles
- Follow React best practices with custom hooks
- Write tests for critical functionality
- Document new features in CLAUDE.md
- Use semantic versioning for releases