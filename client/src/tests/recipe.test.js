import { render, screen } from '@testing-library/react';
import RecipeView from '../components/Recipe/RecipeView';
import { MemoryRouter } from 'react-router-dom';  // Import MemoryRouter
import '@testing-library/jest-dom'
import React from 'react';

describe('RecipeLoading', () => {
    it('loads recipe chosen on first load', () => {
        const getRecipe = jest.fn().mockName('getRecipe');
        const recipe= {};
        const ingredients = [];
        render(
            <MemoryRouter>
                <RecipeView getRecipe={getRecipe} recipe={recipe} ingredients={ingredients} />
            </MemoryRouter>
        );
        expect(getRecipe).toHaveBeenCalled();
    });
    it('uses recipe name', () => {
        const getRecipe = jest.fn().mockName('getRecipe');
        const recipe= {name: "test recipe"};
        const ingredients = [];
        render(
            <MemoryRouter>
                <RecipeView getRecipe={getRecipe} recipe={recipe} ingredients={ingredients} />
            </MemoryRouter>
        );
        expect(screen.getByText('test recipe')).toBeInTheDocument();
    });
});
