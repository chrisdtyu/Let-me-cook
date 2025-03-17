import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../components/App";

describe("App rendering", () => {
    test("App renders Home page by default", () => {
      render(<App />); 
      expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
    });
});
