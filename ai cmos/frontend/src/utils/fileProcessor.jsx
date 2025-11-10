import * as pdfjsLib from "pdfjs-dist";
import { loadModule } from "cld3-asm";
import { franc } from "franc";

// Use CDN for PDF worker to avoid Vite URL issues
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function cleanText(raw) {
  if (!raw) return "";
  return raw
    .replace(/\b[0-9A-F]{8,}\b/gi, " ")
    .replace(/\b\d{6,}\b/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function extractFileData(entry) {
  try {
    const file = await entry.getFile();
    const fileName = file.name || "unknown";
    const ext = fileName.includes(".") ? fileName.split(".").pop().toLowerCase() : "";
    let type = file.type || "unknown";

    // Normalize MIME types
    if (type === "application/octet-stream" || type === "" || type === "unknown") {
      if (ext === "pdf") {
        type = "application/pdf";
      } else if (["txt"].includes(ext)) {
        type = "text/plain";
      } else if (["csv"].includes(ext)) {
        type = "text/csv";
      } else if (["json"].includes(ext)) {
        type = "application/json";
      } else if (["md", "markdown"].includes(ext)) {
        type = "text/markdown";
      } else if (["jpg", "jpeg"].includes(ext)) {
        type = "image/jpeg";
      } else if (["png", "gif", "webp"].includes(ext)) {
        type = `image/${ext}`;
      } else {
        type = "text/plain"; // Default to text/plain for unknown types
      }
    }

    const sizeKB = (file.size / 1024).toFixed(2);
    const created = file.lastModified
      ? new Date(file.lastModified).toLocaleString()
      : "Unknown";

    let text = "";
    try {
      if (type.includes("text") || type.includes("json") || type.includes("csv") || ["txt", "csv", "json", "md"].includes(ext)) {
        text = await file.text();
        text = cleanText(text);
      } else if (type.includes("pdf") || ext === "pdf") {
        text = await extractTextFromPDF(file);
      } else if (type.startsWith("image/")) {
        text = ""; // OCR to be added later
      }
    } catch (e) {
      console.warn("Error reading file content:", e);
      text = "";
    }

    // Language detection for English, Hindi, and Kannada only
    let detectedLang = "Unknown";
try {
  if (type.startsWith("image/")) {
    detectedLang = "Image";
  } else if (text && text.trim().length > 0) {
    const sample = text.slice(0, 5000).trim();

    // Skip unreliable very short samples
    if (sample.length < 5) {
      detectedLang = "Unknown";
    } else {
      // Detect script ranges first
      const hasKannada = /[\u0C80-\u0CFF]/.test(sample); // Kannada block
      const hasDevanagari = /[\u0900-\u097F]/.test(sample); // Hindi (Devanagari)

      if (hasKannada) {
        detectedLang = "Kannada";
      } else if (hasDevanagari) {
        detectedLang = "Hindi";
      } else {
        try {
          const francCode = franc(sample);
          if (francCode === "eng") detectedLang = "English";
          else if (francCode === "hin") detectedLang = "Hindi";
          else if (francCode === "kan") detectedLang = "Kannada";
          else if (francCode === "und") detectedLang = "Unknown";
          else detectedLang = "Unknown";
        } catch (e) {
          console.warn("franc detection failed:", e);
          detectedLang = "Unknown";
        }
      }
    }
  }
} catch (e) {
  console.warn("Language detection error:", e);
  detectedLang = "Unknown";
}

    // Truncate visible text for UI, keep full text for search
    const visibleText = text.length > 500 ? text.slice(0, 500) + "..." : text;

    return {
      name: fileName,
      type,
      sizeKB,
      created,
      language: detectedLang,
      textSnippet: visibleText,
      fullText: text,
      meta: {
        name: fileName,
        type,
        size: file.size,
        lastModified: file.lastModified,
      },
    };
  } catch (err) {
    console.error("Error processing file:", entry.name, err);
    return null;
  }
}

async function extractTextFromPDF(file) {
  try {
    let arrayBuffer = await file.arrayBuffer();

    // Normalize buffer for browser only
    if (arrayBuffer instanceof ArrayBuffer) {
      arrayBuffer = new Uint8Array(arrayBuffer);
    } else if (!(arrayBuffer instanceof Uint8Array)) {
      try {
        arrayBuffer = new Uint8Array(arrayBuffer);
      } catch (err) {
        console.error('Unsupported arrayBuffer type for PDF extraction', err);
        return '';
      }
    }
    // Use pdfjsLib for browser
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((s) => s.str).join(" ") + "\n";
    }
    return cleanText(text);
  } catch (err) {
    console.error("PDF extract error:", err);
    return "";
  }
}