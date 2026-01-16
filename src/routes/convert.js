import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export async function convertPdfToWord(pdfPath) {
  try {
    console.log('Starting conversion for:', pdfPath);
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      throw new Error('PDF file not found');
    }

    // Read PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log('PDF file read successfully, size:', pdfBuffer.length);
    
    // Parse PDF to extract text and page count
    let pdfData;
    try {
      pdfData = await pdfParse(pdfBuffer);
      console.log('PDF parsed successfully');
    } catch (parseError) {
      console.error('PDF parse error:', parseError);
      throw new Error('Failed to parse PDF: ' + parseError.message);
    }
    
    const extractedText = pdfData.text || 'No text found in PDF';
    const extractedPageCount = pdfData.numpages || 1;
    const characterCount = extractedText.length;

    console.log('Page count:', extractedPageCount);
    console.log('Character count:', characterCount);

    // Create Word document with better formatting
    const paragraphs = extractedText.split('\n\n').map(text => 
      new Paragraph({
        children: [
          new TextRun({
            text: text.trim(),
            font: 'Calibri',
            size: 22
          })
        ],
        spacing: {
          after: 200
        }
      })
    );

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs.length > 0 ? paragraphs : [
          new Paragraph({
            children: [
              new TextRun({
                text: extractedText,
                font: 'Calibri',
                size: 22
              })
            ]
          })
        ]
      }]
    });

    // Generate DOCX buffer
    let docxBuffer;
    try {
      docxBuffer = await Packer.toBuffer(doc);
      console.log('DOCX created successfully');
    } catch (docxError) {
      console.error('DOCX creation error:', docxError);
      throw new Error('Failed to create Word document: ' + docxError.message);
    }

    // Create output directory if not exists
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log('Output directory created');
    }

    // Generate output filename
    const timestamp = Date.now();
    const outputFileName = `converted-${timestamp}.docx`;
    const outputPath = path.join(outputDir, outputFileName);

    // Save DOCX file
    fs.writeFileSync(outputPath, docxBuffer);
    console.log('File saved:', outputPath);

    // Create download URL
    const downloadUrl = `/download/${outputFileName}`;

    return {
      downloadUrl,
      fileName: outputFileName,
      pageCount: extractedPageCount,
      characterCount: characterCount,
      outputPath: outputPath
    };

  } catch (error) {
    console.error('PDF conversion error:', error);
    throw error;
  }
}