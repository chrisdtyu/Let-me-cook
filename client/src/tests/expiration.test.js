import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Profile from '../components/Profile';
import { MemoryRouter } from 'react-router-dom';

// Mock BudgetContext 
jest.mock('../components/Budget/BudgetContext', () => ({
  useBudget: () => ({
    weeklySpent: 0, 
  }),
}));

describe('Profile Expiration Date Tests', () => {
  let alwaysAvailableData;

  beforeAll(() => {
    // Set the current date to a fixed point
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date('2025-04-07'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    localStorage.setItem('firebase_uid', 'test_uid');

    // Mock global.fetch to return responses for API endpoints
    jest.spyOn(global, 'fetch').mockImplementation((url, options) => {
      if (url.includes('/api/getUserProfile')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              user: {
                user_id: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                weekly_budget: '100'
              },
              dietaryPreferences: [],
              dietaryRestrictions: [],
              alwaysAvailable: alwaysAvailableData,
              healthGoals: []
            })
        });
      }
      if (url.includes('/api/getUser')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              express: JSON.stringify({
                user_id: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com'
              })
            })
        });
      }
      if (url.includes('/api/getDietaryPreferences')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.includes('/api/getDietaryRestrictions')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.includes('/api/getIngredients')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.includes('/api/getHealthGoals')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });

  test('displays "Expiring soon" when ingredient expiration is within 7 days', async () => {
    alwaysAvailableData = [
      {
        ingredient_name: 'Milk',
        expirationDate: '2025-04-10',
        loadedFromDB: true
      }
    ];

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/User Profile/i)).toBeInTheDocument());

    await waitFor(() => {
      expect(screen.getByText(/Expiring soon/i)).toBeInTheDocument();
    });
  });

  test('does not display "Expiring soon" when ingredient expiration is more than 7 days away', async () => {
    alwaysAvailableData = [
      {
        ingredient_name: 'Milk',
        expirationDate: '2025-04-20',
        loadedFromDB: true
      }
    ];

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/User Profile/i)).toBeInTheDocument());

    await waitFor(() => {
      expect(screen.queryByText(/Expiring soon/i)).toBeNull();
    });
  });
});
