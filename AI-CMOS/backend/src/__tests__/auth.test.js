import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import request from "supertest";
import app from "../server.js";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

// Set default test environment variables if not set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test-secret-key-for-jest";
}
if (!process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES_IN = "7d";
}

const TEST_DB_URI = process.env.TEST_MONGODB_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/test-auth-db";

describe("Authentication API Tests", () => {
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(TEST_DB_URI);
  });

  afterAll(async () => {
    // Clean up test database
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  });

  describe("POST /api/auth/signup", () => {
    it("should create a new user with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({
          username: "testuser",
          password: "password123"
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("User created");
      expect(response.body.user.username).toBe("testuser");
      expect(response.body.user.role).toBe("normal");
      expect(response.body.user).not.toHaveProperty("passwordHash");
    });

    it("should return 400 if username is missing", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({ password: "password123" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("username and password required");
    });

    it("should return 400 if password is missing", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({ username: "testuser" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("username and password required");
    });

    it("should return 400 if username is too short", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({
          username: "ab",
          password: "password123"
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Username must be at least 3 characters");
    });

    it("should return 400 if password is too short", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({
          username: "testuser",
          password: "12345"
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Password must be at least 6 characters");
    });

    it("should return 409 if username already exists", async () => {
      // Create first user
      await request(app)
        .post("/api/auth/signup")
        .send({
          username: "testuser",
          password: "password123"
        });

      // Try to create duplicate
      const response = await request(app)
        .post("/api/auth/signup")
        .send({
          username: "testuser",
          password: "password456"
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe("username already exists");
    });

    it("should hash password correctly", async () => {
      await request(app)
        .post("/api/auth/signup")
        .send({
          username: "testuser",
          password: "password123"
        });

      const user = await User.findOne({ username: "testuser" });
      expect(user.passwordHash).not.toBe("password123");
      expect(user.passwordHash).toHaveLength(60); // bcrypt hash length
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a test user
      const response = await request(app)
        .post("/api/auth/signup")
        .send({
          username: "testuser",
          password: "password123"
        });
      testUser = response.body.user;
    });

    it("should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          username: "testuser",
          password: "password123"
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user.username).toBe("testuser");
      expect(response.body.user.role).toBe("normal");
    });

    it("should return 400 if username is missing", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ password: "password123" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("username and password required");
    });

    it("should return 400 if password is missing", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ username: "testuser" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("username and password required");
    });

    it("should return 401 for non-existent user", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          username: "nonexistent",
          password: "password123"
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should return 401 for incorrect password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          username: "testuser",
          password: "wrongpassword"
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should return a valid JWT token", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          username: "testuser",
          password: "password123"
        });

      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe("string");
      expect(response.body.token.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should return success message", async () => {
      const response = await request(app)
        .post("/api/auth/logout");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logged out successfully");
    });
  });

  describe("Authentication Middleware", () => {
    let authToken;

    beforeEach(async () => {
      // Create user and get token
      await request(app)
        .post("/api/auth/signup")
        .send({
          username: "testuser",
          password: "password123"
        });

      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          username: "testuser",
          password: "password123"
        });

      authToken = loginResponse.body.token;
    });

    it("should access protected route with valid token but get 403 for non-admin", async () => {
      const response = await request(app)
        .get("/api/admin")
        .set("Authorization", `Bearer ${authToken}`);

      // Normal user should get 403 (Forbidden) due to role, not 401 (Unauthorized)
      expect(response.status).toBe(403);
      expect(response.body.message).toContain("Forbidden");
    });

    it("should return 401 without token", async () => {
      const response = await request(app)
        .get("/api/admin");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });

    it("should return 403 with invalid token", async () => {
      const response = await request(app)
        .get("/api/admin")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Invalid or expired token");
    });

    it("should return 401 without Authorization header", async () => {
      const response = await request(app)
        .get("/api/admin");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });

    it("should return 401 with malformed Authorization header", async () => {
      const response = await request(app)
        .get("/api/admin")
        .set("Authorization", "InvalidFormat token");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });
  });
});
