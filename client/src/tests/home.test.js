import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import Home from "../components/Home";

// Mock useNavigate from react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("Home Component", () => {
  test("renders welcome text and the button", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/Let Me Cook/i).length).toBeGreaterThan(1);
    expect(screen.getByRole("button", { name: /Get Cooking!/i })).toBeInTheDocument();
  });

  test("navigates to /Search when the button is clicked", () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: /Get Cooking!/i });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith("/Search");
  });
});
