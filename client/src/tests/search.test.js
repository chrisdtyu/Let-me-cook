import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Search from '../components/Search';

// Mock BudgetContext
jest.mock('../components/Budget/BudgetContext', () => ({
  useBudget: () => ({
    budgetMode: false,
    toggleBudgetMode: jest.fn(),
  }),
}));

// Mock Api methods used in Search
jest.mock('../components/Search/Api', () => ({
  getIngredients: jest.fn(() => Promise.resolve([{ name: 'Chicken' }, { name: 'Beef' }])),
  getCuisines: jest.fn(() => Promise.resolve(['Italian', 'Chinese'])),
  getCategories: jest.fn(() => Promise.resolve(['Dinner', 'Lunch'])),
  getIngTypes: jest.fn(() => Promise.resolve(['Meat', 'Vegetable'])),
  callApiRecommendRecipes: jest.fn(() => Promise.resolve([])),
  getUserSearchProfile: jest.fn(() => Promise.resolve({ dietaryRestrictions: ['Peanuts'] })),
  getUserProfile: jest.fn(() => Promise.resolve([])),
  markTried: jest.fn(() => Promise.resolve({ message: 'Marked as tried' })),
  unmarkTried: jest.fn(() => Promise.resolve({ message: 'Unmarked as tried' })),
  markFavourite: jest.fn(() => Promise.resolve({ message: 'Marked as favourite' })),
  unmarkFavourite: jest.fn(() => Promise.resolve({ message: 'Unmarked as favourite' })),
}));

describe('Search Component (Expanded)', () => {
  beforeEach(() => {
    localStorage.setItem('firebase_uid', 'test_uid');
  });

  it('shows message when no recipes are found', async () => {
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Enter an ingredient/i), {
      target: { value: 'Chicken' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Add/i }));
    fireEvent.click(screen.getByRole('button', { name: /Find Recipes/i }));

    await waitFor(() => {
      expect(screen.getByText(/No recipes found/i)).toBeInTheDocument();
    });
  });

  it('renders ingredient type dropdown and filters', async () => {
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Ingredient Type/i)).toBeInTheDocument();
    });
  });

  it('renders sorting options and sort order fields', () => {
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Sort By/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sort Order/i)).toBeInTheDocument();
  });

  it('allows adding multiple manual ingredients', async () => {
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    const input = screen.getByLabelText(/Enter an ingredient/i);
    const addButton = screen.getByRole('button', { name: /Add/i });

    fireEvent.change(input, { target: { value: 'Chicken' } });
    fireEvent.click(addButton);
    expect(screen.getByText('Chicken')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Rice' } });
    fireEvent.click(addButton);
    expect(screen.getByText('Rice')).toBeInTheDocument();
  });

  it('toggles budget mode button text', async () => {
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    const budgetButton = screen.getByRole('button', { name: /Enable Budget Mode/i });
    expect(budgetButton).toBeInTheDocument();
    fireEvent.click(budgetButton);
  });

  it('lets user select cuisines and categories', async () => {
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Cuisines/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Categories/i)).toBeInTheDocument();
    });

    const cuisineInput = screen.getByLabelText(/Cuisines/i);
    const categoryInput = screen.getByLabelText(/Categories/i);
    expect(cuisineInput).toBeInTheDocument();
    expect(categoryInput).toBeInTheDocument();
  });

  it('changes sort option and order', async () => {
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    const sortOption = screen.getByLabelText(/Sort By/i);
    fireEvent.mouseDown(sortOption); 
    const ratingOption = await screen.findByText('Rating');
    fireEvent.click(ratingOption);
 
    expect(sortOption).toHaveTextContent('Rating');

    const sortOrder = screen.getByLabelText(/Sort Order/i);
    fireEvent.change(sortOrder, { target: { value: 'descending' } });
    expect(sortOrder.value).toBe('descending');
  });
});
