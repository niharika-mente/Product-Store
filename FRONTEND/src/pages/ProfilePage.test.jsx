import { render, screen } from "@testing-library/react";
import { describe, it, beforeAll, expect, vi } from "vitest";
import { ChakraProvider } from "@chakra-ui/react";
import ProfilePage from "./ProfilePage";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("../utils/axios", () => ({
  default: {
    get: vi.fn(() => new Promise(() => {})),
  },
}));

vi.mock("@chakra-ui/react", async () => {
  const actual = await vi.importActual("@chakra-ui/react");
  return {
    ...actual,
    useToast: () => vi.fn(),
  };
});

describe("ProfilePage loading state", () => {
  beforeAll(() => {
    window.matchMedia = window.matchMedia || function () {
      return {
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    };
  });

  it("shows skeleton loaders instead of a spinner while fetching profile", () => {
    localStorage.setItem("authToken", "fake-token");
    render(
      <ChakraProvider>
        <ProfilePage />
      </ChakraProvider>
    );

    expect(screen.getByTestId("profile-skeleton")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});