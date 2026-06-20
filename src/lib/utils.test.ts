import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("utils", () => {
  describe("cn (className utility)", () => {
    it("merges multiple class names", () => {
      const result = cn("class1", "class2", "class3");
      expect(result).toBe("class1 class2 class3");
    });

    it("handles conditional classes", () => {
      const isHidden = false;
      const isVisible = true;
      const result = cn("base", isHidden && "hidden", isVisible && "visible");
      expect(result).toBe("base visible");
    });

    it("merges tailwind classes correctly", () => {
      const result = cn("px-2 py-1", "px-4");
      expect(result).toBe("py-1 px-4");
    });

    it("handles undefined and null values", () => {
      const result = cn("class1", undefined, null, "class2");
      expect(result).toBe("class1 class2");
    });

    it("handles empty strings", () => {
      const result = cn("class1", "", "class2");
      expect(result).toBe("class1 class2");
    });

    it("handles arrays of classes", () => {
      const result = cn(["class1", "class2"], "class3");
      expect(result).toBe("class1 class2 class3");
    });

    it("handles objects with boolean values", () => {
      const result = cn({
        class1: true,
        class2: false,
        class3: true,
      });
      expect(result).toBe("class1 class3");
    });

    it("returns empty string when no arguments", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("handles duplicate classes", () => {
      // Note: cn uses clsx + twMerge which doesn't deduplicate non-Tailwind classes
      const result = cn("class1", "class1", "class2");
      expect(result).toContain("class1");
      expect(result).toContain("class2");
    });
  });
});
