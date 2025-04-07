import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Profile from '../components/Profile';

// Mock the useBudget hook 
jest.mock('../components/Budget/BudgetContext', () => ({
  useBudget: jest.fn()
}));
import { useBudget } from '../components/Budget/BudgetContext';

describe('Profile Component', () => {
  let originalFetch;

  beforeEach(() => {
    useBudget.mockReturnValue({
      weeklySpent: 0,
      budgetMode: false,
      toggleBudgetMode: jest.fn()
    });

    localStorage.setItem('firebase_uid', 'dummy_uid');
    originalFetch = global.fetch;

    // Provide default fetch stubs
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/getUser')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              express: JSON.stringify({
                user_id: 123,
                first_name: 'Test',
                last_name: 'User',
                email: 'test@example.com'
              })
            })
        });
      }
      if (url.includes('/api/getUserProfile')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              user: { weekly_budget: '100' },
              dietaryPreferences: [1],
              dietaryRestrictions: [{ dietary_id: 2 }],
              alwaysAvailable: [
                { ingredient_name: 'Tomato', expirationDate: '' }
              ],
              healthGoals: []
            })
        });
      }
      if (url.includes('/api/getDietaryPreferences')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([{ preference_id: 1, preference_name: 'Vegetarian' }])
        });
      }
      if (url.includes('/api/getDietaryRestrictions')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([{ dietary_id: 2, dietary_name: 'Gluten-Free' }])
        });
      }
      if (url.includes('/api/getIngredients')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { ingredient_id: 3, name: 'Tomato', type: 'Vegetable' },
              { ingredient_id: 4, name: 'Basil', type: 'Herb' }
            ])
        });
      }
      if (url.includes('/api/getHealthGoals')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      }
      if (url.includes('/api/getUserRecipes')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              tried: [{ recipe_id: 1, name: "Tomato Soup" }],
              favourites: [{ recipe_id: 2, name: "Vegetable Stir-fry" }]
            })
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      });
    });
  });

  afterEach(() => {
    localStorage.clear();
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('renders the User Profile heading', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );
    });
    expect(screen.getByText(/user profile/i)).toBeInTheDocument();
  });

  it('renders the main form fields', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );
    });
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/weekly budget/i)).toBeInTheDocument();
  });

  it('does not allow editing the First Name field (read-only)', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );
    });
    const firstNameInput = screen.getByLabelText(/first name/i);
    expect(firstNameInput).toHaveAttribute('readonly');
    fireEvent.change(firstNameInput, { target: { value: 'Ryan' } });
    expect(firstNameInput.value).not.toBe('Ryan');
  });

  it('does not allow editing the Last Name field (read-only)', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );
    });
    const lastNameInput = screen.getByLabelText(/last name/i);
    expect(lastNameInput).toHaveAttribute('readonly');
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
    expect(lastNameInput.value).not.toBe('Smith');
  });

  it('does not allow editing the Email field (read-only)', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );
    });
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('readonly');
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    expect(emailInput.value).not.toBe('new@example.com');
  });

  it('renders the Update Profile button', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );
    });
    const updateBtn = screen.getByRole('button', { name: /update profile/i });
    expect(updateBtn).toBeInTheDocument();
  });

  it('redirects to Login if firebase_uid is missing', async () => {
    localStorage.clear();
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    await act(async () => {
      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );
    });
    expect(alertMock).toHaveBeenCalledWith('You must log in first!');
    alertMock.mockRestore();
  });

  it('allows selecting a dietary preference from the multi-select', async () => {
    global.fetch.mockImplementationOnce((url) => {
      if (url.includes('/api/getDietaryPreferences')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { preference_id: 1, preference_name: 'Vegetarian' },
              { preference_id: 2, preference_name: 'Vegan' }
            ])
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      });
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );
    });

    const input = await screen.findByLabelText(/dietary preferences/i);
    userEvent.click(input); 
    const option = await screen.findByText(/vegetarian/i);
    userEvent.click(option);
    await waitFor(() => {
      expect(screen.getByText(/vegetarian/i)).toBeInTheDocument();
    });
  });

});
