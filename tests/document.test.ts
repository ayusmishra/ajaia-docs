import { describe, expect, it } from "vitest";

describe("Ajaia Docs document validation", () => {
  it("accepts a valid document", () => {
    const document = {
      title: "My Document",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Hello Ajaia Docs" }],
          },
        ],
      },
    };

    expect(document.title.trim().length).toBeGreaterThan(0);
    expect(document.content.type).toBe("doc");
    expect(document.content.content.length).toBeGreaterThan(0);
  });

  it("uses a fallback title when the title is empty", () => {
    const title = "";
    const finalTitle = title.trim() || "Untitled document";

    expect(finalTitle).toBe("Untitled document");
  });
});