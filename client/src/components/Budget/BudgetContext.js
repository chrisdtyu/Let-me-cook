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
    const storedResetDate = localStorage.getItem('lastResetDate');
    const todayStr = today.toISOString().split('T')[0];
  
    const getWeekNumber = (date) => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    };
  
    const currentWeek = getWeekNumber(today);
    const lastResetWeek = storedResetDate ? getWeekNumber(new Date(storedResetDate)) : null;
  
    if (storedResetDate === null || currentWeek !== lastResetWeek) {
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
