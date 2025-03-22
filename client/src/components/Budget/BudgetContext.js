import { createContext, useState, useContext } from "react";

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [budgetMode, setBudgetMode] = useState(false);

  const toggleBudgetMode = () => setBudgetMode(prev => !prev);

  return (
    <BudgetContext.Provider value={{ budgetMode, toggleBudgetMode }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => useContext(BudgetContext);
