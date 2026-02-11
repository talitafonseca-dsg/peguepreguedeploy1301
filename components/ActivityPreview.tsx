
import React from 'react';
import { ActivityContent, LanguageCode } from '../types';
import { ICONS } from '../constants';
import { translations } from '../translations';

interface ActivityPreviewProps {
    activity: ActivityContent;
    coloringImageUrl: string | null;
    onDownload: () => void;
    onClose: () => void;
    isDownloading: boolean;
    lang: LanguageCode;
    mazeStartImage?: string | null;
    mazeEndImage?: string | null;
}

export const ActivityPreview: React.FC<ActivityPreviewProps> = ({
    activity,
    coloringImageUrl,
    onDownload,
    onClose,
    isDownloading,
    lang = 'pt', // Default to pt if not provided
    mazeStartImage,
    mazeEndImage
}) => {
    const t = translations[lang] || translations['pt'];

    return (
        <div className="w-full max-w-4xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">

            <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl overflow-hidden border-4 border-slate-100 dark:border-slate-700">

                {/* Header Section */}
                <div className="bg-purple-100 dark:bg-purple-900/30 p-8 border-b border-purple-200 dark:border-purple-800 flex flex-col md:flex-row items-center justify-between gap-6">
                    <h3 className="text-3xl font-black text-purple-800 dark:text-purple-200 flex items-center gap-3">
                        <span className="text-4xl">📝</span> {t.previewActivity}
                    </h3>

                    <button
                        onClick={onDownload}
                        disabled={isDownloading}
                        className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-purple-200 dark:shadow-none transition-transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? <span className="animate-spin text-xl">⏳</span> : <ICONS.Download className="w-6 h-6" />}
                        <span>{t.downloadActivityBtn}</span>
                    </button>
                </div>

                {/* Scrollable Content (Simulating A4) */}
                <div className="p-8 md:p-12 bg-slate-50 dark:bg-slate-900/50 flex justify-center">
                    <div className="bg-white text-slate-900 w-full max-w-[210mm] shadow-xl p-8 md:p-16 rounded-xl border border-slate-200">
                        {/* Page Header */}
                        <div className="border-b-4 border-purple-500 pb-6 mb-10 text-center">
                            <h1 className="text-4xl font-black text-purple-600 mb-4 uppercase tracking-tight">{t.activityTitle}</h1>
                            <div className="flex flex-col sm:flex-row justify-between text-base text-slate-400 mt-6 border-t-2 border-slate-100 pt-4 font-mono">
                                <span>{t.nameLabel} ___________________________________</span>
                                <span>{t.dateLabel} ___/___/___</span>
                            </div>
                        </div>

                        {/* Title & Verse */}
                        <div className="text-center mb-12 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <h2 className="text-3xl font-black mb-4 text-slate-800">{activity.title}</h2>
                            <p className="italic text-slate-600 text-lg font-serif leading-relaxed">"{activity.bibleVerse || 'Lâmpada para os meus pés é a tua palavra. (Salmos 119:105)'}"</p>
                        </div>

                        {/* Quiz */}
                        <div className="mb-12">
                            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                                <span className="bg-purple-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-purple-200 shadow-lg">1</span>
                                {t.activity1}
                            </h3>
                            <div className="space-y-8">
                                {((activity.quiz && activity.quiz.length > 0) ? activity.quiz : [
                                    {
                                        question: t.fallbackQuestion,
                                        options: [t.fallbackOption1, t.fallbackOption2, t.fallbackOption3]
                                    }
                                ]).slice(0, 1).map((q, idx) => (
                                    <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <p className="font-bold text-lg mb-4 text-slate-700">{idx + 1}. {q.question}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {q.options?.map((opt, optIdx) => (
                                                <div key={optIdx} className="flex items-center gap-3 text-base text-slate-600 p-2 hover:bg-white rounded-lg transition-colors">
                                                    <div className="w-6 h-6 border-2 border-slate-300 rounded-full flex-shrink-0"></div>
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Complete Phrase */}
                        {activity.completeThePhrase && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                                    <span className="bg-emerald-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-emerald-200 shadow-lg">2</span>
                                    {t.activity2}
                                </h3>
                                <div className="bg-yellow-50 p-8 rounded-2xl border-2 border-yellow-200 border-dashed font-bold text-2xl text-center text-yellow-800 leading-relaxed">
                                    {activity.completeThePhrase.phrase}
                                </div>
                            </div>
                        )}

                        {/* Word Search Preview */}
                        <div className="mb-12">
                            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                                <span className="bg-purple-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-purple-200 shadow-lg">3</span>
                                {t.activity3}
                            </h3>
                            <div className="bg-slate-100 p-8 rounded-3xl text-center">
                                <p className="text-base font-bold text-slate-600 mb-6 uppercase tracking-wider">{t.wordSearchFind} <span className="text-purple-600">{activity.wordSearch?.filter(w => w.length <= 10).slice(0, 8).join(", ")}</span></p>
                                {/* Simplified visual representation */}
                                <div className="inline-grid grid-cols-10 gap-2 font-mono text-lg font-bold opacity-40 select-none pointer-events-none mix-blend-multiply">
                                    {Array.from({ length: 80 }).map((_, i) => (
                                        <span key={i} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm">{String.fromCharCode(65 + Math.floor(Math.random() * 26))}</span>
                                    ))}
                                </div>
                                <p className="text-sm text-slate-400 mt-4 font-bold">(Visualização simplificada da grade)</p>
                            </div>
                        </div>

                        {/* Scramble Words Preview */}
                        {activity.scrambleWords && activity.scrambleWords.length > 0 && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                                    <span className="bg-purple-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-purple-200 shadow-lg">4</span>
                                    {t.activity4}
                                </h3>
                                <div className="grid gap-4">
                                    {activity.scrambleWords.map((item, idx) => (
                                        <div key={idx} className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-orange-800 font-bold text-xl tracking-widest uppercase">
                                                    {item.word.split('').sort(() => 0.5 - Math.random()).join('  ')}
                                                </span>
                                                <span className="text-xs text-orange-400 font-bold uppercase mt-1">{t.scrambleHint} {item.hint}</span>
                                            </div>
                                            <div className="w-32 h-10 border-b-2 border-orange-300"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Match Columns Preview */}
                        {activity.matchColumns && activity.matchColumns.length > 0 && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                                    <span className="bg-amber-500 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-amber-200 shadow-lg">5</span>
                                    {t.activity5}
                                </h3>
                                <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-200">
                                    <div className="flex justify-between items-start gap-8">
                                        <div className="flex-1 space-y-4">
                                            {activity.matchColumns.map((item, idx) => (
                                                <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-blue-100 font-bold text-blue-800">
                                                    {String.fromCharCode(65 + idx)}. {item.left}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            {[...activity.matchColumns].sort(() => Math.random() - 0.5).map((item, idx) => (
                                                <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-blue-100 font-bold text-blue-600">
                                                    {idx + 1}. {item.right}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* True or False Preview */}
                        {activity.trueOrFalse && activity.trueOrFalse.length > 0 && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                                    <span className="bg-green-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-green-200 shadow-lg">6</span>
                                    {t.activity6}
                                </h3>
                                <div className="bg-green-50 p-6 rounded-3xl border-2 border-green-200 space-y-4">
                                    {activity.trueOrFalse.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-green-100">
                                            <span className="font-bold text-green-700">{idx + 1}.</span>
                                            <p className="flex-1 text-slate-700 font-medium">{item.statement}</p>
                                            <div className="flex gap-2">
                                                <span className="w-10 h-10 border-2 border-green-300 rounded-lg flex items-center justify-center font-bold text-green-600">{t.trueAbbr}</span>
                                                <span className="w-10 h-10 border-2 border-red-300 rounded-lg flex items-center justify-center font-bold text-red-600">{t.falseAbbr}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 9. Who Said It Preview */}
                        {activity.whoSaidIt && activity.whoSaidIt.length > 0 && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                                    <span className="bg-orange-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-orange-200 shadow-lg">7</span>
                                    {t.activityWhoSaid}
                                </h3>
                                <div className="grid gap-6">
                                    {activity.whoSaidIt.map((item, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row items-center gap-4">
                                            {/* Quote Bubble */}
                                            <div className="flex-1 bg-white p-6 rounded-3xl rounded-tl-none border-2 border-orange-200 shadow-sm relative">
                                                <div className="absolute top-0 -left-2 w-4 h-4 bg-white border-l-2 border-t-2 border-orange-200 transform -rotate-45"></div>
                                                <p className="text-slate-700 italic text-lg font-medium">"{item.quote}"</p>
                                            </div>
                                            {/* Character Label */}
                                            <div className="w-full md:w-48 bg-orange-100 p-4 rounded-2xl text-center border border-orange-200">
                                                <span className="text-orange-800 font-bold text-sm uppercase tracking-wide opacity-50">?</span>
                                                {/* <p className="text-orange-900 font-bold">{item.character}</p> - Hidden for preview/quiz effect */}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-4 p-4 bg-slate-100 rounded-2xl text-center">
                                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{t.wordSearchFind}: <span className="text-slate-800">{activity.whoSaidIt.map(i => i.character).join(", ")}</span></p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 10. Order Events Preview */}
                        {activity.orderEvents && activity.orderEvents.length > 0 && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                                    <span className="bg-teal-500 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-teal-200 shadow-lg">8</span>
                                    {t.activityOrder}
                                </h3>
                                <div className="space-y-4">
                                    {[...activity.orderEvents].sort(() => Math.random() - 0.5).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 bg-teal-50 p-4 rounded-2xl border border-teal-100">
                                            <div className="w-12 h-12 bg-white rounded-xl border-2 border-teal-200 text-teal-300 font-bold flex items-center justify-center text-2xl shadow-inner">
                                            </div>
                                            <p className="flex-1 text-slate-700 font-bold text-lg">{item.event}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 11. Character Card Preview */}
                        {activity.characterCard && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                                    <span className="bg-red-500 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-red-200 shadow-lg">9</span>
                                    {t.activityCharacter}
                                </h3>
                                <div className="bg-white p-6 rounded-3xl border-4 border-slate-800 shadow-2xl max-w-sm mx-auto transform rotate-1">
                                    {/* Card Header */}
                                    <div className="bg-slate-800 text-white p-3 rounded-t-xl text-center">
                                        <h4 className="text-xl font-black uppercase tracking-widest">{activity.characterCard.name}</h4>
                                        <p className="text-xs text-yellow-400 font-bold uppercase">{activity.characterCard.title}</p>
                                    </div>

                                    {/* Image Placeholder */}
                                    <div className="bg-slate-200 h-48 rounded-lg my-4 flex items-center justify-center border-2 border-slate-300 border-dashed">
                                        <span className="text-slate-400 font-bold uppercase text-sm">Desenhe o Herói</span>
                                    </div>

                                    {/* Attributes */}
                                    <div className="space-y-3 mb-4">
                                        {[
                                            { label: t.attrFaith, val: activity.characterCard.attributes.faith, color: "bg-blue-500" },
                                            { label: t.attrCourage, val: activity.characterCard.attributes.courage, color: "bg-red-500" },
                                            { label: t.attrWisdom, val: activity.characterCard.attributes.wisdom, color: "bg-purple-500" }
                                        ].map((attr, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <span className="text-xs font-bold w-16 text-slate-600 uppercase">{attr.label}</span>
                                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                                    <div className={`h-full ${attr.color}`} style={{ width: `${attr.val * 10}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-slate-800">{attr.val * 10}%</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Description */}
                                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm text-yellow-900 font-medium leading-tight">
                                        {activity.characterCard.description}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 10. Secret Message Preview (MOVED) */}
                        {activity.secretPhrase && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                                    <span className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-indigo-200 shadow-lg">10</span>
                                    {t.activitySecret}
                                </h3>
                                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                                    {/* Key */}
                                    <div className="flex flex-wrap gap-2 justify-center mb-8 bg-white p-4 rounded-xl border border-indigo-100">
                                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Z'].map(char => (
                                            <div key={char} className="flex flex-col items-center">
                                                <span className="text-xs text-indigo-400 font-bold mb-1">{char}</span>
                                                <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xs shadow-sm">
                                                    ★
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Puzzle */}
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {activity.secretPhrase.split('').map((char, idx) => (
                                            char === ' ' ? <div key={idx} className="w-8"></div> :
                                                <div key={idx} className="flex flex-col items-center gap-2">
                                                    <div className="w-10 h-10 bg-white rounded-xl border-2 border-indigo-200 flex items-center justify-center text-indigo-500 shadow-sm">
                                                        ★
                                                    </div>
                                                    <div className="w-8 h-0.5 bg-indigo-300"></div>
                                                </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 text-center">
                                        <p className="text-sm text-indigo-400 font-bold uppercase tracking-wider bg-white inline-block px-4 py-2 rounded-full border border-indigo-100">
                                            {t.wordSearchFind}: <span className="text-indigo-800">{activity.secretPhrase}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 11. News Flash Preview */}
                        {activity.newsFlash && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                                    <span className="bg-stone-500 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-stone-200 shadow-lg">11</span>
                                    {t.activityNews}
                                </h3>
                                <div className="bg-stone-100 p-6 rounded-xl border border-stone-300 shadow-xl max-w-md mx-auto">
                                    <div className="border-b-4 border-black pb-2 mb-4 text-center">
                                        <h4 className="font-serif text-3xl font-black uppercase text-stone-900 tracking-tighter">{activity.newsFlash.title}</h4>
                                        <div className="flex justify-between text-[10px] uppercase font-bold text-stone-500 mt-1 border-t border-black pt-1">
                                            <span>Edição Especial</span>
                                            <span>Preço: 1 Denário</span>
                                        </div>
                                    </div>

                                    <h5 className="font-serif text-2xl font-bold leading-tight text-stone-800 mb-4 text-center">
                                        "{activity.newsFlash.headline}"
                                    </h5>

                                    <div className="flex gap-4">
                                        <div className="w-1/2 h-32 bg-white border-2 border-stone-300 flex items-center justify-center text-center p-2">
                                            <span className="text-xs text-stone-400 font-bold uppercase">{t.newsDraw}</span>
                                        </div>
                                        <div className="w-1/2 flex flex-col gap-2">
                                            <div className="h-1 bg-stone-300 w-full"></div>
                                            <div className="h-1 bg-stone-300 w-full"></div>
                                            <div className="h-1 bg-stone-300 w-full"></div>
                                            <div className="h-1 bg-stone-300 w-full"></div>
                                            <div className="h-1 bg-stone-300 w-3/4"></div>
                                            <p className="text-[10px] text-stone-500 mt-2 leading-tight italic">{activity.newsFlash.instructions}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 12. Family Questions Preview */}
                        {activity.familyQuestions && activity.familyQuestions.length > 0 && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                                    <span className="bg-pink-500 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-pink-200 shadow-lg">12</span>
                                    {t.activityFamily}
                                </h3>
                                <div className="space-y-4">
                                    {activity.familyQuestions.map((q, idx) => (
                                        <div key={idx} className="bg-pink-50 p-6 rounded-2xl border border-pink-100 flex gap-4 items-start">
                                            <div className="w-8 h-8 bg-white text-pink-500 rounded-full flex items-center justify-center font-bold shadow-sm shrink-0 mt-0.5">
                                                ?
                                            </div>
                                            <p className="text-slate-700 font-medium text-lg leading-relaxed">{q}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 13. Verse to Memorize Preview */}
                        {activity.bibleVerse && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                                    <span className="bg-purple-500 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-purple-200 shadow-lg">13</span>
                                    {t.activity7}
                                </h3>
                                <div className="bg-white border-2 border-purple-400 p-4 rounded-2xl flex items-center gap-4">
                                    <div className="bg-purple-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold">★</div>
                                    <p className="text-purple-800 italic font-medium text-lg flex-1">{activity.bibleVerse}</p>
                                </div>
                            </div>
                        )}

                        {/* 14. Labirinto Preview */}
                        {activity.maze && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                                    <span className="bg-purple-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-purple-200 shadow-lg">14</span>
                                    {t.activityMaze}
                                </h3>
                                <div className="bg-white border-4 border-slate-200 rounded-[2rem] p-8 shadow-inner overflow-hidden">
                                    <p className="text-center font-bold text-purple-700 mb-8 text-xl uppercase tracking-wide">
                                        ✨ {activity.maze.instructions} ✨
                                    </p>

                                    <div className="flex flex-col items-center gap-8">
                                        {/* Maze Visual Placeholder with Start/End Images - Vertical Aspect */}
                                        <div className="relative w-full aspect-[2/3] max-w-[400px] border-2 border-slate-100 rounded-3xl p-4 flex items-center justify-center bg-slate-50">
                                            {/* Start Image */}
                                            <div className="absolute -top-4 -left-4 w-32 h-32 bg-white border-2 border-slate-200 rounded-2xl shadow-lg p-2 z-10 rotate-[-5deg] flex flex-col items-center">
                                                <div className="w-full h-full bg-slate-50 rounded-xl flex items-center justify-center border border-dashed border-slate-300 overflow-hidden">
                                                    {(activity as any).mazeStartImage ?
                                                        <img src={(activity as any).mazeStartImage} className="w-full h-full object-contain" /> :
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase text-center">Início (A)</span>
                                                    }
                                                </div>
                                            </div>

                                            {/* End Image */}
                                            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white border-2 border-slate-200 rounded-2xl shadow-lg p-2 z-10 rotate-[5deg] flex flex-col items-center">
                                                <div className="w-full h-full bg-slate-50 rounded-xl flex items-center justify-center border border-dashed border-slate-300 overflow-hidden">
                                                    {(activity as any).mazeEndImage ?
                                                        <img src={(activity as any).mazeEndImage} className="w-full h-full object-contain" /> :
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase text-center">Fim (B)</span>
                                                    }
                                                </div>
                                            </div>

                                            {/* Maze Grid Simulation Extreme Vertical */}
                                            <div className="grid grid-cols-20 grid-rows-30 gap-[1px] w-full h-full opacity-20">
                                                {Array.from({ length: 20 * 30 }).map((_, i) => (
                                                    <div key={i} className="border-[0.5px] border-slate-300 rounded-sm bg-white"></div>
                                                ))}
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <p className="font-mono text-slate-300 font-black text-4xl transform rotate-[-15deg] select-none">LABIRINTO</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-center text-slate-400 mt-8 text-sm font-bold uppercase tracking-widest">(Visualização simplificada - O labirinto completo está no PDF)</p>
                                </div>
                            </div>
                        )}

                        {/* Coloring Image Preview (previously 16, now 15) */}
                        {coloringImageUrl && (
                            <div className="mt-8">
                                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                                    <span className="bg-purple-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-purple-200 shadow-lg">15</span>
                                    {t.coloringTitle}
                                </h3>
                                <div className="border-4 border-dashed border-slate-300 rounded-3xl p-6 flex justify-center bg-white">
                                    <img src={coloringImageUrl} alt="Para colorir" className="max-w-full h-auto shadow-2xl rounded-xl transform rotate-1 hover:rotate-0 transition-transform duration-500" />
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
