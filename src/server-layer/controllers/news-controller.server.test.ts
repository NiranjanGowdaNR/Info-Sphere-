import { describe, expect, it } from "vitest";
import { searchNews } from "./news-controller.server";

describe("news controller", () => {
  it("validates empty search queries before calling NewsAPI", async () => {
    const result = await searchNews(
      new Request("http://localhost/api/search/msg?msg=&page=1"),
    );

    expect(result.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.message).toContain("msg query parameter");
  });
});
