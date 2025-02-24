import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../components/Login';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import React from 'react';

// Mock useNavigate from react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

describe('Login Component', () => {
    it('renders login form by default', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('toggles to sign-up mode when clicked', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Don't have an account? Sign Up here"));
        
        expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/personal name/i)).toBeInTheDocument();
    });
});
