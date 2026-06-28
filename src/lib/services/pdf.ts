import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generatePDF(
  elementId: string,
  filename: string = 'report.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Element not found');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
}

export async function generateHealthReport(
  title: string,
  sections: { heading: string; content: string[] }[],
  filename: string
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 20;
  let y = margin;

  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, margin, y);
  y += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, y);
  y += 5;
  pdf.text('MamaCare AI - Maternal Health Report', margin, y);
  y += 10;

  for (const section of sections) {
    if (y > 270) {
      pdf.addPage();
      y = margin;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(section.heading, margin, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    for (const line of section.content) {
      if (y > 270) {
        pdf.addPage();
        y = margin;
      }

      const lines = pdf.splitTextToSize(line, pageWidth - 2 * margin);
      for (const l of lines) {
        if (y > 270) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(l, margin, y);
        y += 5;
      }
    }
    y += 5;
  }

  pdf.save(filename);
}

export async function exportVaccinationReport(
  babyName: string,
  vaccinations: { name: string; date: string; status: string }[]
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const margin = 20;
  let y = margin;

  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Vaccination Report', margin, y);
  y += 8;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Baby: ${babyName}`, margin, y);
  y += 6;
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
  y += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Vaccine', margin, y);
  pdf.text('Date', 90, y);
  pdf.text('Status', 150, y);
  y += 6;

  pdf.setFont('helvetica', 'normal');
  for (const v of vaccinations) {
    if (y > 270) {
      pdf.addPage();
      y = margin;
    }
    pdf.text(v.name, margin, y);
    pdf.text(v.date, 90, y);
    pdf.text(v.status, 150, y);
    y += 6;
  }

  pdf.save(`${babyName.replace(/\s+/g, '_')}_vaccinations.pdf`);
}
