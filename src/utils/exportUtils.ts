import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Document, Paragraph, TextRun,
  Packer, BorderStyle
} from 'docx';
import { saveAs } from 'file-saver';

export const exportToPDF = async (
  elementId: string,
  filename: string
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) return;

  // make visible temporarily for capture
  const prevStyle = element.getAttribute('style') ?? '';
  element.style.cssText = 'position:fixed;left:0;top:0;width:794px;background:white;z-index:99999;';

  await new Promise(r => setTimeout(r, 100));

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    windowWidth: 794,
  });

  element.setAttribute('style', prevStyle);

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = pdfHeight;
  let position = 0;
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

const parseHtmlToDocx = (html: string): Paragraph[] => {
  const div = document.createElement('div');
  div.innerHTML = html;
  const paragraphs: Paragraph[] = [];

  const walk = (node: Element) => {
    const tag = node.tagName;
    const text = node.textContent ?? '';

    if (tag === 'H1') {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text, bold: true, size: 44, font: 'Arial', color: '0f172a' })],
        spacing: { after: 80 },
      }));

    } else if (tag === 'DIV' && node.classList.contains('resume-section-header')) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text, bold: true, size: 20, font: 'Arial', color: '0f172a', allCaps: true })],
        spacing: { before: 240, after: 40 },
        border: {
          bottom: { color: '0f172a', size: 6, style: BorderStyle.SINGLE, space: 4 }
        },
      }));

    } else if (tag === 'HR') {
      // dividers handled by section header border

    } else if (tag === 'P' && node.classList.contains('resume-contact-line')) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text, size: 18, font: 'Arial', color: '475569' })],
        spacing: { after: 40 },
      }));

    } else if (tag === 'P' && node.classList.contains('resume-job-line')) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text, bold: true, size: 21, font: 'Arial', color: '0f172a' })],
        spacing: { before: 120, after: 40 },
      }));

    } else if (tag === 'UL') {
      node.querySelectorAll('li').forEach(li => {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: li.textContent ?? '', size: 21, font: 'Arial', color: '1e293b' })],
          bullet: { level: 0 },
          spacing: { after: 40 },
        }));
      });

    } else if (tag === 'P') {
      if (text.trim()) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text, size: 21, font: 'Arial', color: '1e293b' })],
          spacing: { after: 60 },
        }));
      }

    } else {
      // recurse into containers like div
      node.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child as Element);
        }
      });
    }
  };

  div.childNodes.forEach(child => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      walk(child as Element);
    }
  });

  return paragraphs;
};

export const exportToWord = async (
  htmlContent: string,
  filename: string,
  _title: string
): Promise<void> => {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, right: 900, bottom: 720, left: 900 },
        },
      },
      children: parseHtmlToDocx(htmlContent),
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
};