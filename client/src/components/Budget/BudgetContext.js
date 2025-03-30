import { createContext, useState, useContext, useEffect } from "react";

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
  };

  // Weekly budget Reset
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const storedResetDate = localStorage.getItem('lastResetDate');
  
    const todayStr = today.toISOString().split('T')[0];
  
    if (dayOfWeek === 0 && storedResetDate !== todayStr) {
      console.log("Resetting weekly budget for new week");
  
      setWeeklySpent(0);
      setAddedRecipes([]);
      localStorage.setItem('weeklySpent', '0');
      localStorage.setItem('lastResetDate', todayStr);

      alert("It's a new week! Please update your weekly budget in your profile.");
    }
  }, []);


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
