import { createContext, useState, useContext } from "react";

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [budgetMode, setBudgetMode] = useState(false);
  const [addedRecipes, setAddedRecipes] = useState([]);
  const storedWeeklySpent = parseFloat(localStorage.getItem('weeklySpent')) || 0;
  const [weeklySpent, setWeeklySpent] = useState(storedWeeklySpent);


  const toggleBudgetMode = () => setBudgetMode(prev => !prev);

  const addMealCost = (recipeId, cost) => {
    const newSpent = weeklySpent + parseFloat(cost);
    setWeeklySpent(newSpent);
    localStorage.setItem('weeklySpent', newSpent.toFixed(2));
  
    // Optional: Track added recipes (if needed for duplicate prevention later)
    setAddedRecipes(prev => [...prev, { recipeId, cost: parseFloat(cost) }]);
  };


  return (
    <BudgetContext.Provider 
      value={{ 
        budgetMode, 
        toggleBudgetMode,
        weeklySpent,
        addedRecipes,
        addMealCost}}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => useContext(BudgetContext);
