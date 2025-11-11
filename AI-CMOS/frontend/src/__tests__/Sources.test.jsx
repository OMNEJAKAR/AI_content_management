import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Sources from "../pages/Sources";

jest.mock("../utils/fsStorage", () => ({
  getAllFolderHandles: jest.fn().mockResolvedValue([]),
}));

jest.mock("../components/AddSourceModal", () => () => (
  <div data-testid="mock-modal">Modal</div>
));

describe("Sources Page (light behavior)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders and shows Add Local Source button", () => {
    render(<Sources />);
    expect(screen.getByText("Sources")).toBeInTheDocument();
    expect(screen.getByText("+ Add Local Source")).toBeInTheDocument();
  });

  it("opens modal when Add Local Source is clicked", () => {
    render(<Sources />);
    fireEvent.click(screen.getByText("+ Add Local Source"));
    expect(screen.getByTestId("mock-modal")).toBeInTheDocument();
  });

  it("loads sources from localStorage and displays them", async () => {
    const stored = [
      { id: "1", name: "Docs", files: ["a.txt", "b.txt"], connected: false },
    ];
    localStorage.setItem("localSources_guest", JSON.stringify(stored));

    render(<Sources />);

    await waitFor(() => {
      expect(screen.getByText(/Docs/)).toBeInTheDocument();
    });
  });
});
