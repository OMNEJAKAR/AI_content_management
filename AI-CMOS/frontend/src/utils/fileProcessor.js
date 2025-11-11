import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import { loadModule } from "cld3-asm";
import { franc } from "franc";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

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

    if ((type === "application/octet-stream" || type === "" || type === "unknown") && ext === "pdf") {
      type = "application/pdf";
    }

    const sizeKB = (file.size / 1024).toFixed(2);
    const created = file.lastModified ? new Date(file.lastModified).toLocaleString() : "Unknown";

    let text = "";
    if (type.includes("text") || ["txt", "csv", "json", "md"].includes(ext)) {
      text = await file.text();
      text = cleanText(text);
    } else if (ext === "pdf" || type.includes("pdf")) {
      text = await extractTextFromPDF(file);
    }

    let detectedLang = "English";
    try {
      if (type.startsWith("image/")) {
        detectedLang = "Image";
      } else if (text && text.trim().length > 10) {
        const sample = text.slice(0, 5000);

        const langMap = {
          en: "English",
          fr: "French",
          es: "Spanish",
          de: "German",
          hi: "Hindi",
          it: "Italian",
          pt: "Portuguese",
          ru: "Russian",
          zh: "Chinese",
          ja: "Japanese",
          ko: "Korean",
        };

        // 🧠 1. Try CLD3
        let cldLang = null, cldProb = 0;
        try {
          const cldFactory = await loadModule();
          const cld = await cldFactory.create();
          const result = cld.findLanguage(sample);
          if (result?.language) {
            cldLang = langMap[result.language] || result.language;
            cldProb = result.probability;
          }
          cld.dispose();
        } catch (e) {
          console.warn("CLD3 failed:", e);
        }

        // 🧠 2. Try franc (fallback or confirm)
        let francLang = null;
        try {
          const francCode = franc(sample);
          const francMap = {
            eng: "English",
            fra: "French",
            spa: "Spanish",
            deu: "German",
            hin: "Hindi",
            kan: "Kannada",
            ita: "Italian",
            por: "Portuguese",
            rus: "Russian",
            zho: "Chinese",
            jpn: "Japanese",
            kor: "Korean",
            und: "Unknown",
          };
          francLang = francMap[francCode] || "Unknown";
        } catch (e) {
          console.warn("franc failed:", e);
        }

        // ✅ Final decision logic
        if (cldLang && cldProb >= 0.6 && cldLang !== "Unknown") {
          detectedLang = cldLang;
        } else if (francLang && francLang !== "Unknown") {
          detectedLang = francLang;
        } else {
          detectedLang = "English";
        }
      }
    } catch (e) {
      console.warn("Language detection fallback:", e);
      detectedLang = "English";
    }

    const visibleText = text.length > 500 ? text.slice(0, 500) + "..." : text;

    return {
      name: fileName,
      type,
      sizeKB,
      created,
      language: detectedLang,
      textSnippet: visibleText,
      fullText: text,
      meta: { name: fileName, type, size: file.size, lastModified: file.lastModified },
    };
  } catch (err) {
    console.error("Error processing file:", entry.name, err);
    return null;
  }
}

async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
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
