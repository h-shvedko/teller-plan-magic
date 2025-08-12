export type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
  aisle: string; // e.g., Produce, Dairy, Pantry
};

export type Recipe = {
  id: string;
  title: string;
  cuisine: "Italian" | "Vietnamese" | "Mexican" | "German" | "Indian";
  dietary: Array<"Vegetarian" | "Vegan" | "Gluten-Free" | "Dairy-Free" | "Pescatarian">;
  time: number; // minutes
  difficulty: "Easy" | "Medium" | "Hard";
  suitableForBatch?: boolean;
  ingredients: Ingredient[];
};

export const SAMPLE_RECIPES: Recipe[] = [
  {
    id: "tuscan-salmon",
    title: "Creamy Tuscan Salmon",
    cuisine: "Italian",
    dietary: ["Pescatarian"],
    time: 30,
    difficulty: "Easy",
    suitableForBatch: false,
    ingredients: [
      { name: "salmon fillets", quantity: 2, unit: "pcs", aisle: "Seafood" },
      { name: "spinach", quantity: 150, unit: "g", aisle: "Produce" },
      { name: "cherry tomatoes", quantity: 200, unit: "g", aisle: "Produce" },
      { name: "cream", quantity: 200, unit: "ml", aisle: "Dairy" },
      { name: "garlic", quantity: 3, unit: "cloves", aisle: "Produce" },
    ],
  },
  {
    id: "lemongrass-chicken",
    title: "Lemongrass Chicken",
    cuisine: "Vietnamese",
    dietary: [],
    time: 35,
    difficulty: "Medium",
    suitableForBatch: true,
    ingredients: [
      { name: "chicken thighs", quantity: 600, unit: "g", aisle: "Meat" },
      { name: "lemongrass", quantity: 2, unit: "stalks", aisle: "Produce" },
      { name: "fish sauce", quantity: 2, unit: "tbsp", aisle: "Pantry" },
      { name: "lime", quantity: 1, unit: "pc", aisle: "Produce" },
      { name: "garlic", quantity: 3, unit: "cloves", aisle: "Produce" },
    ],
  },
  {
    id: "black-bean-quesadillas",
    title: "Black Bean Quesadillas",
    cuisine: "Mexican",
    dietary: ["Vegetarian"],
    time: 20,
    difficulty: "Easy",
    suitableForBatch: true,
    ingredients: [
      { name: "tortillas", quantity: 6, unit: "pcs", aisle: "Bakery" },
      { name: "black beans", quantity: 400, unit: "g", aisle: "Pantry" },
      { name: "cheddar", quantity: 150, unit: "g", aisle: "Dairy" },
      { name: "onion", quantity: 1, unit: "pc", aisle: "Produce" },
      { name: "bell pepper", quantity: 1, unit: "pc", aisle: "Produce" },
    ],
  },
  {
    id: "lentil-bolognese",
    title: "Lentil Bolognese",
    cuisine: "Italian",
    dietary: ["Vegan"],
    time: 40,
    difficulty: "Easy",
    suitableForBatch: true,
    ingredients: [
      { name: "red lentils", quantity: 250, unit: "g", aisle: "Pantry" },
      { name: "tomato passata", quantity: 500, unit: "ml", aisle: "Pantry" },
      { name: "onion", quantity: 1, unit: "pc", aisle: "Produce" },
      { name: "carrot", quantity: 1, unit: "pc", aisle: "Produce" },
      { name: "garlic", quantity: 2, unit: "cloves", aisle: "Produce" },
    ],
  },
  {
    id: "bratkartoffeln",
    title: "Bratkartoffeln mit Spiegelei",
    cuisine: "German",
    dietary: [],
    time: 25,
    difficulty: "Easy",
    suitableForBatch: false,
    ingredients: [
      { name: "potatoes", quantity: 600, unit: "g", aisle: "Produce" },
      { name: "eggs", quantity: 4, unit: "pcs", aisle: "Dairy" },
      { name: "onion", quantity: 1, unit: "pc", aisle: "Produce" },
      { name: "butter", quantity: 30, unit: "g", aisle: "Dairy" },
    ],
  },
  {
    id: "chana-masala",
    title: "Chana Masala",
    cuisine: "Indian",
    dietary: ["Vegan", "Gluten-Free"],
    time: 35,
    difficulty: "Medium",
    suitableForBatch: true,
    ingredients: [
      { name: "chickpeas", quantity: 400, unit: "g", aisle: "Pantry" },
      { name: "tomatoes", quantity: 3, unit: "pcs", aisle: "Produce" },
      { name: "onion", quantity: 1, unit: "pc", aisle: "Produce" },
      { name: "garam masala", quantity: 2, unit: "tsp", aisle: "Pantry" },
    ],
  },
  {
    id: "roasted-veg-bowls",
    title: "Roasted Veggie Bowls",
    cuisine: "German",
    dietary: ["Vegetarian", "Gluten-Free"],
    time: 30,
    difficulty: "Easy",
    suitableForBatch: true,
    ingredients: [
      { name: "sweet potato", quantity: 2, unit: "pcs", aisle: "Produce" },
      { name: "broccoli", quantity: 1, unit: "head", aisle: "Produce" },
      { name: "feta", quantity: 150, unit: "g", aisle: "Dairy" },
    ],
  },
  {
    id: "pasta-arrabbiata",
    title: "Pasta Arrabbiata",
    cuisine: "Italian",
    dietary: ["Vegetarian"],
    time: 20,
    difficulty: "Easy",
    suitableForBatch: true,
    ingredients: [
      { name: "pasta", quantity: 400, unit: "g", aisle: "Pantry" },
      { name: "tomato passata", quantity: 400, unit: "ml", aisle: "Pantry" },
      { name: "garlic", quantity: 2, unit: "cloves", aisle: "Produce" },
      { name: "chili flakes", quantity: 1, unit: "tsp", aisle: "Pantry" },
    ],
  },
  {
    id: "pho-ga",
    title: "Pho Ga (Chicken Pho)",
    cuisine: "Vietnamese",
    dietary: [],
    time: 60,
    difficulty: "Medium",
    suitableForBatch: true,
    ingredients: [
      { name: "chicken", quantity: 1, unit: "kg", aisle: "Meat" },
      { name: "rice noodles", quantity: 300, unit: "g", aisle: "Pantry" },
      { name: "ginger", quantity: 1, unit: "pc", aisle: "Produce" },
      { name: "spring onion", quantity: 2, unit: "pcs", aisle: "Produce" },
    ],
  },
];

export function getAlternatives(recipe: Recipe, all: Recipe[], limit = 3) {
  return all
    .filter((r) => r.id !== recipe.id && r.cuisine === recipe.cuisine)
    .slice(0, limit);
}
