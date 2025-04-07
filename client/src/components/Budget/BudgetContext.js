import React, { createContext, useState, useContext, useEffect } from "react";

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
  
    const getLastSunday = (date) => {
      const day = date.getDay(); 
      const diff = date.getDate() - day;
      return new Date(date.setDate(diff));
    };
  
    const lastSunday = getLastSunday(new Date());
    const lastSundayStr = lastSunday.toISOString().split('T')[0];

    const hasResetThisWeek = storedResetDate === lastSundayStr;
  
    const isSunday = today.getDay() === 0;
    const isAfterSunday = today.getDay() > 0;

    if ((isSunday || isAfterSunday) && !hasResetThisWeek) {
      console.log("Resetting weekly budget for new week");

      setWeeklySpent(0);
      setAddedRecipes([]);
      localStorage.setItem('weeklySpent', '0');
      localStorage.setItem('lastResetDate', lastSundayStr);

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
