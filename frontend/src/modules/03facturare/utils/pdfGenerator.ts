import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const removeDiacritics = (str: string) => {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export function generareFacturaPDF(factura: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header background
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Title
  let docTitle = 'FACTURA FISCALA';
  if (factura.serie === 'PEN') docTitle = 'FACTURA PENALIZARE';
  else if (factura.serie === 'STO') docTitle = 'FACTURA STORNO';
  else if (factura.serie === 'DSC') docTitle = 'FACTURA DISCOUNT';

  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(docTitle, 14, 25);
  
  // Invoice Info (Top Right)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Seria: ${removeDiacritics(factura.serie)}`, pageWidth - 14, 15, { align: 'right' });
  doc.text(`Numar: ${factura.numar}`, pageWidth - 14, 21, { align: 'right' });
  doc.text(`Data emiterii: ${new Date(factura.dataEmiterii).toLocaleDateString('ro-RO')}`, pageWidth - 14, 27, { align: 'right' });
  doc.text(`Scadenta: ${new Date(factura.scadenta).toLocaleDateString('ro-RO')}`, pageWidth - 14, 33, { align: 'right' });

  // Reset text color for body
  doc.setTextColor(40, 40, 40);

  // Furnizor
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text('FURNIZOR', 14, 55);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text('SC SERVICE AUTO SRL', 14, 62);
  doc.setTextColor(100, 100, 100);
  doc.text('CUI: RO12345678', 14, 67);
  doc.text('Reg. Com: J40/1234/2020', 14, 72);
  doc.text('Adresa: Str. Exemplu Nr. 1, Bucuresti', 14, 77);

  // Client
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text('CLIENT', pageWidth / 2, 55);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const clientNume = factura.client?.nume || factura.client?.numeFirma || 'Client Necunoscut';
  doc.text(removeDiacritics(clientNume), pageWidth / 2, 62);
  
  doc.setTextColor(100, 100, 100);
  if (factura.client?.CUI || factura.client?.CNP) {
    doc.text(`CUI/CNP: ${factura.client.CUI || factura.client.CNP}`, pageWidth / 2, 67);
  }
  if (factura.client?.telefon) {
    doc.text(`Telefon: ${factura.client.telefon}`, pageWidth / 2, 72);
  }
  if (factura.client?.adresa) {
    // Split address if too long
    const addressLines = doc.splitTextToSize(`Adresa: ${removeDiacritics(factura.client.adresa)}`, (pageWidth / 2) - 14);
    doc.text(addressLines, pageWidth / 2, 77);
  }

  // Divider
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(14, 90, pageWidth - 14, 90);

  // Table
  const tableData = (factura.iteme || []).map((item: any, index: number) => [
    index + 1,
    removeDiacritics(item.descriere),
    item.cantitate,
    `${item.pretUnitar.toFixed(2)} RON`,
    `${(item.cantitate * item.pretUnitar).toFixed(2)} RON`
  ]);

  autoTable(doc, {
    startY: 95,
    head: [['Nr', 'Denumire Produs / Serviciu', 'Cantitate', 'Pret Unitar', 'Valoare']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [248, 250, 252], // slate-50
      textColor: [71, 85, 105], // slate-600
      fontStyle: 'bold',
      lineWidth: 0.1,
      lineColor: [226, 232, 240]
    },
    bodyStyles: {
      textColor: [51, 65, 85], // slate-700
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255]
    },
    columnStyles: {
      0: { cellWidth: 15 },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'right', cellWidth: 35 },
      4: { halign: 'right', cellWidth: 35 }
    },
    styles: { 
      fontSize: 9,
      font: "helvetica",
      cellPadding: 6
    },
  });

  // Totals Section
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  const rightColX = pageWidth - 14;

  // Calculăm de câte linii avem nevoie în caseta de totaluri
  let extraLines = 0;
  if (factura.discountProcent > 0) extraLines++;
  if (factura.penalizareProcent > 0) extraLines++;
  
  const boxHeight = 35 + (extraLines * 8);
  const boxWidth = 75;
  const boxX = pageWidth - boxWidth - 14;

  // Total Box Background
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(boxX, finalY - 5, boxWidth, boxHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(boxX, finalY - 5, boxWidth, boxHeight, 2, 2, 'S');
  
  let currentY = finalY + 5;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Subtotal:', boxX + 5, currentY);
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "bold");
  doc.text(`${factura.totalFaraTVA.toFixed(2)} RON`, rightColX - 5, currentY, { align: 'right' });
  
  if (factura.discountProcent > 0) {
    currentY += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(`Discount (${factura.discountProcent}%):`, boxX + 5, currentY);
    doc.setFont("helvetica", "bold");
    const valDisc = factura.totalFaraTVA * (factura.discountProcent / 100);
    doc.text(`- ${valDisc.toFixed(2)} RON`, rightColX - 5, currentY, { align: 'right' });
  }

  if (factura.penalizareProcent > 0) {
    currentY += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(225, 29, 72); // rose-600
    doc.text(`Penalizare (${factura.penalizareProcent}%):`, boxX + 5, currentY);
    doc.setFont("helvetica", "bold");
    const valPen = factura.totalFaraTVA * (factura.penalizareProcent / 100);
    doc.text(`+ ${valPen.toFixed(2)} RON`, rightColX - 5, currentY, { align: 'right' });
  }

  currentY += 8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text('TVA (19%):', boxX + 5, currentY);
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "bold");
  doc.text(`${factura.tva.toFixed(2)} RON`, rightColX - 5, currentY, { align: 'right' });
  
  // Divider inside total box
  currentY += 5;
  doc.setDrawColor(226, 232, 240);
  doc.line(boxX + 5, currentY, rightColX - 5, currentY);

  currentY += 8;
  doc.setFontSize(12);
  doc.setTextColor(79, 70, 229); // indigo-600
  doc.text('TOTAL:', boxX + 5, currentY);
  doc.text(`${factura.totalGeneral.toFixed(2)} RON`, rightColX - 5, currentY, { align: 'right' });

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Factura circula fara stampila si semnatura conform Legii 227/2015 privind Codul Fiscal.', pageWidth / 2, 285, { align: 'center' });

  doc.save(`Factura_${removeDiacritics(factura.serie)}_${factura.numar}.pdf`);
}

