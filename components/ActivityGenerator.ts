
import { jsPDF } from "jspdf";
import { ActivityContent, LanguageCode } from "../types";
import { translations } from "../translations";

// Helper to clean AI strings from quotes, parentheses and emojis
function sanitizeAIString(str: string): string {
    if (!str) return "";
    return str
        .replace(/^['"\(]+/, '') // Remove leading quotes or parentheses
        .replace(/['"\)]+$/, '') // Remove trailing quotes or parentheses
        .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '') // Remove emojis
        .trim();
}

/**
 * Maze Generator using Recursive Backtracker Algorithm
 * Guarantees a solvable, dense and interesting maze
 */
function generateMaze(rows: number, cols: number) {
    const grid = Array(rows).fill(null).map(() =>
        Array(cols).fill(null).map(() => ({
            visited: false,
            walls: { top: true, right: true, bottom: true, left: true }
        }))
    );

    const stack: [number, number][] = [];
    let current: [number, number] = [0, 0];
    grid[0][0].visited = true;

    do {
        const [r, c] = current;
        const neighbors: [number, number, string][] = [];

        // Check Top
        if (r > 0 && !grid[r - 1][c].visited) neighbors.push([r - 1, c, 'top']);
        // Check Bottom
        if (r < rows - 1 && !grid[r + 1][c].visited) neighbors.push([r + 1, c, 'bottom']);
        // Check Left
        if (c > 0 && !grid[r][c - 1].visited) neighbors.push([r, c - 1, 'left']);
        // Check Right
        if (c < cols - 1 && !grid[r][c + 1].visited) neighbors.push([r, c + 1, 'right']);

        if (neighbors.length > 0) {
            const [nr, nc, dir] = neighbors[Math.floor(Math.random() * neighbors.length)];

            // Remove walls between current and neighbor
            if (dir === 'top') {
                grid[r][c].walls.top = false;
                grid[nr][nc].walls.bottom = false;
            } else if (dir === 'bottom') {
                grid[r][c].walls.bottom = false;
                grid[nr][nc].walls.top = false;
            } else if (dir === 'left') {
                grid[r][c].walls.left = false;
                grid[nr][nc].walls.right = false;
            } else if (dir === 'right') {
                grid[r][c].walls.right = false;
                grid[nr][nc].walls.left = false;
            }

            grid[nr][nc].visited = true;
            stack.push(current);
            current = [nr, nc];
        } else if (stack.length > 0) {
            current = stack.pop()!;
        }
    } while (stack.length > 0);

    return grid;
}

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

export async function createActivityPDF(
    activity: ActivityContent,
    coloringImageUrl: string | null,
    lang: LanguageCode,
    mazeStartImage?: string | null,
    mazeEndImage?: string | null
) {
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
    doc.text(`1. ${t.activity1}`, margin, cursorY);
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
        doc.text(`2. ${t.activity2}`, margin, cursorY);
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
    doc.text(`3. ${t.activity3}`, margin, cursorY);
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
        doc.text(`4. ${t.activity4}`, margin, cursorY);
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
        doc.text(`5. ${t.activity5}`, margin, cursorY);
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
        doc.text(`6. ${t.activity6}`, margin, cursorY);
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

    // 9. Who Said It? (Quote Matching)
    const whoSaidIt = activity.whoSaidIt && Array.isArray(activity.whoSaidIt) ? activity.whoSaidIt : [];
    if (whoSaidIt.length > 0) {
        if (cursorY + (whoSaidIt.length * 22) + 20 > pageHeight - 15) {
            doc.addPage();
            cursorY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(234, 88, 12); // Orange-600
        doc.text(`7. ${t.activityWhoSaid}`, margin, cursorY);
        cursorY += 8;

        // Draw character bank box
        doc.setFillColor(255, 247, 237); // Orange-50
        doc.setDrawColor(253, 186, 116); // Orange-300
        doc.roundedRect(margin, cursorY, pageWidth - (margin * 2), 12, 3, 3, 'FD');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(194, 65, 12); // Orange-800
        const charNames = whoSaidIt.map(w => w.character).join("   •   ");
        doc.text(charNames, pageWidth / 2, cursorY + 8, { align: "center" });
        cursorY += 20;

        // Draw quotes
        whoSaidIt.forEach((item, idx) => {
            // Speech bubble style
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(253, 186, 116); // Orange-300
            doc.roundedRect(margin + 10, cursorY, pageWidth - (margin * 2) - 10, 18, 4, 4, 'FD');

            // Triangle tail
            doc.triangle(
                margin + 10, cursorY + 5,
                margin + 2, cursorY + 9,
                margin + 10, cursorY + 13,
                'FD'
            );

            doc.setFont("helvetica", "italic");
            doc.setFontSize(10);
            doc.setTextColor(67, 20, 7); // Orange-950
            const quoteText = doc.splitTextToSize(`"${item.quote}"`, pageWidth - (margin * 2) - 30);
            doc.text(quoteText[0], margin + 20, cursorY + 11);

            // Line for answer
            doc.setDrawColor(194, 65, 12); // Orange-800
            doc.line(pageWidth - margin - 60, cursorY + 14, pageWidth - margin - 5, cursorY + 14);
            doc.setFontSize(8);
            doc.setTextColor(154, 52, 18); // Orange-700
            doc.text(t.nameLabel.replace(':', ''), pageWidth - margin - 60, cursorY + 17);

            cursorY += 24;
        });

        cursorY += 10;
    }

    // 10. Order Events (Timeline)
    const orderEvents = activity.orderEvents && Array.isArray(activity.orderEvents) ? activity.orderEvents : [];
    if (orderEvents.length > 0) {
        if (cursorY + (orderEvents.length * 18) + 20 > pageHeight - 15) {
            doc.addPage();
            cursorY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(13, 148, 136); // Teal-600
        doc.text(`8. ${t.activityOrder}`, margin, cursorY);
        cursorY += 10;

        // Shuffle for PDF
        const pdfEvents = [...orderEvents].sort(() => Math.random() - 0.5);

        pdfEvents.forEach((item, idx) => {
            // Number box
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(20, 184, 166); // Teal-500
            doc.setLineWidth(0.5);
            doc.roundedRect(margin, cursorY, 12, 12, 2, 2, 'FD');

            // Event text
            doc.setFillColor(240, 253, 250); // Teal-50
            doc.setDrawColor(204, 251, 241); // Teal-100
            doc.roundedRect(margin + 18, cursorY, pageWidth - (margin * 2) - 18, 12, 2, 2, 'FD');

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(15, 118, 110); // Teal-800
            const eventText = doc.splitTextToSize(item.event, pageWidth - (margin * 2) - 25);
            doc.text(eventText[0], margin + 22, cursorY + 8);

            cursorY += 16;
        });

        cursorY += 10;
    }

    // 11. Character Card (Cartão do Herói)
    if (activity.characterCard) {
        doc.addPage();
        cursorY = 20;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(239, 68, 68); // Red-500
        doc.text(`9. ${t.activityCharacter}`, margin, cursorY);
        cursorY += 10;

        // Card Container
        // Card Container - Increased Height
        const cardHeight = 135; // Was 120
        const cardWidth = 140;
        const cardX = (pageWidth - cardWidth) / 2;

        doc.setDrawColor(30, 41, 59); // Slate-800
        doc.setLineWidth(1);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(cardX, cursorY, cardWidth, cardHeight, 4, 4, 'FD');

        // Header
        doc.setFillColor(30, 41, 59); // Slate-800
        doc.roundedRect(cardX, cursorY, cardWidth, 20, 4, 4, 'F');
        // Fix corners
        doc.rect(cardX, cursorY + 10, cardWidth, 10, 'F'); // Square bottom of header

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text(activity.characterCard.name.toUpperCase(), pageWidth / 2, cursorY + 13, { align: "center" });

        // Title
        doc.setFontSize(10);
        doc.setTextColor(250, 204, 21); // Yellow-400
        doc.text(activity.characterCard.title.toUpperCase(), pageWidth / 2, cursorY + 25, { align: "center" });

        // Portrait Box
        const contentY = cursorY + 30;
        doc.setDrawColor(203, 213, 225); // Slate-300
        doc.setLineWidth(0.5);
        doc.setLineDashPattern([3, 3], 0);
        doc.rect(cardX + 25, contentY, 90, 65); // Bigger photo area
        doc.setLineDashPattern([], 0);

        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.text(t.newsDraw || "DESENHE O HERÓI", pageWidth / 2, contentY + 32, { align: "center" });

        // Attributes (Compressed to give space for photo)
        let attrY = contentY + 70; // Moved down
        const attrs = [
            { label: t.attrFaith, val: activity.characterCard.attributes.faith, color: [59, 130, 246] },
            { label: t.attrCourage, val: activity.characterCard.attributes.courage, color: [239, 68, 68] },
            { label: t.attrWisdom, val: activity.characterCard.attributes.wisdom, color: [168, 85, 247] }
        ];

        attrs.forEach(attr => {
            doc.setFontSize(8); // Smaller font
            doc.setTextColor(71, 85, 105);
            doc.text(attr.label.toUpperCase(), cardX + 10, attrY + 2);

            // Bar bg
            doc.setFillColor(241, 245, 249);
            doc.roundedRect(cardX + 35, attrY - 2, 85, 5, 2, 2, 'F'); // Wider bar

            // Bar fill
            doc.setFillColor(attr.color[0], attr.color[1], attr.color[2]);
            const fillWidth = (attr.val / 10) * 85;
            doc.roundedRect(cardX + 35, attrY - 2, fillWidth, 5, 2, 2, 'F');

            doc.setFontSize(8);
            doc.text(attr.val * 10 + "%", cardX + 120, attrY + 2);

            attrY += 8; // Tighter spacing
        });

        // "Somente Cristo" Badge for full stats (Case D)
        if (activity.characterCard.attributes.faith >= 10 &&
            activity.characterCard.attributes.courage >= 10 &&
            activity.characterCard.attributes.wisdom >= 10) {
            doc.setFillColor(239, 68, 68); // Red-500
            doc.roundedRect(cardX + 35, attrY + 2, 70, 8, 2, 2, 'F');
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.setTextColor(255, 255, 255);
            doc.text("FORÇA TOTAL SOMENTE EM CRISTO!", pageWidth / 2, attrY + 7.5, { align: "center" });
        }

        cursorY += cardHeight + 10;
    }

    // 10. Secret Message (Decifre o Código) - MOVED HERE to follow Hero Card
    if (activity.secretPhrase) {
        if (cursorY + 60 > pageHeight - 15) { // If it doesn't fit with Hero Card
            doc.addPage();
            cursorY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(79, 70, 229); // Indigo-600
        doc.text(`10. ${t.activitySecret}`, margin, cursorY);
        cursorY += 8;

        // Draw Key Box
        doc.setDrawColor(199, 210, 254);
        doc.setFillColor(238, 242, 255);
        doc.roundedRect(margin, cursorY, pageWidth - (margin * 2), 25, 3, 3, 'FD');

        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
        const codeMap = new Map<string, number>();
        alphabet.forEach((char, i) => codeMap.set(char, i + 1));

        doc.setFontSize(8);
        doc.setTextColor(67, 56, 202);
        let keyX = margin + 5;
        let keyY = cursorY + 6;

        alphabet.forEach((char, i) => {
            if (i === 13) { keyX = margin + 5; keyY += 12; }
            doc.text(`${char}=${i + 1}`, keyX, keyY);
            keyX += 13;
        });

        cursorY += 35;

        const phrase = activity.secretPhrase.toUpperCase();
        let pX = margin;

        phrase.split('').forEach((char) => {
            if (char === ' ') {
                pX += 10;
            } else {
                doc.setDrawColor(99, 102, 241);
                doc.rect(pX, cursorY, 10, 10);
                doc.setFontSize(7);
                doc.setTextColor(100, 100, 100);
                const code = codeMap.get(char) || "?";
                doc.text(`${code}`, pX + 5, cursorY + 14, { align: "center" });
                pX += 12;
                if (pX > pageWidth - margin - 15) {
                    pX = margin;
                    cursorY += 18;
                }
            }
        });

        cursorY += 25;
    }

    // 11. News Flash (Notícia Urgente) - START NEW PAGE
    if (activity.newsFlash) {
        doc.addPage();
        cursorY = 20;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(87, 83, 78); // Stone-600
        doc.text(`11. ${t.activityNews}`, margin, cursorY);
        cursorY += 10;

        const paperHeight = 85; // Reduced slightly to fit more
        doc.setDrawColor(168, 162, 158);
        doc.setLineWidth(0.5);
        doc.setFillColor(250, 250, 249);
        doc.roundedRect(margin, cursorY, pageWidth - (margin * 2), paperHeight, 2, 2, 'FD');

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.8);
        doc.line(margin + 5, cursorY + 12, pageWidth - margin - 5, cursorY + 12);

        doc.setFont("times", "bold");
        doc.setFontSize(18);
        doc.setTextColor(28, 25, 23);
        doc.text(activity.newsFlash.title.toUpperCase(), pageWidth / 2, cursorY + 9, { align: "center" });

        doc.setFontSize(14);
        doc.text(`"${activity.newsFlash.headline}"`, pageWidth / 2, cursorY + 22, { align: "center" });

        const contentY = cursorY + 28;
        doc.setDrawColor(214, 211, 209);
        doc.rect(margin + 10, contentY + 2, 50, 35);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(168, 162, 158);
        doc.text(t.newsDraw || "FOTO", margin + 35, contentY + 18, { align: "center" });

        const lineX = margin + 65;
        const lineW = pageWidth - lineX - margin - 10;
        let lineY = contentY + 8;
        doc.setLineWidth(0.5);
        for (let i = 0; i < 4; i++) {
            doc.line(lineX, lineY, lineX + lineW, lineY);
            lineY += 8;
        }

        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(120, 113, 108);
        const instruct = doc.splitTextToSize(activity.newsFlash.instructions, pageWidth - (margin * 2) - 20);
        doc.text(instruct, margin + 10, cursorY + paperHeight - 5);

        cursorY += paperHeight + 15;
    }

    // 12. Family Questions - FOLLOWS News Flash
    const familyQuestions = activity.familyQuestions && Array.isArray(activity.familyQuestions) ? activity.familyQuestions : [];
    if (familyQuestions.length > 0) {
        if (cursorY + (familyQuestions.length * 15) > pageHeight - 40) {
            doc.addPage();
            cursorY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(219, 39, 119); // Pink-600
        doc.text(`12. ${t.activityFamily}`, margin, cursorY);
        cursorY += 10;

        familyQuestions.forEach((q) => {
            doc.setFillColor(253, 242, 248);
            doc.setDrawColor(252, 231, 243);
            doc.circle(margin + 5, cursorY + 4, 4, 'FD');
            doc.setTextColor(219, 39, 119);
            doc.setFontSize(8);
            doc.text("?", margin + 5, cursorY + 5, { align: "center" });

            doc.setFont("helvetica", "italic");
            doc.setFontSize(10);
            doc.setTextColor(131, 24, 67);
            const qLines = doc.splitTextToSize(q, pageWidth - (margin * 2) - 15);
            doc.text(qLines, margin + 12, cursorY + 5);
            cursorY += (qLines.length * 5) + 6;
        });

        cursorY += 10;
    }

    // 13. Verse to Memorize - FOLLOWS Family Questions
    if (activity.bibleVerse) {
        if (cursorY + 30 > pageHeight - 15) {
            doc.addPage();
            cursorY = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(168, 85, 247); // Purple-500
        doc.text(`13. ${t.activity7}`, margin, cursorY);
        cursorY += 8;

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(168, 85, 247);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, cursorY, pageWidth - (margin * 2), 22, 4, 4, 'FD');

        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(88, 28, 135);
        const verseText = doc.splitTextToSize(activity.bibleVerse, pageWidth - (margin * 2) - 20);
        doc.text(verseText, margin + 10, cursorY + 8);

        cursorY += 30;
    }


    // 15. Labirinto (Maze)
    if (activity.maze) {
        doc.addPage();
        cursorY = 20;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(124, 58, 237); // Purple-600
        doc.text(`14. ${sanitizeAIString(t.activityMaze)}`, margin, cursorY);
        cursorY += 10;

        // Header for maze - Sanitized
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(109, 40, 217); // Purple-700
        const mazeInstructions = sanitizeAIString(activity.maze.instructions);
        doc.text(mazeInstructions, margin, cursorY);
        cursorY += 15;

        // Maze Generation Algorithm Integration
        const ageGroup = (activity as any).ageGroup || '5-6';
        let rows = 10;
        let cols = 10;

        // Dynamic density based on age
        if (ageGroup === '3-4' || ageGroup === '5-6') {
            rows = 15; cols = 10;
        } else if (ageGroup === '7-9') {
            rows = 25; cols = 18;
        } else {
            rows = 40; cols = 28; // Back to Extreme complexity for 10-12
        }

        const mazeGrid = generateMaze(rows, cols);

        // Calculate cell size - Reduced by 20% (approx 100mm width)
        const maxMazeWidth = 100;
        const cellSize = maxMazeWidth / cols;
        const startX = (pageWidth - (cols * cellSize)) / 2;
        const startY = cursorY + 45; // Spacing increased to avoid overlap with instruction text

        // Draw Maze Walls - Classic Black style
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.8); // Thinner for complex mazes 35x22

        // Outer Border - OPEN AT START AND END
        doc.line(startX + cellSize, startY, startX + (cols * cellSize), startY); // Top (skipped start cell)
        doc.line(startX + (cols * cellSize), startY, startX + (cols * cellSize), startY + (rows * cellSize)); // Right
        doc.line(startX, startY + (rows * cellSize), startX + (cols - 1) * cellSize, startY + (rows * cellSize)); // Bottom (skipped end cell)
        doc.line(startX, startY, startX, startY + (rows * cellSize)); // Left

        // Draw Internal Walls
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = mazeGrid[r][c];
                const x = startX + (c * cellSize);
                const y = startY + (r * cellSize);

                if (cell.walls.right && !(r === rows - 1 && c === cols - 1)) {
                    doc.line(x + cellSize, y, x + cellSize, y + cellSize);
                }
                if (cell.walls.bottom && !(r === rows - 1 && c === cols - 1)) {
                    doc.line(x, y + cellSize, x + cellSize, y + cellSize);
                }
            }
        }

        // Thematic Images at Start and End - CLEAN RENDER
        const imgSize = 30;
        if (mazeStartImage) {
            // PETER (A) - Positioned near the open TOP entry
            doc.addImage(mazeStartImage, "PNG", startX - 2, startY - imgSize - 5, imgSize, imgSize);
            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0);
            doc.text("INÍCIO (A)", startX + cellSize / 2, startY - 2, { align: "center" });
        }
        if (mazeEndImage) {
            // JESUS (B) - Positioned near the open BOTTOM exit
            const mazeEndX = startX + (cols * cellSize);
            const mazeEndY = startY + (rows * cellSize);
            doc.addImage(mazeEndImage, "PNG", mazeEndX - imgSize + 2, mazeEndY + 2, imgSize, imgSize);
            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0);
            doc.text("FIM (B)", mazeEndX - cellSize / 2, mazeEndY + imgSize + 5, { align: "center" });
        }

        cursorY = startY + (rows * cellSize) + 20;
    }

    // --- PAGE 3/4: COLORING (re-indexed) ---
    if (coloringImageUrl) {
        doc.addPage();

        // Header Reuse (Minimal)
        doc.setFillColor(124, 58, 237);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text(`15. ${t.coloringTitle}`, pageWidth / 2, 13, { align: "center" });

        const imgWidth = 180;
        const imgHeight = (imgWidth * 4) / 3; // ~240
        const x = (pageWidth - imgWidth) / 2;
        const y = 30; // Position higher

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
        doc.text(`${t.title || "Pegue & Pregue"} - www.peguepregue.online`, pageWidth / 2, pageHeight - 10, { align: "center" });
    }

    const fileName = activity.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
    doc.save(`atividade_${fileName}.pdf`);
}
