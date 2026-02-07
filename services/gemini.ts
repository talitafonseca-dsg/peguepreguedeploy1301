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
    
    1. ESTRUTURA: Analise a complexidade da história "${storyName}" e divida em 10 a 12 cenas narrativas claras e cronológicas.
       - Histórias longas/complexas (Criação, Êxodo, Vida de José): USE 12 CENAS para cobrir toda a narrativa.
       - Histórias médias (Davi e Golias, Daniel, Jonas): USE 10-11 CENAS.
       - Histórias curtas (Parábolas simples): USE 10 CENAS mínimo para aprofundar os detalhes.
       - IMPORTANTE: A história deve ficar COMPLETA, sem cortar partes importantes.
    
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
       - CRÍTICO: PROIBIDO INVENTAR PERSONAGENS OUVINTES (Ex: Nada de "Rabi fictício ensinando na escola", nada de "Criança moderna ouvindo").
       - Se for uma Parábola de Jesus (Ex: Bom Samaritano), narre a parábola DIRETAMENTE ou mostre Jesus ensinando seus Discípulos/Multidão.
       - Fidelidade ESCRITURAL é a prioridade máxima. Não adicione "molduras narrativas" que não existem na Bíblia.

    4. DESCRIÇÃO DO PERSONAGEM (CONSISTÊNCIA VISUAL - CRÍTICO): 
       - O CAMPO "characterDescription" DEVE SER DETALHADO E FIXO.
       - VOCÊ DEVE DEFINIR A IDADE APRENTE DO PERSONAGEM (Ex: "30 anos", "60 anos", "criança de 8 anos").
       - A IDADE DEVE SER MANTIDA EM TODAS AS CENAS. PROIBIDO MUDAR A IDADE.
       - Se for Narrativa: Defina o protagonista com DETALHES VISUAIS ESPECÍFICOS.
       - Exemplo: "Gideon, homem de 30 anos (MATENHA ESSA IDADE), barba curta castanha, cabelo castanho encaracolado, túnica bege simples, cinto de couro marrom, sandálias gastas, corpo forte de guerreiro".
       - Se for Doutrina: Defina um personagem representativo fixo com os mesmos detalhes.
    
    5. PRECISÃO HISTÓRICA: Garanta vestimentas da época e cenários autênticos do Oriente Médio antigo.
    
    6. PROMPTS DE IMAGEM (CRÍTICO - FIDELIDADE BÍBLICA E CONSISTÊNCIA):
       - O imagePrompt DEVE ilustrar EXATAMENTE o que está descrito no narrativeText daquela cena.
       - IMPORTANTE: NÃO repita a descrição física completa do personagem no prompt da cena, pois usaremos a "characterDescription" separadamente.
       - MAS, garanta que a ação e a emoção sejam descritas.
       - Exemplo Jonas: Se o texto diz "Jonas orou no ventre do peixe", o prompt deve ser "Jonas praying on his knees, dark interior with soft light, expression of faith" - (A aparência dele virá do characterDescription).
       - Exemplo Daniel: Se o texto diz "Daniel orava na cova", mostre ele orando pacificamente - NÃO mostre leões atacando.
       - NUNCA mostre momentos de violência ou medo excessivo.
       - DICA DE CONSISTÊNCIA: Se o personagem é adulto, NUNCA use palavras como "boy", "child", "kid", "little" no imagePrompt, a menos que seja outro personagem.
       - Mostre o MOMENTO DE FÉ/MILAGRE, não o momento de perigo.
       - Se for Doutrina/Simbolismo: O prompt deve focar no OBJETO ou SÍMBOLO da lição.
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
    
    LANGUAGE ENFORCEMENT:
    - You MUST output the JSON values in ${languageName}.
    - Do NOT output in Portuguese unless the requested language is Portuguese.
    
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
    stylePrompt = `PREMIUM 2D STICKER ILLUSTRATION STYLE:
- High quality digital sticker art with thick white outline around everything
- Rich, vibrant saturated colors with beautiful gradients and soft shading
- Semi-realistic proportions (NOT chibi, NOT flat)
- Detailed rendering with depth and dimension like professional children's book art
- Characters with expressive faces and detailed clothing textures
- Soft volumetric lighting creating depth
- Pure white background
- Professional illustration quality like Disney storybook art`;
  } else if (style === IllustrationStyle.STYLE_2D_NO_BORDER) {
    stylePrompt = `PREMIUM 2D ILLUSTRATION STYLE (NO BORDERS):
- High quality digital illustration art (NOT sticker style, NO white outlines)
- Rich, vibrant saturated colors with beautiful gradients and soft shading
- Semi-realistic proportions (NOT chibi, NOT flat)
- Detailed rendering with depth and dimension like professional children's book art
- Characters with expressive faces and detailed clothing textures
- Soft volumetric lighting creating depth
- Pure white background for easy integration
- Professional illustration quality like Disney storybook art`;
  } else if (style === IllustrationStyle.COLORING_PAGE) {
    stylePrompt = `STRICT BLACK AND WHITE COLORING PAGE FOR KIDS:
- ABSOLUTELY NO COLORS. ONLY BLACK LINES ON WHITE BACKGROUND.
- DO NOT use grayscale, DO NOT use shading, DO NOT use gradients.
- PURE BLACK OUTLINES ONLY.
- Thick, clean, continuous lines suitable for crayons.
- Characters and objects must be EMPTY (WHITE) to be colored in.
- NO fill, NO texture, NO cross-hatching.
- Simple, clear shapes.
- 100% Monochrome.
- This is a PRINTABLE COLORING BOOK PAGE.`;
  } else if (style === IllustrationStyle.STYLE_CUTE) {
    stylePrompt = `CUTE KAWAII / CHIBI STICKER STYLE (HISTÓRIAS NA LUVA):
- ADORABLE, CUTE, ROUND CHARACTERS (Chibi/Kawaii aesthetic)
- **UNIFORM EYE STYLE FOR EVERYONE**: ALL characters (main, secondary, crowd) MUST have the EXACT SAME eyes:
- **EYE STYLE**: Large, round, BLACK OVAL eyes with a small white highlight.
- **CRITICAL OVERRIDE**: IGNORE any eye color description in the character text. ALL EYES MUST BE BLACK.
- DO NOT use realistic eyes. DO NOT use colored irises.
- **COLORS MUST BE VIBRANT AND HIGHLY SATURATED**: Use bright primary colors (Red, Blue, Yellow, Green). AVOID pastel or washed-out tones.
- THICK WHITE OUTLINES around all characters and main objects (Sticker effect)
- Flat lighting with soft cell shading (Vector art style)
- Simplified anatomy (Big heads, small bodies, cute proportions)
- Pure white background

CRITICAL FOR CONSISTENCY (MUITO IMPORTANTE):
- **ABSOLUTELY NO TEXT, NO LETTERS, NO SPEECH BUBBLES**.
- 1. IF CHARACTER HAS A BEARD, THE CHIBI MUST HAVE A BEARD.
- 2. HAIR COLOR AND STYLE MUST MATCH THE DESCRIPTION EXACTLY.
- 3. CLOTHING COLORS MUST MATCH THE DESCRIPTION EXACTLY.
- 4. Do not make adults look like babies. Make them "Adult Chibis".
- KEEP THE SAME "CUTE DESIGN" IN EVERY SINGLE IMAGE.`;
  } else {
    // Default or STYLE_3D
    stylePrompt = `PREMIUM 3D PIXAR STYLE ILLUSTRATION:
- High quality 3D rendered characters like Pixar/Disney movies
- Rich volumetric lighting with soft shadows and depth
- Detailed textures on clothing and environments
- Semi-realistic proportions with appealing character designs
- Warm, cinematic color palette
- Thick white sticker outline around characters
- Pure white background
- Professional animation studio quality`;
  }

  // Variação de ângulo para evitar imagens repetidas no refresh
  const variationInstruction = isVariation
    ? " Use a slightly different camera angle."
    : "";

  // Combina a ação da cena com a descrição fixa do personagem
  const finalPrompt = `CHILDREN'S BIBLE ILLUSTRATION - STRICT REQUIREMENTS

${stylePrompt}

SCENE: ${scenePrompt}

MAIN CHARACTER (MUST LOOK IDENTICAL IN EVERY IMAGE):
${characterDesc}
- The character MUST have the EXACT same face, hair, clothes, and body type in EVERY scene
- DO NOT change the character's appearance

BIBLICAL ACCURACY RULES:
- NEVER show God as a human figure or old man with beard
- Represent God's presence as: golden light rays from above, glowing clouds, or voice (no visible figure)
- Show biblical events ACCURATELY as described in scripture
- Characters wear authentic ancient Middle Eastern clothing
${variationInstruction}

STRICT RULES:
- NO text or letters anywhere in the image
- ABSOLUTELY NO HALOS, NO AUREOLAS, NO GLOWING RINGS around heads. (CRITICAL)
- NO wings on humans
- Friendly, child-appropriate content only
- Pure white background, no complex scenery
- MAINTAIN THE EXACT SAME ART STYLE IN ALL IMAGES
${style === IllustrationStyle.COLORING_PAGE ? "- REMEMBER: BLACK LINES ONLY. NO COLOR AT ALL." : ""}`;

  const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  if (isDev) console.log(`[Imagem] Gerando cena (tentativa ${retryCount + 1}):`, scenePrompt.substring(0, 100) + '...');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
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
    - "wordSearch": Array com EXATAMENTE 8 palavras-chave DA HISTÓRIA (todas em UPPERCASE, sem acentos, sem espaços, MÁXIMO 8 LETRAS CADA - palavras curtas!).
    - "coloringPrompt": Prompt DETALHADO em INGLÊS para gerar um desenho de colorir sobre a cena principal.
       - IMPORTANTE: O prompt DEVE especificar claramente cada personagem (ex: "a man named Adam" ou "a woman named Eve").
       - CRÍTICO: Todos os personagens devem ter ANATOMIA HUMANA CORRETA - rostos humanos normais, proporções corretas, sem híbridos, sem distorções.
       - Se houver crianças, especifique "cute human children with normal human faces and bodies".
       - Se houver multidão, especifique "group of people with distinct human features".
       - OBRIGATÓRIO incluir no final: "professional illustration, clean line art, pure black outlines on white background, NO shading, NO fills, NO solid black areas, simple elegant strokes, high quality coloring book style, cute chibi style, all characters must have proper human anatomy"
    - "completeThePhrase": Objeto com "phrase" e "missingWord".
       - A frase deve ser um VERSÍCULO CHAVE ou LIÇÃO MORAL da história.
       - A frase NÃO pode ser simples demais.
       - Indique a palavra que falta com '_______'.
       - exemplo: { "phrase": "Pela _______, Noé construiu a arca para salvar sua família.", "missingWord": "fé" }
    - "scrambleWords": Array com 3 objetos.
       - "word": A palavra correta (ex: "ARCA").
       - "hint": Uma dica curta (ex: "Barco grande").
    - "matchColumns": Array com 4 objetos para atividade de ligar colunas.
       - "left": Personagem ou início da frase (ex: "Daniel").
       - "right": Ação ou final da frase (ex: "orou a Deus").
    - "trueOrFalse": Array com 4 objetos para atividade verdadeiro/falso.
       - "statement": Afirmação sobre a história (ex: "Daniel foi jogado na cova dos leões.").
       - "isTrue": true ou false.

    Retorne APENAS o JSON válido, sem markdown.
    exemplo:
    {
      "title": "Daniel na Cova dos Leões",
      "bibleVerse": "O meu Deus enviou o seu anjo, e fechou a boca dos leões. (Daniel 6:22)",
      "quiz": [{ "question": "Qual atitude de Daniel fez o rei Dario assinar o decreto?", "options": ["Sua fidelidade a Deus", "Sua desobediência", "Sua riqueza"], "correctAnswer": 0 }],
      "wordSearch": ["DANIEL", "LEOES", "ANJO", "REI", "ORACAO", "DEUS", "FE", "COVA"],
      "coloringPrompt": "A man named Daniel kneeling and praying peacefully, surrounded by friendly cute lions sleeping around him, an angel protecting them, clean line art, pure black outlines on white background, NO shading, NO fills, NO solid black areas, simple elegant strokes, coloring book style for children, cute kawaii style",
      "completeThePhrase": { "phrase": "O meu Deus enviou o seu _______.", "missingWord": "anjo" },
      "scrambleWords": [
        { "word": "LEOES", "hint": "Animais selvagens" },
        { "word": "ANJO", "hint": "Mensageiro de Deus" },
        { "word": "REI", "hint": "Governante" }
      ],
      "matchColumns": [
        { "left": "Daniel", "right": "orou a Deus" },
        { "left": "Rei Dario", "right": "ficou triste" },
        { "left": "Os leões", "right": "não atacaram" },
        { "left": "O anjo", "right": "fechou as bocas" }
      ],
      "trueOrFalse": [
        { "statement": "Daniel foi jogado na cova dos leões.", "isTrue": true },
        { "statement": "Daniel parou de orar por medo.", "isTrue": false },
        { "statement": "O rei Dario queria salvar Daniel.", "isTrue": true },
        { "statement": "Os leões devoraram Daniel.", "isTrue": false }
      ]
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
            },
            scrambleWords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  hint: { type: Type.STRING }
                },
                required: ["word", "hint"]
              }
            },
            matchColumns: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  left: { type: Type.STRING },
                  right: { type: Type.STRING }
                },
                required: ["left", "right"]
              }
            },
            trueOrFalse: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  statement: { type: Type.STRING },
                  isTrue: { type: Type.BOOLEAN }
                },
                required: ["statement", "isTrue"]
              }
            }
          },
          required: ["title", "bibleVerse", "quiz", "wordSearch", "coloringPrompt", "completeThePhrase", "scrambleWords", "matchColumns", "trueOrFalse"]
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
