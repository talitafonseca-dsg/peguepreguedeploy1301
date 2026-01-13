
import { jsPDF } from "jspdf";
import { ActivityContent, LanguageCode } from "../types";

// Simple Word Search Generator
function generateWordSearchGrid(words: string[], size: number = 10): { grid: string[][], placed: boolean } {
    const grid = Array(size).fill(null).map(() => Array(size).fill(''));
    const directions = [[0, 1], [1, 0], [1, 1], [-1, 1]]; // Horizontal, Vertical, Diagonal

    for (const word of words) {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 100) {
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const startX = Math.floor(Math.random() * size);
            const startY = Math.floor(Math.random() * size);

            // Check boundaries
            let fits = true;
            for (let i = 0; i < word.length; i++) {
                const x = startX + i * dir[0];
                const y = startY + i * dir[1];
                if (x < 0 || x >= size || y < 0 || y >= size || (grid[y][x] !== '' && grid[y][x] !== word[i])) {
                    fits = false;
                    break;
                }
            }

            if (fits) {
                for (let i = 0; i < word.length; i++) {
                    const x = startX + i * dir[0];
                    const y = startY + i * dir[1];
                    grid[y][x] = word[i];
                }
                placed = true;
            }
            attempts++;
        }
    }

    // Fill empty spaces with random letters
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (grid[y][x] === '') {
                grid[y][x] = alphabet[Math.floor(Math.random() * alphabet.length)];
            }
        }
    }

    return { grid, placed: true };
}

export async function createActivityPDF(activity: ActivityContent, coloringImageUrl: string | null, lang: LanguageCode) {
    const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4"
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    let cursorY = 20;

    // Helper for Rounded Rects with Fill
    const drawCard = (y: number, height: number, fillColor: [number, number, number] = [255, 255, 255]) => {
        doc.setFillColor(...fillColor);
        doc.setDrawColor(240, 240, 240); // Light gray border
        doc.roundedRect(margin, y, pageWidth - (margin * 2), height, 3, 3, 'FD');
    };

    // --- PAGE 1: ATIVIDADE ---

    // 1. Header (Purple Background)
    doc.setFillColor(124, 58, 237); // Purple-600
    doc.rect(0, 0, pageWidth, 35, 'F'); // Reduced height

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("ATIVIDADES BÍBLICAS", pageWidth / 2, 18, { align: "center" });

    // Header Info Box (White floating box)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 28, pageWidth - (margin * 2), 16, 3, 3, 'F'); // Compact box

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Nome: _________________________________", margin + 10, 39);
    doc.text("Data: ____/____/____", pageWidth - margin - 50, 39);

    cursorY = 52; // Started earlier

    // 2. Title & Verse Card
    const titleHeight = 30; // Compact height
    drawCard(cursorY, titleHeight, [248, 250, 252]); // Slate-50

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59); // Slate-800
    const splitTitle = doc.splitTextToSize(activity.title, 160);
    doc.text(splitTitle, pageWidth / 2, cursorY + 10, { align: "center" }); // Tuned position

    // Verse
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // Slate-600
    let verseText = activity.bibleVerse;
    if (!verseText || verseText === "undefined") {
        verseText = "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho. (Salmos 119:105)";
    }
    const splitVerse = doc.splitTextToSize(`"${verseText}"`, 150);
    doc.text(splitVerse, pageWidth / 2, cursorY + 20, { align: "center" }); // Tuned position

    cursorY += titleHeight + 6; // Reduced spacing

    // 3. Quiz Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(124, 58, 237); // Purple Header
    doc.text("1. Responda:", margin, cursorY);
    cursorY += 6; // Reduced spacing

    // Fallback Quiz Data (More engaging)
    const FALLBACK_QUIZ = [
        {
            question: "Qual o principal ensinamento de fé desta história?",
            options: ["Confiar sempre em Deus", "Desistir quando for difícil", "Fazer tudo sozinho", "Fugir dos problemas"]
        }
    ];

    const allQuestions = (Array.isArray(activity.quiz) && activity.quiz.length > 0) ? activity.quiz : FALLBACK_QUIZ;
    const quizQuestions = allQuestions.slice(0, 1); // FORCE 1 QUESTION ONLY

    // REWRITE OF THE WHOLE LOOP for cleanliness:
    cursorY += 2; // Extra spacing before loop (if needed)

    quizQuestions.forEach((q, idx) => {
        const options = Array.isArray(q.options) ? q.options : [];

        // Calculate needed height
        doc.setFontSize(11); // Increased font size for measurement
        let optionsHeight = 0;
        options.forEach(opt => {
            const lines = doc.splitTextToSize(opt, pageWidth - (margin * 2) - 15);
            optionsHeight += (lines.length * 6) + 3; // Increased spacing
        });

        doc.setFontSize(12); // Increased font size for question title
        const qTitleLines = doc.splitTextToSize(`${idx + 1}) ${q.question}`, 160);
        const qTitleHeight = qTitleLines.length * 6; // Increased spacing

        const totalHeight = qTitleHeight + optionsHeight + 10; // Padding

        // Draw Card
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240); // Slate-200
        doc.roundedRect(margin, cursorY, pageWidth - (margin * 2), totalHeight, 2, 2, 'FD');

        // Draw Question
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12); // Larger Question Font
        doc.setTextColor(51, 65, 85); // Slate-700
        doc.text(qTitleLines, margin + 5, cursorY + 8);

        // Draw Options
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11); // Larger Option Font
        let currentY = cursorY + 8 + qTitleHeight + 2;

        options.forEach((opt) => {
            doc.setDrawColor(203, 213, 225);
            doc.rect(margin + 5, currentY - 4, 4, 4); // Larger Checkbox

            const splitOpt = doc.splitTextToSize(opt, pageWidth - (margin * 2) - 15);
            doc.text(splitOpt, margin + 14, currentY);
            currentY += (splitOpt.length * 6) + 3;
        });

        cursorY += totalHeight + 6;
    });

    cursorY += 2; // Minimal spacing

    // 4. Complete Phrase
    if (activity.completeThePhrase && cursorY < pageHeight - 60) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(124, 58, 237);
        doc.text("2. Complete a frase:", margin, cursorY);
        cursorY += 10;

        // Yellow Card
        doc.setFillColor(254, 252, 232); // Yellow-50
        doc.setDrawColor(253, 224, 71); // Yellow-300
        doc.roundedRect(margin, cursorY, pageWidth - (margin * 2), 20, 3, 3, 'FD');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(161, 98, 7); // Yellow-800
        const splitPhrase = doc.splitTextToSize(activity.completeThePhrase.phrase || "", 150);
        doc.text(splitPhrase, pageWidth / 2, cursorY + 11, { align: "center" });

        cursorY += 30;
    }

    // 5. Word Search (Explicitly on New Page)
    doc.addPage();
    cursorY = 20;

    // Header Reuse (Minimal)
    doc.setFillColor(124, 58, 237);
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("CAÇA-PALAVRAS", pageWidth / 2, 13, { align: "center" });

    cursorY = 35;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(124, 58, 237);
    doc.text("3. Caça-Palavras:", margin, cursorY);
    cursorY += 10;

    const words = Array.isArray(activity.wordSearch) ? activity.wordSearch : [];
    if (words.length > 0) {
        // Grey Card container for Grid
        const { grid } = generateWordSearchGrid(words);
        const cellSize = 11; // Slightly smaller to fit card
        const gridHeight = (grid.length * cellSize) + 30;

        doc.setFillColor(248, 250, 252); // Slate-50
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, cursorY, pageWidth - (margin * 2), gridHeight, 4, 4, 'FD');

        // Draw Grid
        const gridPixelWidth = grid.length * cellSize;
        const startX = (pageWidth - gridPixelWidth) / 2;
        const startY = cursorY + 10;

        doc.setFont("courier", "bold");
        doc.setFontSize(14);
        doc.setTextColor(71, 85, 105);

        grid.forEach((row, rowIndex) => {
            row.forEach((letter, colIndex) => {
                const x = startX + (colIndex * cellSize) + (cellSize / 2) - 1;
                const y = startY + (rowIndex * cellSize) + (cellSize / 2) + 1;
                doc.text(letter, x, y, { align: 'center', baseline: 'middle' });
            });
        });

        // Word List Footer inside card
        const listY = startY + (grid.length * cellSize) + 8;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8); // Reduced font size for better fit
        doc.setTextColor(100, 100, 100);
        doc.text(`Encontre: ${words.join(", ")}`, pageWidth / 2, listY, { align: "center", maxWidth: pageWidth - (margin * 3) });

    } else {
        doc.text("Indisponível", margin + 5, cursorY + 10);
    }


    // --- PAGE 2: COLORING ---
    if (coloringImageUrl) {
        doc.addPage();

        // Header Reuse (Minimal)
        doc.setFillColor(124, 58, 237);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text("VAMOS COLORIR!", pageWidth / 2, 13, { align: "center" });

        const imgWidth = 170;
        const imgHeight = (imgWidth * 4) / 3;
        const x = (pageWidth - imgWidth) / 2;
        const y = 40;

        // Dashed Border Frame
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(1);
        doc.setLineDashPattern([3, 3], 0);
        doc.rect(x - 5, y - 5, imgWidth + 10, imgHeight + 10);
        doc.setLineDashPattern([], 0); // Reset

        doc.addImage(coloringImageUrl, "PNG", x, y, imgWidth, imgHeight);
    }

    // Global Footer Logic
    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Pegue & Pregue - www.pegueepregue.com", pageWidth / 2, pageHeight - 10, { align: "center" });
    }

    const fileName = activity.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
    doc.save(`atividade_${fileName}.pdf`);
}
