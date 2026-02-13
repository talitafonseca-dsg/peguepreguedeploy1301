import { getFixedCharacterDescription } from "./characterRegistry";
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
  const fixedCharacterDesc = getFixedCharacterDescription(storyName);

  let characterEnforcement = "";
  if (fixedCharacterDesc) {
    characterEnforcement = `
    IMPORTANT: This story involves a known biblical figure.
    You MUST define the 'characterDescription' field based on this FIXED VISUAL PROFILE (translate to ${languageName}):
    "${fixedCharacterDesc}"
    
    CRITICAL: 
    - You must NOT change the age, hair color, or clothing color from this profile.
    - Use this description as the source of truth.
    `;
  }


  const prompt = `
    Como um especialista em educação cristã infantil e teólogo experiente, adapte a história bíblica: "${storyName}" para crianças de ${age}.
    Toda a resposta (título, descrições e narração) deve ser estritamente em ${languageName}.
    
    **ADAPTAÇÃO POR FAIXA ETÁRIA (CRÍTICO):**
    - SE ${age} = "3–4 anos":
      - Frases MUITO CURTAS (máximo 2 frases simples por cena).
      - Vocabulário SIMPLES (palavras do dia a dia da criança).
      - Tom ACOLHEDOR e LÚDICO, como uma contadora de histórias.
      - FOCO em emoções e ações concretas ("Jesus ajudou", "Deus cuidou").
      - EVITE conceitos abstratos (justiça, redenção, expiação). Simplifique: "Deus ama você!".
      - USE 8-10 CENAS no máximo.
    - SE ${age} = "5–6 anos":
      - Frases curtas e claras (3-4 frases por cena).
      - Vocabulário adequado, sem termos teológicos complexos.
      - Pode incluir lições morais simples.
    - SE ${age} = "7–9 anos":
      - Frases mais elaboradas (4-5 frases por cena).
      - Pode usar termos bíblicos com explicação simples.
      - Inclua referências bíblicas (livro e capítulo).
    - SE ${age} = "10–12 anos":
      - Frases completas e maduras (5-6 frases por cena).
      - Linguagem mais profunda, conceitos teológicos explicados.
      - Inclua versículos com referência completa.
      - Pode abordar contexto histórico e geográfico.
    
    REGRAS IMPORTANTES:
    
    1. ESTRUTURA: Analise a complexidade da história "${storyName}" e divida em cenas narrativas claras e cronológicas.
       - Histórias longas/complexas (Criação, Êxodo, Vida de José): USE 12 CENAS para cobrir toda a narrativa.
       - Histórias médias (Davi e Golias, Daniel, Jonas): USE 10-11 CENAS.
       - Histórias curtas (Parábolas simples): USE 10 CENAS mínimo para aprofundar os detalhes.
       - TEMA BÍBLICO (quando iniciado com [TEMA BÍBLICO]): USE 12 A 16 CENAS para explorar o tema com profundidade e riqueza bíblica.
       - IMPORTANTE: A história/tema deve ficar COMPLETO(A), sem cortar partes importantes.
    
    2. FIDELIDADE BÍBLICA: O narrativeText de cada cena DEVE:
       - Ser FIEL às escrituras sagradas.
       - **CRÍTICO: NUNCA INVENTE NOMES** para personagens que não têm nome na Bíblia.
         - Ex: O menino dos 5 pães e 2 peixinhos NÃO TEM NOME. Chame-o apenas de "o menino" ou "o jovem".
         - Ex: A esposa de Noé NÃO TEM NOME. Chame-a de "esposa de Noé".
         - Ex: Os magos do oriente NÃO TÊM NOMES na Bíblia. Chame-os de "magos".
         - INVENTAR NOMES É ESTRITAMENTE PROIBIDO.
       - Ter entre 4 a 6 frases por cena.
       - Manter linguagem apropriada para crianças.
    
    3. TIPO DE ADAPTAÇÃO (CRÍTICO):
       Analise o título "${storyName}".
       
       CASO A: HISTÓRIA NARRATIVA (Ex: Arca de Noé, Davi e Golias, Nascimento de Jesus)
       - Mantenha o foco na sequência de eventos e personagens principais da Bíblia.
       
       CASO B: TEMA DOUTRINÁRIO/ENSINO (Ex: Armadura de Deus, Fruto do Espírito, Bem-Aventuranças, Parábolas)
       - As cenas devem ilustrar os CONCEITOS ou SÍMBOLOS bíblicos.
       - **USE ANALOGIAS CRIATIVAS**: Compare conceitos abstratos com objetos visuais do dia a dia da criança.
         - Ex: "Fruto do Espírito" pode ser comparado a uma uva ou tangerina (um fruto, vários gomos/sabores).
         - Ex: "Trindade" pode ser comparada à água (gelo, líquido, vapor) ou maçã (casca, polpa, semente).
       - O texto deve ser EXPLICATIVO, CRIATIVO e DIDÁTICO, fugindo do óbvio.
       
       CASO C: CULTURA NACIONAL (Ex: Carnaval, Festas Juninas, Halloween)
       - Abordagem: "No mundo, mas não do mundo".
       - VISÃO: As festas mundanas (Carnaval, etc) oferecem uma alegria passageira e enganosa.
       - A LIÇÃO deve ensinar que a VERDADEIRA alegria vem somente de Deus e da sua Palavra.
       - NÃO mostre o personagem principal, nem seus amigos ou familiares "curtindo" a festa. ELES NÃO PARTICIPAM.
       - NUNCA descreva o personagem dançando, usando máscaras, fantasias de carnaval ou adereços de festa.
       - Use termos como "barulho", "ilusão", "alegria que acaba logo" para se referir à festa.
       - CONTRASTE: Mostre a paz e a luz duradoura de quem está com Jesus.
       - **VESTIMENTAS (CRÍTICO)**: Use roupas MODERNAS e ATUAIS para TODOS os personagens (jeans, camisetas, tênis), mas discretas e cristãs (sem fantasias).
       - **AMBIENTAÇÃO (CRÍTICO)**: O cenário DEVE SER MODERNO (Cidades atuais, ruas asfaltadas, casas modernas, carros). NADA DE EDIFICAÇÕES ANTIGAS OU BÍBLICAS.
       
       **ADAPTAÇÃO POR FAIXA ETÁRIA PARA CULTURA NACIONAL (CRÍTICO):**
       
       **SE ${age} = "3–4 anos":**
       - USE APENAS 6-8 CENAS (menos visuais, conteúdo mais direto).
       - FORMATO SUGERIDO: "5 motivos por que o cristão não participa do Carnaval" ou estrutura similar de lista simples.
       - Cada cena = 1 motivo explicado com linguagem MUITO SIMPLES (2 frases curtas máximo).
       - Exemplo: "Motivo 1: Porque a festa não agrada a Deus. Jesus quer que a gente brinque de um jeito que Ele goste!"
       - ILUSTRAÇÕES COLORIDAS e ALEGRES: Mostre crianças FELIZES em atividades cristãs (brincando na igreja, cantando louvor, fazendo artes bíblicas).
       - NÃO mostre cenas tristes, escuras ou assustadoras.
       - FOCO na ALEGRIA de estar com Jesus, não no medo da festa.
       - Tom positivo e acolhedor o tempo todo.
       
       **SE ${age} = "5–6 anos":**
       - USE 8-10 CENAS.
       - Explique de forma simples por que não participamos, com exemplos do dia a dia.
       - Mostre ALTERNATIVAS divertidas: acampamento da igreja, culto kids, brincadeiras com amigos cristãos.
       - Ilustrações coloridas e alegres, crianças em atividades saudáveis.
       - Tom positivo: "A gente não precisa da festa, porque com Jesus é MUITO melhor!"
       
       **SE ${age} = "7–9 anos":**
       - USE 10-12 CENAS.
       - Explique a ORIGEM HISTÓRICA da festa de forma educativa e acessível.
       - O que é paganismo? Explicação simples: "Antigamente, pessoas adoravam coisas que não eram Deus."
       - Por que cristãos não comemoram? Base bíblica com versículos simples.
       - Mostre o contraste: a alegria do mundo (passageira) vs a alegria de Deus (eterna).
       - CENA VISUAL: Criança em retiro/acampamento da igreja ou em casa com família, paz e luz.
       
       **SE ${age} = "10–12 anos":**
       - USE 12 CENAS com profundidade.
       - **EXPLIQUE A ORIGEM HISTÓRICA DETALHADA:** Cite a origem pagã da festa (saturnálias, festas da carne, origem celta do Halloween) de forma educativa.
       - **O QUE É PAGANISMO:** Explique teologicamente — adoração a falsos deuses, idolatria, foco na carne vs espírito.
       - **POR QUE NÃO COMEMORAMOS:** Base bíblica sólida (1 João 2:15-17, Romanos 12:2, 2 Coríntios 6:14-17).
       - Explique a **RAIZ ESPIRITUAL** e **HISTÓRICA** do problema, não apenas "é perigoso".
       - A linguagem deve ser séria e madura, tratando a criança como alguém capaz de entender história e teologia.
       - CENA VISUAL: Pode incluir representações históricas (antigas civilizações pagãs) para contexto educativo.
       
       CASO D: HERÓIS DA FÉ E BIOGRAFIAS (Ex: João Ferreira de Almeida, John Wesley, Lutero)
       - Foco: O agir de Deus através da vida de uma pessoa.
       - Narre os marcos principais: o chamado, os desafios, a perseverança e o impacto para o Reino.
       - Destaque a FONTE da força deles: A Palavra de Deus e o Espírito Santo.
       - Mantenha a precisão histórica (século, país, vestimentas).
       
       CASO E: TEMA BÍBLICO (Quando o título começa com [TEMA BÍBLICO])
       - SE o título contiver "[TEMA BÍBLICO]", este é um TEMA DOUTRINÁRIO livre escolhido pela professora.
       - O texto após "[TEMA BÍBLICO]" contém o TEMA (ex: "Santidade", "Graça", "Perdão") e opcionalmente o OBJETIVO DA AULA (após "| OBJETIVO:").
       
       **PRIORIDADE DO NOVO TESTAMENTO (CRÍTICO):**
       - A MAIORIA das cenas (70-80%) DEVE ser baseada no NOVO TESTAMENTO.
       - PRIORIZE os ensinamentos de JESUS (Evangelhos) e as cartas de PAULO (Romanos, Gálatas, Efésios, etc.).
       - Use VERSÍCULOS do Novo Testamento como base principal: palavras de Jesus, parábolas, epístolas.
       - O Antigo Testamento pode ser usado como COMPLEMENTO (máximo 2-3 cenas), para mostrar o CONTEXTO ou a SOMBRA que se cumpriu em Cristo.
       - Exemplo para "Graça": Foque em Efésios 2:8-9, João 3:16, Romanos 5:8, Tito 2:11 — NÃO em Adão e Eva ou Abraão como tema central.
       - Exemplo para "Santidade": Foque em 1 Pedro 1:15-16, Hebreus 12:14, 1 Tessalonicenses 4:7 — NÃO reduza a histórias do AT.
       
       **ESTRUTURA DAS CENAS:**
       - Cenas 1-2: Introdução ao tema — O que a Bíblia diz? (definição bíblica clara e simples).
       - Cenas 3-10: Ensinamentos de JESUS e dos APÓSTOLOS sobre o tema, com versículos específicos, parábolas, e exemplos do Novo Testamento.
       - Cenas 11-13: Pode incluir 1-2 exemplos do Antigo Testamento como COMPLEMENTO (sombra/tipo que aponta para Cristo).
       - Cenas 14-16: Aplicação prática — Como viver isso hoje? O que o Espírito Santo nos ensina?
       
       - FOCO: Explicar o TEMA à LUZ DO NOVO TESTAMENTO, de forma DIDÁTICA e adaptada para a faixa etária da criança.
       - **CRIATIVIDADE DIDÁTICA**: Use comparações e objetos visuais para facilitar o entendimento (Ex: Sal da terra = tempero que dá sabor).
       - Cada cena deve trazer um ASPECTO diferente do tema, com VERSÍCULOS BÍBLICOS ESPECÍFICOS (livro, capítulo e versículo) no narrativeText.
       - As cenas devem ser EDUCATIVAS e RICAS em conteúdo bíblico, não apenas ilustrativas.
       - Se houver OBJETIVO DA AULA fornecido, a narrativa DEVE estar alinhada com esse objetivo pedagógico.
       - USE 12 A 16 CENAS para cobrir o tema com profundidade.
       - O personagem (characterDescription) deve ser JESUS ensinando, ou um APÓSTOLO (Paulo, Pedro, João), ou um personagem do NT apropriado ao tema.
       - Vestimentas e cenários bíblicos (Oriente Médio antigo, época de Jesus) são o padrão.

       CRÍTICO (PARA TODOS):
       - PROIBIDO inventar "crianças modernas" (Ex: Nada de "Aninha aprendendo com a vovó", nada de "Joãozinho na escola").
       - A narrativa deve ser direta sobre o tema ou o personagem histórico/bíblico.
       - Fidelidade ESCRITURAL e HISTÓRICA é a prioridade máxima.


    ${characterEnforcement}

    4. DESCRIÇÃO DO PERSONAGEM (CONSISTÊNCIA VISUAL - CRÍTICO): 
       - O CAMPO "characterDescription" DEVE SER DETALHADO E FIXO.
       - **COR DAS ROUPAS (CRÍTICO)**: Você DEVE definir a cor e o tipo de cada peça de roupa. (Ex: "Blue tunic with red sash", "White robe with gold belt"). NUNCA deixe ambíguo.
       - VOCÊ DEVE DEFINIR A IDADE APRENTE DO PERSONAGEM (Ex: "30 anos", "60 anos", "criança de 8 anos").
       - A IDADE DEVE SER MANTIDA EM TODAS AS CENAS. PROIBIDO MUDAR A IDADE.
       - **GÊNERO (ABSOLUTAMENTE CRÍTICO)**:
         - SEMPRE especifique o GÊNERO do personagem de forma EXPLÍCITA e INEQUÍVOCA.
         - Use termos como "HOMEM/MAN" ou "MULHER/WOMAN" de forma clara.
         - Para personagens MASCULINOS: Especifique "male", traços masculinos (barba, mandíbula forte, ombros largos, peito plano/liso, corpo musculoso).
         - Para personagens FEMININOS: Especifique "female", traços femininos (rosto delicado, cabelos longos típicos da época).
         - ADÃO = HOMEM (male, masculine features, flat chest, muscular build, short/medium hair)
         - EVA = MULHER (female, feminine features, long hair)
         - NUNCA confunda gêneros. Isso é fidelidade bíblica básica.
       - Se for Narrativa: Defina o protagonista com DETALHES VISUAIS ESPECÍFICOS.
       - Exemplo: "Gideon, HOMEM de 30 anos (MATENHA ESSA IDADE), barba curta castanha, cabelo castanho encaracolado, túnica bege simples, cinto de couro marrom, sandálias gastas, corpo forte de guerreiro, peito plano masculino".
       - Se for Doutrina: Defina um personagem representativo fixo com os mesmos detalhes.
    
    5. PRECISÃO HISTÓRICA E CULTURAL: 
       - Se for Narrativa Bíblica: Vestimentas antigas do Oriente Médio para todos.
       - Se for Biografia: Use vestimentas e arquitetura fiéis à época do personagem.
       - Se for Cultura: Use vestimentas, cenários e ambientes MODERNOS e ATUAIS para TODOS os personagens na cena. Nada de roupas bíblicas em contextos culturais atuais.
       - Represente a "Luz de Jesus" com cores quentes e vibrantes (amarelo, dourado) e o mundo com cores mais suaves ou contrastantes, sem ser assustador.
    
    6. PROMPTS DE IMAGEM (CRÍTICO - FIDELIDADE BÍBLICA E CONSISTÊNCIA):
       - O imagePrompt DEVE ilustrar EXATAMENTE o que está descrito no narrativeText daquela cena.
        - CRITICAL VISUAL CONSISTENCY STRATEGY (ABSOLUTELY MANDATORY):
        - For EVERY scene, the "imagePrompt" MUST include the FULL VISUAL DESCRIPTION of the Main Character AND any Secondary Character present.
        - DO NOT rely on external descriptions. The "imagePrompt" must be SELF-CONTAINED.
        - FORMAT: "Scene Action... [Character Name: Visual details]... [Secondary Character: Visual details]"
        - EXAMPLE: "The Good Samaritan (Middle-aged, olive skin, short beard, RED TUNIC, CREAM TURBAN) is bandaging the Wounded Man (pale skin, TORN GRAY TUNIC, bandages) on the rocky road."
        - YOU MUST REPEAT THESE VISUAL DETAILS IN EVERY SINGLE SCENE where they appear.
        - IF A FIXED DESCRIPTION WAS PROVIDED ABOVE, COPY-PASTE IT INTO EVERY SCENE PROMPT.
        - NEVER change the clothing colors or physical features between scenes.
        - Exemplo Jonas: If text says "Jonah prayed", prompt MUST be "Jonah (Old man, long gray beard, RAGGED BLUE TUNIC) praying..."
        - Exemplo Daniel: If text says "Daniel in the den", prompt MUST be "Daniel (Young man, Bablylonian BLUE ROBE) standing..."
       - NUNCA mostre momentos de violência ou medo excessivo.
       - DICA DE CONSISTÊNCIA: Se o personagem é adulto, NUNCA use palavras como "boy", "child", "kid", "little" no imagePrompt, a menos que seja outro personagem.
       - Mostre o MOMENTO DE FÉ/MILAGRE, não o momento de perigo.
       - Se for Doutrina/Simbolismo: O prompt deve focar no OBJETO ou SÍMBOLO da lição.
       - VARIAR OS ENQUADRAMENTOS: Use "Wide shot", "Close up", "Low angle".
       - CENA COMPLETA: Descreva o ambiente e ação.
       - NÃO inclua números repetitivos.
        - STRICT RULE: NEVER include halos, aureolas, divine glows, radiant rings, or light rays behind characters.
        - Characters must be human figures without any mystical effects.
       - **PERSONAGENS SECUNDÁRIOS (CRÍTICO PARA CONSISTÊNCIA)**:
          - Se houver outro personagem importante (ex: O Homem Ferido, O Filho Pródigo), você DEVE descrevê-lo visualmente NA PRIMEIRA CENA que ele aparece (roupa, cabelo, barba).
          - E VOCÊ DEVE **REPETIR A MESMA DESCRIÇÃO VISUAL** EM TODAS AS OUTRAS CENAS onde ele aparecer.
          - Ex CENA 1: "Samaritan sees a Wounded Man (long GREY hair, TORN BROWN tunic)..."
          - Ex CENA 2: "Samaritan puts the Wounded Man (long GREY hair, TORN BROWN tunic) on donkey..."
          - ISSO É OBRIGATÓRIO PARA QUE O SEGUNDO PERSONAGEM NÃO MUDE DE ROUPA/ROSTO.
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
  let stylePrompt = "ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS, NO WATERMARKS, NO SPEECH BUBBLES. ";
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
    
    MAIN CHARACTER (MUST LOOK IDENTICAL IN EVERY IMAGE):
    ${characterDesc}
    
    CRITICAL CONSISTENCY ENFORCEMENT V2:
    1. EXTREME PRIORITY: The Main Character MUST wear the EXACT SAME CLOTHES in every single scene.
       - If they wore a "Blue Tunic" in scene 1, they MUST wear a "Blue Tunic" in scene 10.
       - NEVER change clothing arbitrarily.
    2. FACIAL FEATURES:
       - Beard/No Beard: If established with a beard, MUST HAVE BEARD. If clean-shaven, MUST BE CLEAN-SHAVEN.
       - Hair Color/Style: MUST TIMELINE MATCH description.
       - Age: MUST REMAIN CONSISTENT (Do not make them younger/older).
    3. SECONDARY CHARACTERS:
       - If a secondary character (e.g., Jesus, Wife, King) appears, they MUST ALSO follow their specific visual description from the prompt.
       
    STRICT RULES:
    - CRITICAL: NO TEXT, NO LETTERS, NO NUMBERS, NO SPEECH BUBBLES anywhere in the image.
- CRITICAL: ABSOLUTELY NO HALOS, NO AUREOLAS, NO GLOWING RINGS around heads, NO SUNBURSTS, NO LIGHT RAYS, NO DIVINE GLOWS, NO HOLY RADIANCE. (Even for Jesus).
- CRITICAL: IF THE SCENE IS ABOUT CARNIVAL/PARTY: The main character must NEVER be dancing, wearing carnival costumes/masks, or mixing with the crowd. They must be observing from a distance (looking reflective/sad for them), or in a separate peaceful environment (nature, church, home), or praying. The party can be in the background but the character is SEPARATE and NOT PARTICIPATING.
- NO wings on humans, NO mystical effects.

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

GENDER ACCURACY (ABSOLUTELY CRITICAL - ZERO TOLERANCE):
- MALE characters (Adam, Moses, David, Jesus, Paul, etc.) MUST look DISTINCTLY MALE: masculine facial features, broad shoulders, shorter hair (unless historically accurate), facial hair when appropriate.
- FEMALE characters (Eve, Mary, Ruth, Esther, etc.) MUST look DISTINCTLY FEMALE: feminine face, longer hair, softer features.
- NEVER make male characters look feminine or female characters look masculine.
- If the scene has BOTH male and female characters, they MUST be CLEARLY DISTINGUISHABLE by gender.
- Adam = MAN (strong build, masculine face). Eve = WOMAN (feminine features, long hair).
- ANGELS MUST ALWAYS have MASCULINE appearance (strong jawline, broad shoulders, short hair, masculine face, warrior-like build). In the Bible, angels ALWAYS appeared as MEN. NEVER draw angels with feminine features, long flowing hair, or delicate faces.
- This is NON-NEGOTIABLE biblical accuracy.

MODESTY & CLOTHING (ABSOLUTELY CRITICAL):
- JESUS must ALWAYS wear a LONG, LOOSE, FLOWING ROBE/TUNIC that covers his ENTIRE body from neck to ankles. NEVER show Jesus with exposed arms, bare chest, muscular build, or tight clothing.
- Jesus should have a GENTLE, SERENE appearance — NOT muscular, NOT athletic, NOT warrior-like. He is a teacher and shepherd.
- ALL biblical characters must wear MODEST clothing that covers the body appropriately. Tunics must reach at LEAST to the knees, preferably ankles.
- NEVER draw any character with exposed upper body, tight-fitting clothes, or revealing clothing.
- This applies to ALL illustration styles including coloring pages and line art.

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
  storyContext?: string,
  supabaseToken?: string
): Promise<ActivityContent> {
  const languageName = langMap[lang];

  const prompt = `
    Como pedagogo especialista em BNCC e educação cristã, crie o conteúdo para uma folha de atividades A4 sobre a história: "${storyName}".
    Público Alvo: Crianças de ${age}.
    Idioma: ${languageName}.
    
    **REGRAS DE ADAPTAÇÃO POR IDADE (CRÍTICO):**
    - SE ${age} = "3–4 anos":
      - Quiz: Perguntas SIMPLES com apenas 3 opções (A, B, C). Linguagem fácil.
      - wordSearch: Apenas 5 palavras, TODAS com no MÁXIMO 5 LETRAS.
      - scrambleWords: Palavras de no MÁXIMO 4 LETRAS, com dicas muito claras.
      - completeThePhrase: Frase MUITO curta e simples, palavra fácil.
      - matchColumns: Apenas 3 pares simples (personagem → ação básica).
      - trueOrFalse: Apenas 3 afirmações SIMPLES e óbvias.
      - orderEvents: Apenas 3 eventos, com frases curtas.
      - secretPhrase: Máximo 3 palavras curtas.
      - familyQuestions: Perguntas simples sobre sentimentos ("Você gostou?", "Como você se sentiu?").
    - SE ${age} = "5–6 anos":
      - Quiz: 4 opções, linguagem clara.
      - wordSearch: 6 palavras de até 6 letras.
      - scrambleWords: Palavras de até 5 letras.
      - Demais atividades com complexidade moderada.
    - SE ${age} = "7–9 anos" ou "10–12 anos":
      - Complexidade padrão, desafios maiores, vocabulário mais rico.
      - wordSearch: 8 palavras de até 8 letras.

    ${storyContext ? `
    **CONTEXTO COMPLETO DA HISTÓRIA (FONTE DA VERDADE):**
    Utilize EXCLUSIVAMENTE o texto abaixo para criar as perguntas e atividades. NÃO invente personagens ou eventos que não estejam neste texto.
    
    ${storyContext}
    ` : ''}
    
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
       - CRÍTICO: Todos os personagens devem ter APARÊNCIA HUMANA CORRETA - rostos simpáticos, estilo Disney.
       - CRÍTICO: Jesus DEVE SEMPRE usar túnica LONGA e SOLTA que cobre TODO o corpo do pescoço aos tornozelos. NUNCA muscular ou com corpo exposto.
       - CRÍTICO: TODOS os personagens bíblicos devem usar roupas MODESTAS que cobrem o corpo adequadamente.
       - Se houver crianças, especifique "cute human children with happy expressions".
       - Se houver multidão, especifique "group of people with distinct human features".
       - **CRÍTICO: O prompt de colorir deve dizer explicitamente "NO TEXT, NO WORDS, NO LABELS inside the drawing".**
        - OBRIGATÓRIO incluir no final: "Disney animation style, modern 3D animated character line art, expressive eyes, Pixar-like character design, professional clean line art, high quality coloring book illustration, pure black outlines on white background, NO shading, NO fills, NO solid black areas, clean elegant strokes, NO HALOS, NO AUREOLAS, NO LIGHT RAYS, NO SUNBURSTS, NO TEXT, NO LETTERS, NO WORDS written on objects, characters wearing long modest robes covering entire body"
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
        - "startPrompt": Prompt curto em INGLÊS para a imagem de ENTRADA do labirinto (ponto A). Deve ser um personagem ou objeto central da história (ex: "Noah"). MANTENHA o estilo Disney line art. CRÍTICO: NUNCA GERE ANJOS, NUNCA GERE ASAS EM HUMANOS. SE FOR CRIANÇA, É APENAS UMA CRIANÇA NORMAL. DO NOT USE WORDS LIKE "ANGEL", "WINGS", "HALO" FOR HUMAN CHARACTERS.
        - "endPrompt": Prompt curto em INGLÊS para a imagem de CHEGADA do labirinto (ponto B). Deve ser o destino ou objetivo (ex: "The Ark"). MANTENHA o estilo Disney line art. DO NOT USE WINGS OR ANGELS.
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
