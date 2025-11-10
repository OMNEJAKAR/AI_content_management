import { extractFileData } from "../utils/fileProcessor.jsx";

// Mock the language detection libraries
jest.mock("cld3-asm", () => ({
  loadModule: () => Promise.resolve({
    create: () => ({
      findLanguage: () => ({ language: 'en', probability: 1 }),
      dispose: () => {}
    })
  })
}));
jest.mock("franc", () => jest.fn((text) => {
  if (text.includes("नमस्ते")) return "hin";
  if (text.includes("ಹಲೋ")) return "kan";
  if (text.includes("Hello")) return "eng";
  return "und";
}));


jest.mock("franc", () => ({
  __esModule: true,
  franc: () => "eng"
}));

// Mock PDF.js
jest.mock("pdfjs-dist", () => ({
  getDocument: () => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: () => Promise.resolve({
        getTextContent: () => Promise.resolve({
          items: [{ str: "Test PDF content" }]
        })
      })
    })
  }),
  GlobalWorkerOptions: { workerSrc: null },
  version: "3.11.174"
}));

// Mock language detection libraries
jest.mock("cld3-asm", () => ({
  loadModule: () => Promise.resolve({
    create: () => ({
      findLanguage: () => ({ language: 'en', probability: 1 }),
      dispose: () => {}
    })
  })
}));

jest.mock("franc", () => ({
  franc: () => "eng"
}));

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

describe("fileProcessor", () => {
  it("detects English text correctly", async () => {
    const entry = mockEntry({
      name: "english.txt",
      type: "text/plain",
      content: "This is English text"
    });

    const result = await extractFileData(entry);
    expect(result.language).toBe("English");
  });

  it("detects Hindi text correctly", async () => {
    const entry = mockEntry({
      name: "hindi.txt",
      type: "text/plain",
      content: "हिंदी पाठ" // Hindi text
    });

    const result = await extractFileData(entry);
    expect(result.language).toBe("Hindi");
  });

  it("detects Kannada text correctly", async () => {
    const entry = mockEntry({
      name: "kannada.txt",
      type: "text/plain",
      content: "ಕನ್ನಡ ಪಠ್ಯ" // Kannada text
    });

    const result = await extractFileData(entry);
    expect(result.language).toBe("Kannada");
  });

  it("handles invalid file entry gracefully", async () => {
    const badEntry = {
      getFile: () => {
        throw new Error("Invalid file");
      },
    };

    const result = await extractFileData(badEntry);
    expect(result).toBeNull();
  });
});
