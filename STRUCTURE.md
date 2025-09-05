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
│   ├── RecipeRatingReview.tsx          # v1.2: Recipe rating and review system
│   ├── CookingTimeEstimator.tsx        # v1.2: Skill-based cooking time estimation
│   ├── RecipeScaler.tsx                # v1.2: Recipe scaling for different serving sizes
│   ├── RecipeVariations.tsx            # v1.2: Recipe variation suggestions and substitutions
│   ├── NutritionalAnalysis.tsx         # v1.2: Complete nutritional analysis and tracking
│   ├── PriceComparisonWidget.tsx       # v1.3: Multi-store price comparison with savings analysis
│   ├── SmartSubstitutionsPanel.tsx     # v1.3: AI-powered ingredient substitutions with confidence scoring
│   ├── PantryInventoryManager.tsx      # v1.3: Complete pantry management with inventory tracking
│   ├── ShoppingListOptimizer.tsx       # v1.3: Store layout optimization with route planning
│   ├── BulkBuyingRecommendations.tsx   # v1.3: Intelligent bulk purchasing with savings analysis
│   ├── SmartRecommendationDisplay.tsx  # v1.4: Intelligent recommendation display with categorized suggestions
│   ├── MealPlanSuccessTracker.tsx      # v1.4: Comprehensive meal plan tracking with detailed feedback collection
│   ├── TasteProfileLearning.tsx        # v1.4: Taste profile visualization with learning insights
│   ├── SeasonalPreferenceAdaptation.tsx # v1.4: Seasonal adaptation interface with ingredient recommendations
│   ├── RecipeSharing.tsx               # v1.5: Advanced recipe sharing interface with friend selection and permission management
│   ├── FamilyMealPlanCollaboration.tsx # v1.5: Family collaboration system with real-time activity feeds
│   ├── CommunityRecipeCollections.tsx  # v1.5: Community-driven recipe collections with curation tools
│   ├── CookingAchievements.tsx         # v1.5: Comprehensive achievement system with progress tracking
│   ├── RecipeImportWizard.tsx          # v1.5: Multi-step recipe import wizard with URL extraction and photo OCR
│   ├── NutritionalGoalTracker.tsx      # v1.6: Goal setting and real-time nutritional balance tracking
│   ├── MealPlanBudgetTracker.tsx       # v1.6: Budget management with spending analysis and category breakdowns
│   ├── LeftoverManager.tsx             # v1.6: Leftover inventory tracking with expiration alerts and meal rotation
│   ├── SpecialOccasionPlanner.tsx      # v1.6: Event planning interface with timeline management and guest requirements
│   ├── MealPlanAnalytics.tsx           # v1.6: Analytics dashboard with interactive charts and trend analysis
│   ├── OfflineShoppingList.tsx        # v1.7: Comprehensive offline shopping list management with sync status tracking
│   ├── VoiceActivatedCooking.tsx       # v1.7: Voice-controlled cooking interface with speech recognition and synthesis
│   ├── CookingTimer.tsx                # v1.7: Advanced timer system with notifications, presets, and background operation
│   ├── PWAManager.tsx                  # v1.7: PWA status dashboard with installation prompts, cache management, and settings
│   ├── GroceryDeliveryIntegration.tsx  # v1.8: Full grocery delivery interface with service selection, product browsing, and cart management
│   ├── FitnessAppsIntegration.tsx      # v1.8: Fitness app connections with nutrition syncing, activity tracking, and goal management
│   ├── CalendarIntegration.tsx         # v1.8: Calendar provider integration with meal plan synchronization and event creation
│   ├── SmartApplianceIntegration.tsx   # v1.8: Smart appliance discovery, connection, and control with automated cooking programs
│   ├── BarcodeScanningIntegration.tsx  # v1.8: Barcode scanning interface with camera integration and pantry management
│   ├── UserAnalyticsDashboard.tsx      # v1.9: Main analytics dashboard with comprehensive metrics visualization and trend analysis
│   ├── CookingAnalyticsWidget.tsx      # v1.9: Compact cooking analytics widget for dashboard integration with key metrics
│   ├── RecipePopularityTracker.tsx     # v1.9: Detailed recipe performance analysis with popularity rankings and cuisine analytics
│   ├── SeasonalTrendsAnalyzer.tsx      # v1.9: Seasonal pattern analysis with ingredient trends and cooking pattern insights
│   ├── UserEngagementMetrics.tsx       # v1.9: Comprehensive engagement tracking with achievement progress and personalized recommendations
│   ├── AdminEngagementAnalytics.tsx    # v2.0: Advanced admin engagement analytics dashboard with user segmentation and behavioral analysis
│   ├── ABTestingManager.tsx            # v2.0: Complete A/B testing management interface with experiment creation and statistical analysis
│   ├── CustomerLifecycleAnalysis.tsx   # v2.0: Customer lifecycle tracking dashboard with stage progression and retention optimization
│   ├── ChurnPredictionDashboard.tsx    # v2.0: Churn prediction and prevention dashboard with risk assessment and intervention management
│   ├── FeatureUsageAnalytics.tsx       # v2.0: Feature usage analytics platform with adoption tracking and performance analysis
│   ├── PremiumRecipeCollections.tsx  # v2.1: Celebrity chef recipe collections with premium content browser and chef profiles
│   ├── AINutritionistConsultation.tsx # v2.1: AI nutritionist consultation platform with health metrics and goal management
│   ├── MealPlanHistoryManager.tsx     # v2.1: Unlimited meal plan history with advanced filtering and detailed analytics
│   ├── PrioritySupportCenter.tsx      # v2.1: Priority support system with real-time chat and agent management
│   ├── ExportManager.tsx              # v2.1: Advanced export functionality with multiple formats and custom styling
│   ├── ChefPublishingPortal.tsx       # v2.2: Professional chef portal with recipe publishing, analytics, and revenue tracking
│   ├── SponsoredContentManager.tsx    # v2.2: Sponsorship campaign manager with brand partnerships and performance tracking
│   ├── RecipeLicensingSystem.tsx      # v2.2: Recipe licensing platform with agreement management and royalty collection
│   ├── OptimizedImage.tsx             # v2.3: Advanced image component with progressive loading, WebP support, and lazy loading
│   ├── PerformanceDashboard.tsx       # v2.3: Performance monitoring dashboard with cache analytics and optimization controls
│   ├── RealtimeShoppingList.tsx       # v2.4: Real-time collaborative shopping list interface with live updates and user presence
│   ├── LiveCookingSession.tsx          # v2.4: Interactive cooking session platform with step guidance and participant management
│   ├── RealtimeMealPlan.tsx            # v2.4: Collaborative meal planning with live editing and multi-user synchronization
│   ├── AIRecipeImageAnalyzer.tsx       # v2.5: Advanced AI image analysis for recipe creation with computer vision and ingredient detection
│   ├── NaturalLanguageRecipeParser.tsx # v2.5: Intelligent recipe parsing from unstructured text with natural language processing
│   ├── AIAdvancedNutritionAnalyzer.tsx # v2.5: Comprehensive AI-powered nutrition analysis with health scoring and personalized insights
│   ├── IntelligentMealTimingSuggester.tsx # v2.5: Smart meal timing optimization with circadian rhythm analysis and energy pattern recognition
│   ├── DataAnalyticsDashboard.tsx        # v3.0: Advanced analytics dashboard with multi-dimensional data visualization and behavioral insights
│   ├── SecurityDashboard.tsx             # v3.1: Comprehensive security dashboard with rate limiting, audit logs, GDPR compliance, 2FA, and role management
│   ├── OnboardingDashboard.tsx           # v3.2: Interactive onboarding dashboard with tutorials, skill assessment, wizard workflows, and sample meal plans
│   ├── RetentionDashboard.tsx            # v3.3: Comprehensive retention dashboard with cooking streaks, habit tracking, reminders, challenges, milestones, and referral program
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
├── __tests__/                    # Comprehensive test suite
│   ├── hooks/                    # Custom hook unit tests
│   │   ├── useAuth.test.tsx      # Authentication hook testing with mock Supabase
│   │   ├── useSubscription.test.tsx # Subscription management testing
│   │   ├── useSettings.test.tsx  # Settings loading and error handling tests
│   │   └── useUserStats.test.tsx # User statistics aggregation tests
│   ├── components/               # Component testing
│   │   ├── Header.test.tsx       # Navigation and user menu testing
│   │   └── ui/                   # UI component tests
│   │       └── Button.test.tsx   # Button variants and interaction tests
│   ├── pages/                    # Page component integration tests
│   │   └── Dashboard.test.tsx    # Dashboard functionality and state management
│   ├── utils/                    # Utility function tests
│   │   ├── utils.test.ts         # className utility (cn function) tests
│   │   └── recipes.test.ts       # Recipe utilities and alternative finding tests
│   └── integration/              # Integration and end-to-end tests
│       └── auth.test.tsx         # Complete authentication flow testing
├── test/                         # Test configuration and utilities
│   ├── setup.ts                  # Global test setup, mocks, and configuration
│   ├── mocks/                    # Mock implementations
│   │   └── supabase.ts          # Comprehensive Supabase client mocks
│   ├── fixtures/                 # Test data factories
│   │   └── index.ts             # Reusable test data generation
│   └── utils/                    # Test utility functions
└── test-utils/                   # Custom testing utilities
    └── render.tsx               # Enhanced React Testing Library render function
├── integrations/                 # External service integrations
│   └── supabase/                 # Supabase backend integration
│       ├── client.ts             # Supabase client configuration
│       └── types.ts              # Supabase database type definitions
├── lib/                          # Utility libraries and business logic
│   ├── createAdminUser.ts        # Admin user creation utilities
│   ├── recipes.ts                # Recipe data structures and utilities
│   ├── utils.ts                  # General utility functions
│   ├── mealPlanTemplates.ts      # v1.1: Meal plan templates and seasonal logic
│   ├── recipeEnhancements.ts     # v1.2: Recipe rating, scaling, variations, nutrition, and time estimation logic
│   ├── shoppingOptimization.ts   # v1.3: Price comparison, substitutions, pantry management, route optimization, and bulk buying logic
│   ├── smartRecommendations.ts   # v1.4: ML recommendation engine with taste profiling, success tracking, and seasonal adaptation
│   ├── socialFeatures.ts         # v1.5: Social features service with user profiles, friend connections, sharing permissions, and achievements
│   ├── advancedPlanningTools.ts  # v1.6: Nutritional tracking, budget management, leftover handling, special events, and analytics
│   ├── pwaUtils.ts               # v1.7: Core PWA utilities with offline storage, network management, and service worker integration
│   ├── thirdPartyIntegrations.ts # v1.8: Comprehensive integration service layer with mock API implementations for all third-party services
│   ├── userAnalytics.ts          # v1.9: Core analytics service with comprehensive tracking capabilities and statistical analysis algorithms
│   ├── adminBusinessIntelligence.ts # v2.0: Comprehensive business intelligence service with user engagement analytics, A/B testing framework, and churn prediction models
│   ├── premiumFeatures.ts        # v2.1: Premium subscription service with celebrity chef collections, AI nutritionist, unlimited history, priority support, and export functionality
│   ├── marketplaceFeatures.ts    # v2.2: Marketplace service layer with chef profiles, affiliate marketing, sponsorship management, and licensing framework
│   ├── caching.ts                # v2.3: Complete caching infrastructure with Redis, memory cache, CDN service, and database optimization
│   ├── realtime.ts               # v2.4: Real-time infrastructure with Socket.IO client management, event handling, and WebSocket communication
│   ├── enhancedAI.ts             # v2.5: Comprehensive AI service layer with fine-tuned models, image analysis, recipe parsing, nutrition analysis, and meal timing intelligence
│   ├── dataAnalytics.ts          # v3.0: Comprehensive data analytics service with user behavior tracking, recipe success analytics, seasonal analysis, and cost optimization algorithms
│   ├── enhancedSecurity.ts       # v3.1: Comprehensive security service with rate limiting, audit logging, GDPR compliance, two-factor authentication, and enhanced role-based permissions
│   ├── improvedOnboarding.ts     # v3.2: Comprehensive onboarding service with tutorial management, skill assessment, preference learning, wizard workflows, and sample meal plan generation
│   └── retentionFeatures.ts      # v3.3: Comprehensive retention service with cooking streak tracking, habit management, reminder scheduling, challenge creation, milestone monitoring, and referral program functionality
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
│   ├── send-contact-email/       # Contact form email handling
│   │   └── index.ts
│   ├── enhanced-ai-recipe-generation/ # v2.5: Fine-tuned AI recipe generation with specialized models
│   │   └── index.ts
│   ├── ai-image-recipe-analysis/ # v2.5: Computer vision recipe analysis from food photos
│   │   └── index.ts
│   ├── ai-recipe-parser/         # v2.5: Natural language recipe parsing from unstructured text
│   │   └── index.ts
│   ├── ai-nutrition-analysis/    # v2.5: Comprehensive AI-powered nutritional analysis
│   │   └── index.ts
│   └── ai-meal-timing/           # v2.5: Intelligent meal timing optimization with circadian rhythm analysis
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

## Real-time Services Structure (`realtime-services/`)
```
realtime-services/
├── socketio/                     # Socket.IO WebSocket server
│   ├── server.js                 # Main Socket.IO server with Redis adapter
│   ├── package.json              # Node.js dependencies for real-time services
│   └── .env                      # Real-time service environment variables
├── notifications/                # Push notification service
│   ├── server.js                 # Web Push notification server
│   ├── package.json              # Notification service dependencies
│   └── templates/                # Notification message templates
├── jobs/                         # Background job processor
│   ├── processor.js              # RabbitMQ job queue processor
│   ├── package.json              # Job processor dependencies
│   └── schedulers/               # Scheduled job definitions
└── ws-adapter/                   # WebSocket scaling adapter
    ├── adapter.js                # Redis-based Socket.IO adapter
    └── package.json              # Adapter service dependencies
```

## Docker Infrastructure
```
├── docker-compose.yml            # Main application services
├── docker-compose.realtime.yml   # Real-time services extension
├── docker-compose.override.yml   # Development overrides
├── docker-compose.prod.yml       # Production configuration
├── Dockerfile                    # Multi-stage Docker build
├── nginx.conf                    # Production Nginx configuration
├── redis.conf                    # Redis server configuration
└── scripts/                      # Docker management scripts
    ├── docker-dev.sh             # Development environment helper
    ├── docker-prod.sh            # Production deployment helper
    ├── docker-fresh-start.sh     # Complete environment reset
    └── docker-restart.sh         # Quick restart helper
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

### New v1.2 Enhanced Recipe Integration Architecture
- **Recipe Rating System**: Comprehensive rating and review system with analytics and user feedback
- **Cooking Time Estimation**: Skill-based time estimation with confidence levels and adjustment factors
- **Recipe Scaling**: Mathematical recipe scaling with precision tracking and equipment considerations
- **Recipe Variations**: Intelligent recipe variations with dietary substitutions and cuisine adaptations
- **Nutritional Analysis**: Complete nutritional breakdown with macro/micronutrient tracking and daily values

### New v1.3 Intelligent Shopping List Architecture
- **Price Comparison System**: Multi-store price comparison with real-time updates, availability tracking, and savings optimization
- **Smart Substitutions Engine**: AI-powered ingredient substitutions with confidence scoring, health benefits, and cost analysis
- **Pantry Inventory Management**: Complete inventory tracking with expiration monitoring, low stock alerts, and automated reordering
- **Shopping Route Optimization**: Store layout-based route planning with time estimates, aisle organization, and progress tracking
- **Bulk Buying Intelligence**: Advanced bulk purchasing recommendations with savings calculations, storage analysis, and usage patterns

### New v1.4 User Experience & Personalization Architecture
- **Smart Recommendations Engine**: Machine learning-powered personalized recipe recommendations with ML-based scoring algorithms
- **Meal Plan Success Rate Tracking**: Comprehensive tracking of what users actually cook vs. what they plan, with success rate analytics
- **Taste Profile Learning**: AI system that learns from user interactions (views, likes, saves, cooks) to build detailed taste preferences
- **Seasonal Preference Adaptation**: Dynamic seasonal recommendations based on ingredient availability, weather patterns, and user seasonal cooking history

### New v1.5 Social & Community Architecture
- **Recipe Sharing System**: Comprehensive recipe sharing with granular permissions, friend connections, and family group management
- **Meal Plan Collaboration**: Real-time family collaboration on meal plans with role-based permissions, activity tracking, and voting systems
- **Community Recipe Collections**: Curated recipe collections with community features, subscriptions, ratings, and featured content
- **Cooking Achievement System**: Gamified cooking experience with badges, levels, progress tracking, and milestone rewards
- **Recipe Import Engine**: AI-powered recipe import with URL extraction and OCR-based photo processing

### New v1.6 Advanced Planning Tools Architecture
- **Nutritional Goal System**: Comprehensive nutritional goal setting with daily/weekly/monthly targets, real-time balance scoring, and intelligent recommendations
- **Budget Management System**: Detailed budget tracking with category allocations, spending analysis, variance monitoring, and savings opportunities identification
- **Leftover Management Engine**: Smart leftover tracking with expiration monitoring, storage optimization, meal rotation rules, and waste reduction algorithms
- **Special Occasion Planning**: Complete event planning system for holidays and celebrations with guest management, dietary requirements, and preparation timelines
- **Analytics Platform**: Advanced analytics dashboard with cost trends, nutrition analysis, time tracking, preference insights, and machine learning-powered recommendations

### New v1.7 Progressive Web App Architecture
- **Service Worker Framework**: Comprehensive caching strategies with network-first for APIs, cache-first for static assets, and intelligent offline fallback mechanisms
- **Offline Storage System**: IndexedDB-based persistent storage with structured data management, sync status tracking, and conflict resolution algorithms
- **Voice Interface Engine**: Speech recognition and synthesis with natural language processing, cooking-specific command recognition, and customizable voice settings
- **Timer Management System**: Advanced multi-timer functionality with background operation, push notifications, wake lock support, and preset configurations
- **PWA Installation Framework**: Native app installation prompts, manifest configuration, shortcut management, and platform-specific optimizations
- **Background Sync Engine**: Automatic synchronization with conflict detection, retry mechanisms, and offline operation continuity
- **Cache Management System**: Intelligent storage quota monitoring, cleanup utilities, and performance optimization for offline-first experience

### New v1.8 Third-Party Integrations Architecture
- **Grocery Delivery Integration**: Complete integration framework with Instacart, Amazon Fresh, and Walmart Grocery APIs supporting product search, cart management, delivery scheduling, and real-time order tracking
- **Fitness Apps Integration**: Comprehensive fitness ecosystem connectivity with MyFitnessPal, Fitbit, Apple Health, Google Fit, Strava, and Cronometer supporting nutrition synchronization, activity monitoring, goal alignment, and personalized recommendations
- **Calendar Integration System**: Multi-provider calendar synchronization with Google Calendar, Microsoft Outlook, Apple Calendar, and CalDAV supporting automated meal plan event creation, preparation reminders, and scheduling optimization
- **Smart Kitchen Appliances**: Device integration platform supporting smart ovens, induction cooktops, sous vide cookers, multicookers, air fryers, and refrigerators with device discovery, remote control, automated cooking program execution, and recipe integration
- **Barcode Scanning & Pantry Management**: Advanced scanning system with camera integration, product identification, automated inventory tracking, expiration monitoring, low stock alerts, and seamless shopping list integration
- **Mock API Infrastructure**: Complete development-ready mock API implementations for all integrated services with realistic data simulation, authentication flows, and error handling
- **Service Abstraction Layer**: Unified interface supporting multiple providers per integration type with standardized data formats, authentication management, and seamless provider switching
- **Data Synchronization Engine**: Bi-directional sync capabilities with conflict resolution, offline support, retry mechanisms, and real-time status tracking

### New v1.9 User Analytics Dashboard Architecture
- **Cooking Session Tracking System**: Complete cooking session lifecycle tracking with start/end times, success ratings, difficulty assessment, ingredient logging, and real-time analytics
- **Recipe Performance Analytics Engine**: Advanced recipe analytics with popularity scoring algorithm, success rate calculations, trend analysis, cuisine-based filtering, and user demographic insights
- **Seasonal Analysis Framework**: Sophisticated seasonal pattern recognition with cuisine popularity trends, ingredient seasonality scoring, weather-based cooking patterns, and predictive seasonal recommendations
- **User Engagement Measurement Platform**: Multi-dimensional engagement tracking covering cooking frequency, platform usage, social interactions, achievement progress, and personalized skill development insights
- **Analytics Visualization System**: Comprehensive chart library integration with interactive dashboards, trend indicators, comparative analytics, and real-time data visualization
- **Predictive Analytics Engine**: Machine learning-powered insights for recipe recommendations, seasonal cooking suggestions, engagement optimization, and personalized user journey enhancement
- **Performance Dashboard Framework**: Executive-level analytics interface for administrators with user growth metrics, platform engagement analysis, content performance tracking, and business intelligence integration

### New v2.0 Admin Business Intelligence & Analytics Suite Architecture
- **User Engagement Analytics Platform**: Advanced admin dashboard with multi-dimensional engagement tracking, behavioral pattern analysis, user segmentation, cohort analysis, and predictive user journey optimization
- **A/B Testing Framework**: Complete statistical testing platform with experiment design, randomization algorithms, significance testing, confidence interval calculations, automated result interpretation, and decision support systems
- **Customer Lifecycle Management System**: Comprehensive lifecycle tracking with stage definitions, progression analysis, conversion funnel optimization, cohort-based retention insights, and user journey mapping with intervention points
- **Churn Prediction & Prevention Engine**: Machine learning-powered churn prediction with risk scoring algorithms, feature importance analysis, intervention recommendation systems, prevention campaign management, and ROI tracking for retention efforts
- **Feature Usage Analytics Platform**: Advanced feature adoption tracking with usage pattern analysis, discovery funnel optimization, performance metrics, engagement depth measurement, and data-driven product development insights
- **Business Intelligence Infrastructure**: Unified analytics service layer with comprehensive data aggregation, statistical analysis algorithms, predictive modeling capabilities, real-time dashboard systems, and automated reporting frameworks
- **Intervention Management System**: Automated intervention triggering based on user behavior patterns with success tracking, A/B testing integration, personalized messaging systems, and comprehensive ROI measurement for retention campaigns

### New v2.1 Premium Subscription Tier Enhancements Architecture
- **Celebrity Chef Recipe Collections**: Premium content management system with chef profiles, exclusive recipes, achievement tracking, and subscription-based access control
- **AI Nutritionist Consultation Platform**: Advanced AI-powered nutrition consultation system with health metric tracking, personalized recommendations, goal management, and expert chat interface
- **Unlimited Meal Plan History Manager**: Comprehensive meal plan archive system with advanced filtering, search capabilities, detailed analytics, and success rate tracking across unlimited time periods
- **Priority Customer Support Center**: Premium support system with priority ticket routing, real-time chat interface, agent assignment, and satisfaction tracking with dedicated support channels
- **Advanced Export & Sharing System**: Professional export functionality supporting multiple formats (PDF, Excel, Word, CSV, JSON) with custom styling, branding options, template library, and comprehensive sharing capabilities

### New v2.2 Marketplace Features (Recipe Monetization Platform) Architecture
- **Chef Publishing & Monetization Platform**: Comprehensive professional chef portal with recipe publishing workflows, revenue analytics, audience engagement metrics, and multi-stream income tracking
- **Affiliate Marketing Integration System**: Complete affiliate marketing framework with product recommendation engine, commission tracking, click analytics, conversion optimization, and automated payment processing
- **Sponsored Content Management Platform**: Brand partnership ecosystem with campaign management, performance tracking, sponsor matching algorithms, and automated revenue distribution
- **Recipe Licensing & Legal Framework**: Professional intellectual property management system with customizable licensing agreements, territory management, royalty collection, and legal compliance tools
- **Marketplace Analytics & Reporting**: Advanced business intelligence for marketplace operations with chef performance metrics, revenue optimization, market trends analysis, and financial reporting
- **Professional Profile & Verification System**: Verified chef credentialing with portfolio management, social media integration, audience analytics, and professional certification tracking

### New v2.3 Caching & Performance Optimization Architecture
- **Multi-Layer Caching System**: Advanced caching architecture with memory cache (L1), Redis cache (L2), and CDN edge caching (L3) with intelligent invalidation strategies, cache warming, and health monitoring
- **CDN Integration & Media Optimization**: Complete CDN service with automatic image format optimization (WebP, AVIF), responsive image transforms, video processing, and global content delivery with edge caching
- **Database Performance Engine**: Intelligent query optimization with strategic indexing, connection pooling, query analysis, performance monitoring, and automated optimization recommendations
- **Progressive Loading Infrastructure**: Smart content loading system with intersection observer, lazy loading, preloading strategies, image compression, and fallback handling for optimal user experience
- **Performance Monitoring & Analytics**: Real-time performance dashboard with cache hit rates, query performance metrics, image loading analytics, Core Web Vitals tracking, and automated optimization alerts
- **Resource Management System**: Advanced resource optimization with memory management, garbage collection monitoring, asset bundling, code splitting, and performance budgeting

### New v2.4 Real-time Features Architecture
- **WebSocket Communication Infrastructure**: Socket.IO-based real-time communication with Redis adapter for horizontal scaling, room-based messaging, and connection management
- **Collaborative Shopping List System**: Real-time collaborative shopping with live item updates, user presence tracking, conflict resolution, and synchronized state management
- **Live Cooking Session Platform**: Interactive cooking sessions with step-by-step guidance, participant management, real-time messaging, host controls, and progress synchronization
- **Real-time Meal Plan Collaboration**: Multi-user meal planning with live updates, assignment tracking, status changes, collaborative editing, and conflict resolution
- **Push Notification Service**: Comprehensive notification system with Web Push API, VAPID key management, service worker integration, and scheduled notification delivery
- **Microservices Architecture**: Docker-based microservices with Socket.IO server, Redis pub/sub, RabbitMQ message queue, background job processing, and notification services
- **Offline-First Real-time**: Service worker integration with background sync, offline queuing, and seamless reconnection handling for uninterrupted collaborative experiences

### New v2.5 Enhanced AI Capabilities Architecture
- **Fine-tuned OpenAI Integration**: Specialized OpenAI models trained for recipe creation, nutrition analysis, meal timing optimization, and natural language processing with domain-specific expertise
- **Computer Vision Recipe Analysis**: GPT-4 Vision API integration for comprehensive food image analysis with ingredient detection, cooking method recognition, recipe estimation, and nutritional assessment
- **Natural Language Processing Engine**: Advanced text parsing capabilities for extracting structured recipe data from unstructured text sources including blogs, social media posts, and handwritten notes
- **Comprehensive Nutrition Analysis System**: Scientific nutritional analysis with macronutrient tracking, micronutrient analysis, health scoring algorithms, glycemic index calculation, and personalized dietary insights
- **Intelligent Meal Timing Optimization**: Chronobiology-based meal scheduling with circadian rhythm analysis, energy pattern recognition, metabolic optimization, and personalized timing recommendations
- **Multi-modal AI Integration**: Seamless integration of text, image, and structured data AI capabilities with unified API interfaces and consistent confidence scoring across all AI services
- **Advanced Health Intelligence**: AI-powered health recommendations with ingredient synergy analysis, bioavailability optimization, anti-inflammatory scoring, and personalized nutrition guidance

### New v3.0 Data Analytics & Insights Architecture
- **User Behavior Analytics Engine**: Comprehensive tracking system with action monitoring, session analytics, engagement scoring, device usage patterns, and behavioral insight generation with predictive analytics capabilities
- **Recipe Success Intelligence Platform**: Advanced recipe performance analytics with success rate calculations, popularity scoring algorithms, completion tracking, repeat cooking analysis, and difficulty assessment with trending analysis
- **Seasonal Preference Analysis Framework**: Intelligent seasonal cooking pattern analysis with cuisine preferences, ingredient seasonality scoring, cooking method trends, cost analysis by season, and predictive seasonal recommendations
- **Cost Optimization Intelligence System**: AI-powered cost optimization with ingredient substitution algorithms, bulk buying recommendations, seasonal optimization strategies, store selection analysis, and portion adjustment calculations
- **Analytics Dashboard & Visualization**: Interactive analytics dashboard with real-time data visualization, multi-dimensional trend analysis, comparative metrics, behavioral insights, and actionable recommendations across all analytical dimensions
- **Predictive Analytics Engine**: Machine learning-powered insights for user engagement optimization, recipe performance prediction, seasonal trend forecasting, cost reduction strategies, and personalized improvement recommendations

### New v3.1 Enhanced Security Architecture
- **Rate Limiting Engine**: Multi-tier API rate limiting with configurable thresholds, automatic IP blocking, violation tracking, and intelligent reset mechanisms with Redis-compatible storage and real-time monitoring
- **Audit Logging Framework**: Comprehensive security event logging with severity classification, metadata collection, IP address tracking, user agent monitoring, and local backup storage for compliance and forensic analysis
- **GDPR Compliance Platform**: Complete data portability system with automated user data export, secure file generation, download link management, expiration handling, and comprehensive data type coverage for privacy compliance
- **Two-Factor Authentication System**: Full 2FA implementation with TOTP secret generation, QR code creation, backup code management, verification workflows, and security event integration for enhanced account protection
- **Advanced Role Management**: Extended permission system with custom role creation, hierarchical access control, permission inheritance, dynamic role assignment, and fine-grained resource access control beyond basic admin/user roles
- **Security Monitoring Dashboard**: Real-time security analytics with violation tracking, failed authentication monitoring, blocked IP management, security metrics visualization, and comprehensive security event correlation

### New v3.2 Improved Onboarding Architecture
- **Interactive Tutorial System**: Progressive tutorial framework with step-by-step guidance, contextual help, prerequisite management, progress tracking, and adaptive flow based on user behavior and skill level
- **Guided Wizard Framework**: Multi-step workflow management with data persistence, step validation, adaptive questioning, progress tracking, and personalized meal plan generation based on user inputs
- **Preference Learning Engine**: Intelligent behavioral analysis system that infers user preferences from interactions, cooking attempts, recipe views, and engagement patterns with confidence scoring and dynamic updating
- **Skill Assessment Platform**: Comprehensive cooking skill evaluation across 8 categories with scoring algorithms, weakness identification, personalized recommendations, and skill-based content customization
- **Sample Content Management**: Curated meal plan library with difficulty matching, preference filtering, instant application workflows, and personalized recommendation algorithms
- **Onboarding Analytics Engine**: Progress tracking, completion rate analysis, engagement metrics, user journey optimization, and continuous improvement through data-driven insights

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