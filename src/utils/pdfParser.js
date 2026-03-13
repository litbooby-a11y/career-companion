import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker for PDF.js to parse the PDF in a web worker
// using Vite's ?url syntax to get the correct URL for the worker script
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * Extracts text from a PDF File object
 * @param {File} file - The uploaded PDF file
 * @returns {Promise<string>} - The extracted text content
 */
export const extractTextFromPdf = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // Load the document using the loaded worker
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Iterate through all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Combine text items, adding spaces/newlines somewhat intelligently
      let lastY = -1;
      let pageText = '';
      
      for (const item of textContent.items) {
        if (lastY !== item.transform[5] && lastY !== -1) {
          // If Y coordinate changes significantly, it's likely a new line
          pageText += '\n';
        } else if (lastY !== -1) {
          // If on same line, add a space
          pageText += ' ';
        }
        pageText += item.str;
        lastY = item.transform[5];
      }
      
      fullText += pageText + '\n\n';
    }
    
    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("PDF 解析失败，请确保上传的是有效的文本型 PDF 文件（非纯图片扫描版）。");
  }
};
