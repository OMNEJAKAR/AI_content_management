import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import * as authApi from "../api/auth";

// Mock fetch globally
global.fetch = jest.fn();

describe("Auth API", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("signup", () => {
    it("should successfully signup a user", async () => {
      const mockResponse = {
        message: "User created",
        user: { id: "1", username: "testuser", role: "normal" }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await authApi.signup("testuser", "password123");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/signup"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "testuser", password: "password123" })
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it("should throw error on failed signup", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "username already exists" })
      });

      await expect(authApi.signup("testuser", "password123")).rejects.toThrow(
        "username already exists"
      );
    });
  });

  describe("login", () => {
    it("should successfully login a user", async () => {
      const mockResponse = {
        token: "mock-token",
        user: { id: "1", username: "testuser", role: "normal" }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await authApi.login("testuser", "password123");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/login"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "testuser", password: "password123" })
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it("should throw error on failed login", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Invalid credentials" })
      });

      await expect(authApi.login("testuser", "wrongpassword")).rejects.toThrow(
        "Invalid credentials"
      );
    });
  });

  describe("logout", () => {
    it("should successfully logout", async () => {
      const mockResponse = { message: "Logged out successfully" };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await authApi.logout();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/logout"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" }
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it("should throw error on failed logout", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Logout failed" })
      });

      await expect(authApi.logout()).rejects.toThrow("Logout failed");
    });
  });
});
