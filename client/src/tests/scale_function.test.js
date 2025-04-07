import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RecipeView from '../components/Recipe/RecipeView';
import { BudgetProvider } from '../components/Budget/BudgetContext';

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

  it('allows selecting a base ingredient for scaling', async () => {
    await act(async () => {
      render(
        <BudgetProvider>
          <MemoryRouter>
            <RecipeView
              getRecipe={jest.fn()}
              recipe={mockRecipe}
              ingredients={mockIngredients}
            />
          </MemoryRouter>
        </BudgetProvider>
      );
    });

    const dropdown = screen.getByLabelText(/base ingredient/i);
    fireEvent.mouseDown(dropdown);

    const flourOption = await screen.findByText("Flour");
    fireEvent.click(flourOption);

    expect(dropdown).toHaveTextContent("Flour");
  });
});
