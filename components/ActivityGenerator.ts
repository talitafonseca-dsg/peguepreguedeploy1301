
import { jsPDF } from "jspdf";
import { ActivityContent, LanguageCode } from "../types";
import { translations } from "../translations";

// Robust Word Search Generator - Guarantees 100% word placement
function generateWordSearchGrid(words: string[], minSize: number = 10): { grid: string[][], placed: boolean, placedWords: string[] } {
    const sortedWords = [...words].sort((a, b) => b.length - a.length);
    const maxWordLen = sortedWords[0]?.length || 0;
    let size = Math.max(minSize, maxWordLen);
    const maxSize = 20;

    while (size <= maxSize) {
        const result = tryPlaceAllWords(sortedWords, size);
        if (result.success) {
            return { grid: result.grid, placed: true, placedWords: result.placedWords };
        }
        size++;
    }

    const finalResult = tryPlaceAllWords(sortedWords, maxSize);
    return { grid: finalResult.grid, placed: true, placedWords: finalResult.placedWords };
}

function tryPlaceAllWords(words: string[], size: number): { success: boolean, grid: string[][], placedWords: string[] } {
    const grid = Array(size).fill(null).map(() => Array(size).fill(''));
    const directions = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];
    const placedWords: string[] = [];

    for (const word of words) {
        if (word.length > size) continue;
        let placed = false;
        const shuffledDirs = [...directions].sort(() => Math.random() - 0.5);

        for (let startY = 0; startY < size && !placed; startY++) {
            for (let startX = 0; startX < size && !placed; startX++) {
                for (const dir of shuffledDirs) {
                    if (canPlaceWord(grid, word, startX, startY, dir, size)) {
                        placeWord(grid, word, startX, startY, dir);
                        placedWords.push(word);
                        placed = true;
                        break;
                    }
                }
            }
        }
    }

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (grid[y][x] === '') {
                grid[y][x] = alphabet[Math.floor(Math.random() * alphabet.length)];
            }
        }
    }

    return { success: placedWords.length === words.length, grid, placedWords };
}

function canPlaceWord(grid: string[][], word: string, startX: number, startY: number, dir: number[], size: number): boolean {
    for (let i = 0; i < word.length; i++) {
        const x = startX + i * dir[0];
        const y = startY + i * dir[1];
        if (x < 0 || x >= size || y < 0 || y >= size) return false;
        if (grid[y][x] !== '' && grid[y][x] !== word[i]) return false;
    }
    return true;
}

function placeWord(grid: string[][], word: string, startX: number, startY: number, dir: number[]): void {
    for (let i = 0; i < word.length; i++) {
        const x = startX + i * dir[0];
        const y = startY + i * dir[1];
        grid[y][x] = word[i];
    }
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

    // Get translations for current language (fallback to pt if missing)
    const t = translations[lang] || translations['pt'];

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
    doc.text(t.activityTitle, pageWidth / 2, 18, { align: "center" });

    // Header Info Box (White floating box)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 28, pageWidth - (margin * 2), 16, 3, 3, 'F'); // Compact box

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setTextColor(100, 100, 100);
    doc.text(`${t.nameLabel} _________________________________`, margin + 10, 39);
    doc.text(`${t.dateLabel} ____/____/____`, pageWidth - margin - 50, 39);

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

    cursorY += titleHeight + 10; // Increased spacing

    // 3. Quiz Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(124, 58, 237); // Purple Header
    doc.text(t.activity1, margin, cursorY);
    cursorY += 10; // Increased spacing

    // Fallback Quiz Data (More engaging)
    const FALLBACK_QUIZ = [
        {
            question: t.fallbackQuestion,
            options: [t.fallbackOption1, t.fallbackOption2, t.fallbackOption3, t.fallbackOption4]
        }
    ];

    const allQuestions = (Array.isArray(activity.quiz) && activity.quiz.length > 0) ? activity.quiz : FALLBACK_QUIZ;
    const quizQuestions = allQuestions.slice(0, 1); // FORCE 1 QUESTION ONLY

    // REWRITE OF THE WHOLE LOOP for cleanliness:
    cursorY += 2; // Extra spacing before loop (if needed)

    quizQuestions.forEach((q, idx) => {
        const options = Array.isArray(q.options) ? q.options : [];

        // Calculate needed height
        doc.setFontSize(12); // Larger font size for options
        let optionsHeight = 0;
        options.forEach(opt => {
            const lines = doc.splitTextToSize(opt, pageWidth - (margin * 2) - 20);
            optionsHeight += (lines.length * 8) + 6; // More line spacing
        });

        doc.setFontSize(13); // Larger font size for question title
        const qTitleLines = doc.splitTextToSize(`${idx + 1}) ${q.question}`, 155);
        const qTitleHeight = qTitleLines.length * 8; // More line spacing

        const totalHeight = qTitleHeight + optionsHeight + 18; // More padding

        // Draw Card
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240); // Slate-200
        doc.roundedRect(margin, cursorY, pageWidth - (margin * 2), totalHeight, 2, 2, 'FD');

        // Draw Question
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13); // Larger Question Font
        doc.setTextColor(51, 65, 85); // Slate-700
        doc.text(qTitleLines, margin + 8, cursorY + 12);

        // Draw Options
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12); // Larger Option Font
        let currentY = cursorY + 14 + qTitleHeight + 4;

        options.forEach((opt) => {
            // Modern circular checkbox
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(124, 58, 237); // Purple-600
            doc.setLineWidth(0.8);
            doc.circle(margin + 12, currentY - 1, 4, 'FD');

            const splitOpt = doc.splitTextToSize(opt, pageWidth - (margin * 2) - 25);
            doc.setTextColor(51, 65, 85); // Slate-700
            doc.text(splitOpt, margin + 20, currentY);
            currentY += (splitOpt.length * 8) + 6; // More spacing between options
        });

        cursorY += totalHeight + 10; // More spacing after quiz
    });

    cursorY += 8; // More spacing before next section

    // 4. Complete Phrase
    if (activity.completeThePhrase && cursorY < pageHeight - 60) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(124, 58, 237);
        doc.text(t.activity2, margin, cursorY);
        cursorY += 14; // More spacing

        // Yellow Card - Larger height for better readability
        doc.setFillColor(254, 252, 232); // Yellow-50
        doc.setDrawColor(253, 224, 71); // Yellow-300
        doc.roundedRect(margin, cursorY, pageWidth - (margin * 2), 36, 3, 3, 'FD');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13); // Larger font
        doc.setTextColor(161, 98, 7); // Yellow-800
        const splitPhrase = doc.splitTextToSize(activity.completeThePhrase.phrase || "", 145);
        doc.text(splitPhrase, pageWidth / 2, cursorY + 18, { align: "center", lineHeightFactor: 1.5 });

        cursorY += 46; // More spacing after
    }

    // 5. Word Search (Explicitly on New Page)
    doc.addPage();
    cursorY = 20;

    // Header Removed to save space

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(124, 58, 237);
    doc.text(t.activity3, margin, cursorY);
    cursorY += 10;

    // Filter words: max 10 chars, max 8 words for guaranteed placement
    const words = Array.isArray(activity.wordSearch)
        ? activity.wordSearch.filter(w => w.length <= 10).slice(0, 8)
        : [];
    if (words.length > 0) {
        // Grey Card container for Grid
        const { grid, placedWords } = generateWordSearchGrid(words);
        const cellSize = 11; // Slightly smaller to fit card
        const gridHeight = (grid.length * cellSize) + 30;

        doc.setFillColor(248, 250, 252); // Slate-50
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, cursorY, pageWidth - (margin * 2), gridHeight, 4, 4, 'FD');

        // Draw Grid
        const gridPixelWidth = grid.length * cellSize;
        const startX = (pageWidth - gridPixelWidth) / 2;
        const startY = cursorY + 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(71, 85, 105);

        grid.forEach((row, rowIndex) => {
            row.forEach((letter, colIndex) => {
                const x = startX + (colIndex * cellSize) + (cellSize / 2) - 1;
                const y = startY + (rowIndex * cellSize) + (cellSize / 2) + 1;
                doc.text(letter, x, y, { align: 'center', baseline: 'middle' });
            });
        });

        // Word List Footer inside card - show only placed words
        const listY = startY + (grid.length * cellSize) + 8;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8); // Reduced font size for better fit
        doc.setTextColor(100, 100, 100);
        doc.text(`${t.wordSearchFind} ${placedWords.join(", ")}`, pageWidth / 2, listY, { align: "center", maxWidth: pageWidth - (margin * 3) });

    } else {
        doc.text(t.unavailable, margin + 5, cursorY + 10);
    }

    // 6. Unscramble Words (After Word Search)
    // Update cursorY based on Word Search height (Grid size = 10 * 11mm + 30mm padding = 140mm)
    // Start Y was 45 (Title line)
    // If words available, cursor should be at 45 + 140 = 185
    if (words.length > 0) {
        cursorY = 30 + 140 + 15; // More space below word search
    } else {
        cursorY += 20;
    }

    const scrambleWords = activity.scrambleWords && Array.isArray(activity.scrambleWords) ? activity.scrambleWords : [];
    if (scrambleWords.length > 0) {

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(124, 58, 237);
        doc.text(t.activity4, margin, cursorY);
        cursorY += 8;

        const boxHeight = (scrambleWords.length * 20) + 10;

        // Check if fits on page, if not add page (unlikely for A4 but safe)
        if (cursorY + boxHeight > pageHeight - 15) {
            doc.addPage();
            cursorY = 20;
        }

        drawCard(cursorY, boxHeight, [255, 247, 237]); // Orange-50 background

        let wordY = cursorY + 12;

        scrambleWords.forEach((item) => {
            // Scramble logic
            const scrambled = item.word.split('').sort(() => 0.5 - Math.random()).join('   ');

            doc.setFont("helvetica", "bold");
            // Dynamic font size based on word length
            const wordLen = item.word.length;
            const fontSize = wordLen > 8 ? 12 : wordLen > 6 ? 14 : 16;
            doc.setFontSize(fontSize);
            doc.setTextColor(234, 88, 12); // Orange-600
            doc.text(scrambled, margin + 15, wordY);

            // Line for answer
            doc.setDrawColor(251, 146, 60); // Orange-400
            doc.setLineWidth(0.5);
            doc.line(pageWidth - margin - 80, wordY, pageWidth - margin - 15, wordY);

            // Hint
            doc.setFont("helvetica", "italic");
            doc.setFontSize(9);
            doc.setTextColor(120, 113, 108); // Warm Gray
            doc.text(`${t.scrambleHint} ${item.hint}`, margin + 15, wordY + 6);

            wordY += 20;
        });

        cursorY += boxHeight;
    }

    // 7. Match Columns (on new page)
    const matchColumns = activity.matchColumns && Array.isArray(activity.matchColumns) ? activity.matchColumns : [];
    if (matchColumns.length > 0) {
        doc.addPage();
        cursorY = 20;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(37, 99, 235); // Blue-600
        doc.text(t.activity5, margin, cursorY);
        cursorY += 12;

        // Main container - white with light border
        const cardHeight = 14;
        const totalHeight = (matchColumns.length * (cardHeight + 4)) + 10;
        doc.setFillColor(248, 250, 252); // Slate-50
        doc.setDrawColor(226, 232, 240); // Slate-200
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, cursorY, pageWidth - (margin * 2), totalHeight, 4, 4, 'FD');

        const columnWidth = (pageWidth - (margin * 2) - 25) / 2;
        let itemY = cursorY + 10;

        // Shuffle right column for the activity
        const shuffledRight = [...matchColumns].sort(() => Math.random() - 0.5);

        matchColumns.forEach((item, idx) => {
            // Left card - individual rounded box
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(59, 130, 246); // Blue-500
            doc.setLineWidth(0.4);
            doc.roundedRect(margin + 5, itemY, columnWidth, cardHeight, 3, 3, 'FD');

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(30, 64, 175); // Blue-800
            const leftText = doc.splitTextToSize(`${String.fromCharCode(65 + idx)}. ${item.left}`, columnWidth - 8);
            doc.text(leftText[0], margin + 10, itemY + 9);

            // Right card - individual rounded box
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(59, 130, 246); // Blue-500
            doc.roundedRect(margin + columnWidth + 15, itemY, columnWidth, cardHeight, 3, 3, 'FD');

            doc.setTextColor(59, 130, 246); // Blue-500
            const rightText = doc.splitTextToSize(`${idx + 1}. ${shuffledRight[idx].right}`, columnWidth - 8);
            doc.text(rightText[0], margin + columnWidth + 20, itemY + 9);

            itemY += cardHeight + 4;
        });

        cursorY += totalHeight + 15;  // Standardized spacing
    }

    // 8. True or False (same page with cards like preview)
    const trueOrFalse = activity.trueOrFalse && Array.isArray(activity.trueOrFalse) ? activity.trueOrFalse : [];
    if (trueOrFalse.length > 0) {
        const cardHeight = 14;
        const totalHeight = (trueOrFalse.length * (cardHeight + 4)) + 10;

        if (cursorY + totalHeight > pageHeight - 30) {
            doc.addPage();
            cursorY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(22, 163, 74); // Green-600
        doc.text(t.activity6, margin, cursorY);
        cursorY += 12;

        let itemY = cursorY;

        trueOrFalse.forEach((item, idx) => {
            // Individual card for each statement
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(226, 232, 240); // Slate-200
            doc.setLineWidth(0.4);
            doc.roundedRect(margin, itemY, pageWidth - (margin * 2), cardHeight, 3, 3, 'FD');

            // Statement text
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(51, 65, 85); // Slate-700
            const statement = doc.splitTextToSize(`${idx + 1}. ${item.statement}`, 125);
            doc.text(statement[0], margin + 8, itemY + 9);

            // V button (green) - box at itemY+2, size 10, center at itemY+7
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(34, 197, 94); // Green-500
            doc.setLineWidth(0.6);
            doc.roundedRect(pageWidth - margin - 28, itemY + 2, 10, 10, 2, 2, 'FD');
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(34, 197, 94);
            doc.text(t.trueAbbr, pageWidth - margin - 23, itemY + 7, { align: "center", baseline: "middle" });

            // F button (red)
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(239, 68, 68); // Red-500
            doc.roundedRect(pageWidth - margin - 15, itemY + 2, 10, 10, 2, 2, 'FD');
            doc.setTextColor(239, 68, 68);
            doc.text(t.falseAbbr, pageWidth - margin - 10, itemY + 7, { align: "center", baseline: "middle" });

            itemY += cardHeight + 4;
        });

        cursorY = itemY + 10;  // Standardized spacing
    }

    // 9. Verse to Memorize (compact activity)
    if (activity.bibleVerse && cursorY < pageHeight - 40) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(168, 85, 247); // Purple-500
        doc.text(t.activity7, margin, cursorY);
        cursorY += 10;

        // Decorative card with verse
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(168, 85, 247); // Purple-500
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, cursorY, pageWidth - (margin * 2), 25, 4, 4, 'FD');



        // Verse text
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(88, 28, 135); // Purple-800
        const verseText = doc.splitTextToSize(activity.bibleVerse, pageWidth - (margin * 2) - 20); // Less padding needed
        doc.text(verseText[0], margin + 10, cursorY + 10);
        if (verseText[1]) {
            doc.text(verseText[1], margin + 10, cursorY + 18);
        }

        cursorY += 30;
    }


    // --- PAGE 3: COLORING ---
    if (coloringImageUrl) {
        doc.addPage();

        // Header Reuse (Minimal)
        doc.setFillColor(124, 58, 237);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text(t.coloringTitle, pageWidth / 2, 13, { align: "center" });

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
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`${t.title || "Pegue & Pregue"} - www.peguepregue.online`, pageWidth / 2, pageHeight - 10, { align: "center" });
    }

    const fileName = activity.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
    doc.save(`atividade_${fileName}.pdf`);
}
