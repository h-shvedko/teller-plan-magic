import { describe, it, expect } from 'vitest';
import { getAlternatives, SAMPLE_RECIPES, type Recipe } from '@/lib/recipes';

describe('recipes utilities', () => {
  describe('SAMPLE_RECIPES', () => {
    it('should contain valid recipe data', () => {
      expect(SAMPLE_RECIPES).toHaveLength(9);
      
      SAMPLE_RECIPES.forEach((recipe) => {
        expect(recipe).toHaveProperty('id');
        expect(recipe).toHaveProperty('title');
        expect(recipe).toHaveProperty('cuisine');
        expect(recipe).toHaveProperty('dietary');
        expect(recipe).toHaveProperty('time');
        expect(recipe).toHaveProperty('difficulty');
        expect(recipe).toHaveProperty('ingredients');
        
        expect(typeof recipe.id).toBe('string');
        expect(typeof recipe.title).toBe('string');
        expect(typeof recipe.time).toBe('number');
        expect(Array.isArray(recipe.dietary)).toBe(true);
        expect(Array.isArray(recipe.ingredients)).toBe(true);
        
        expect(['Italian', 'Vietnamese', 'Mexican', 'German', 'Indian']).toContain(recipe.cuisine);
        expect(['Easy', 'Medium', 'Hard']).toContain(recipe.difficulty);
        
        // Validate ingredients structure
        recipe.ingredients.forEach((ingredient) => {
          expect(ingredient).toHaveProperty('name');
          expect(ingredient).toHaveProperty('quantity');
          expect(ingredient).toHaveProperty('unit');
          expect(ingredient).toHaveProperty('aisle');
          
          expect(typeof ingredient.name).toBe('string');
          expect(typeof ingredient.quantity).toBe('number');
          expect(typeof ingredient.unit).toBe('string');
          expect(typeof ingredient.aisle).toBe('string');
          
          expect(ingredient.quantity).toBeGreaterThan(0);
          expect(ingredient.name.trim()).not.toBe('');
          expect(ingredient.unit.trim()).not.toBe('');
          expect(ingredient.aisle.trim()).not.toBe('');
        });
      });
    });

    it('should have unique recipe IDs', () => {
      const ids = SAMPLE_RECIPES.map(recipe => recipe.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids).toHaveLength(uniqueIds.length);
    });

    it('should contain recipes from different cuisines', () => {
      const cuisines = [...new Set(SAMPLE_RECIPES.map(recipe => recipe.cuisine))];
      expect(cuisines.length).toBeGreaterThan(1);
      expect(cuisines).toContain('Italian');
      expect(cuisines).toContain('Vietnamese');
      expect(cuisines).toContain('Mexican');
    });

    it('should have recipes with different difficulty levels', () => {
      const difficulties = [...new Set(SAMPLE_RECIPES.map(recipe => recipe.difficulty))];
      expect(difficulties).toContain('Easy');
      expect(difficulties.length).toBeGreaterThan(1);
    });

    it('should have reasonable cooking times', () => {
      SAMPLE_RECIPES.forEach((recipe) => {
        expect(recipe.time).toBeGreaterThan(0);
        expect(recipe.time).toBeLessThanOrEqual(120); // Max 2 hours
      });
    });
  });

  describe('getAlternatives', () => {
    const testRecipe: Recipe = {
      id: 'test-recipe',
      title: 'Test Recipe',
      cuisine: 'Italian',
      dietary: ['Vegetarian'],
      time: 30,
      difficulty: 'Easy',
      ingredients: [
        { name: 'pasta', quantity: 200, unit: 'g', aisle: 'Pantry' }
      ],
    };

    it('should return alternatives from same cuisine', () => {
      const alternatives = getAlternatives(testRecipe, SAMPLE_RECIPES, 5);
      
      alternatives.forEach((alt) => {
        expect(alt.cuisine).toBe('Italian');
        expect(alt.id).not.toBe(testRecipe.id);
      });
    });

    it('should exclude the input recipe', () => {
      // Add test recipe to the array
      const allRecipes = [...SAMPLE_RECIPES, testRecipe];
      const alternatives = getAlternatives(testRecipe, allRecipes);
      
      const alternativeIds = alternatives.map(alt => alt.id);
      expect(alternativeIds).not.toContain(testRecipe.id);
    });

    it('should respect the limit parameter', () => {
      const limit = 2;
      const alternatives = getAlternatives(testRecipe, SAMPLE_RECIPES, limit);
      
      expect(alternatives.length).toBeLessThanOrEqual(limit);
    });

    it('should default to 3 alternatives when no limit specified', () => {
      const alternatives = getAlternatives(testRecipe, SAMPLE_RECIPES);
      
      expect(alternatives.length).toBeLessThanOrEqual(3);
    });

    it('should return empty array when no alternatives available', () => {
      const uniqueCuisineRecipe: Recipe = {
        id: 'unique-recipe',
        title: 'Unique Recipe',
        cuisine: 'French', // Not in SAMPLE_RECIPES
        dietary: [],
        time: 45,
        difficulty: 'Medium',
        ingredients: [],
      };

      const alternatives = getAlternatives(uniqueCuisineRecipe, SAMPLE_RECIPES);
      expect(alternatives).toHaveLength(0);
    });

    it('should return all available alternatives when limit exceeds available count', () => {
      const italianRecipes = SAMPLE_RECIPES.filter(recipe => recipe.cuisine === 'Italian');
      const availableAlternatives = italianRecipes.length; // Excluding the test recipe itself
      
      const alternatives = getAlternatives(testRecipe, SAMPLE_RECIPES, 100);
      expect(alternatives.length).toBeLessThanOrEqual(availableAlternatives);
    });

    it('should maintain original order of recipes', () => {
      const alternatives = getAlternatives(testRecipe, SAMPLE_RECIPES, 5);
      const italianRecipes = SAMPLE_RECIPES
        .filter(recipe => recipe.cuisine === 'Italian' && recipe.id !== testRecipe.id)
        .slice(0, 5);
      
      expect(alternatives.map(alt => alt.id)).toEqual(italianRecipes.map(recipe => recipe.id));
    });

    it('should work with empty recipe array', () => {
      const alternatives = getAlternatives(testRecipe, []);
      expect(alternatives).toHaveLength(0);
    });

    it('should work with array containing only the input recipe', () => {
      const alternatives = getAlternatives(testRecipe, [testRecipe]);
      expect(alternatives).toHaveLength(0);
    });

    it('should handle different cuisine matching correctly', () => {
      const germanRecipe: Recipe = {
        id: 'german-test',
        title: 'German Test',
        cuisine: 'German',
        dietary: [],
        time: 25,
        difficulty: 'Easy',
        ingredients: [],
      };

      const alternatives = getAlternatives(germanRecipe, SAMPLE_RECIPES);
      const germanRecipes = SAMPLE_RECIPES.filter(recipe => recipe.cuisine === 'German');
      
      expect(alternatives.length).toBeLessThanOrEqual(germanRecipes.length);
      alternatives.forEach((alt) => {
        expect(alt.cuisine).toBe('German');
      });
    });
  });
});