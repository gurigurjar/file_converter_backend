import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export async function convertPdfToWord(pdfPath) {
  try {
    // Read PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    // Parse PDF to extract text and page count
    const pdfData = await pdfParse(pdfBuffer);
    
    const extractedText = pdfData.text;
    const extractedPageCount = pdfData.numpages;
    const characterCount = extractedText.length;

    // Create Word document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: extractedText,
                font: 'Calibri',
                size: 24
              })
            ]
          })
        ]
      }]
    });

    // Generate DOCX buffer
    const docxBuffer = await Packer.toBuffer(doc);

    // Create output directory if not exists
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate output filename
    const outputFileName = `converted-${Date.now()}.docx`;
    const outputPath = path.join(outputDir, outputFileName);

    // Save DOCX file
    fs.writeFileSync(outputPath, docxBuffer);

    // Create download URL (adjust based on your server setup)
    const downloadUrl = `/download/${outputFileName}`;

    return {
      downloadUrl,
      fileName: outputFileName,
      pageCount: extractedPageCount,
      characterCount: characterCount
    };

  } catch (error) {
    console.error('PDF conversion error:', error);
    throw new Error('Failed to convert PDF to Word: ' + error.message);
  }
}