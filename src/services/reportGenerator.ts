import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import type { MangoAnalysisReport } from '../types/analysis';

/**
 * Captura el elemento con id="mango-report" y lo exporta como PDF A4.
 * El nombre del archivo incluye la enfermedad y la fecha.
 */
export async function generatePDF(report: MangoAnalysisReport): Promise<void> {
  console.log("Iniciando generación de PDF...");
  const element = document.getElementById('mango-report');
  if (!element) {
    throw new Error('No se encontró el elemento del informe en el DOM.');
  }

  console.log("Elemento encontrado, renderizando con html-to-image...");
  
  // Utilizar toPng de html-to-image (evita el bug de oklch de html2canvas y Tailwind v4)
  const dataUrl = await htmlToImage.toPng(element, {
    backgroundColor: '#ffffff',
    pixelRatio: 2, // 2x resolución para mejor nitidez en PDF
  });

  const pdf       = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW     = pdf.internal.pageSize.getWidth();
  const pageH     = pdf.internal.pageSize.getHeight();
  
  // Obtener dimensiones reales de la imagen generada
  const imgProps = pdf.getImageProperties(dataUrl);
  const imgW = pageW;
  const imgH = (imgProps.height * imgW) / imgProps.width;

  let heightLeft = imgH;
  let position   = 0;

  pdf.addImage(dataUrl, 'PNG', 0, position, pageW, imgH);
  heightLeft -= pageH;

  // Si el informe ocupa más de una página
  while (heightLeft > 0) {
    position = heightLeft - imgH;
    pdf.addPage();
    pdf.addImage(dataUrl, 'PNG', 0, position, pageW, imgH);
    heightLeft -= pageH;
  }

  // Nombre del archivo
  const dateStr  = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const disease  = report.diagnostico_principal.codigo;
  const shortId  = report.id_sesion.slice(0, 8);
  pdf.save(`informe_mango_${disease}_${dateStr}_${shortId}.pdf`);
}
