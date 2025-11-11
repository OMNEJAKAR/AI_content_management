import { extractFileData } from "../utils/fileProcessor";

// --- Mock pdf.js so we don't load real worker in Jest ---
jest.mock("pdfjs-dist/build/pdf", () => ({
  getDocument: jest.fn(() => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: jest.fn(() =>
        Promise.resolve({
          getTextContent: jest.fn(() =>
            Promise.resolve({
              items: [{ str: "Hello PDF World" }],
            })
          ),
        })
      ),
    }),
  })),
  GlobalWorkerOptions: { workerSrc: "" },
}));

jest.mock("pdfjs-dist/build/pdf.worker?url", () => "mock-worker-url", {
  virtual: true,
});

// ✅ Helper: create realistic mock file entry
function mockEntry({ name, type, content }) {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(content);

  const mockFile = {
    name,
    type,
    size: buffer.length,
    lastModified: Date.now(),
    text: async () => content,
    arrayBuffer: async () => buffer,
  };

  return {
    getFile: async () => mockFile,
  };
}

describe("fileProcessor (light behavior)", () => {
  it("extracts text from a plain text file", async () => {
    const entry = mockEntry({
      name: "test.txt",
      type: "text/plain",
      content: "Hello 123456 TESTABC12345678",
    });

    const result = await extractFileData(entry);

    expect(result).not.toBeNull();
    expect(result.name).toBe("test.txt");
    expect(result.type).toBe("text/plain");

    // ✅ Updated expectation: number attached to word is NOT removed
    expect(result.fullText).toBe("Hello TESTABC12345678");

    expect(result.textSnippet).toContain("Hello");
  });

  it("extracts text from a mocked PDF file", async () => {
    const entry = mockEntry({
      name: "sample.pdf",
      type: "application/pdf",
      content: "fake-bytes",
    });

    const result = await extractFileData(entry);

    expect(result).not.toBeNull();
    expect(result.name).toBe("sample.pdf");
    expect(result.type).toBe("application/pdf");
    expect(result.fullText).toContain("Hello PDF World");
  });

  it("returns null if getFile throws", async () => {
    const badEntry = {
      getFile: () => {
        throw new Error("boom");
      },
    };

    const result = await extractFileData(badEntry);
    expect(result).toBeNull();
  });
});
