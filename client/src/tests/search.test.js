import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Search from '../components/Search';

describe('Search Component', () => {
    it('renders search button', () => {
        render(
            <MemoryRouter>
                <Search />
            </MemoryRouter>
        );
        expect(screen.getByRole('button', { name: /Find Recipes/i })).toBeInTheDocument();
    });

    it('allows manual ingredient input', () => {
        render(
            <MemoryRouter>
                <Search />
            </MemoryRouter>
        );

        const input = screen.getByLabelText(/Enter an ingredient/i);
        fireEvent.change(input, { target: { value: 'Chicken' } });
        expect(input.value).toBe('Chicken');
    });

    it('adds ingredient when "Add" button is clicked', () => {
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
    });

    it('enables and disables Budget Mode', () => {
        render(
            <MemoryRouter>
                <Search />
            </MemoryRouter>
        );

        const budgetModeButton = screen.getByRole('button', { name: /Enable Budget Mode/i });

        fireEvent.click(budgetModeButton);
        expect(budgetModeButton).toHaveTextContent(/Disable Budget Mode/i);

        fireEvent.click(budgetModeButton);
        expect(budgetModeButton).toHaveTextContent(/Enable Budget Mode/i);
    });

    it('changes max time input', () => {
        render(
            <MemoryRouter>
                <Search />
            </MemoryRouter>
        );

        const maxTimeInput = screen.getByLabelText(/Max Time/i);
        fireEvent.change(maxTimeInput, { target: { value: '30' } });

        expect(maxTimeInput.value).toBe('30');
    });

    it('renders dropdown for cuisines and categories', () => {
        render(
            <MemoryRouter>
                <Search />
            </MemoryRouter>
        );

        expect(screen.getByLabelText(/Cuisines/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Categories/i)).toBeInTheDocument();
    });

    it('renders sorting dropdown', () => {
        render(
            <MemoryRouter>
                <Search />
            </MemoryRouter>
        );

        const sortDropdown = screen.getByLabelText(/Sort by Time/i);
        expect(sortDropdown).toBeInTheDocument();
    });
});