import { describe, expect, it } from "vitest";
import { GENERIC_AUTH_ERROR, authErrorMessage } from "./password-errors";

describe("authErrorMessage", () => {
  it("explains wrong credentials without revealing whether the email exists", () => {
    expect(authErrorMessage("invalid_credentials")).toContain(
      "email and password do not match",
    );
  });

  it("tells an unconfirmed learner what to do next", () => {
    expect(authErrorMessage("email_not_confirmed")).toContain("confirm your email");
  });

  it("falls back to a calm generic message for unknown or missing codes", () => {
    expect(authErrorMessage("something_new")).toBe(GENERIC_AUTH_ERROR);
    expect(authErrorMessage(undefined)).toBe(GENERIC_AUTH_ERROR);
    expect(authErrorMessage(null)).toBe(GENERIC_AUTH_ERROR);
  });
});
