import { render, screen, waitFor } from '@testing-library/react';
import RecipeView from '../components/Recipe/RecipeView';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import React from 'react';
import { BudgetContext } from '../components/Budget/BudgetContext';

jest.mock('../components/Budget/BudgetContext', () => ({
    useBudget: () => ({
        budgetMode: false,
        weeklySpent: 0,
        addedRecipes: [],
        addMealCost: jest.fn(),
        toggleBudgetMode: jest.fn(),
    }),
}));

describe('RecipeView component', () => {
    it('calls getRecipe on first load with recipe ID from route params', () => {
        const getRecipe = jest.fn();
        const recipe = {};
        const ingredients = [];
        render(
            <MemoryRouter initialEntries={['/recipes/123']}>
                <Routes>
                    <Route path="/recipes/:id" element={
                        <RecipeView getRecipe={getRecipe} recipe={recipe} ingredients={ingredients} />
                    } />
                </Routes>
            </MemoryRouter>
        );

        expect(getRecipe).toHaveBeenCalledWith('123');
    });

    it('renders recipe name when provided', async () => {
        const getRecipe = jest.fn();
        const recipe = { name: 'test recipe' };
        const ingredients = [];

        render(
            <MemoryRouter initialEntries={['/recipes/123']}>
                <Routes>
                    <Route path="/recipes/:id" element={
                        <RecipeView getRecipe={getRecipe} recipe={recipe} ingredients={ingredients} />
                    } />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/test recipe/i)).toBeInTheDocument();
        });
    });
});