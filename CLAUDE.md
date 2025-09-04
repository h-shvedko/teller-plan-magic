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

### Local Development (Node.js)
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

### Docker Development Environment
```bash
# Quick Start Scripts
./scripts/docker-fresh-start.sh   # Complete fresh setup (destructive)
./scripts/docker-restart.sh       # Restart existing stopped environment

# Using Docker helper scripts
./scripts/docker-dev.sh start     # Start full development environment
./scripts/docker-dev.sh stop      # Stop development environment
./scripts/docker-dev.sh logs      # View all logs
./scripts/docker-dev.sh status    # Check service status
./scripts/docker-dev.sh reset-db  # Reset development database
./scripts/docker-dev.sh seed      # Run database seeding

# Database seeding options
./scripts/docker-seed.sh          # Run all seeds
./scripts/docker-seed.sh --reset  # Reset and re-run all seeds
./scripts/docker-seed.sh --verify # Verify existing seed data

# Manual Docker commands
docker-compose up -d               # Start all services in background
docker-compose down                # Stop and remove containers
docker-compose logs -f app         # Follow app logs
docker-compose restart app         # Restart specific service
```

### Production Docker Environment
```bash
# Using Docker production scripts
./scripts/docker-prod.sh deploy    # Build and deploy production
./scripts/docker-prod.sh start     # Start production environment
./scripts/docker-prod.sh stop      # Stop production environment
./scripts/docker-prod.sh backup-db # Backup production database
./scripts/docker-prod.sh update-supabase # Update Supabase services

# Manual Docker commands
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
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

## v1.4 User Experience & Personalization Features
- ✅ **Smart Recommendations Engine**: Machine learning-powered personalized recipe recommendations with ML-based scoring algorithms
- ✅ **Meal Plan Success Rate Tracking**: Comprehensive tracking of what users actually cook vs. what they plan, with success rate analytics
- ✅ **Taste Profile Learning**: AI system that learns from user interactions (views, likes, saves, cooks) to build detailed taste preferences
- ✅ **Seasonal Preference Adaptation**: Dynamic seasonal recommendations based on ingredient availability, weather patterns, and user seasonal cooking history

### New Components Added:
- `src/lib/smartRecommendations.ts` - Core ML recommendation engine with taste profiling, success tracking, and seasonal adaptation
- `src/components/SmartRecommendationDisplay.tsx` - Intelligent recommendation display with categorized suggestions and confidence scoring
- `src/components/MealPlanSuccessTracker.tsx` - Comprehensive meal plan tracking with detailed feedback collection and success analytics
- `src/components/TasteProfileLearning.tsx` - Taste profile visualization with learning insights, preferences analysis, and improvement suggestions
- `src/components/SeasonalPreferenceAdaptation.tsx` - Seasonal adaptation interface with ingredient recommendations, weather-based suggestions, and location-aware preferences

### Enhanced Personalization Functionality:
- Advanced machine learning algorithm that scores recipes based on cuisine preferences, flavor profiles, ingredient affinities, cooking time, difficulty, and seasonal patterns
- Real-time meal plan success tracking with detailed feedback on cooking time, difficulty, and user satisfaction
- Intelligent taste profile building that learns from user interactions and adapts recommendations over time
- Seasonal awareness with peak ingredient recommendations, weather-appropriate cooking methods, and location-based preferences
- Confidence scoring system that improves recommendation accuracy as more user data is collected

## v1.5 Social & Community Features
- ✅ **Recipe Sharing with Friends/Family**: Comprehensive recipe sharing system with granular permissions, friend connections, and family group management
- ✅ **Meal Plan Collaboration**: Real-time family collaboration on meal plans with role-based permissions, activity tracking, and voting systems
- ✅ **Community Recipe Collections**: Curated recipe collections with community features, subscriptions, ratings, and featured content
- ✅ **Cooking Achievement System**: Gamified cooking experience with badges, levels, progress tracking, and milestone rewards
- ✅ **Recipe Import from URLs/Photos**: AI-powered recipe import with URL extraction and OCR-based photo processing

### New Components Added:
- `src/lib/socialFeatures.ts` - Core social features service with user profiles, friend connections, family groups, sharing permissions, achievements, and recipe import functionality
- `src/components/RecipeSharing.tsx` - Advanced recipe sharing interface with friend selection, family groups, permission management, and sharing analytics
- `src/components/FamilyMealPlanCollaboration.tsx` - Family collaboration system with real-time activity feeds, role management, and collaborative meal planning
- `src/components/CommunityRecipeCollections.tsx` - Community-driven recipe collections with curation tools, subscription management, and discovery features
- `src/components/CookingAchievements.tsx` - Comprehensive achievement system with progress tracking, badge management, and gamification elements
- `src/components/RecipeImportWizard.tsx` - Multi-step recipe import wizard with URL extraction, photo OCR, AI validation, and manual editing capabilities

### Enhanced Social Functionality:
- Friend connections with pending/accepted status management and privacy controls
- Family group creation and management with role-based permissions and invitation systems
- Recipe sharing with granular permissions (view, cook, modify, reshare) and expiration settings
- Real-time meal plan collaboration with activity feeds, notifications, and approval workflows
- Community recipe collections with rating systems, subscriber counts, and featured content curation
- Comprehensive achievement system with multiple categories (cooking, social, collection, sharing, milestone)
- AI-powered recipe import supporting both URL extraction and photo OCR with confidence scoring and manual review
- Social interaction tracking for personalized recommendations and community engagement metrics

## v1.6 Advanced Planning Tools
- ✅ **Nutritional Goal Tracking and Meal Balancing**: Comprehensive nutritional goal setting with daily/weekly/monthly targets, real-time balance scoring, and intelligent recommendations for macro/micronutrient optimization
- ✅ **Budget Tracking per Meal Plan**: Detailed budget management with category allocations, spending tracking, variance analysis, and savings opportunities identification
- ✅ **Leftover Management and Meal Rotation**: Smart leftover tracking with expiration monitoring, storage optimization, meal rotation rules, and recipe variety management
- ✅ **Special Occasion Meal Planning**: Complete event planning system for holidays, parties, and celebrations with guest management, dietary requirements, preparation timelines, and shopping lists
- ✅ **Meal Plan Analytics**: Advanced analytics dashboard with cost trends, nutrition analysis, time tracking, preference insights, and actionable recommendations

### New Components Added:
- `src/lib/advancedPlanningTools.ts` - Core business logic for nutritional tracking, budget management, leftover handling, special events, and comprehensive analytics
- `src/components/NutritionalGoalTracker.tsx` - Goal setting and real-time nutritional balance tracking with visual progress indicators and personalized recommendations
- `src/components/MealPlanBudgetTracker.tsx` - Budget management with spending analysis, category breakdowns, and savings opportunity identification
- `src/components/LeftoverManager.tsx` - Leftover inventory tracking with expiration alerts, meal rotation rules, and waste reduction suggestions
- `src/components/SpecialOccasionPlanner.tsx` - Event planning interface with timeline management, guest dietary requirements, and comprehensive preparation workflows
- `src/components/MealPlanAnalytics.tsx` - Analytics dashboard with interactive charts, trend analysis, and actionable insights across cost, nutrition, time, and preferences

### Enhanced Planning Functionality:
- Intelligent nutritional goal tracking with balance scoring and recommendation engine for optimal macro/micronutrient distribution
- Comprehensive budget management with real-time spending tracking, category allocations, and AI-powered savings opportunity identification
- Smart leftover management system with expiration monitoring, quality rating, meal rotation algorithms, and waste reduction optimization
- Complete special occasion planning with event-specific timelines, dietary requirement management, and collaborative preparation workflows
- Advanced analytics platform with multi-dimensional insights, trend analysis, and machine learning-powered recommendations for continuous meal planning improvement

## v1.7 Progressive Web App Features
- ✅ **Offline Recipe Access**: Service worker implementation with intelligent caching strategies, offline page fallback, and background sync capabilities
- ✅ **Shopping List Offline Sync**: IndexedDB-based offline storage with real-time synchronization, conflict resolution, and pending changes tracking
- ✅ **Voice-Activated Cooking Instructions**: Speech recognition and synthesis for hands-free cooking with customizable voice settings and comprehensive command support
- ✅ **Timer Integration for Cooking Steps**: Advanced timer system with notifications, wake lock support, multiple concurrent timers, and background operation

### New Components Added:
- `src/lib/pwaUtils.ts` - Core PWA utilities with offline storage, network management, and service worker integration
- `src/components/OfflineShoppingList.tsx` - Comprehensive offline shopping list management with sync status tracking
- `src/components/VoiceActivatedCooking.tsx` - Voice-controlled cooking interface with speech recognition and synthesis
- `src/components/CookingTimer.tsx` - Advanced timer system with notifications, presets, and background operation
- `src/components/PWAManager.tsx` - PWA status dashboard with installation prompts, cache management, and settings

### PWA Infrastructure:
- `public/sw.js` - Service worker with caching strategies, background sync, and push notification support
- `public/offline.html` - Offline fallback page with network status monitoring and retry functionality
- `public/manifest.json` - Complete PWA manifest with shortcuts, file handlers, and share targets

### Enhanced PWA Functionality:
- **Service Worker**: Implements network-first for APIs, cache-first for static assets, and offline fallback strategies
- **Offline Storage**: IndexedDB-based storage with structured data management, expiration tracking, and sync status monitoring
- **Background Sync**: Automatic synchronization when network connectivity is restored with conflict resolution
- **Push Notifications**: Timer completion notifications with customizable settings and service worker integration
- **Installation Support**: Native app installation prompts with platform detection and user experience optimization
- **Voice Commands**: Comprehensive voice navigation with natural language processing and cooking-specific command recognition
- **Cache Management**: Intelligent caching with size monitoring, cleanup utilities, and storage quota management

## v1.8 Third-Party Integrations
- ✅ **Grocery Delivery Services Integration**: Complete integration with Instacart, Amazon Fresh, and Walmart Grocery with product search, cart management, delivery scheduling, and order tracking
- ✅ **Fitness Apps Integration**: Comprehensive integration with MyFitnessPal, Fitbit, Apple Health, Google Fit, Strava, and Cronometer for nutrition tracking, activity monitoring, and goal synchronization
- ✅ **Calendar Integration**: Full calendar provider support for Google Calendar, Microsoft Outlook, Apple Calendar, and CalDAV with meal plan synchronization, event creation, and reminder management
- ✅ **Smart Kitchen Appliances**: Device integration for smart ovens, induction cooktops, sous vide cookers, multicookers, air fryers, and refrigerators with remote control and automated cooking programs
- ✅ **Barcode Scanning & Pantry Management**: Complete barcode scanning system with product identification, pantry inventory tracking, expiration monitoring, and automated shopping list integration

### New Components Added:
- `src/lib/thirdPartyIntegrations.ts` - Comprehensive integration service layer with mock API implementations for all third-party services
- `src/components/GroceryDeliveryIntegration.tsx` - Full grocery delivery interface with service selection, product browsing, cart management, and order tracking
- `src/components/FitnessAppsIntegration.tsx` - Fitness app connections with nutrition syncing, activity tracking, goal management, and progress monitoring
- `src/components/CalendarIntegration.tsx` - Calendar provider integration with meal plan synchronization, event creation, and scheduling automation
- `src/components/SmartApplianceIntegration.tsx` - Smart appliance discovery, connection, and control with automated cooking program execution
- `src/components/BarcodeScanningIntegration.tsx` - Barcode scanning interface with camera integration, manual entry, pantry management, and inventory tracking

### Integration Infrastructure:
- **Mock API System**: Complete mock implementations for development with realistic response simulation
- **Service Abstraction**: Unified service layer supporting multiple providers per integration type
- **Authentication Handling**: OAuth flows and API key management for secure service connections
- **Data Synchronization**: Bi-directional sync with conflict resolution and offline support
- **Error Handling**: Comprehensive error management with retry mechanisms and fallback options

### Enhanced Integration Functionality:
- **Grocery Delivery**: Real-time product search, price comparison, cart synchronization, delivery slot booking, and order status tracking across multiple services
- **Fitness Tracking**: Automatic nutrition data sync, activity-based meal adjustments, goal progress tracking, and personalized recommendations based on fitness metrics
- **Calendar Sync**: Automatic meal plan event creation, preparation reminders, shopping notifications, and multi-calendar support with conflict resolution
- **Smart Appliances**: Device discovery, remote control capabilities, automated cooking program execution, and integration with recipe instructions
- **Pantry Management**: Barcode-based product identification, automated inventory tracking, expiration alerts, low stock notifications, and seamless shopping list integration
- **Environment Configuration**: Comprehensive mock API keys setup in `.env` file for all integrated services enabling immediate development capability

## Docker Environment Setup

### Overview
The project includes comprehensive Docker support for both development and production environments. The Docker setup includes:
- React application with Vite development server
- Complete Supabase stack (PostgreSQL, Auth, Storage, Studio, Edge Functions)
- Production-ready Nginx configuration
- Multi-stage builds for optimization
- Health checks and monitoring
- Automated backup and restore capabilities

### Docker Services
- **app**: React application (development with hot reload)
- **app-prod**: Production React app with Nginx
- **supabase-db**: PostgreSQL database
- **supabase-api**: Supabase Auth service (GoTrue)
- **supabase-storage**: Supabase Storage API
- **supabase-rest**: PostgREST API server
- **supabase-studio**: Supabase Dashboard
- **supabase-inbucket**: Email testing service
- **supabase-imgproxy**: Image processing service

### Quick Start with Docker

#### Development Environment

**Fresh Start (Recommended for first time setup):**
```bash
# Clone the repository
git clone <repository-url>
cd teller-plan-magic

# Complete fresh setup with migrations and seeding
./scripts/docker-fresh-start.sh

# The application will be available at:
# - React App: http://localhost:8080
# - Supabase Studio: http://localhost:54324
# - Supabase API: http://localhost:54321
# - Database: postgresql://postgres:postgres@localhost:54322/postgres
```

**Restart Existing Environment:**
```bash
# If you have a previously set up environment that's stopped
./scripts/docker-restart.sh

# Or use the standard development helper
./scripts/docker-dev.sh start
```

#### Production Environment
```bash
# Configure production environment
cp .env.docker.prod .env
# Edit .env with your production Supabase credentials

# Deploy production environment
./scripts/docker-prod.sh deploy

# The application will be available at:
# - Production App: http://localhost (port 80)
# - HTTPS: https://localhost (port 443, if configured)
```

### Environment Configuration

#### Development (.env.docker)
- Uses local Supabase instance with default development keys
- Hot reload enabled for React development
- All services running locally

#### Production (.env.docker.prod)
- Uses production Supabase instance
- Production-optimized builds
- Nginx with security headers and caching
- SSL/TLS ready configuration

### File Structure
```
├── Dockerfile                     # Multi-stage Docker build
├── docker-compose.yml            # Main Docker Compose configuration
├── docker-compose.override.yml   # Development overrides
├── docker-compose.prod.yml       # Production configuration
├── nginx.conf                    # Production Nginx configuration
├── .dockerignore                 # Docker ignore file
├── .env.docker                   # Development environment variables
├── .env.docker.prod              # Production environment variables
└── scripts/
    ├── docker-dev.sh             # Development helper script
    └── docker-prod.sh            # Production helper script
```

### Docker Features

#### Multi-Stage Builds
- **Base**: Node.js environment with build dependencies
- **Development**: Development server with hot reload
- **Build**: Production build generation
- **Production**: Optimized Nginx deployment

#### Volume Management
- **supabase-db-data**: Persistent database storage
- **supabase-storage-data**: File storage persistence
- **App volumes**: Source code mounting for development

#### Health Checks
- Application health endpoints
- Database connectivity checks
- Service dependency management

#### Security Features
- Non-root user execution
- Security headers configuration
- Network isolation
- Environment variable protection

### Development Workflow

1. **Start Development Environment**
   ```bash
   ./scripts/docker-dev.sh start
   ```

2. **View Logs**
   ```bash
   ./scripts/docker-dev.sh logs        # All services
   ./scripts/docker-dev.sh logs app    # Specific service
   ```

3. **Database Operations**
   ```bash
   ./scripts/docker-dev.sh reset-db    # Reset database
   ./scripts/docker-dev.sh migrate     # Run migrations
   ```

4. **Stop Environment**
   ```bash
   ./scripts/docker-dev.sh stop
   ```

### Production Deployment

1. **Configure Environment**
   ```bash
   cp .env.docker.prod .env
   # Edit with production values
   ```

2. **Deploy Application**
   ```bash
   ./scripts/docker-prod.sh deploy
   ```

3. **Backup Database**
   ```bash
   ./scripts/docker-prod.sh backup-db
   ```

4. **Update Supabase**
   ```bash
   ./scripts/docker-prod.sh update-supabase
   ```

### Supabase Integration

#### Local Development
- Complete Supabase stack running in Docker
- Database migrations automatically applied
- Studio interface for database management
- Email testing with Inbucket

#### Production Updates
- Automated migration deployment
- Database backup before updates
- Health checks during deployment
- Rollback capabilities

### Troubleshooting

#### Common Issues
1. **Port Conflicts**: Ensure ports 8080, 54321-54328, and 80 are available
2. **Database Connection**: Check if Supabase services are fully started
3. **Environment Variables**: Verify .env file configuration
4. **Docker Permissions**: Ensure Docker daemon is running with proper permissions

#### Useful Commands
```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs -f [service-name]

# Restart specific service
docker-compose restart [service-name]

# Clean up resources
docker-compose down -v --remove-orphans
docker system prune -f

# Access database directly
docker-compose exec supabase-db psql -U postgres postgres
```

### Performance Optimization

#### Development
- Source code mounting for instant updates
- Optimized layer caching
- Minimal service startup time

#### Production
- Multi-stage builds for minimal image size
- Nginx with caching and compression
- Health checks for reliability
- Resource limits and monitoring

### Monitoring and Logging

#### Service Health
- Health check endpoints for all services
- Dependency checks between services
- Automated restart policies

#### Logging
- Centralized logging with Docker
- Service-specific log filtering
- Log rotation and retention

This Docker environment provides a complete, production-ready setup that mirrors your production Supabase configuration while enabling local development with hot reload capabilities.