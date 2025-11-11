import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "../components/Navbar";

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Navbar Component", () => {
  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render navbar with links", () => {
    renderWithRouter(<Navbar onLogout={mockOnLogout} />);

    expect(screen.getByText("AI-CMO")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Library")).toBeInTheDocument();
    expect(screen.getByText("Sources")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("should call onLogout when logout button is clicked", () => {
    renderWithRouter(<Navbar onLogout={mockOnLogout} />);

    const logoutButton = screen.getByTestId("logout-button");
    logoutButton.click();

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it("should show admin link for admin users", () => {
    const adminUser = { id: "1", username: "admin", role: "admin" };
    renderWithRouter(<Navbar onLogout={mockOnLogout} user={adminUser} />);

    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("should not show admin link for normal users", () => {
    const normalUser = { id: "1", username: "testuser", role: "normal" };
    renderWithRouter(<Navbar onLogout={mockOnLogout} user={normalUser} />);

    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("should not show admin link when user is not provided", () => {
    renderWithRouter(<Navbar onLogout={mockOnLogout} />);

    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });
});
