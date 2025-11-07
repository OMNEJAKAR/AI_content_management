import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../pages/auth/Login";

describe("Login Component", () => {
  const mockOnLogin = jest.fn();
  const mockOnSignup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render login form by default", () => {
    render(<Login onLogin={mockOnLogin} onSignup={mockOnSignup} />);
    
    expect(screen.getByText("AI-CMO Login")).toBeInTheDocument();
    expect(screen.getByTestId("username-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("should toggle to signup form", () => {
    render(<Login onLogin={mockOnLogin} onSignup={mockOnSignup} />);
    
    const toggleButton = screen.getByTestId("toggle-to-signup");
    fireEvent.click(toggleButton);

    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("should call onLogin with correct credentials", async () => {
    const user = userEvent.setup();
    mockOnLogin.mockResolvedValue({});

    render(<Login onLogin={mockOnLogin} onSignup={mockOnSignup} />);
    
    const usernameInput = screen.getByTestId("username-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitButton = screen.getByTestId("submit-button");

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith("testuser", "password123");
    });
  });

  it("should call onSignup when in signup mode", async () => {
    const user = userEvent.setup();
    mockOnSignup.mockResolvedValue({});

    render(<Login onLogin={mockOnLogin} onSignup={mockOnSignup} />);
    
    // Toggle to signup
    fireEvent.click(screen.getByTestId("toggle-to-signup"));

    const usernameInput = screen.getByTestId("username-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitButton = screen.getByTestId("submit-button");

    await user.type(usernameInput, "newuser");
    await user.type(passwordInput, "password456");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSignup).toHaveBeenCalledWith("newuser", "password456");
    });
  });

  it("should display error message when provided", () => {
    render(
      <Login
        onLogin={mockOnLogin}
        onSignup={mockOnSignup}
        errorMessage="Invalid credentials"
      />
    );

    expect(screen.getByTestId("error-message")).toBeInTheDocument();
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("should show loading state during submission", async () => {
    const user = userEvent.setup();
    mockOnLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<Login onLogin={mockOnLogin} onSignup={mockOnSignup} />);
    
    const usernameInput = screen.getByTestId("username-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitButton = screen.getByTestId("submit-button");

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });

  it("should trim whitespace from inputs", async () => {
    const user = userEvent.setup();
    mockOnLogin.mockResolvedValue({});

    render(<Login onLogin={mockOnLogin} onSignup={mockOnSignup} />);
    
    const usernameInput = screen.getByTestId("username-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitButton = screen.getByTestId("submit-button");

    await user.type(usernameInput, "  testuser  ");
    await user.type(passwordInput, "  password123  ");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith("testuser", "password123");
    });
  });

  it("should require username and password", () => {
    render(<Login onLogin={mockOnLogin} onSignup={mockOnSignup} />);
    
    const usernameInput = screen.getByTestId("username-input");
    const passwordInput = screen.getByTestId("password-input");

    expect(usernameInput).toHaveAttribute("required");
    expect(passwordInput).toHaveAttribute("required");
  });

  it("should reset form when toggling between login and signup", async () => {
    const user = userEvent.setup();
    render(<Login onLogin={mockOnLogin} onSignup={mockOnSignup} />);
    
    const usernameInput = screen.getByTestId("username-input");
    const passwordInput = screen.getByTestId("password-input");

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");

    fireEvent.click(screen.getByTestId("toggle-to-signup"));

    expect(usernameInput.value).toBe("");
    expect(passwordInput.value).toBe("");
  });
});
