import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "../components/App";

describe("App rendering", () => {
    test("App renders Home page by default", () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );
      expect(screen.getByText(/home/i)).toBeInTheDocument();
    });
  });
  