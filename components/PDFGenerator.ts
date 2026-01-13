
import { jsPDF } from "jspdf";
import { StoryScene, LanguageCode } from "../types";
import { translations } from "../translations";

export async function createPrintablePDF(title: string, scenes: StoryScene[], lang: LanguageCode) {
  const t = translations[lang];
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];

    // Página Ímpar (Frente) -> O Visual
    if (i > 0) doc.addPage();

    if (scene.imageUrl) {
      // Para maximizar mantendo margem de ~15mm (conforme pedido inicial)
      // A largura de 180mm deixa 15mm de cada lado (210 - 180 = 30 / 2)
      const imgWidth = 180;
      const imgHeight = (imgWidth * 4) / 3; // Mantém proporção 3:4 = 240mm

      const x = (pageWidth - imgWidth) / 2; // 15mm
      const y = (pageHeight - imgHeight) / 2; // 28.5mm

      // Adiciona uma borda fina cinza para guiar o recorte se necessário
      doc.setDrawColor(230, 230, 230);
      doc.rect(x - 0.5, y - 0.5, imgWidth + 1, imgHeight + 1);

      doc.addImage(scene.imageUrl, "PNG", x, y, imgWidth, imgHeight);
    }

    // Página Par (Verso) -> O Texto Narrativo
    doc.addPage();

    // Título da História no topo do verso (com quebra de linha se necessário)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18); // Reduzido de 26 para 18
    doc.setTextColor(124, 58, 237); // Roxo Primary

    // Limpa o título (remove textos entre parênteses que a IA possa ter gerado)
    const cleanTitle = title.replace(/\s*\(.*?\)\s*/g, '').trim();

    // Quebra o título em múltiplas linhas se necessário (máx 170mm de largura)
    const splitTitle = doc.splitTextToSize(cleanTitle, 170);
    const titleHeight = splitTitle.length * 8;
    doc.text(splitTitle, pageWidth / 2, 35, { align: "center" });

    // Indicador de Cena (ajustado para depois do título)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14); // Reduzido de 16 para 14
    doc.setTextColor(150, 150, 150);
    doc.text(`${t.visualLabel} ${i + 1} / ${scenes.length}`, pageWidth / 2, 35 + titleHeight + 10, { align: "center" });

    // Divisor visual simples
    doc.setDrawColor(124, 58, 237);
    doc.setLineWidth(1);
    doc.line(pageWidth / 2 - 20, 35 + titleHeight + 18, pageWidth / 2 + 20, 35 + titleHeight + 18);

    // Texto Narrativo centralizado
    doc.setFont("helvetica", "italic");
    doc.setFontSize(18); // Reduzido de 24 para 18 para caber melhor
    doc.setTextColor(20, 20, 20);

    const splitText = doc.splitTextToSize(scene.narrativeText, 170); // Aumentado de 160 para 170
    const textLineHeight = 9; // Altura por linha para fontSize 18
    const textHeight = splitText.length * textLineHeight;

    // Posiciona o texto no centro da área disponível (entre o divisor e o rodapé)
    const topMargin = 35 + titleHeight + 30; // Após o divisor
    const bottomMargin = pageHeight - 30; // Antes do rodapé
    const availableHeight = bottomMargin - topMargin;
    const textY = topMargin + (availableHeight - textHeight) / 2 + textLineHeight;

    doc.text(splitText, pageWidth / 2, textY, { align: "center", lineHeightFactor: 1.3 });

    // Rodapé Institucional e Copyright
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 180, 180);
    doc.text(t.footerText, pageWidth / 2, pageHeight - 20, { align: "center" });

    doc.setFontSize(7);
    doc.setTextColor(200, 200, 200);
    doc.text(t.copyright, pageWidth / 2, pageHeight - 15, { align: "center" });
  }

  // Nome do arquivo limpo (remove parenteses antes de sanitizar)
  const cleanTitleForFile = title.replace(/\s*\(.*?\)\s*/g, '').trim();
  const fileName = cleanTitleForFile.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
  doc.save(`${fileName}_pegue_e_pregue.pdf`);
}
