import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

/**
 * Extract text from PDF file
 * @param {string} buffer - Buffer to PDF file
 * @returns {Promise<{text: string, numPages: number}>}
 */

export const extractTextFromPDF = async (dataBuffer) => {
  try {
    //pdf-parse expects a Uint8Array, not a buffer
    const parser = new PDFParse(new Uint8Array(dataBuffer));
    const data = await parser.getText();

    return {
      text: data.text,
      numPages: data.numPages,
      info: data.info,
    };
  } catch (error) {
    throw new Error("Failed to extract text from PDF");
  }
};
