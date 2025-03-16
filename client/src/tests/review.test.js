import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RecipeView from '../components/Recipe/RecipeView';


const mockGetRecipe = jest.fn();
const mockRecipe = { name: 'Test Recipe' };
const mockIngredients = [];

test('renders the Leave a Review button and review form on button click', async () => {
  render(
    <MemoryRouter>
      <RecipeView getRecipe={mockGetRecipe} recipe={mockRecipe} ingredients={mockIngredients} />
    </MemoryRouter>
  );

  const reviewButton = screen.getByText(/Leave a Review/i);
  expect(reviewButton).toBeInTheDocument();

  fireEvent.click(reviewButton);
  await waitFor(() => {
    expect(screen.getByLabelText(/Review Title/i)).toBeInTheDocument();
  });
});


  
