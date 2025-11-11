import React from "react";
import { render, screen } from "@testing-library/react";
import LocalViewer from "../pages/LocalViewer";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "1" }),
}));

jest.mock("../utils/fsStorage", () => ({
  getAllFolderHandles: jest.fn().mockResolvedValue([]),
}));

describe("LocalViewer Page (light behavior)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows 'Folder not found' when ID not found", () => {
    render(<LocalViewer />);
    expect(screen.getByText("Folder not found.")).toBeInTheDocument();
  });

  it("renders folder name when found in storage", async () => {
    const stored = [
      { id: "1", name: "MyFolder", files: ["a.txt", "b.txt"] },
    ];
    localStorage.setItem("localSources_guest", JSON.stringify(stored));

    render(<LocalViewer />);

    expect(await screen.findByText("MyFolder")).toBeInTheDocument();
  });
});
