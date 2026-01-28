
import React, { useState, useEffect } from 'react';
import { AgeGroup, IllustrationStyle, StoryScene, BibleStory, LanguageCode, LANGUAGES, ActivityContent } from './types';
import { BIBLE_STORIES, ICONS, COLORS } from './constants';
import { generateStoryStructure, generateSceneImage, generateActivityContent } from './services/gemini';
import { createPrintablePDF } from './components/PDFGenerator';
import { createActivityPDF } from './components/ActivityGenerator';
import { ActivityPreview } from './components/ActivityPreview';
import { translations } from './translations';
import { supabase } from './services/supabase';
import { LoginScreen } from './components/LoginScreen';
import { ApiKeyScreen } from './components/ApiKeyScreen';
import { PurchaseScreen } from './components/PurchaseScreen';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);

  // Mapa de logos por idioma
  const LOGO_MAP: Record<LanguageCode, string> = {
    pt: '/logo.png',
    en: '/logo_en.png',
    es: '/logo_es.png',
    fr: '/logo_fr.png',
    it: '/logo_it.png',
  };

  const [userApiKey, setUserApiKey] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [lang, setLang] = useState<LanguageCode>('pt');
  const [selectedStory, setSelectedStory] = useState(BIBLE_STORIES[0]);
  const [customStory, setCustomStory] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(AgeGroup.GROUP_5_6);
  const [style, setStyle] = useState<IllustrationStyle>(IllustrationStyle.STYLE_2D);
  const [darkMode, setDarkMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingActivity, setIsGeneratingActivity] = useState(false);
  const [showActivityPreview, setShowActivityPreview] = useState(false);
  const [activityData, setActivityData] = useState<ActivityContent | null>(null);
  const [activityColoringImage, setActivityColoringImage] = useState<string | null>(null);

  const [currentGenerationPhase, setCurrentGenerationPhase] = useState('');
  const [scenes, setScenes] = useState<StoryScene[]>([]);
  const [characterDescription, setCharacterDescription] = useState('');
  const [generatedTitle, setGeneratedTitle] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  const t = translations[lang];



  // Translation maps for enums
  const ageGroupLabels: Record<AgeGroup, string> = {
    [AgeGroup.GROUP_3_4]: t.age_3_4,
    [AgeGroup.GROUP_5_6]: t.age_5_6,
    [AgeGroup.GROUP_7_9]: t.age_7_9,
    [AgeGroup.GROUP_10_12]: t.age_10_12,
  };

  const styleLabels: Record<IllustrationStyle, string> = {
    [IllustrationStyle.STYLE_2D]: t.style2D,
    [IllustrationStyle.STYLE_3D]: t.style3D,
    [IllustrationStyle.COLORING_PAGE]: t.styleColoring,
  };

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkUserProfile(session.user.id, session.user.email);
      else setLoadingAuth(false);
    }).catch((err) => {
      console.error("Auth initialization error:", err);
      setLoadingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkUserProfile(session.user.id, session.user.email);
      else {
        setUserApiKey(null);
        setLoadingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserProfile = async (userId: string, userEmail?: string) => {
    try {
      // Primeiro tenta buscar por ID
      let { data, error } = await supabase
        .from('profiles')
        .select('gemini_api_key, purchase_status')
        .eq('id', userId)
        .single();

      // Se não encontrou por ID e temos email, tenta buscar por email
      if ((!data || error) && userEmail) {
        console.log('Profile not found by ID, trying by email:', userEmail);
        const emailResult = await supabase
          .from('profiles')
          .select('id, gemini_api_key, purchase_status')
          .eq('email', userEmail.toLowerCase())
          .single();

        if (emailResult.data) {
          data = emailResult.data;
          // Atualiza o ID do profile para sincronizar com auth.users
          if (emailResult.data.id !== userId) {
            console.log('Syncing profile ID from', emailResult.data.id, 'to', userId);
            await supabase
              .from('profiles')
              .update({ id: userId })
              .eq('email', userEmail.toLowerCase());
          }
        }
      }

      setPurchaseStatus(data?.purchase_status || 'pending');

      if (data?.gemini_api_key) {
        setUserApiKey(data.gemini_api_key);
      } else {
        setUserApiKey(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleKeySaved = (key: string) => {
    setUserApiKey(key);
  };

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#fdfaf6';
    }
  }, [darkMode]);

  const handleStartGeneration = async () => {
    if (!userApiKey) {
      alert("Erro: Chave de API não encontrada.");
      return;
    }

    const finalStory = customStory.trim() || selectedStory;
    setIsGenerating(true);
    setGenerationProgress(5);
    setCurrentGenerationPhase(t.studyScript);

    try {
      const result: BibleStory = await generateStoryStructure(userApiKey, finalStory, ageGroup, lang);
      setScenes(result.scenes);
      setGeneratedTitle(result.title);
      setCharacterDescription(result.characterDescription);
      setGenerationProgress(20);

      const updatedScenes = [...result.scenes];
      for (let i = 0; i < updatedScenes.length; i++) {
        setCurrentGenerationPhase(t.illustratingScene.replace('{0}', (i + 1).toString()).replace('{1}', updatedScenes.length.toString()));
        try {
          const imageUrl = await generateSceneImage(
            userApiKey,
            updatedScenes[i].imagePrompt,
            result.characterDescription,
            style
          );
          updatedScenes[i] = { ...updatedScenes[i], imageUrl, error: undefined };
        } catch (err) {
          console.error(`Error generating image for scene ${i + 1}:`, err);
          updatedScenes[i] = { ...updatedScenes[i], error: 'Error' };
        }
        setScenes([...updatedScenes]);
        setGenerationProgress(20 + ((i + 1) / updatedScenes.length) * 80);
      }
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      alert(`Erro detalhado: ${errorMessage}\n\nVerifique se sua chave API está correta e tem permissões.`);
      console.error("Erro completo:", err);
      setIsGenerating(false);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setCurrentGenerationPhase('');
    }
  };

  const handleRefreshScene = async (index: number) => {
    if (!userApiKey) return;

    const updatedScenes = [...scenes];
    const originalImage = updatedScenes[index].imageUrl;

    updatedScenes[index] = { ...updatedScenes[index], loading: true, imageUrl: undefined, error: undefined };
    setScenes([...updatedScenes]);

    try {
      const imageUrl = await generateSceneImage(
        userApiKey,
        updatedScenes[index].imagePrompt,
        characterDescription,
        style,
        0, // retryCount
        true // isVariation - Force different angle
      );
      updatedScenes[index] = { ...updatedScenes[index], imageUrl, loading: false, error: undefined };
      setScenes([...updatedScenes]);
    } catch (err) {
      console.error(`Error refreshing image for scene ${index + 1}:`, err);
      updatedScenes[index] = { ...updatedScenes[index], imageUrl: originalImage, loading: false, error: 'Error' };
      setScenes([...updatedScenes]);
    }
  };

  const handleDownloadPDF = async () => {
    const title = generatedTitle || customStory.trim() || selectedStory;
    const validScenes = scenes.filter(s => !!s.imageUrl);
    if (validScenes.length < scenes.length) {
      if (!confirm("Algumas imagens falharam na geração. Deseja baixar o PDF assim mesmo?")) {
        return;
      }
    }
    await createPrintablePDF(title, scenes, lang);
  };

  const handleGenerateActivity = async () => {
    if (!userApiKey) return;
    const title = customStory.trim() || selectedStory;

    setIsGeneratingActivity(true);
    try {
      // 1. Generate Content
      let activityContent;
      try {
        activityContent = await generateActivityContent(userApiKey, title, ageGroup, lang);
      } catch (e: any) {
        throw new Error(`Erro na IA de Texto: ${e.message}`);
      }

      // 2. Generate Coloring Image
      let coloringImageUrl = null;
      try {
        coloringImageUrl = await generateSceneImage(
          userApiKey,
          activityContent.coloringPrompt,
          "", // No character desc needed
          IllustrationStyle.COLORING_PAGE,
          0,
          false
        );
      } catch (e) {
        console.error("Error generating coloring image", e);
      }

      // Set Data for Preview
      setActivityData(activityContent);
      setActivityColoringImage(coloringImageUrl);
      setShowActivityPreview(true);

    } catch (err: any) {
      console.error("Error generating activity:", err);
      alert(err.message || "Erro desconhecido ao gerar atividade.");
    } finally {
      setIsGeneratingActivity(false);
    }
  };

  const handleDownloadActivityPDF = async () => {
    if (!activityData) return;
    setIsGeneratingActivity(true);
    try {
      await createActivityPDF(activityData, activityColoringImage, lang);
    } catch (e: any) {
      alert(`Erro ao criar PDF: ${e.message}`);
    } finally {
      setIsGeneratingActivity(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  // ... (rest of render until buttons)
  <div className="flex flex-col gap-4 w-full md:w-auto">
    <button
      onClick={handleGenerateActivity}
      disabled={isGeneratingActivity}
      className="w-full bg-white hover:bg-slate-50 text-purple-600 px-8 py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-xl border-4 border-purple-100 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
    >
      {isGeneratingActivity ? <span className="animate-spin text-2xl">⏳</span> : <span className="text-2xl">✏️</span>}
      <span>{isGeneratingActivity ? t.creatingActivity : t.generateActivity}</span>
    </button>

    <button
      onClick={handleDownloadPDF}
      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-2xl shadow-emerald-200 dark:shadow-none border-b-8 border-green-800 whitespace-nowrap"
    >
      <ICONS.Download />
      <span>{t.downloadBtn}</span>
    </button>
  </div>

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  // Se o usuário não tiver compra aprovada, mostra tela de compra
  if (purchaseStatus !== 'approved') {
    return (
      <PurchaseScreen
        userEmail={session.user.email || ''}
        onRefresh={() => checkUserProfile(session.user.id)}
      />
    );
  }

  if (!userApiKey) {
    return <ApiKeyScreen onKeySaved={handleKeySaved} />;
  }

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-500 overflow-x-hidden ${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-[#fdfaf6] text-slate-800'}`}>

      {/* Decorative floating elements */}
      {!isGenerating && scenes.length === 0 && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 dark:opacity-10">
          <ICONS.Star className="absolute top-20 left-[10%] w-12 h-12 text-yellow-400 animate-pulse" />
          <ICONS.Heart className="absolute top-40 right-[15%] w-10 h-10 text-pink-500 animate-bounce" />
          <ICONS.Star className="absolute bottom-40 left-[15%] w-8 h-8 text-blue-400" />
          <ICONS.Heart className="absolute bottom-20 right-[10%] w-14 h-14 text-orange-400" />
          <div className="absolute top-1/4 left-1/2 w-4 h-4 bg-green-400 rounded-full" />
          <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-purple-400 rounded-full" />
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b-4 border-yellow-400 dark:border-yellow-600 py-3 px-4 mb-8 sticky top-0 z-50 shadow-xl">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.location.reload()}>
            <img
              src={LOGO_MAP[lang]}
              alt="Logo Pegue & Pregue"
              className="h-14 sm:h-16 w-auto drop-shadow-md hover:scale-110 transition-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="hidden md:block">
              <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-none tracking-tight">
                {t.title}
              </h1>
              <p className="text-[10px] text-blue-500 dark:text-blue-400 font-black tracking-[0.2em] uppercase mt-1">{t.subtitle}</p>
            </div>
          </div>

          {/* Header Redesigned */}
          <div className="flex items-center gap-3">

            {/* Account Settings Group */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-2xl p-1.5 border-2 border-slate-200 dark:border-slate-700 mr-2">
              <button
                onClick={() => {
                  if (confirm("Deseja alterar e atualizar sua Chave API?")) {
                    setUserApiKey(null);
                  }
                }}
                title={t.headerKey}
                className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all font-bold"
              >
                <span className="text-lg">🔑</span>
              </button>

              <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>

              <button
                onClick={() => setShowPasswordModal(true)}
                title={t.headerPass}
                className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-bold"
              >
                <span className="text-lg">🔒</span>
              </button>

              <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>

              <button
                onClick={() => supabase.auth.signOut()}
                title={t.headerLogout}
                className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-all font-bold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>

            {/* Language Selector (Compressed) */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1 border-2 border-slate-200 dark:border-slate-700">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  title={l.label}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${lang === l.code
                    ? 'bg-white dark:bg-slate-700 shadow-sm opacity-100'
                    : 'opacity-50 hover:opacity-100'
                    }`}
                >
                  <img
                    src={`https://flagcdn.com/w40/${l.countryCode}.png`}
                    alt={l.label}
                    className="w-5 h-auto rounded-[2px]"
                  />
                </button>
              ))}
            </div>

            <a
              href="https://wa.me/5531999982884"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-2xl bg-green-500 hover:bg-green-600 text-white transition-all shadow-lg hover:shadow-green-300/50"
            >
              <span className="text-lg">💬</span>
            </a>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-2xl bg-yellow-400/20 text-yellow-600 hover:bg-yellow-400 hover:text-white transition-all"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {scenes.length > 0 && !isGenerating && (
              <button
                onClick={handleDownloadPDF}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all ml-2"
              >
                <ICONS.Download className="w-5 h-5" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            )}

          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4">
        {scenes.length === 0 && !isGenerating ? (
          <div className="space-y-12 animate-in fade-in duration-700">
            {/* Main Welcome Card */}
            <div className="bg-white dark:bg-slate-800 p-8 md:p-14 rounded-[3rem] shadow-2xl border-t-8 border-purple-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ICONS.Star className="w-32 h-32 text-yellow-500 rotate-12" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
                    {t.subtitle}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-6 leading-tight">
                    {t.prepareClass} <span className="text-purple-600 block sm:inline">✨</span>
                  </h2>
                  <p className="text-slate-500 dark:text-slate-300 text-lg md:text-xl font-medium max-w-lg mb-0 leading-relaxed">
                    {t.prepareDesc}
                  </p>
                </div>
                <div className="w-full md:w-1/3 flex justify-center">
                  <img
                    src={LOGO_MAP[lang]}
                    alt="Mascote Logo"
                    className="w-48 md:w-full max-w-[280px] drop-shadow-2xl hover:rotate-2 transition-transform"
                  />
                </div>
              </div>
            </div>

            {/* Selection Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Story */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-[2.5rem] border-2 border-blue-100 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
                <label className="block text-sm font-black mb-4 flex items-center gap-3 text-blue-700 dark:text-blue-300 uppercase tracking-widest">
                  <span className="bg-blue-500 text-white p-2 rounded-xl"><ICONS.Bible /></span> {t.storyLabel}
                </label>
                <select
                  value={selectedStory || "custom"}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "custom") {
                      setSelectedStory("");
                      setCustomStory("");
                    } else {
                      setSelectedStory(val);
                      setCustomStory("");
                    }
                  }}
                  className="w-full p-4 rounded-xl border-2 border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white focus:outline-none focus:border-blue-500 transition-colors font-bold text-lg"
                >
                  {BIBLE_STORIES[lang].map((story) => (
                    <option key={story} value={story}>{story}</option>
                  ))}
                  <option value="custom">{t.otherStory}...</option>
                </select>
                {(selectedStory === "" || !BIBLE_STORIES[lang].includes(selectedStory)) && (
                  <input
                    type="text"
                    placeholder={t.otherStory}
                    className="w-full mt-4 bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800 rounded-2xl px-4 py-4 focus:border-blue-400 focus:outline-none transition-all text-slate-800 dark:text-white font-medium text-base"
                    value={customStory}
                    onChange={(e) => setCustomStory(e.target.value)}
                    autoFocus
                  />
                )}
              </div>

              {/* Age */}
              <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-[2.5rem] border-2 border-green-100 dark:border-green-800 shadow-sm hover:shadow-md transition-shadow">
                <label className="block text-sm font-black mb-4 flex items-center gap-3 text-green-700 dark:text-green-300 uppercase tracking-widest">
                  <span className="bg-green-500 text-white p-2 rounded-xl">👶</span> {t.ageLabel}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(AgeGroup).map((age) => (
                    <button
                      key={age}
                      onClick={() => setAgeGroup(age)}
                      className={`px-3 py-3.5 rounded-2xl font-black text-xs border-2 transition-all ${ageGroup === age
                        ? 'bg-green-500 border-green-600 text-white shadow-lg shadow-green-200 dark:shadow-none'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-green-100/50'
                        }`}
                    >
                      {ageGroupLabels[age]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div className="bg-orange-50 dark:bg-orange-900/20 p-8 rounded-[2.5rem] border-2 border-orange-100 dark:border-orange-800 shadow-sm hover:shadow-md transition-shadow">
                <label className="block text-sm font-black mb-4 flex items-center gap-3 text-orange-700 dark:text-orange-300 uppercase tracking-widest">
                  <span className="bg-orange-500 text-white p-2 rounded-xl">✨</span> {t.styleLabel}
                </label>
                <div className="flex flex-col gap-3">
                  {Object.values(IllustrationStyle).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={`px-4 py-3.5 rounded-2xl font-black text-xs border-2 transition-all text-left flex items-center justify-between ${style === s
                        ? 'bg-orange-500 border-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-orange-100/50'
                        }`}
                    >
                      {styleLabels[s]}
                      {style === s && <span className="bg-white/20 p-1 rounded-lg">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button Section */}
            <div className="flex flex-col items-center">
              <button
                onClick={handleStartGeneration}
                disabled={isGenerating}
                className="group relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 px-16 rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-purple-200 dark:shadow-none transition-all transform hover:-translate-y-2 active:scale-95 disabled:opacity-50 overflow-hidden border-b-8 border-blue-800"
              >
                <div className="relative z-10 flex items-center gap-4">
                  <span>{t.generateBtn}</span>
                  <span className="text-3xl animate-bounce">🎨</span>
                </div>
                <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-full transition-all duration-1000" />
              </button>

              <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-3xl border-2 border-yellow-200 dark:border-yellow-800 flex items-center gap-4 max-w-lg">
                <span className="text-3xl">💡</span>
                <p className="text-yellow-800 dark:text-yellow-200 text-sm font-bold leading-tight">
                  {t.whiteBgTitle}: {t.whiteBgDesc}
                </p>
              </div>
            </div>
          </div>
        ) : isGenerating ? (
          <div className="bg-white dark:bg-slate-800 p-16 rounded-[4rem] shadow-2xl border-b-[16px] border-purple-100 dark:border-slate-700 text-center relative overflow-hidden">
            {/* Background rainbow circle */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-700" />

            <div className="relative w-48 h-48 mx-auto mb-10">
              <div className="absolute inset-0 bg-purple-500/20 dark:bg-purple-400/20 rounded-full animate-ping"></div>
              <div className="relative w-48 h-48 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto shadow-2xl border-8 border-purple-50 dark:border-slate-700 overflow-hidden">
                <img src={LOGO_MAP[lang]} className="w-4/5 h-auto animate-bounce" />
              </div>
            </div>

            <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">{t.generating}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-12 text-xl font-bold">{currentGenerationPhase}</p>

            <div className="max-w-xl mx-auto">
              <div className="w-full bg-slate-100 dark:bg-slate-950 h-8 rounded-full overflow-hidden mb-4 border-4 border-white dark:border-slate-700 shadow-inner p-1">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded-full transition-all duration-700 ease-out relative"
                  style={{ width: `${generationProgress}%` }}
                >
                  <div className="absolute top-0 right-0 w-2 h-full bg-white/40 animate-pulse" />
                </div>
              </div>
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">{Math.round(generationProgress)}% COMPLETO</p>
            </div>
          </div>
        ) : (
          <div className="space-y-20 animate-in slide-in-from-bottom duration-1000">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 px-4 py-10 bg-white dark:bg-slate-800 rounded-[3rem] shadow-xl border-l-[12px] border-yellow-400">
              <div className="text-center sm:text-left">
                <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {customStory || selectedStory}
                </h2>
                <div className="flex flex-wrap gap-3 mt-5 justify-center sm:justify-start">
                  <span className="bg-purple-600 text-white px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-md">{styleLabels[style]}</span>
                  <span className="bg-blue-500 text-white px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-md">{ageGroupLabels[ageGroup]}</span>
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest">{scenes.length} {t.visuals}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setScenes([]);
                  setCustomStory('');
                  setGeneratedTitle(null);
                  setActivityData(null);
                  setActivityColoringImage(null);
                  setShowActivityPreview(false);
                }}
                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-8 py-4 rounded-2xl font-black text-sm transition-all hover:bg-red-600 hover:text-white border-2 border-red-100 dark:border-red-900/50 shadow-sm"
              >
                ← {t.restartBtn}
              </button>
            </div>

            <div className="grid gap-20">
              {scenes.map((scene, idx) => (
                <div key={scene.id} className="grid lg:grid-cols-2 gap-12 items-stretch group">
                  {/* Visual Side */}
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between px-4">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 bg-yellow-400 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md">{idx + 1}</span>
                        <span className="text-slate-800 dark:text-white text-sm font-black uppercase tracking-widest">
                          {t.visualLabel}
                        </span>
                      </div>
                      {scene.imageUrl && !scene.loading && (
                        <button
                          onClick={() => handleRefreshScene(idx)}
                          className="p-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-purple-600 hover:border-purple-200 transition-all shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="flex-1 aspect-[3/4] bg-white rounded-[3rem] shadow-2xl border-[16px] border-white ring-4 ring-slate-100 dark:ring-slate-700/50 p-8 flex items-center justify-center relative overflow-hidden group/img cursor-zoom-in">
                      {scene.loading ? (
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-20 border-8 border-purple-100 border-t-purple-600 rounded-full animate-spin mb-6"></div>
                          <span className="text-slate-400 text-sm font-black uppercase tracking-widest">{t.recreating}</span>
                        </div>
                      ) : scene.imageUrl ? (
                        <div className="relative w-full h-full bg-white flex items-center justify-center">
                          <img
                            src={scene.imageUrl}
                            alt={`${t.visualLabel} ${idx + 1}`}
                            className="max-w-full max-h-full object-contain drop-shadow-2xl transition-transform group-hover/img:scale-105 duration-700"
                          />
                          {/* Rainbow border hint */}
                          <div className="absolute inset-0 border-4 border-dashed border-slate-100 rounded-xl pointer-events-none opacity-50" />
                        </div>
                      ) : scene.error ? (
                        <div className="text-center p-8">
                          <span className="text-6xl block mb-6">🏜️</span>
                          <button
                            onClick={() => handleRefreshScene(idx)}
                            className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-purple-700 shadow-lg"
                          >
                            {t.tryAgain}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 border-4 border-slate-100 border-t-purple-400 rounded-full animate-spin"></div>
                        </div>
                      )}

                      {/* Recortar icon hint */}
                      <div className="absolute top-4 right-4 bg-slate-100/80 backdrop-blur-sm p-2 rounded-xl opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <span className="text-xs font-black text-slate-500">✂️ PRONTO PARA RECORTAR</span>
                      </div>
                    </div>
                  </div>

                  {/* Text Side */}
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-3 px-4">
                      <span className="bg-blue-500 text-white p-2 rounded-xl">📜</span>
                      <span className="text-slate-800 dark:text-white text-sm font-black uppercase tracking-widest">
                        {t.guideLabel}
                      </span>
                    </div>

                    <div className="flex-1 bg-white dark:bg-slate-800 rounded-[3rem] p-12 border-b-[12px] border-blue-500 shadow-2xl flex flex-col justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <ICONS.Bible />
                      </div>

                      <div className="relative z-10">
                        <div className="text-blue-500 text-5xl font-black mb-8 opacity-20">“</div>
                        <p className="text-lg md:text-xl font-bold text-slate-800 dark:text-white leading-relaxed font-nunito italic -mt-8">
                          {scene.narrativeText}
                        </p>
                        <div className="text-blue-500 text-5xl font-black mt-4 text-right opacity-20">”</div>
                      </div>

                      <div className="mt-12 pt-10 border-t-2 border-slate-100 dark:border-slate-700 relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded-lg text-yellow-600">💡</span>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">{t.pedagogicTip}</p>
                        </div>
                        <p className="text-md text-slate-600 dark:text-slate-300 font-bold px-4 italic leading-relaxed">
                          {t.pedagogicDesc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Final Download Section */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-purple-500 to-blue-500 rounded-[4rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white dark:bg-slate-800 p-12 md:p-16 rounded-[4rem] flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl border-2 border-white dark:border-slate-700">
                <div className="text-center lg:text-left flex flex-col md:flex-row items-center gap-8">
                  <img src={LOGO_MAP[lang]} className="w-24 h-24" />
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-4xl mb-3 tracking-tight">{t.finishTitle}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xl font-bold">{t.finishDesc}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4 w-full md:w-auto">
                  <button
                    onClick={handleGenerateActivity}
                    disabled={isGeneratingActivity}
                    className="w-full bg-white hover:bg-slate-50 text-purple-600 px-8 py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-xl border-4 border-purple-100 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isGeneratingActivity ? <span className="animate-spin text-2xl">⏳</span> : <span className="text-2xl">✏️</span>}
                    <span>{isGeneratingActivity ? t.creatingActivity : t.generateActivity}</span>
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-2xl shadow-emerald-200 dark:shadow-none border-b-8 border-green-800 whitespace-nowrap"
                  >
                    <ICONS.Download />
                    <span>{t.downloadBtn}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Activity Preview Section - Rendered before footer */}
      {showActivityPreview && activityData && (
        <div id="activity-preview-section" className="w-full max-w-6xl mx-auto px-4 mb-24 mt-20">
          <ActivityPreview
            activity={activityData}
            coloringImageUrl={activityColoringImage}
            onDownload={handleDownloadActivityPDF}
            onClose={() => setShowActivityPreview(false)}
            isDownloading={isGeneratingActivity}
            lang={lang}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="mt-32 text-center px-6 max-w-4xl mx-auto pt-16 border-t-4 border-dotted border-slate-200 dark:border-slate-800">
        <div className="flex flex-col items-center gap-8">
          <img src="/logo.png" className="h-16 w-auto grayscale opacity-50" />

          <div>
            <p className="text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] mb-3">
              {t.footerText}
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-sm font-black tracking-wide">
              {t.copyright}
            </p>
          </div>

          <div className="flex justify-center gap-8 grayscale opacity-30">
            <span className="text-4xl hover:grayscale-0 transition-all cursor-default">⛪</span>
            <span className="text-4xl hover:grayscale-0 transition-all cursor-default">📖</span>
            <span className="text-4xl hover:grayscale-0 transition-all cursor-default">🕊️</span>
            <span className="text-4xl hover:grayscale-0 transition-all cursor-default">🎨</span>
          </div>

          <div className="max-w-lg bg-slate-100 dark:bg-slate-800/50 p-6 rounded-3xl">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold italic leading-relaxed">
              {t.iaDisclaimer}
            </p>
          </div>
        </div>
      </footer>

      {/* Modal de Alteração de Senha */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div >
  );
};

export default App;
