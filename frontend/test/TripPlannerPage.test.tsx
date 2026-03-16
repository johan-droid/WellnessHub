import React from "react";
import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock the auth hook to simulate a logged-in user
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u1", email: "test@example.com", firstName: "Test", lastName: "User", createdAt: Date.now() },
    token: "fake-token",
    loading: false,
  }),
}));

// Mock next/navigation router used by the component
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Import the component after mocking
import TripPlannerPage from "@/app/trips/page";

describe("TripPlannerPage", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Default fetch mock returns empty trips and ok
    global.fetch = vi.fn(async (input: RequestInfo) => {
      const url = String(input);
      if (url.endsWith("/api/protected/trips")) {
        return {
          ok: true,
          json: async () => ({ data: { trips: [] } }),
        } as unknown as Response;
      }
      // activities endpoint
      return {
        ok: true,
        json: async () => ({ data: { activities: [] } }),
      } as unknown as Response;
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.resetAllMocks();
  });

  it("renders heading and empty state when no trips", async () => {
    render(<TripPlannerPage />);

    // Heading exists (wait for initial loading to finish)
    expect(await screen.findByText(/Your Trips/i)).toBeInTheDocument();

    // Empty state appears after fetch
    expect(await screen.findByText(/No trips yet/i)).toBeInTheDocument();
  });
});
