import { GoogleGenAI, Type } from "@google/genai";
import { AgeGroup, IllustrationStyle, BibleStory, LanguageCode, ActivityContent } from "../types";

const langMap: Record<LanguageCode, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano'
};

/**
 * GERA A ESTRUTURA DA HISTÓRIA (TEXTO E PROMPTS)
 */
export async function generateStoryStructure(apiKey: string, storyName: string, age: AgeGroup, lang: LanguageCode): Promise<BibleStory> {
  const ai = new GoogleGenAI({ apiKey });
  const languageName = langMap[lang];

  const prompt = `
    Como um especialista em educação cristã infantil e teólogo experiente, adapte a história bíblica: "${storyName}" para crianças de ${age}.
    Toda a resposta (título, descrições e narração) deve ser estritamente em ${languageName}.
    
    REGRAS IMPORTANTES:
    
    1. ESTRUTURA: Divida a história em 6 a 8 cenas narrativas claras e cronológicas que cubram TODOS os pontos importantes da história bíblica.
    
    2. FIDELIDADE BÍBLICA: O narrativeText de cada cena DEVE:
       - Ser FIEL às escrituras sagradas.
       - Ter entre 4 a 6 frases por cena.
       - Manter linguagem apropriada para crianças.
    
    3. TIPO DE ADAPTAÇÃO (CRÍTICO):
       Analise o título "${storyName}".
       
       CASO A: HISTÓRIA NARRATIVA (Ex: Arca de Noé, Davi e Golias, Nascimento de Jesus)
       - Mantenha o foco na sequência de eventos e personagens principais da Bíblia.
       
       CASO B: TEMA DOUTRINÁRIO/ENSINO (Ex: Armadura de Deus, Fruto do Espírito, Bem-Aventuranças, Parábolas)
       - NÃO INVENTE histórias paralelas de "crianças modernas" (Ex: Nada de "Aninha aprendendo com a vovó").
       - As cenas devem ilustrar os CONCEITOS ou SÍMBOLOS.
       - Exemplo "Armadura de Deus": Cena 1=Paulo apresentando, Cena 2=Cinto da Verdade (foco visual no cinto), Cena 3=Couraça (foco na couraça), etc.
       - Exemplo "Frutos do Espírito": Cada cena deve ilustrar um ou dois frutos com exemplos visuais claros ou metáforas bíblicas.
       - O texto deve ser EXPLICATIVO e DIDÁTICO, falando diretamente sobre o conceito.

    4. DESCRIÇÃO DO PERSONAGEM (CONSISTÊNCIA VISUAL): 
       - Se for Narrativa: Defina o protagonista com DETALHES VISUAIS ESPECÍFICOS e FIXOS para garantir consistência em todas as imagens.
       - Exemplo: "Gideon, jovem hebreu, 30 anos, barba curta castanha, cabelo castanho encaracolado, túnica bege simples, sinto de couro marrom, sandálias gastas".
       - Se for Doutrina: Defina um personagem representativo fixo com os mesmos detalhes.
    
    5. PRECISÃO HISTÓRICA: Garanta vestimentas da época e cenários autênticos do Oriente Médio antigo.
    
    6. PROMPTS DE IMAGEM (CRÍTICO - FIDELIDADE BÍBLICA):
       - O imagePrompt DEVE ilustrar EXATAMENTE o que está descrito no narrativeText daquela cena.
       - Exemplo Jonas: Se o texto diz "Jonas orou no ventre do peixe", o prompt deve ser "Jonas inside the belly of a large fish, praying on his knees, dark interior with soft light" - NÃO mostre ele sendo engolido.
       - Exemplo Daniel: Se o texto diz "Daniel orava na cova", mostre ele orando pacificamente com leões dormindo ao redor - NÃO mostre leões atacando.
       - NUNCA mostre momentos de violência ou medo excessivo.
       - Mostre o MOMENTO DE FÉ/MILAGRE, não o momento de perigo.
       - Se for Doutrina/Simbolismo: O prompt deve focar no OBJETO ou SÍMBOLO da lição (Ex: "Close up of a golden shinning Belt of Truth on a tunic").
       - VARIAR OS ENQUADRAMENTOS: Use "Wide shot", "Close up", "Low angle".
       - CENA COMPLETA: Descreva o ambiente e ação.
       - NÃO inclua números repetitivos.
       - NÃO inclua anjos/halos (exceto se essenciais ao tema, ex: Anunciação).
       - Os personagens devem ser humanos normais.
       - Se houver Jesus ou multidão, descreva-os.
    
    7. TÍTULO: Deve ser APENAS o nome da história.

    CRITICAMENTE IMPORTANTE:
    - O conteúdo de "narrativeText", "title" e "characterDescription" DEVE SER ESTRITAMENTE EM ${languageName}.
    - SE ${languageName} FOR "English", USE TEXTO EM INGLÊS.
    - SE ${languageName} FOR "Español", USE TEXTO EM ESPANHOL.
    - O idioma de resposta é ${languageName}.
    
    Retorne estritamente um JSON válido.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            characterDescription: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  imagePrompt: { type: Type.STRING },
                  narrativeText: { type: Type.STRING }
                },
                required: ["id", "imagePrompt", "narrativeText"]
              }
            }
          },
          required: ["title", "characterDescription", "scenes"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error("Erro ao gerar estrutura da história:", error);
    throw new Error(`Falha ao gerar história: ${error.message}`);
  }
}

/**
 * GERA A IMAGEM DE CADA CENA
 */
export async function generateSceneImage(
  apiKey: string,
  scenePrompt: string,
  characterDesc: string,
  style: IllustrationStyle,
  retryCount = 0,
  isVariation = false
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  // Define o estilo visual baseado na escolha do usuário
  let stylePrompt = "";
  if (style === IllustrationStyle.STYLE_2D) {
    stylePrompt = `Premium quality 2D digital sticker illustration for children's books. 
STYLE REQUIREMENTS:
- Cute, friendly cartoon characters with big expressive eyes
- Vivid and vibrant saturated colors
- Clean thick white outline around everything (sticker effect)
- Smooth gradients and soft shadows
- Pure white background (#FFFFFF)
- Professional children's book illustration quality
- Consistent art style throughout`;
  } else if (style === IllustrationStyle.COLORING_PAGE) {
    stylePrompt = `Black and white coloring page for children ages 4-8.
STYLE REQUIREMENTS:
- Thick clean black outlines only
- NO grayscale, NO shading, NO color fills
- Pure white background
- Simple shapes easy for kids to color
- Minimal fine details
- Large areas to color`;
  } else {
    stylePrompt = `3D Pixar-style illustration for children's books.
STYLE REQUIREMENTS:
- Smooth 3D rendered characters
- Volumetric lighting with soft shadows
- Cute and appealing character designs
- Warm, inviting color palette
- Pure white background
- Professional animation studio quality`;
  }

  // Variação de ângulo para evitar imagens repetidas no refresh
  const variationInstruction = isVariation
    ? " CAMERA: Use a different camera angle than usual (wide shot, low angle, or over-the-shoulder)."
    : "";

  // Combina a ação da cena com a descrição fixa do personagem
  const finalPrompt = `ILLUSTRATION REQUEST FOR CHILDREN'S BIBLE STORY BOOK

${stylePrompt}

SCENE TO ILLUSTRATE: ${scenePrompt}

MAIN CHARACTER APPEARANCE (KEEP CONSISTENT IN ALL IMAGES):
${characterDesc}

SETTING: Ancient Israel/Middle East biblical times
BACKGROUND: Pure white background, no complex backgrounds
${variationInstruction}

CRITICAL RULES:
- NO text or letters in the image
- NO halos on characters
- NO wings on humans (only on angels if specifically mentioned)
- Characters should look friendly and approachable
- Age-appropriate for children ages 3-10
- The character must look EXACTLY as described above in every scene`;

  const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  if (isDev) console.log(`[Imagem] Gerando cena (tentativa ${retryCount + 1}):`, scenePrompt.substring(0, 100) + '...');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: { parts: [{ text: finalPrompt }] },
      config: {
        responseModalities: ["image", "text"],
        imageConfig: { aspectRatio: "3:4" }
      } as any
    });

    if (isDev) console.log('[Imagem] Resposta recebida, verificando partes...');

    // Verificar se há candidatos na resposta
    if (!response.candidates || response.candidates.length === 0) {
      if (isDev) console.error('[Imagem] Nenhum candidato na resposta:', JSON.stringify(response));
      throw new Error('API não retornou candidatos');
    }

    const parts = response.candidates[0]?.content?.parts || [];
    if (isDev) console.log(`[Imagem] Encontradas ${parts.length} partes na resposta`);

    for (const part of parts) {
      if ((part as any).inlineData) {
        const inlineData = (part as any).inlineData;
        if (isDev) console.log('[Imagem] Imagem gerada com sucesso!');
        return `data:${inlineData.mimeType || 'image/png'};base64,${inlineData.data}`;
      }
    }

    // Se não encontrou imagem, verificar se há texto com erro
    for (const part of parts) {
      if ((part as any).text) {
        if (isDev) console.log('[Imagem] API retornou texto ao invés de imagem:', (part as any).text);
      }
    }

    // Retry até 2 vezes se não conseguiu gerar
    if (retryCount < 2) {
      if (isDev) console.log(`[Imagem] Retentando geração (${retryCount + 1}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Aguarda 1s antes de retentar
      return generateSceneImage(apiKey, scenePrompt, characterDesc, style, retryCount + 1);
    }
  } catch (error: any) {
    if (isDev) console.error('[Imagem] Erro na geração:', error?.message || error);

    // Se for erro de rate limit ou quota, aguarda mais tempo
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      if (isDev) console.log('[Imagem] Rate limit detectado, aguardando 3s...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    if (retryCount < 2) {
      if (isDev) console.log(`[Imagem] Retentando após erro (${retryCount + 1}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return generateSceneImage(apiKey, scenePrompt, characterDesc, style, retryCount + 1);
    }
    throw error;
  }

  throw new Error("Failed to generate image after retries");
}

/**
 * GERA CONTEÚDO PARA ATIVIDADE EDUCATIVA (BNCC)
 */
export async function generateActivityContent(apiKey: string, storyName: string, age: AgeGroup, lang: LanguageCode): Promise<ActivityContent> {
  const ai = new GoogleGenAI({ apiKey });
  const languageName = langMap[lang];

  const prompt = `
    Como pedagogo especialista em BNCC e educação cristã, crie o conteúdo para uma folha de atividades A4 sobre a história: "${storyName}".
    Público Alvo: Crianças de ${age}.
    Idioma: ${languageName}.
    
    Gere um JSON VÁLIDO e COMPLETO com todos os campos abaixo (NENHUM CAMPO PODE SER NULL):
    1. title: Título da atividade (ex: "Aprendendo com [Nome da História]").
    - "bibleVerse": Um versículo CHAVE e ESPECÍFICO desta história (com referência). NÃO use Salmos genéricos.
    - "quiz": Array com EXATAMENTE 1 (UMA) pergunta de múltipla escolha.
       - A pergunta deve ser DESAFIADORA e TEMÁTICA, testando a compreensão da história.
       - PROIBIDO perguntas genéricas como "Onde está na bíblia?" ou "O que aprendemos?".
       - Deve ser uma pergunta sobre um EVENTO ou AÇÃO específica do personagem.
       - Deve ter 4 (QUATRO) opções de resposta.
    - "wordSearch": Array com 10 a 15 palavras-chave DA HISTÓRIA (todas em UPPERCASE, sem acentos, sem espaços, máx 12 letras).
    - "coloringPrompt": Prompt em INGLÊS para gerar um desenho de colorir (black and white outlines, for kids) sobre a cena principal.
    - "completeThePhrase": Objeto com "phrase" e "missingWord".
       - A frase deve ser um VERSÍCULO CHAVE ou LIÇÃO MORAL da história.
       - A frase NÃO pode ser simples demais.
       - Indique a palavra que falta com '_______'.
       - exemplo: { "phrase": "Pela _______, Noé construiu a arca para salvar sua família.", "missingWord": "fé" }

    Retorne APENAS o JSON válido, sem markdown.
    exemplo:
    {
      "title": "Daniel na Cova dos Leões",
      "bibleVerse": "O meu Deus enviou o seu anjo, e fechou a boca dos leões. (Daniel 6:22)",
      "quiz": [{ "question": "Qual atitude de Daniel fez o rei Dario assinar o decreto?", "options": ["Sua fidelidade a Deus", "Sua desobediência", "Sua riqueza"], "correctAnswer": 0 }],
      "wordSearch": ["DANIEL", "LEOES", "ANJO", "REI", "ORACAO", "DEUS", "FE", "PROTECAO", "DARIO", "COVA"],
      "coloringPrompt": "Daniel praying in the lions den, cute lions sleeping, simple black and white outlines, coloring page style for kids",
      "completeThePhrase": { "phrase": "O meu Deus enviou o seu _______.", "missingWord": "anjo" }
    }

    IMPORTANTE SOBRE O IDIOMA:
    - TODO o conteúdo gerado (perguntas, opções, versículos, títulos e palavras-chave) DEVE ESTAR EM ${languageName}.
    - Se ${languageName} for Inglês, o quiz e o versículo DEVEM ser em Inglês.
    - Se ${languageName} for Espanhol, o quiz e o versículo DEVEM ser em Espanhol.
    - O campo "coloringPrompt" DEVE ser sempre em INGLÊS (pois é para o modelo de imagem).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            bibleVerse: { type: Type.STRING },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.NUMBER }
                },
                required: ["question", "options", "correctAnswer"]
              }
            },
            wordSearch: { type: Type.ARRAY, items: { type: Type.STRING } },
            coloringPrompt: { type: Type.STRING },
            completeThePhrase: {
              type: Type.OBJECT,
              properties: {
                phrase: { type: Type.STRING },
                missingWord: { type: Type.STRING }
              },
              required: ["phrase", "missingWord"]
            }
          },
          required: ["title", "bibleVerse", "quiz", "wordSearch", "coloringPrompt", "completeThePhrase"]
        }
      }
    });

    const text = response.text || "{}";
    // Limpeza de possíveis blocos de código markdown que o Gemini possa retornar
    const cleanText = text.replace(/```json\n ?| ```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error: any) {
    console.error("Erro ao gerar atividade:", error);
    throw new Error(`Falha ao gerar atividade: ${error.message} `);
  }
}
