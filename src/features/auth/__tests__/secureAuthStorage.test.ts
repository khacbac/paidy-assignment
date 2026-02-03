import {
  clearLastAuthenticatedAtMs,
  getLastAuthenticatedAtMs,
  setLastAuthenticatedAtMs,
} from "@/features/auth/secureAuthStorage";
import { AUTH_LAST_AT_KEY } from "@/features/auth/constants";
import {
  getSecureItem,
  removeSecureItem,
  setSecureItem,
} from "@/lib/storage";

jest.mock("@/lib/storage", () => ({
  getSecureItem: jest.fn(),
  setSecureItem: jest.fn(),
  removeSecureItem: jest.fn(),
}));

const mockedGetSecureItem = jest.mocked(getSecureItem);
const mockedSetSecureItem = jest.mocked(setSecureItem);
const mockedRemoveSecureItem = jest.mocked(removeSecureItem);

describe("secureAuthStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when storage is empty", async () => {
    mockedGetSecureItem.mockResolvedValueOnce(null);

    await expect(getLastAuthenticatedAtMs()).resolves.toBeNull();
    expect(mockedGetSecureItem).toHaveBeenCalledWith(AUTH_LAST_AT_KEY);
  });

  it("returns null for invalid stored values", async () => {
    mockedGetSecureItem.mockResolvedValueOnce("nope");
    await expect(getLastAuthenticatedAtMs()).resolves.toBeNull();

    mockedGetSecureItem.mockResolvedValueOnce("0");
    await expect(getLastAuthenticatedAtMs()).resolves.toBeNull();
  });

  it("returns the parsed timestamp for a valid value", async () => {
    mockedGetSecureItem.mockResolvedValueOnce("1700000000000");

    await expect(getLastAuthenticatedAtMs()).resolves.toBe(1700000000000);
  });

  it("stores floored timestamps as strings", async () => {
    await setLastAuthenticatedAtMs(1700000000000.9);

    expect(mockedSetSecureItem).toHaveBeenCalledWith(
      AUTH_LAST_AT_KEY,
      "1700000000000"
    );
  });

  it("clears the persisted timestamp", async () => {
    await clearLastAuthenticatedAtMs();

    expect(mockedRemoveSecureItem).toHaveBeenCalledWith(AUTH_LAST_AT_KEY);
  });
});
