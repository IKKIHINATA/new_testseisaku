
// This uses the pdfjsLib object from the global scope, loaded via CDN in index.html
declare const pdfjsLib: any;

/**
 * Extracts text from a PDF file.
 * @param file The PDF file to process.
 * @returns A promise that resolves with the extracted text content.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n\n';
  }

  return fullText;
}
