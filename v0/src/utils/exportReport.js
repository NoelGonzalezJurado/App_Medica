import jsPDF from 'jspdf';

export function exportToPDF(symptoms, analysis, patientName = 'Paciente') {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  let y = 0;

  function checkPage(needed = 10) {
    if (y + needed > pageH - 15) {
      doc.addPage();
      y = 20;
    }
  }

  // ── Header band ──
  doc.setFillColor(13, 148, 136);
  doc.rect(0, 0, pageW, 42, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Diario de Síntomas Médicos', margin, 20);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Paciente: ${patientName}`, margin, 30);
  doc.text(`Generado el ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, 37);

  y = 55;

  // ── Summary block ──
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen del historial', margin, y);
  y += 7;

  const avg = symptoms.length
    ? (symptoms.reduce((s, x) => s + x.intensity, 0) / symptoms.length).toFixed(1)
    : 0;
  const dates = symptoms.map(s => new Date(s.date));
  const minDate = dates.length ? new Date(Math.min(...dates)).toLocaleDateString('es-ES') : '-';
  const maxDate = dates.length ? new Date(Math.max(...dates)).toLocaleDateString('es-ES') : '-';
  const uniqueNames = [...new Set(symptoms.map(s => s.name))];

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Total registros: ${symptoms.length}  |  Período: ${minDate} – ${maxDate}  |  Intensidad media: ${avg}/10`, margin, y);
  y += 5;
  doc.text(`Síntomas únicos: ${uniqueNames.join(', ')}`, margin, y, { maxWidth: pageW - margin * 2 });
  y += 10;

  // Divider
  doc.setDrawColor(20, 184, 166);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // ── Symptom table ──
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Registro de síntomas', margin, y);
  y += 6;

  // Table header
  const colX = { date: margin, name: margin + 32, intensity: margin + 100, area: margin + 122, notes: margin + 148 };

  doc.setFillColor(240, 253, 250);
  doc.rect(margin, y, pageW - margin * 2, 7, 'F');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('Fecha', colX.date, y + 5);
  doc.text('Síntoma', colX.name, y + 5);
  doc.text('Int.', colX.intensity, y + 5);
  doc.text('Zona', colX.area, y + 5);
  doc.text('Notas', colX.notes, y + 5);
  y += 7;

  const sorted = [...symptoms].sort((a, b) => new Date(b.date) - new Date(a.date));

  sorted.forEach((s, i) => {
    checkPage(8);

    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageW - margin * 2, 7, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8);

    doc.text(new Date(s.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }), colX.date, y + 5);
    doc.text(s.name.substring(0, 28), colX.name, y + 5);

    const int = s.intensity;
    if (int <= 3) doc.setTextColor(5, 150, 105);
    else if (int <= 6) doc.setTextColor(180, 100, 0);
    else doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.text(`${int}/10`, colX.intensity, y + 5);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.text((s.bodyArea || '-').substring(0, 12), colX.area, y + 5);
    doc.text((s.notes || '-').substring(0, 22), colX.notes, y + 5);

    y += 7;
  });

  // ── AI Analysis ──
  if (analysis) {
    checkPage(20);
    y += 5;
    doc.setDrawColor(20, 184, 166);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Análisis de patrones (IA)', margin, y);
    y += 7;

    const clean = analysis
      .replace(/#{1,6}\s?/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/---+/g, '');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    const lines = doc.splitTextToSize(clean, pageW - margin * 2);
    lines.forEach(line => {
      checkPage(6);
      doc.text(line, margin, y);
      y += 5;
    });
  }

  // ── Footer on every page ──
  const total = doc.internal.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Este documento es orientativo y no reemplaza el diagnóstico médico profesional.',
      margin,
      pageH - 8
    );
    doc.text(`Pág. ${p}/${total}`, pageW - margin - 12, pageH - 8);
  }

  doc.save(`Diario_Sintomas_${new Date().toISOString().split('T')[0]}.pdf`);
}
