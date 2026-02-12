import { GoogleGenAI, Type } from "@google/genai";
import { AgeGroup, IllustrationStyle, BibleStory, LanguageCode, ActivityContent } from "../types";

const langMap: Record<LanguageCode, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano'
};

const SUPABASE_URL = "https://tywhhliyawmuivreuvgj.supabase.co";

/**
 * GERA A ESTRUTURA DA HISTÓRIA (TEXTO E PROMPTS)
 */
export async function generateStoryStructure(
  apiKey: string | null,
  storyName: string,
  age: AgeGroup,
  lang: LanguageCode,
  supabaseToken?: string
): Promise<BibleStory> {
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
       - As cenas devem ilustrar os CONCEITOS ou SÍMBOLOS bíblicos.
       - O texto deve ser EXPLICATIVO e DIDÁTICO, focado no ensino bíblico direto.
       
       CASO C: CULTURA NACIONAL (Ex: Carnaval, Festas Juninas, Halloween)
       - Abordagem: "No mundo, mas não do mundo".
       - VISÃO: As festas mundanas (Carnaval, etc) oferecem uma alegria passageira e enganosa.
       - A LIÇÃO deve ensinar que a VERDADEIRA alegria vem somente de Deus e da sua Palavra.
       - NÃO mostre o personagem principal, nem seus amigos ou familiares "curtindo" a festa. ELES NÃO PARTICIPAM.
       - CENA VISUAL: O personagem deve estar:
         1. Em um retiro/acampamento da igreja (longe da festa - MOSTRAR NATUREZA, BARRACAS).
         2. Ou em casa/apartamento moderno observando da JANELA DE VIDRO (tristeza pela ilusão do mundo).
         3. Ao fundo (longe): Cenário URBANO MODERNO com asfalto, prédios, carros, luzes de cidade e desfile de carnaval indistinto.
       - NUNCA descreva o personagem dançando, usando máscaras, fantasias de carnaval ou adereços de festa.
       - Use termos como "barulho", "ilusão", "alegria que acaba logo" para se referir à festa.
       - CONTRASTE: Mostre a paz e a luz duradoura de quem está com Jesus.
       - **VESTIMENTAS (CRÍTICO)**: Use roupas MODERNAS e ATUAIS para TODOS os personagens (jeans, camisetas, tênis), mas discretas e cristãs (sem fantasias).
       - **AMBIENTAÇÃO (CRÍTICO)**: O cenário DEVE SER MODERNO (Cidades atuais, ruas asfaltadas, casas modernas, carros). NADA DE EDIFICAÇÕES ANTIGAS OU BÍBLICAS.
       
       **CRÍTICO PARA FAIXA ETÁRIA 10-12 ANOS (PROFUNDIDADE):**
       - Se a idade for "10–12 anos", a narrativa DEVE ser mais profunda e educativa.
       - **EXPLIQUE A ORIGEM HISTÓRICA:** Cite a origem pagã da festa (ex: saturnálias, festas da carne, origem do Halloween) de forma educativa.
       - Explique TEOLOGICAMENTE por que não participamos (Idolatria, foco na carne vs espírito).
       - Não use apenas "é perigoso", explique a **RAIZ ESPIRITUAL** e **HISTÓRICA** do problema.
       - A linguagem deve ser séria e madura, tratando a criança como alguém capaz de entender história e teologia básica.
       
       CASO D: HERÓIS DA FÉ E BIOGRAFIAS (Ex: João Ferreira de Almeida, John Wesley, Lutero)
       - Foco: O agir de Deus através da vida de uma pessoa.
       - Narre os marcos principais: o chamado, os desafios, a perseverança e o impacto para o Reino.
       - Destaque a FONTE da força deles: A Palavra de Deus e o Espírito Santo.
       - Mantenha a precisão histórica (século, país, vestimentas).

       CRÍTICO (PARA TODOS):
       - PROIBIDO inventar "crianças modernas" (Ex: Nada de "Aninha aprendendo com a vovó", nada de "Joãozinho na escola").
       - A narrativa deve ser direta sobre o tema ou o personagem histórico/bíblico.
       - Fidelidade ESCRITURAL e HISTÓRICA é a prioridade máxima.

    4. DESCRIÇÃO DO PERSONAGEM (CONSISTÊNCIA VISUAL - CRÍTICO): 
       - O CAMPO "characterDescription" DEVE SER DETALHADO E FIXO.
       - VOCÊ DEVE DEFINIR A IDADE APRENTE DO PERSONAGEM (Ex: "30 anos", "60 anos", "criança de 8 anos").
       - A IDADE DEVE SER MANTIDA EM TODAS AS CENAS. PROIBIDO MUDAR A IDADE.
       - Se for Narrativa: Defina o protagonista com DETALHES VISUAIS ESPECÍFICOS.
       - Exemplo: "Gideon, homem de 30 anos (MATENHA ESSA IDADE), barba curta castanha, cabelo castanho encaracolado, túnica bege simples, cinto de couro marrom, sandálias gastas, corpo forte de guerreiro".
       - Se for Doutrina: Defina um personagem representativo fixo com os mesmos detalhes.
    
    5. PRECISÃO HISTÓRICA E CULTURAL: 
       - Se for Narrativa Bíblica: Vestimentas antigas do Oriente Médio para todos.
       - Se for Biografia: Use vestimentas e arquitetura fiéis à época do personagem.
       - Se for Cultura: Use vestimentas, cenários e ambientes MODERNOS e ATUAIS para TODOS os personagens na cena. Nada de roupas bíblicas em contextos culturais atuais.
       - Represente a "Luz de Jesus" com cores quentes e vibrantes (amarelo, dourado) e o mundo com cores mais suaves ou contrastantes, sem ser assustador.
    
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
        - STRICT RULE: NEVER include halos, aureolas, divine glows, radiant rings, or light rays behind characters.
        - Characters must be human figures without any mystical effects.
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

  // Retry logic loop
  const maxRetries = 3;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const payload = {
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
      };

      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent(payload);
        return JSON.parse(response.text || "{}");
      } else if (supabaseToken) {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseToken}`
          },
          body: JSON.stringify({ type: "story", payload })
        });

        if (!response.ok) {
          const err = await response.json();
          // Check for 429 specifically in response status if accessible, or body
          if (response.status === 429 || (err.error && err.error.includes('429'))) {
            throw new Error("429 Resource exhausted");
          }
          throw new Error(err.error || "Erro no servidor de cortesia");
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const cleanText = text.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(cleanText);
      } else {
        throw new Error("API Key ou Token de Cortesia não fornecido.");
      }
    } catch (error: any) {
      // Last attempt, throw error
      if (attempt === maxRetries) {
        console.error("Erro ao gerar estrutura da história (Max retries):", error);
        throw new Error(`Falha ao gerar história: ${error.message}`);
      }

      const isRateLimit = error?.message?.includes('429') ||
        error?.message?.includes('quota') ||
        error?.message?.includes('Resource exhausted');

      if (isRateLimit) {
        const delay = (attempt + 1) * 2000;
        console.log(`[Story] Rate limit check failed. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue; // Retry
      }

      // If not rate limit, throw immediately
      throw error;
    }
  }
  throw new Error("Falha desconhecida na geração da história.");
}

/**
 * GERA A IMAGEM DE CADA CENA
 */
export async function generateSceneImage(
  apiKey: string | null,
  scenePrompt: string,
  characterDesc: string,
  style: IllustrationStyle,
  retryCount = 0,
  isVariation = false,
  supabaseToken?: string
): Promise<string> {
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
    stylePrompt = `Disney animation style, modern 3D animated character line art, Pixar-inspired design.
- Expressive eyes, professional clean line art, high quality coloring book aesthetic.
- ABSOLUTELY NO COLORS. ONLY BLACK LINES ON WHITE BACKGROUND.
- DO NOT use grayscale, DO NOT use shading, DO NOT use gradients.
- PURE BLACK OUTLINES ONLY.
- Thick, clean, continuous lines suitable for crayons.
- Characters and objects must be EMPTY (WHITE) to be colored in.
- NO fill, NO texture, NO cross-hatching.
- NO TEXT, NO LETTERS, NO SPEECH BUBBLES inside the illustration.
- NO HALOS, NO AUREOLAS, NO GLOWING RINGS around heads, NO SUNBURSTS, NO LIGHT BEAMS, NO DIVINE GLOW.
- This is a PRINTABLE COLORING BOOK PAGE (Disney Style).`;
  } else if (style === IllustrationStyle.STYLE_CUTE) {
    stylePrompt = `CUTE KAWAII / CHIBI STICKER STYLE(HISTÓRIAS NA LUVA):
    - ADORABLE, CUTE, ROUND CHARACTERS(Chibi / Kawaii aesthetic)
      - ** UNIFORM EYE STYLE FOR EVERYONE **: ALL characters(main, secondary, crowd) MUST have the EXACT SAME eyes:
- ** EYE STYLE **: Large, round, BLACK OVAL eyes with a small white highlight.
- ** CRITICAL OVERRIDE **: IGNORE any eye color description in the character text.ALL EYES MUST BE BLACK.
- DO NOT use realistic eyes.DO NOT use colored irises.
- ** COLORS MUST BE VIBRANT AND HIGHLY SATURATED **: Use bright primary colors(Red, Blue, Yellow, Green).AVOID pastel or washed - out tones.
- THICK WHITE OUTLINES around all characters and main objects(Sticker effect)
      - Flat lighting with soft cell shading(Vector art style)
        - Simplified anatomy(Big heads, small bodies, cute proportions)
          - Pure white background

CRITICAL FOR CONSISTENCY(MUITO IMPORTANTE):
- ** ABSOLUTELY NO TEXT, NO LETTERS, NO SPEECH BUBBLES **.
- 1. IF CHARACTER HAS A BEARD, THE CHIBI MUST HAVE A BEARD.
- 2. HAIR COLOR AND STYLE MUST MATCH THE DESCRIPTION EXACTLY.
- 3. CLOTHING COLORS MUST MATCH THE DESCRIPTION EXACTLY.
- 4. Do not make adults look like babies.Make them "Adult Chibis".
- KEEP THE SAME "CUTE DESIGN" IN EVERY SINGLE IMAGE.`;
  } else {
    // Default or STYLE_3D
    stylePrompt = `PREMIUM 3D PIXAR STYLE ILLUSTRATION:
    - High quality 3D rendered characters like Pixar / Disney movies
      - Rich volumetric lighting with soft shadows and depth
        - Detailed textures on clothing and environments
          - Semi - realistic proportions with appealing character designs
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

MAIN CHARACTER(MUST LOOK IDENTICAL IN EVERY IMAGE):
${characterDesc}
    - The character MUST have the EXACT same face, hair, clothes, and body type in EVERY scene
      - DO NOT change the character's appearance

BIBLICAL ACCURACY RULES:
    - NEVER show God as a human figure or old man with beard
    - Represent God's presence as: golden light rays from above, glowing clouds, or voice (no visible figure)
      - Show biblical events ACCURATELY as described in scripture
      - TIME PERIOD CONTEXT (STRICT RULES):
        - DEFAULT (BIBLICAL STORIES): Characters MUST wear authentic ancient Middle Eastern clothing (robes, tunics, sandals). Settings must be ANCIENT (stone/clay houses, desert, villages, no technology).
        - EXCEPTION (ONLY FOR MODERN CULTURAL THEMES): IF the scene mentions "Carnival", "School", "Church Camp" OR character has "Jeans/Sneakers" -> Use MODERN CITY backgrounds (paved streets, cars, buildings) and MODERN clothing.
${variationInstruction}

STRICT RULES:
    - CRITICAL: NO TEXT, NO LETTERS, NO NUMBERS, NO SPEECH BUBBLES anywhere in the image.
- CRITICAL: ABSOLUTELY NO HALOS, NO AUREOLAS, NO GLOWING RINGS around heads, NO SUNBURSTS, NO LIGHT RAYS, NO DIVINE GLOWS, NO HOLY RADIANCE. (Even for Jesus).
- CRITICAL: IF THE SCENE IS ABOUT CARNIVAL/PARTY: The main character must NEVER be dancing, wearing carnival costumes/masks, or mixing with the crowd. They must be observing from a distance (looking reflective/sad for them), or in a separate peaceful environment (nature, church, home), or praying. The party can be in the background but the character is SEPARATE and NOT PARTICIPATING.
- NO wings on humans, NO mystical effects.
      - Friendly, child - appropriate content only
        - Pure white background, no complex scenery
          - MAINTAIN THE EXACT SAME ART STYLE IN ALL IMAGES
${style === IllustrationStyle.COLORING_PAGE ? "- REMEMBER: BLACK LINES ONLY. NO COLOR AT ALL." : ""} `;

  const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  if (isDev) console.log(`[Imagem] Gerando cena(tentativa ${retryCount + 1}): `, scenePrompt.substring(0, 100) + '...');

  try {
    const payload = {
      model: "gemini-2.5-flash-image",
      contents: { parts: [{ text: finalPrompt }] },
      config: {
        responseModalities: ["image", "text"],
        imageConfig: { aspectRatio: "3:4" }
      }
    };

    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent(payload as any);

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
    } else if (supabaseToken) {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseToken}`
        },
        body: JSON.stringify({ type: "image", payload })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erro no servidor de imagens");
      }

      const result = await response.json();
      const parts = result.candidates?.[0]?.content?.parts || [];

      for (const part of parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    } else {
      throw new Error("API Key ou Token de Cortesia não fornecido.");
    }

    // Se não encontrou imagem no loop de partes (para o caso de apiKey)
    // Retry até 2 vezes se não conseguiu gerar
    if (retryCount < 2) {
      if (isDev) console.log(`[Imagem] Retentando geração(${retryCount + 1}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Aguarda 1s antes de retentar
      return generateSceneImage(apiKey, scenePrompt, characterDesc, style, retryCount + 1, isVariation, supabaseToken);
    }
  } catch (error: any) {
    if (isDev) console.error('[Imagem] Erro na geração:', error?.message || error);

    // Se for erro de rate limit ou quota, aguarda mais tempo
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      if (isDev) console.log('[Imagem] Rate limit detectado, aguardando 3s...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    if (retryCount < 2) {
      if (isDev) console.log(`[Imagem] Retentando após erro(${retryCount + 1}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return generateSceneImage(apiKey, scenePrompt, characterDesc, style, retryCount + 1, isVariation, supabaseToken);
    }
    throw error;
  }

  throw new Error("Failed to generate image after retries");
}

/**
 * GERA CONTEÚDO PARA ATIVIDADE EDUCATIVA (BNCC)
 */
export async function generateActivityContent(
  apiKey: string | null,
  storyName: string,
  age: AgeGroup,
  lang: LanguageCode,
  supabaseToken?: string
): Promise<ActivityContent> {
  const languageName = langMap[lang];

  const prompt = `
    Como pedagogo especialista em BNCC e educação cristã, crie o conteúdo para uma folha de atividades A4 sobre a história: "${storyName}".
    Público Alvo: Crianças de ${age}.
    Idioma: ${languageName}.
    
    Gere um JSON VÁLIDO e COMPLETO com todos os campos abaixo(NENHUM CAMPO PODE SER NULL):
    1. title: Título da atividade(ex: "Aprendendo com [Nome da História]").
    - "bibleVerse": Um versículo CHAVE e ESPECÍFICO desta história(com referência).NÃO use Salmos genéricos.
    - "quiz": Array com EXATAMENTE 1(QUATRO) pergunta de múltipla escolha.
       - A pergunta deve ser DESAFIADORA e TEMÁTICA, testando a compreensão da história.
       - PROIBIDO perguntas genéricas como "Onde está na bíblia?" ou "O que aprendemos?".
       - Deve ser uma pergunta sobre um EVENTO ou AÇÃO específica do personagem.
       - Deve ter 4(QUATRO) opções de resposta.
    - "wordSearch": Array com EXATAMENTE 8 palavras - chave DA HISTÓRIA(todas em UPPERCASE, sem acentos, sem espaços, MÁXIMO 8 LETRAS CADA - palavras curtas!).
    - "coloringPrompt": Prompt DETALHADO em INGLÊS para gerar um desenho de colorir sobre a cena principal.
       - IMPORTANTE: O prompt DEVE especificar claramente cada personagem(ex: "a man named Adam" ou "a woman named Eve").
       - CRÍTICO: Todos os personagens devem ter ANATOMIA HUMANA CORRETA - rostos humanos normais, proporções corretas, sem híbridos, sem distorções.
       - Se houver crianças, especifique "cute human children with normal human faces and bodies".
       - Se houver multidão, especifique "group of people with distinct human features".
        - OBRIGATÓRIO incluir no final: "Disney animation style, modern 3D animated character line art, expressive eyes, Pixar-like character design, professional clean line art, high quality coloring book illustration, pure black outlines on white background, NO shading, NO fills, NO solid black areas, clean elegant strokes, perfect human anatomy, NO HALOS, NO AUREOLAS, NO LIGHT RAYS, NO SUNBURSTS"
    - "completeThePhrase": Objeto com "phrase" e "missingWord".
       - A frase deve ser um VERSÍCULO CHAVE ou LIÇÃO MORAL da história.
       - A frase NÃO pode ser simples demais.
       - Indique a palavra que falta com '_______'.
       - exemplo: { "phrase": "Pela _______, Noé construiu a arca para salvar sua família.", "missingWord": "fé" }
    - "scrambleWords": Array com 3 objetos.
       - "word": A palavra correta(ex: "ARCA").
       - "hint": Uma dica curta(ex: "Barco grande").
    - "matchColumns": Array com 4 objetos para atividade de ligar colunas.
       - "left": Personagem ou início da frase(ex: "Daniel").
       - "right": Ação ou final da frase(ex: "orou a Deus").
    - "trueOrFalse": Array com 4 objetos para atividade verdadeiro / falso.
       - "statement": Afirmação sobre a história(ex: "Daniel foi jogado na cova dos leões.").
       - "isTrue": true ou false.
    - "whoSaidIt": Array com 3 ou 4 objetos.
       - "character": Nome do personagem(ex: "Jesus").
       - "quote": Uma fala marcante ou resumo do que ele disse(ex: "Lázaro, vem para fora!").
       - REGRA CRÍTICA: Os personagens DEVEM SER DIFERENTES.
       - NUNCA retorne "Jesus" para as 3 opções.Tente variar(Ex: Jesus, Pedro, Maria, Narrador).
       - Se a história for um monólogo, use o "Narrador" ou pessoas que fizeram perguntas.
       - Mínimo de 2 personagens distintos obrigatórios.
    - "orderEvents": Array com 4 ou 5 objetos.
       - "event": Um acontecimento da história.
       - "order": A ordem cronológica correta(1 a 5).
       - IMPORTANTE: Retorne os eventos JÁ NA ORDEM CORRETA no JSON.Nós vamos embaralhar no front - end.
    - "secretPhrase": Uma frase curta para ser decifrada.
       - A frase deve ser em CAIXA ALTA.
    - "familyQuestions": Array com 3 perguntas para discussão em família.
    - "characterCard": Objeto com dados para o card do herói.
       - "name": Nome do personagem principal.
       - "title": Um título impacto / heroico(ex: "O Matador de Gigantes", "O Reformador da Fé").
       - "description": Breve descrição das qualidades dele(máx 2 linhas).
       - "attributes": Objeto com níveis de 1 a 10:
          - "faith": Nível de Fé.
          - "courage": Nível de Coragem.
          - "wisdom": Nível de Sabedoria.
         - **REGRA IMPORTANTE PARA OS ATRIBUTOS DO CARTÃO DO HERÓI**:
           - **SOMENTE JESUS** deve ter TODOS os atributos em 10 (faith=10, courage=10, wisdom=10). Ele é perfeito. Na "description" dele, mencione "Força Total - Somente Nele!".
           - **TODOS OS OUTROS personagens** (Noé, Moisés, Davi, Daniel, etc.) devem ter atributos VARIADOS e REALISTAS baseados na história bíblica deles. Nenhum humano é perfeito. Exemplos:
              - Noé: faith=10, courage=7, wisdom=8 (fiel mas enfrentou medo e isolamento).
              - Davi: faith=9, courage=10, wisdom=6 (corajoso, mas cometeu erros graves de sabedoria).
              - Moisés: faith=8, courage=7, wisdom=9 (sábio mas hesitante no início, gaguejava).
              - Jonas: faith=5, courage=3, wisdom=6 (fugiu de Deus, mas aprendeu a lição).
              - Daniel: faith=10, courage=9, wisdom=10 (fiel e sábio, mas também humano).
              - Pedro: faith=7, courage=6, wisdom=5 (negou Jesus 3 vezes, mas foi restaurado).
           - Os valores devem refletir HONESTAMENTE a trajetória bíblica do personagem.
           - Na "description" de personagens humanos, destaque suas qualidades E suas limitações, mostrando que a verdadeira força vem de Deus apesar das fraquezas humanas.
    - "newsFlash": Objeto para a atividade de jornal.
       - "title": Nome de um jornal da época ou temático(ex: "Diário de Jericó", "O Pregador Mirim").
       - "headline": Uma manchete impactante e apropriada para a história(ex: "MURALHAS CAEM!", "ALEGRIA NO ACAMPAMENTO COM JESUS").
       - REGRA CRÍTICA PARA TEMAS CULTURAIS: NÃO use o verbo "celebrar" ou "festejar" em relação ao Carnaval. Use "Jovens brilham a luz de Jesus no feriado" ou "Acampamento traz alegria e comunhão".
       - "instructions": Instrução para a criança desenhar e escrever.

    - "maze": Objeto para a atividade de labirinto.
        - "startPrompt": Prompt curto em INGLÊS para a imagem de ENTRADA do labirinto (ponto A). Deve ser um personagem ou objeto central da história (ex: "Noah"). MANTENHA o estilo Disney line art.
        - "endPrompt": Prompt curto em INGLÊS para a imagem de CHEGADA do labirinto (ponto B). Deve ser o destino ou objetivo (ex: "The Ark"). MANTENHA o estilo Disney line art.
        - "instructions": Uma frase curta de incentivo em ${languageName} (ex: "Ajude Noé a chegar na Arca!").

    Retorne APENAS o JSON válido, sem markdown.
  `;

  try {
    const payload = {
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
            },
            whoSaidIt: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  character: { type: Type.STRING },
                  quote: { type: Type.STRING }
                },
                required: ["character", "quote"]
              }
            },
            orderEvents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  event: { type: Type.STRING },
                  order: { type: Type.NUMBER }
                },
                required: ["event", "order"]
              }
            },
            secretPhrase: { type: Type.STRING },
            familyQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            characterCard: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                attributes: {
                  type: Type.OBJECT,
                  properties: {
                    faith: { type: Type.NUMBER },
                    courage: { type: Type.NUMBER },
                    wisdom: { type: Type.NUMBER }
                  },
                  required: ["faith", "courage", "wisdom"]
                }
              },
              required: ["name", "title", "description", "attributes"]
            },
            newsFlash: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                headline: { type: Type.STRING },
                instructions: { type: Type.STRING }
              },
              required: ["title", "headline", "instructions"]
            },
            maze: {
              type: Type.OBJECT,
              properties: {
                startPrompt: { type: Type.STRING },
                endPrompt: { type: Type.STRING },
                instructions: { type: Type.STRING }
              },
              required: ["startPrompt", "endPrompt", "instructions"]
            }
          },
          required: ["title", "bibleVerse", "quiz", "wordSearch", "coloringPrompt", "completeThePhrase", "scrambleWords", "matchColumns", "trueOrFalse", "whoSaidIt", "orderEvents", "secretPhrase", "familyQuestions", "characterCard", "newsFlash", "maze"]
        }
      }
    };

    let text = "{}";

    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent(payload);
      text = response.text || "{}";
    } else if (supabaseToken) {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseToken}`
        },
        body: JSON.stringify({ type: "activity", payload })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erro no servidor de atividades");
      }

      const result = await response.json();
      text = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    } else {
      throw new Error("API Key ou Token de Cortesia não fornecido.");
    }

    const cleanText = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error: any) {
    console.error("Erro ao gerar atividade:", error);
    throw new Error(`Falha ao gerar atividade: ${error.message}`);
  }
}
