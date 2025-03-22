import React from "react";
import { useBudget } from "./BudgetContext";

const PriceDisplay = ({ price }) => {
  const { budgetMode } = useBudget();

  if (!budgetMode) return null;
  if (price === null || price === undefined) return <span> - Price Not Available</span>;

  return <span> - ${price.toFixed(2)}</span>;
};

export default PriceDisplay;
