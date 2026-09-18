/**
 * Maps Supabase Auth error codes to calm, learner-facing messages. Pure, so it
 * is unit tested; raw provider messages never reach the UI.
 *
 * Wording is deliberately identical for "no such account" and "wrong password"
 * so the form cannot be used to discover which emails are registered.
 */

export const GENERIC_AUTH_ERROR =
  "We could not sign you in just now. Please try again in a moment.";

const MESSAGES: Record<string, string> = {
  invalid_credentials: "That email and password do not match. Please try again.",
  email_not_confirmed:
    "Please confirm your email first — open the link we sent you, then sign in.",
  user_already_exists:
    "An account with this email already exists. Try signing in instead.",
  weak_password:
    "Please choose a stronger password: at least 8 characters, mixing letters and numbers.",
  email_address_invalid: "That email address does not look right.",
  over_email_send_rate_limit:
    "Too many emails were sent in a short time. Please wait a few minutes and try again.",
  over_request_rate_limit:
    "Too many attempts in a short time. Please wait a minute and try again.",
  signup_disabled: "New accounts are not being accepted right now.",
};

export function authErrorMessage(code: string | undefined | null): string {
  return (code && MESSAGES[code]) || GENERIC_AUTH_ERROR;
}
