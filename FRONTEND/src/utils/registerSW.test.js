import { describe, it, expect, vi } from "vitest";
import { registerSW } from "./registerSW";

describe("registerSW", () => {
  it("registers load listener when service workers are supported", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");

    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        register: vi.fn(),
      },
      configurable: true,
    });

    registerSW();

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "load",
      expect.any(Function)
    );
  });

it("does nothing when service workers are unsupported", () => {
  const addEventListenerSpy = vi.spyOn(window, "addEventListener");

  delete navigator.serviceWorker;

  registerSW();

  expect(addEventListenerSpy).not.toHaveBeenCalled();
});
});