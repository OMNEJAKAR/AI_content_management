import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Dashboard from "../pages/Dashboard";
import { MemoryRouter } from "react-router-dom";

describe("Dashboard Page (light behavior)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderWithRouter = (ui) =>
    render(<MemoryRouter>{ui}</MemoryRouter>);

  it("renders dashboard and welcome message", () => {
    renderWithRouter(<Dashboard user={{ username: "parthiv" }} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Welcome, parthiv!")).toBeInTheDocument();
  });

  it("shows empty local sources state", () => {
    renderWithRouter(<Dashboard />);
    expect(
      screen.getByText("No local folders yet. Add one in “Sources.”")
    ).toBeInTheDocument();
  });

  it("shows local sources when available", () => {
    const stored = [
      { id: "1", name: "Projects", files: ["a.txt"], connected: true },
    ];
    localStorage.setItem("localSources_guest", JSON.stringify(stored));

    renderWithRouter(<Dashboard />);

    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Files: 1")).toBeInTheDocument();
  });

  it("opens delete confirmation modal", () => {
    const stored = [
      { id: "1", name: "Projects", files: ["a.txt"], connected: true },
    ];
    localStorage.setItem("localSources_guest", JSON.stringify(stored));

    renderWithRouter(<Dashboard />);
    fireEvent.click(screen.getByText("Delete"));
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
  });
});
