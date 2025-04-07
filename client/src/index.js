import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./components/App";
import { BudgetProvider } from "./components/Budget/BudgetContext"; 

import * as serviceWorker from "./serviceWorker";

ReactDOM.render(
  <BudgetProvider>
    <App />
  </BudgetProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
