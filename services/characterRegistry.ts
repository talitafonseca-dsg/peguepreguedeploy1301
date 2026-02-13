
import { LanguageCode } from "../types";

interface CharacterProfile {
    keywords: string[]; // Palavras-chave no título da história para identificar
    visual: string; // Descrição visual FIXA e IMUTÁVEL (em inglês para melhor compreensão da IA de imagem)
}

// Definições visuais "Hardcoded" para garantir consistência absoluta
// As descrições são em INGLÊS pois o modelo de imagem (Gemini/Flux) entende melhor prompts em inglês.
const CHARACTER_DB: CharacterProfile[] = [
    {
        keywords: ["zaqueu", "zacchaeus", "zachée", "zaccheo"],
        visual: "Zacchaeus (Main Character): Short stature man (dwarf-like but proportional), approx 40 years old, olive middle-eastern skin, short curly dark brown hair, well-groomed short dark beard. He wears a LAVISH EMERALD GREEN TUNIC with GOLD embroidery and a RICH RED SASH. He looks wealthy but short. EXPRESSION: Often curious or eager."
    },
    {
        keywords: ["noé", "noah", "noè"],
        visual: "Noah (Main Character): Elderly man, approx 600 years old (looks 70s), weather-beaten tan skin, LONG FLOWING WHITE HAIR and LONG WHITE BEARD. He wears a SIMPLE RUSTIC BEIGE TUNIC and a brown leather belt. Strong build for his age, diverse carpenter tools often nearby."
    },
    {
        keywords: ["davi", "david"],
        visual: "David (Young Shepherd): Young man, approx 16 years old, ruddy/tan skin, bright eyes, SHORT CURLY REDDISH-BROWN HAIR, NO BEARD (youthful). He wears a SIMPLE SHEPHERD TUNCI (light brown) and carries a wooden staff and a leather sling. Handsome and spirited appearance."
    },
    {
        keywords: ["jonas", "jonah", "giona"],
        visual: "Jonah (Prophet): Middle-aged man, approx 50 years old, pale/tan skin, BALDING head with graying hair on sides, LONG GRAY BEARD. He wears a RAGGED BLUE TUNIC (water-stained) with a brown cloak. He often looks grumpy or stubborn."
    },
    {
        keywords: ["daniel"],
        visual: "Daniel (Prophet): Young/Middle-aged man (depending on scene, default to young adult), handsome, olive skin, short neat dark hair, clean-shaven or very short stubble. He wears BABYLONIAN ROYAL CLOTHING: Blue and purple robe with intricate patterns, but keeps a humble posture."
    },
    {
        keywords: ["moisés", "moses", "moïse", "mosè"],
        visual: "Moses (Prophet): Elderly strong man, approx 80 years old, tan skin, LONG WHITE HAIR and LONG WHITE BEARD. He wears a RED ROBE/TUNIC with a brown cloak and holds a LARGE WOODEN STAFF. He radiates authority and humility."
    },
    {
        keywords: ["jesus", "jesús", "gesù"],
        visual: "Jesus Christ: Man approx 30-33 years old, middle-eastern olive skin, SHOULDER-LENGTH BROWN WAVY HAIR, FULL BROWN BEARD. He wears a LONG WHITE TUNIC (teaching robe) with a BLUE SASH/MANTLE draped over one shoulder. Gentle, kind, and authoritative expression. NO HALO."
    }
];

export function getFixedCharacterDescription(storyTitle: string): string | null {
    const lowerTitle = storyTitle.toLowerCase();

    for (const char of CHARACTER_DB) {
        if (char.keywords.some(k => lowerTitle.includes(k))) {
            return char.visual;
        }
    }

    return null;
}
