import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL } from "@/lib/config/api";
import { productPromotionHighlightsRepository } from "@/lib/repositories/productPromotionHighlights.repository";

global.fetch = vi.fn();

describe("ProductPromotionHighlightsRepository.getByProductId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => vi.restoreAllMocks());

  it("uses the existing API version base without stacking a frontend cache", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        productId: "product/1",
        shippingPromotions: [],
        orderDiscounts: [],
        giftPromotions: [],
      }),
    } as Response);

    await productPromotionHighlightsRepository.getByProductId("product/1");

    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/shop/products/product%2F1/promotion-highlights`,
      expect.objectContaining({
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("returns null without requesting when product id is empty", async () => {
    await expect(
      productPromotionHighlightsRepository.getByProductId(""),
    ).resolves.toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fails softly when the endpoint responds with an error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 503,
    } as Response);

    await expect(
      productPromotionHighlightsRepository.getByProductId("product-1"),
    ).resolves.toBeNull();
  });

  it("fails softly when the request times out or throws", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network unavailable"));

    await expect(
      productPromotionHighlightsRepository.getByProductId("product-1"),
    ).resolves.toBeNull();
  });

  it("fails softly when a successful response has an invalid payload", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shippingPromotions: [null] }),
    } as Response);

    await expect(
      productPromotionHighlightsRepository.getByProductId("product-1"),
    ).resolves.toBeNull();
  });
});
