import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BudgetProvider, useBudget } from '../components/Budget/BudgetContext';
import PriceDisplay from '../components/Budget/PriceDisplay';

const BudgetTestComponent = () => {
  const {
    budgetMode,
    toggleBudgetMode,
    weeklySpent,
    addMealCost
  } = useBudget();

  return (
    <div>
      <p>Budget Mode: {budgetMode ? 'ON' : 'OFF'}</p>
      <p>Weekly Spent: ${weeklySpent.toFixed(2)}</p>
      <button onClick={toggleBudgetMode}>Toggle Budget</button>
      <button onClick={() => addMealCost(1, 5)}>Add $5 Meal</button>
    </div>
  );
};

describe('BudgetContext', () => {
  beforeEach(() => {
    localStorage.clear(); 
  });

  it('toggles budget mode', () => {
    render(
      <BudgetProvider>
        <BudgetTestComponent />
      </BudgetProvider>
    );

    expect(screen.getByText(/Budget Mode: OFF/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Toggle Budget/i));
    expect(screen.getByText(/Budget Mode: ON/i)).toBeInTheDocument();
  });

  it('adds a meal cost and updates weeklySpent', () => {
    render(
      <BudgetProvider>
        <BudgetTestComponent />
      </BudgetProvider>
    );

    fireEvent.click(screen.getByText(/Add \$5 Meal/i));
    expect(screen.getByText(/Weekly Spent: \$5.00/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Add \$5 Meal/i));
    expect(screen.getByText(/Weekly Spent: \$10.00/i)).toBeInTheDocument();
  });
});

test('displays price only in budget mode and not for always available', () => {
    const { queryByText, rerender } = render(
      <BudgetProvider>
        <PriceDisplay price={2.5} ingredientId={1} alwaysAvailable={[]} />
      </BudgetProvider>
    );
  
    expect(queryByText(/\$2.50/)).not.toBeInTheDocument();
});
