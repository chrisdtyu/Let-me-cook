import React from "react";
import { useBudget } from "./BudgetContext";

const PriceDisplay = ({ price, ingredientId, alwaysAvailable }) => {
  const { budgetMode } = useBudget();

  if (!budgetMode) return null;
  if (price === null || price === undefined) return <span> - Price Not Available</span>;

  // exclude the always avaiable ingredients
  if (alwaysAvailable && alwaysAvailable.includes(ingredientId)) {
    return null;
  }

  return <span> - ${price.toFixed(2)}</span>;
};

export default PriceDisplay;
