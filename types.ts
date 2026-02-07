
export enum AgeGroup {
  GROUP_3_4 = '3–4 anos',
  GROUP_5_6 = '5–6 anos',
  GROUP_7_9 = '7–9 anos',
  GROUP_10_12 = '10–12 anos'
}

export enum IllustrationStyle {
  STYLE_2D = '2D Premium (Vibrante)',
  STYLE_2D_NO_BORDER = '2D Sem Borda',
  STYLE_3D = '3D Suave (Disney Style)',
  STYLE_CUTE = 'Fofinho (Luva)',
  COLORING_PAGE = 'Página de Colorir (P&B)'
}

export type LanguageCode = 'pt' | 'es' | 'en' | 'fr' | 'it';

export interface Language {
  code: LanguageCode;
  label: string;
  flag: string;
  countryCode: string;
}

export const LANGUAGES: Language[] = [
  { code: 'pt', label: 'Português', flag: '🇧🇷', countryCode: 'br' },
  { code: 'en', label: 'English', flag: '🇺🇸', countryCode: 'us' },
  { code: 'es', label: 'Español', flag: '🇪🇸', countryCode: 'es' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', countryCode: 'fr' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹', countryCode: 'it' },
];

export interface StoryScene {
  id: number;
  imagePrompt: string;
  narrativeText: string;
  imageUrl?: string;
  loading?: boolean;
  error?: string;
}

export interface BibleStory {
  title: string;
  characterDescription: string;
  scenes: StoryScene[];
}

export interface ActivityContent {
  title: string;
  bibleVerse: string;
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number; // 0-3
  }[];
  wordSearch: string[]; // List of words
  coloringPrompt: string; // Prompt for the coloring image
  completeThePhrase: {
    phrase: string;
    missingWord: string;
  };
  scrambleWords: {
    word: string;
    hint: string;
  }[];
  matchColumns: {
    left: string;
    right: string;
  }[];
  trueOrFalse: {
    statement: string;
    isTrue: boolean;
  }[];
}

export interface GenerationState {
  isGeneratingText: boolean;
  isGeneratingImages: boolean;
  currentStep: number;
  totalSteps: number;
  error?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  gemini_api_key?: string;
  purchase_status?: string; // 'approved', 'pending', 'refunded'
  purchase_platform?: string; // 'hotmart', 'assiny'
}
