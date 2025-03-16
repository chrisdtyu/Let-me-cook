import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RecipeView from '../RecipeView';

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

  it('renders the RecipeView component with ingredients', () => {
    render(
      <MemoryRouter>
        <RecipeView getRecipe={jest.fn()} recipe={mockRecipe} ingredients={mockIngredients} budgetMode={true} />
      </MemoryRouter>
    );

    expect(screen.getByText(/test recipe/i)).toBeInTheDocument();
    expect(screen.getByText(/200 g Flour/i)).toBeInTheDocument();
    expect(screen.getByText(/100 ml Milk/i)).toBeInTheDocument();
    expect(screen.getByText(/5 g Salt/i)).toBeInTheDocument();
  });

  it('allows selecting a base ingredient for scaling', () => {
    render(
      <MemoryRouter>
        <RecipeView getRecipe={jest.fn()} recipe={mockRecipe} ingredients={mockIngredients} budgetMode={true} />
      </MemoryRouter>
    );

    const baseIngredientDropdown = screen.getByLabelText(/base ingredient for scaling/i);
    fireEvent.change(baseIngredientDropdown, { target: { value: 1 } });

    expect(baseIngredientDropdown.value).toBe("1");
  });

  it('updates ingredient quantities when scaling is adjusted', () => {
    render(
      <MemoryRouter>
        <RecipeView getRecipe={jest.fn()} recipe={mockRecipe} ingredients={mockIngredients} budgetMode={true} />
      </MemoryRouter>
    );

    // Select Flour as base ingredient
    const baseIngredientDropdown = screen.getByLabelText(/base ingredient for scaling/i);
    fireEvent.change(baseIngredientDropdown, { target: { value: 1 } });

    // Adjust slider for scaling
    const slider = screen.getByLabelText("slider");
    fireEvent.change(slider, { target: { value: 400 } });

    // Check updated ingredient values
    expect(screen.getByText(/400 g Flour/i)).toBeInTheDocument();
    expect(screen.getByText(/200 ml Milk/i)).toBeInTheDocument();
    expect(screen.getByText(/5 g Salt/i)).toBeInTheDocument();
  });
});
