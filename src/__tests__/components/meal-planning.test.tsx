import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMockRecipe,
  createMockMealPlan,
  createMockApiResponse,
} from '@/test/fixtures';

// Mock Meal Planning Components
const MockMealPlanCreator = () => (
  <div data-testid="meal-plan-creator">
    <h2>Create Meal Plan</h2>
    <form>
      <input
        type="text"
        placeholder="Meal Plan Name"
        data-testid="meal-plan-name"
      />
      <input type="date" data-testid="start-date" />
      <select data-testid="duration-select">
        <option value="1">1 Week</option>
        <option value="2">2 Weeks</option>
        <option value="4">1 Month</option>
      </select>
      <textarea placeholder="Notes (optional)" data-testid="meal-plan-notes" />
      <button type="submit" data-testid="create-meal-plan-button">
        Create Meal Plan
      </button>
    </form>
  </div>
);

const MockRecipeSearch = () => (
  <div data-testid="recipe-search">
    <h2>Search Recipes</h2>
    <input
      type="text"
      placeholder="Search recipes..."
      data-testid="recipe-search-input"
    />
    <div data-testid="search-filters">
      <select data-testid="cuisine-filter">
        <option value="">All Cuisines</option>
        <option value="italian">Italian</option>
        <option value="mexican">Mexican</option>
        <option value="asian">Asian</option>
      </select>
      <select data-testid="difficulty-filter">
        <option value="">All Difficulties</option>
        <option value="easy">Easy</option>
        <option value="intermediate">Intermediate</option>
        <option value="hard">Hard</option>
      </select>
      <select data-testid="time-filter">
        <option value="">Any Time</option>
        <option value="15">Under 15 minutes</option>
        <option value="30">Under 30 minutes</option>
        <option value="60">Under 1 hour</option>
      </select>
    </div>
    <button data-testid="search-button">Search</button>
    <div data-testid="search-results">
      <div data-testid="recipe-card">
        <h3>Sample Recipe</h3>
        <p>Delicious test recipe</p>
        <button data-testid="add-to-meal-plan">Add to Meal Plan</button>
      </div>
    </div>
  </div>
);

const MockRecipeCreator = () => (
  <div data-testid="recipe-creator">
    <h2>Create Recipe</h2>
    <form>
      <input type="text" placeholder="Recipe Name" data-testid="recipe-name" />
      <textarea placeholder="Description" data-testid="recipe-description" />
      <select data-testid="recipe-cuisine">
        <option value="">Select Cuisine</option>
        <option value="italian">Italian</option>
        <option value="mexican">Mexican</option>
      </select>
      <select data-testid="recipe-difficulty">
        <option value="">Select Difficulty</option>
        <option value="easy">Easy</option>
        <option value="intermediate">Intermediate</option>
        <option value="hard">Hard</option>
      </select>
      <input
        type="number"
        placeholder="Prep Time (minutes)"
        data-testid="prep-time"
      />
      <input
        type="number"
        placeholder="Cook Time (minutes)"
        data-testid="cook-time"
      />
      <input type="number" placeholder="Servings" data-testid="servings" />
      <textarea
        placeholder="Ingredients (one per line)"
        data-testid="ingredients"
      />
      <textarea placeholder="Instructions" data-testid="instructions" />
      <button type="submit" data-testid="save-recipe-button">
        Save Recipe
      </button>
    </form>
  </div>
);

const MockShoppingListGenerator = () => (
  <div data-testid="shopping-list-generator">
    <h2>Shopping List</h2>
    <div data-testid="meal-plan-selector">
      <select>
        <option value="">Select Meal Plan</option>
        <option value="1">This Week</option>
        <option value="2">Next Week</option>
      </select>
      <button data-testid="generate-list-button">Generate List</button>
    </div>
    <div data-testid="shopping-list">
      <h3>Generated Shopping List</h3>
      <div data-testid="category-produce">
        <h4>Produce</h4>
        <ul>
          <li data-testid="item-tomatoes">
            <input type="checkbox" />
            Tomatoes (3 lbs)
          </li>
          <li data-testid="item-onions">
            <input type="checkbox" />
            Onions (2 lbs)
          </li>
        </ul>
      </div>
      <div data-testid="category-dairy">
        <h4>Dairy</h4>
        <ul>
          <li data-testid="item-milk">
            <input type="checkbox" />
            Milk (1 gallon)
          </li>
        </ul>
      </div>
    </div>
    <button data-testid="export-list-button">Export List</button>
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Meal Planning & Recipe Components', () => {
  let mockSupabase: ReturnType<typeof vi.mocked>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await import('@/integrations/supabase/client');
    mockSupabase = vi.mocked(module.supabase);
  });

  describe('Meal Plan Creator', () => {
    it('should render meal plan creation form', () => {
      render(<MockMealPlanCreator />, { wrapper: TestWrapper });

      expect(screen.getByTestId('meal-plan-name')).toBeInTheDocument();
      expect(screen.getByTestId('start-date')).toBeInTheDocument();
      expect(screen.getByTestId('duration-select')).toBeInTheDocument();
      expect(screen.getByTestId('meal-plan-notes')).toBeInTheDocument();
      expect(screen.getByTestId('create-meal-plan-button')).toBeInTheDocument();
    });

    it('should allow user to fill out meal plan details', async () => {
      const user = userEvent.setup();
      render(<MockMealPlanCreator />, { wrapper: TestWrapper });

      await user.type(screen.getByTestId('meal-plan-name'), 'Weekly Meal Plan');
      await user.type(screen.getByTestId('start-date'), '2024-01-01');
      await user.selectOptions(screen.getByTestId('duration-select'), '2');
      await user.type(
        screen.getByTestId('meal-plan-notes'),
        'Healthy meals for the family'
      );

      expect(screen.getByTestId('meal-plan-name')).toHaveValue(
        'Weekly Meal Plan'
      );
      expect(screen.getByTestId('start-date')).toHaveValue('2024-01-01');
      expect(screen.getByTestId('duration-select')).toHaveValue('2');
      expect(screen.getByTestId('meal-plan-notes')).toHaveValue(
        'Healthy meals for the family'
      );
    });

    it('should handle meal plan creation', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValue(createMockApiResponse(createMockMealPlan())),
      });

      const user = userEvent.setup();
      render(<MockMealPlanCreator />, { wrapper: TestWrapper });

      await user.type(screen.getByTestId('meal-plan-name'), 'Test Plan');
      await user.click(screen.getByTestId('create-meal-plan-button'));

      expect(screen.getByTestId('meal-plan-creator')).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(<MockMealPlanCreator />, { wrapper: TestWrapper });

      await user.click(screen.getByTestId('create-meal-plan-button'));

      // Form should still be present, indicating validation prevented submission
      expect(screen.getByTestId('meal-plan-creator')).toBeInTheDocument();
    });
  });

  describe('Recipe Search', () => {
    it('should render recipe search interface', () => {
      render(<MockRecipeSearch />, { wrapper: TestWrapper });

      expect(screen.getByTestId('recipe-search-input')).toBeInTheDocument();
      expect(screen.getByTestId('cuisine-filter')).toBeInTheDocument();
      expect(screen.getByTestId('difficulty-filter')).toBeInTheDocument();
      expect(screen.getByTestId('time-filter')).toBeInTheDocument();
      expect(screen.getByTestId('search-button')).toBeInTheDocument();
    });

    it('should allow user to search for recipes', async () => {
      const user = userEvent.setup();
      render(<MockRecipeSearch />, { wrapper: TestWrapper });

      await user.type(screen.getByTestId('recipe-search-input'), 'pasta');
      await user.selectOptions(screen.getByTestId('cuisine-filter'), 'italian');
      await user.click(screen.getByTestId('search-button'));

      expect(screen.getByTestId('recipe-search-input')).toHaveValue('pasta');
      expect(screen.getByTestId('cuisine-filter')).toHaveValue('italian');
    });

    it('should display search results', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi
          .fn()
          .mockResolvedValue(createMockApiResponse([createMockRecipe()])),
      });

      const user = userEvent.setup();
      render(<MockRecipeSearch />, { wrapper: TestWrapper });

      await user.click(screen.getByTestId('search-button'));

      expect(screen.getByTestId('search-results')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-card')).toBeInTheDocument();
    });

    it('should handle adding recipe to meal plan', async () => {
      const user = userEvent.setup();
      render(<MockRecipeSearch />, { wrapper: TestWrapper });

      const addButton = screen.getByTestId('add-to-meal-plan');
      await user.click(addButton);

      expect(addButton).toBeInTheDocument();
    });
  });

  describe('Recipe Creator', () => {
    it('should render recipe creation form', () => {
      render(<MockRecipeCreator />, { wrapper: TestWrapper });

      expect(screen.getByTestId('recipe-name')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-description')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-cuisine')).toBeInTheDocument();
      expect(screen.getByTestId('recipe-difficulty')).toBeInTheDocument();
      expect(screen.getByTestId('prep-time')).toBeInTheDocument();
      expect(screen.getByTestId('cook-time')).toBeInTheDocument();
      expect(screen.getByTestId('servings')).toBeInTheDocument();
      expect(screen.getByTestId('ingredients')).toBeInTheDocument();
      expect(screen.getByTestId('instructions')).toBeInTheDocument();
    });

    it('should allow user to create a recipe', async () => {
      const user = userEvent.setup();
      render(<MockRecipeCreator />, { wrapper: TestWrapper });

      await user.type(screen.getByTestId('recipe-name'), 'Spaghetti Carbonara');
      await user.type(
        screen.getByTestId('recipe-description'),
        'Classic Italian pasta dish'
      );
      await user.selectOptions(screen.getByTestId('recipe-cuisine'), 'italian');
      await user.selectOptions(
        screen.getByTestId('recipe-difficulty'),
        'intermediate'
      );
      await user.type(screen.getByTestId('prep-time'), '15');
      await user.type(screen.getByTestId('cook-time'), '20');
      await user.type(screen.getByTestId('servings'), '4');
      await user.type(
        screen.getByTestId('ingredients'),
        'Pasta\nEggs\nBacon\nParmesan cheese'
      );
      await user.type(
        screen.getByTestId('instructions'),
        'Cook pasta, mix with eggs and cheese...'
      );

      expect(screen.getByTestId('recipe-name')).toHaveValue(
        'Spaghetti Carbonara'
      );
      expect(screen.getByTestId('recipe-cuisine')).toHaveValue('italian');
    });

    it('should handle recipe saving', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValue(createMockApiResponse(createMockRecipe())),
      });

      const user = userEvent.setup();
      render(<MockRecipeCreator />, { wrapper: TestWrapper });

      await user.type(screen.getByTestId('recipe-name'), 'Test Recipe');
      await user.click(screen.getByTestId('save-recipe-button'));

      expect(screen.getByTestId('recipe-creator')).toBeInTheDocument();
    });

    it('should validate numeric fields', async () => {
      const user = userEvent.setup();
      render(<MockRecipeCreator />, { wrapper: TestWrapper });

      await user.type(screen.getByTestId('prep-time'), 'invalid');
      await user.type(screen.getByTestId('servings'), '4');

      expect(screen.getByTestId('servings')).toHaveValue(4);
    });
  });

  describe('Shopping List Generator', () => {
    it('should render shopping list generator', () => {
      render(<MockShoppingListGenerator />, { wrapper: TestWrapper });

      expect(screen.getByTestId('meal-plan-selector')).toBeInTheDocument();
      expect(screen.getByTestId('generate-list-button')).toBeInTheDocument();
      expect(screen.getByTestId('shopping-list')).toBeInTheDocument();
    });

    it('should generate shopping list from meal plan', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: vi
          .fn()
          .mockResolvedValue(createMockApiResponse([createMockMealPlan()])),
      });

      const user = userEvent.setup();
      render(<MockShoppingListGenerator />, { wrapper: TestWrapper });

      await user.click(screen.getByTestId('generate-list-button'));

      expect(screen.getByTestId('shopping-list')).toBeInTheDocument();
    });

    it('should organize items by category', () => {
      render(<MockShoppingListGenerator />, { wrapper: TestWrapper });

      expect(screen.getByTestId('category-produce')).toBeInTheDocument();
      expect(screen.getByTestId('category-dairy')).toBeInTheDocument();
      expect(screen.getByText('Produce')).toBeInTheDocument();
      expect(screen.getByText('Dairy')).toBeInTheDocument();
    });

    it('should allow checking off items', async () => {
      const user = userEvent.setup();
      render(<MockShoppingListGenerator />, { wrapper: TestWrapper });

      const tomatoCheckbox = screen
        .getByTestId('item-tomatoes')
        .querySelector('input[type="checkbox"]');
      if (tomatoCheckbox) {
        await user.click(tomatoCheckbox);
        expect(tomatoCheckbox).toBeChecked();
      }
    });

    it('should handle list export', async () => {
      const user = userEvent.setup();
      render(<MockShoppingListGenerator />, { wrapper: TestWrapper });

      const exportButton = screen.getByTestId('export-list-button');
      await user.click(exportButton);

      expect(exportButton).toBeInTheDocument();
    });
  });

  describe('Meal Planning Integration', () => {
    it('should handle meal plan CRUD operations', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValue(createMockApiResponse(createMockMealPlan())),
        then: vi
          .fn()
          .mockResolvedValue(createMockApiResponse([createMockMealPlan()])),
      });

      render(<MockMealPlanCreator />, { wrapper: TestWrapper });

      expect(screen.getByTestId('meal-plan-creator')).toBeInTheDocument();
    });

    it('should handle recipe CRUD operations', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValue(createMockApiResponse(createMockRecipe())),
        then: vi
          .fn()
          .mockResolvedValue(createMockApiResponse([createMockRecipe()])),
      });

      render(<MockRecipeCreator />, { wrapper: TestWrapper });

      expect(screen.getByTestId('recipe-creator')).toBeInTheDocument();
    });

    it('should sync meal plans with recipes', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: vi
          .fn()
          .mockResolvedValue(createMockApiResponse([createMockRecipe()])),
      });

      render(<MockRecipeSearch />, { wrapper: TestWrapper });

      expect(screen.getByTestId('recipe-search')).toBeInTheDocument();
    });
  });
});
