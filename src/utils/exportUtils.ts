import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Export an HTML element as PDF
 */
export const exportToPDF = async (
  elementId: string,
  filename: string
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const imgData  = canvas.toDataURL('image/png');
  const pdf      = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  // Handle multi-page
  let heightLeft  = pdfHeight;
  let position    = 0;
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${filename}.pdf`);
};

/**
 * Parse HTML content into docx paragraphs
 */
const parseHtmlToDocx = (html: string): Paragraph[] => {
  const div = document.createElement('div');
  div.innerHTML = html;
  const paragraphs: Paragraph[] = [];

  div.childNodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const text = el.textContent ?? '';

      if (el.tagName === 'H1' || el.tagName === 'H2') {
        paragraphs.push(new Paragraph({
          text,
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 120 },
          border: { bottom: { color: '#e2e8f0', size: 1, style: 'single', space: 4 } },
        }));
      } else if (el.tagName === 'UL' || el.tagName === 'OL') {
        el.querySelectorAll('li').forEach(li => {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: li.textContent ?? '', size: 22 })],
            bullet: { level: 0 },
            spacing: { after: 60 },
          }));
        });
      } else if (el.tagName === 'HR') {
        paragraphs.push(new Paragraph({
          border: { bottom: { color: '#e2e8f0', size: 1, style: 'single', space: 4 } },
          spacing: { after: 120 },
          text: '',
        }));
      } else {
        const runs: TextRun[] = [];
        el.childNodes.forEach(child => {
          if (child.nodeType === Node.TEXT_NODE) {
            runs.push(new TextRun({ text: child.textContent ?? '', size: 22 }));
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            const childEl = child as HTMLElement;
            runs.push(new TextRun({
              text: childEl.textContent ?? '',
              bold:      childEl.tagName === 'STRONG' || childEl.tagName === 'B',
              italics:   childEl.tagName === 'EM'     || childEl.tagName === 'I',
              underline: childEl.tagName === 'U' ? {} : undefined,
              size: 22,
            }));
          }
        });
        if (runs.length > 0) {
          paragraphs.push(new Paragraph({
            children: runs,
            spacing: { after: 80 },
          }));
        }
      }
    }
  });

  return paragraphs;
};

/**
 * Export HTML content as Word document
 */
export const exportToWord = async (
  htmlContent: string,
  filename: string,
  title: string
): Promise<void> => {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
        },
      },
      children: [
        new Paragraph({
          children: [new TextRun({
            text: title,
            bold: true,
            size: 32,
            font: 'Calibri',
          })],
          spacing: { after: 200 },
          alignment: AlignmentType.CENTER,
        }),
        ...parseHtmlToDocx(htmlContent),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
};