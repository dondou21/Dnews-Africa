import { afterEach, describe, expect, it, vi } from "vitest";
import { get } from "./index";

describe("api client path normalization", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("prefixes CMS dashboard routes with /cms", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: "success", data: { overview: {} } }),
    });

    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { location: { pathname: "/dashboard" } });
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    });

    await get("/dashboard");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/v1/cms/dashboard",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("keeps public article requests on the public route", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: "success", data: { articles: [] } }),
    });

    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { location: { pathname: "/" } });
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    });

    await get("/articles?limit=3");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/v1/articles?limit=3",
      expect.objectContaining({ method: "GET" })
    );
  });
});
