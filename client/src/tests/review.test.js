import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Review from '../components/ReviewForm/ReviewForm';

jest.mock('../components/ReviewForm/Api', () => ({
  __esModule: true,
  default: {
    callApiAddReview: jest.fn(() => Promise.resolve({ body: 'mock success' })),
    callApiGetUser: jest.fn(() => Promise.resolve({ express: JSON.stringify({ user_id: 123 }) })),
  },
}));

import Api from '../components/ReviewForm/Api';

describe('Review component', () => {
  beforeEach(() => {
    localStorage.setItem('firebase_uid', 'test-uid');
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders the review form with all input fields', async () => {
    render(
      <MemoryRouter>
        <Review recipeId="123" reviewSubmitted={() => {}} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(Api.callApiGetUser).toHaveBeenCalled();
    });

    expect(screen.getByLabelText(/review title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^review$/i)).toBeInTheDocument();
    expect(screen.getByLabelText('5')).toBeInTheDocument(); // rating input
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  test('lets the user fill out the review form', async () => {
    render(
      <MemoryRouter>
        <Review recipeId="123" reviewSubmitted={() => {}} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(Api.callApiGetUser).toHaveBeenCalled();
    });

    const titleInput = screen.getByLabelText(/review title/i);
    const bodyInput = screen.getByLabelText(/^review$/i);
    const ratingInput = screen.getByLabelText('5');

    fireEvent.change(titleInput, { target: { value: 'Absolutely Delicious!' } });
    fireEvent.change(bodyInput, { target: { value: 'Awesome recipe!' } });
    fireEvent.click(ratingInput);

    expect(titleInput.value).toBe('Absolutely Delicious!');
    expect(bodyInput.value).toBe('Awesome recipe!');
    expect(ratingInput.checked).toBe(true);
  });

  test('submits a review with valid data', async () => {
    jest.useFakeTimers(); // handle setTimeout in form
    const mockSubmit = jest.fn();

    render(
      <MemoryRouter>
        <Review recipeId="123" reviewSubmitted={mockSubmit} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(Api.callApiGetUser).toHaveBeenCalled();
    });

    fireEvent.change(screen.getByLabelText(/review title/i), {
      target: { value: 'Absolutely Delicious!' },
    });

    fireEvent.change(screen.getByLabelText(/^review$/i), {
      target: { value: 'Awesome recipe!' },
    });

    fireEvent.click(screen.getByLabelText('5'));

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(Api.callApiAddReview).toHaveBeenCalledWith({
        user_id: 123,
        recipe_id: '123',
        review_title: 'Absolutely Delicious!',
        review_score: '5',
        review_content: 'Awesome recipe!',
      });
    });

    jest.advanceTimersByTime(1000); // simulate setTimeout delay

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });

    jest.useRealTimers(); // cleanup
  });
});