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

## v1.1 New Features (Smart Meal Plan Generation)
- ✅ **Meal Plan Templates**: Implemented pre-built templates (Busy Week, Family Friendly, Budget Conscious) with customizable preferences and meal suggestions
- ✅ **Seasonal Meal Planning**: Added seasonal ingredient suggestions, peak season tracking, storage/budget tips, and seasonal recipe recommendations
- ✅ **Calendar Integration**: Created comprehensive meal plan scheduling with calendar view, meal status tracking, and prep time management
- ✅ **Batch Cooking Optimization**: Implemented intelligent batch cooking suggestions with time savings calculations, storage optimization, and step-by-step instructions

### New Components Added:
- `src/lib/mealPlanTemplates.ts` - Core logic for templates, seasonal ingredients, and batch cooking
- `src/components/MealPlanTemplateSelector.tsx` - Template selection with detailed preview and customization
- `src/components/SeasonalMealPlanning.tsx` - Seasonal ingredient planning with recipe suggestions
- `src/components/MealPlanCalendar.tsx` - Calendar-based meal scheduling with status tracking
- `src/components/BatchCookingOptimizer.tsx` - Intelligent batch cooking optimization with time savings

### Enhanced Functionality:
- Smart meal plan generation with template-based approach
- Seasonal awareness with ingredient peak season tracking
- Calendar integration for better meal scheduling
- Batch cooking optimization to save preparation time
- Advanced meal planning logic with preferences integration

## v1.2 Enhanced Recipe Integration Features
- ✅ **Recipe Rating and Review System**: Comprehensive rating system with star ratings, detailed reviews, helpful voting, and rating distribution analytics
- ✅ **Cooking Time Estimation**: Skill-based time estimation with confidence levels, adjustment factors, and personalized cooking tips
- ✅ **Recipe Scaling**: Dynamic recipe scaling for different serving sizes with ingredient precision tracking and equipment adjustments
- ✅ **Recipe Variations**: Smart recipe variations with dietary substitutions, spice level adjustments, and cuisine style adaptations
- ✅ **Nutritional Analysis**: Complete nutritional breakdown with macro/micronutrient tracking, daily value calculations, and health badge system

### New Components Added:
- `src/lib/recipeEnhancements.ts` - Core business logic for recipe rating, scaling, variations, nutrition, and time estimation
- `src/components/RecipeRatingReview.tsx` - Comprehensive rating and review system with user feedback and analytics
- `src/components/CookingTimeEstimator.tsx` - Skill-based cooking time estimation with confidence tracking
- `src/components/RecipeScaler.tsx` - Recipe scaling with precision tracking and equipment adjustments
- `src/components/RecipeVariations.tsx` - Smart recipe variations with ingredient substitutions and dietary adaptations
- `src/components/NutritionalAnalysis.tsx` - Complete nutritional analysis with macro/micro tracking and health insights

### Enhanced Recipe Functionality:
- Advanced rating and review system with helpful voting and verification
- Personalized cooking time estimates based on user skill level
- Dynamic recipe scaling with mathematical precision and equipment considerations
- Intelligent recipe variations for dietary preferences and cooking styles
- Comprehensive nutritional analysis with daily value tracking and health recommendations

## v1.3 Intelligent Shopping List Features
- ✅ **Price Comparison Integration**: Real-time price comparison across major grocery stores with availability tracking, delivery options, and savings analysis
- ✅ **Smart Ingredient Substitutions**: AI-powered substitution suggestions with price, health, and availability considerations
- ✅ **Pantry Inventory Management**: Complete pantry tracking with low stock alerts, expiration monitoring, and automatic shopping list integration
- ✅ **Shopping List Optimization**: Store layout-based route optimization with time estimates, aisle organization, and efficiency improvements
- ✅ **Bulk Buying Recommendations**: Intelligent bulk purchasing suggestions with savings calculations, storage requirements, and usage frequency analysis

### New Components Added:
- `src/lib/shoppingOptimization.ts` - Core business logic for price comparison, substitutions, pantry management, route optimization, and bulk buying
- `src/components/PriceComparisonWidget.tsx` - Multi-store price comparison with real-time updates and savings analysis
- `src/components/SmartSubstitutionsPanel.tsx` - AI-powered ingredient substitutions with confidence scoring and health benefits
- `src/components/PantryInventoryManager.tsx` - Complete pantry management with inventory tracking and smart reordering
- `src/components/ShoppingListOptimizer.tsx` - Store layout optimization with route planning and progress tracking
- `src/components/BulkBuyingRecommendations.tsx` - Intelligent bulk purchasing with savings analysis and storage considerations

### Enhanced Shopping Functionality:
- Real-time price comparison across multiple grocery stores with availability and delivery tracking
- Smart ingredient substitutions with price, health, and availability optimization
- Comprehensive pantry inventory management with expiration monitoring and low stock alerts
- Intelligent shopping route optimization based on store layouts for maximum efficiency
- Advanced bulk buying recommendations with detailed savings analysis and storage planning