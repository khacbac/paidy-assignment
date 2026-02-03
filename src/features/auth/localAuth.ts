import * as LocalAuthentication from "expo-local-authentication";

export type LocalAuthAvailability =
  | { available: true }
  | {
      available: false;
      reason: "NO_HARDWARE" | "NOT_ENROLLED";
      message: string;
    };

export type LocalAuthResult =
  | { ok: true }
  | {
      ok: false;
      code: "CANCELLED" | "FAILED" | "NOT_AVAILABLE";
      message: string;
    };

export async function getLocalAuthAvailability(): Promise<LocalAuthAvailability> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    return {
      available: false,
      reason: "NO_HARDWARE",
      message: "Local authentication is not supported on this device.",
    };
  }

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) {
    return {
      available: false,
      reason: "NOT_ENROLLED",
      message: "No biometrics or device passcode is enrolled.",
    };
  }

  return { available: true };
}

export async function authenticateLocal({
  reason,
}: {
  reason: string;
}): Promise<LocalAuthResult> {
  const availability = await getLocalAuthAvailability();
  if (!availability.available) {
    return { ok: false, code: "NOT_AVAILABLE", message: availability.message };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    cancelLabel: "Cancel",
  });

  if (result.success) return { ok: true };

  // Expo’s API varies slightly across platforms; treat cancel as a benign failure.
  if ("error" in result && result.error === "user_cancel") {
    return {
      ok: false,
      code: "CANCELLED",
      message: "Authentication cancelled.",
    };
  }

  return { ok: false, code: "FAILED", message: "Authentication failed." };
}
