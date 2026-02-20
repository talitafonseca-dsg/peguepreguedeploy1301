
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
    },
    {
        keywords: ["samaritano", "samaritan", "samaritain"],
        visual: "The Good Samaritan (Main Character): Middle-aged man, approx 40 years old, olive skin, short black beard, wearing a RUSTIC RED TUNIC with a CREAM-COLORED HEAD SCARF (TURBAN). Kind expression. \nSecondary Character (The Wounded Man): Man approx 30 years old, pale skin, wearing a TORN GRAY TUNIC, lying on ground, bandages/wounds visible."
    },
    {
        keywords: ["filho pródigo", "prodigal son", "prodigo"],
        visual: "The Prodigal Son (Main Character): Young man, approx 20 years old, olive skin, messy dark hair, patchy beard. Wears a DIRTY, RAGGED GREEN TUNIC (after losing money). \nThe Father: Elderly man, white beard, wearing a RICH PURPLE ROBE and GOLD RING, running with open arms."
    },
    {
        keywords: ["criação", "creation", "création", "creazione"],
        visual: "Presence of God: Represented ONLY by powerful golden light rays, glowing atmosphere, and cosmic energy. ABSOLUTELY NO HUMAN FIGURE, no face, no beard, no body. Focus on the MAGNIFICENCE of the creation acts (light, stars, nature) rather than a person."
    },
    {
        keywords: ["jacó", "jacob", "giacobbe"],
        visual: "Jacob (Twin 1): Dark brown hair, olive skin, smooth face. AS A BABY: Tiny newborn with SHORT DARK hair and smooth skin. AS AN ADULT: Smooth face (no beard), wearing a simple DARK GREEN tunic. IMPORTANT: He is the twin of Esau but looks completely opposite (smooth and dark)."
    },
    {
        keywords: ["esaú", "esau"],
        visual: "Esau (Twin 2): Red hair. AS A BABY: Tiny newborn with noticeably LONG, THICK, BRIGHT RED HAIR on his head. AS AN ADULT: He is extremely hairy on arms and chest, with a long wild red beard and messy red hair. Wears a rustic furry tunic. IMPORTANT: He is the twin of Jacob but looks completely opposite (hairy and red)."
    },
    {
        keywords: ["paralítico de betesda", "paralítico", "bethesda paralytic", "paralytic of bethesda"],
        visual: "Paralytic of Bethesda (Main Character): Man approx 40 years old, thin and weak appearance, olive skin, messy shoulder-length dark brown hair, scruffy beard. Wears a VERY RAGGED and DIRTY BEIGE TUNIC. He is often seen lying on a simple wooden mat/stretcher."
    },
    {
        keywords: ["pedro", "peter", "pierre", "pietro"],
        visual: "Peter (Apostle): Strong man approx 45 years old, tanned skin, short curly salt-and-pepper hair, thick graying beard. Wears a DARK BLUE TUNIC with a brown sash. Resolute and passionate expression."
    },
    {
        keywords: ["paulo", "paul", "pablo", "paul"],
        visual: "Paul (Apostle): Man approx 50 years old, receding hairline with short dark hair, well-kept dark beard. Wears a SIMPLE GRAY ROBE. Intelligent and intense eyes."
    },
    {
        keywords: ["maria", "mary", "marie"],
        visual: "Mary (Mother of Jesus): Kind woman approx 45-50 years old, gentle features, wearing a LIGHT BLUE ROBE and a CREAM-COLORED HEAD SCARF. Warm and caring expression."
    }
];

export function getFixedCharacterDescription(storyTitle: string): string | null {
    const lowerTitle = storyTitle.toLowerCase();
    const matches: string[] = [];

    for (const char of CHARACTER_DB) {
        if (char.keywords.some(k => lowerTitle.includes(k))) {
            matches.push(char.visual);
        }
    }

    return matches.length > 0 ? matches.join("\n\n") : null;
}
