import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react'; // ✅ Fixed import
import { MemoryRouter } from 'react-router-dom';
import RecipeView from '../components/Recipe/RecipeView';

describe('RecipeView Scaling Functionality', () => {
  const mockRecipe = {
    name: "Test Recipe",
    category: "Dinner",
    type: "Italian",
    prep_time: 30,
    instructions: "Step 1. Step 2. Step 3."
  };

  const mockIngredients = [
    { ingredient_id: 1, name: "Flour", quantity: 200, quantity_type: "g", required: 1, price: 2.50 },
    { ingredient_id: 2, name: "Milk", quantity: 100, quantity_type: "ml", required: 1, price: 1.50 },
    { ingredient_id: 3, name: "Salt", quantity: 5, quantity_type: "g", required: 0, price: 0.10 },
  ];

  it('renders the RecipeView component with ingredients', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <RecipeView getRecipe={jest.fn()} recipe={mockRecipe} ingredients={mockIngredients} />
        </MemoryRouter>
      );
    });

    expect(screen.getByRole("heading", { level: 4, name: /test recipe/i })).toBeInTheDocument();
    expect(screen.getByText(/200 g Flour/i)).toBeInTheDocument();
    expect(screen.getByText(/100 ml Milk/i)).toBeInTheDocument();
    expect(screen.getByText(/5 g Salt/i)).toBeInTheDocument();
  });

  it('allows selecting a base ingredient for scaling', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <RecipeView getRecipe={jest.fn()} recipe={mockRecipe} ingredients={mockIngredients} budgetMode={true} />
        </MemoryRouter>
      );
    });

    // Open the dropdown
    const dropdown = screen.getByLabelText(/base ingredient for scaling/i);
    fireEvent.mouseDown(dropdown);

    // Select "Flour"
    const flourOption = screen.getByText("Flour");
    fireEvent.click(flourOption);

    // Verify the selection
    expect(dropdown).toHaveTextContent("Flour");
  });
});
