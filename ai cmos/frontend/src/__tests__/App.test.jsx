import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import * as authApi from "../api/auth";

// Mock the auth API
jest.mock("../api/auth");

describe("App Component", () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("should render login page when not logged in", () => {
    render(<App />);
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
  });

  it("should login successfully and show dashboard", async () => {
    const mockUser = { id: "1", username: "testuser", role: "normal" };
    const mockToken = "mock-token";

    authApi.login.mockResolvedValue({
      token: mockToken,
      user: mockUser
    });

    render(<App />);

    const usernameInput = screen.getByTestId("username-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitButton = screen.getByTestId("submit-button");

    await userEvent.type(usernameInput, "testuser");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId("navbar")).toBeInTheDocument();
      expect(screen.getByText("Welcome, testuser!")).toBeInTheDocument();
    });

    expect(localStorage.getItem("authToken")).toBe(mockToken);
    expect(localStorage.getItem("user")).toBe(JSON.stringify(mockUser));
  });

  it("should signup successfully", async () => {
    authApi.signup.mockResolvedValue({
      message: "User created",
      user: { id: "1", username: "newuser", role: "normal" }
    });

    render(<App />);

    // Toggle to signup
    fireEvent.click(screen.getByTestId("toggle-to-signup"));

    const usernameInput = screen.getByTestId("username-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitButton = screen.getByTestId("submit-button");

    await userEvent.type(usernameInput, "newuser");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(authApi.signup).toHaveBeenCalledWith("newuser", "password123");
    });
  });

  it("should display error message on login failure", async () => {
    authApi.login.mockRejectedValue(new Error("Invalid credentials"));

    render(<App />);

    const usernameInput = screen.getByTestId("username-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitButton = screen.getByTestId("submit-button");

    await userEvent.type(usernameInput, "testuser");
    await userEvent.type(passwordInput, "wrongpassword");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("should logout successfully", async () => {
    const mockUser = { id: "1", username: "testuser", role: "normal" };
    const mockToken = "mock-token";

    // Set up logged in state
    localStorage.setItem("authToken", mockToken);
    localStorage.setItem("user", JSON.stringify(mockUser));

    authApi.logout.mockResolvedValue({ message: "Logged out successfully" });

    render(<App />);

    // Should be logged in
    expect(screen.getByTestId("navbar")).toBeInTheDocument();

    // Click logout
    const logoutButton = screen.getByTestId("logout-button");
    await userEvent.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });

    expect(localStorage.getItem("authToken")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("should restore session from localStorage on mount", () => {
    const mockUser = { id: "1", username: "testuser", role: "normal" };
    const mockToken = "mock-token";

    localStorage.setItem("authToken", mockToken);
    localStorage.setItem("user", JSON.stringify(mockUser));

    render(<App />);

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByText("Welcome, testuser!")).toBeInTheDocument();
  });

  it("should show admin link for admin users", () => {
    const mockUser = { id: "1", username: "admin", role: "admin" };
    const mockToken = "mock-token";

    localStorage.setItem("authToken", mockToken);
    localStorage.setItem("user", JSON.stringify(mockUser));

    render(<App />);

    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("should not show admin link for normal users", () => {
    const mockUser = { id: "1", username: "testuser", role: "normal" };
    const mockToken = "mock-token";

    localStorage.setItem("authToken", mockToken);
    localStorage.setItem("user", JSON.stringify(mockUser));

    render(<App />);

    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });
});
