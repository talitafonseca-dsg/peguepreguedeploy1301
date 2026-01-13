
import React from 'react';
import { ActivityContent } from '../types';
import { ICONS } from '../constants';

interface ActivityPreviewProps {
    activity: ActivityContent;
    coloringImageUrl: string | null;
    onDownload: () => void;
    onClose: () => void;
    isDownloading: boolean;
}

export const ActivityPreview: React.FC<ActivityPreviewProps> = ({
    activity,
    coloringImageUrl,
    onDownload,
    onClose,
    isDownloading
}) => {
    return (
        <div className="w-full max-w-4xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">

            <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl overflow-hidden border-4 border-slate-100 dark:border-slate-700">

                {/* Header Section */}
                <div className="bg-purple-100 dark:bg-purple-900/30 p-8 border-b border-purple-200 dark:border-purple-800 flex flex-col md:flex-row items-center justify-between gap-6">
                    <h3 className="text-3xl font-black text-purple-800 dark:text-purple-200 flex items-center gap-3">
                        <span className="text-4xl">📝</span> Prévia da Atividade
                    </h3>

                    <button
                        onClick={onDownload}
                        disabled={isDownloading}
                        className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-purple-200 dark:shadow-none transition-transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? <span className="animate-spin text-xl">⏳</span> : <ICONS.Download className="w-6 h-6" />}
                        <span>Baixar PDF da Atividade</span>
                    </button>
                </div>

                {/* Scrollable Content (Simulating A4) */}
                <div className="p-8 md:p-12 bg-slate-50 dark:bg-slate-900/50 flex justify-center">
                    <div className="bg-white text-slate-900 w-full max-w-[210mm] shadow-xl p-8 md:p-16 rounded-xl border border-slate-200">
                        {/* Page Header */}
                        <div className="border-b-4 border-purple-500 pb-6 mb-10 text-center">
                            <h1 className="text-4xl font-black text-purple-600 mb-4 uppercase tracking-tight">Atividades Bíblicas</h1>
                            <div className="flex flex-col sm:flex-row justify-between text-base text-slate-400 mt-6 border-t-2 border-slate-100 pt-4 font-mono">
                                <span>Nome: ___________________________________</span>
                                <span>Data: ___/___/___</span>
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
                                Responda:
                            </h3>
                            <div className="space-y-8">
                                {((activity.quiz && activity.quiz.length > 0) ? activity.quiz : [
                                    {
                                        question: "Qual o principal ensinamento de fé desta história?",
                                        options: ["Confiar sempre em Deus", "Desistir quando for difícil", "Fazer tudo sozinho"]
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
                                    <span className="bg-purple-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-purple-200 shadow-lg">2</span>
                                    Complete a frase:
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
                                Caça-Palavras:
                            </h3>
                            <div className="bg-slate-100 p-8 rounded-3xl text-center">
                                <p className="text-base font-bold text-slate-600 mb-6 uppercase tracking-wider">Encontre: <span className="text-purple-600">{activity.wordSearch?.join(", ")}</span></p>
                                {/* Simplified visual representation */}
                                <div className="inline-grid grid-cols-10 gap-2 font-mono text-lg font-bold opacity-40 select-none pointer-events-none mix-blend-multiply">
                                    {Array.from({ length: 80 }).map((_, i) => (
                                        <span key={i} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm">{String.fromCharCode(65 + Math.floor(Math.random() * 26))}</span>
                                    ))}
                                </div>
                                <p className="text-sm text-slate-400 mt-4 font-bold">(Visualização simplificada da grade)</p>
                            </div>
                        </div>

                        {/* Coloring Image Preview */}
                        {coloringImageUrl && (
                            <div className="mt-8">
                                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
                                    <span className="bg-purple-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-purple-200 shadow-lg">4</span>
                                    Para Colorir:
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
