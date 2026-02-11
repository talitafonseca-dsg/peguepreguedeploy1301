import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface ApiKeyScreenProps {
    onKeySaved: (key: string) => void;
    onDemoMode: () => void;
    isEligibleForDemo: boolean;
}

export const ApiKeyScreen: React.FC<ApiKeyScreenProps> = ({ onKeySaved, onDemoMode, isEligibleForDemo }) => {
    const [key, setKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSaveKey = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!key.startsWith('AIza')) {
            setError('A chave parece inválida. Ela geralmente começa com "AIza".');
            setLoading(false);
            return;
        }

        const { error: dbError } = await supabase
            .from('profiles')
            .update({ gemini_api_key: key })
            .eq('id', (await supabase.auth.getUser()).data.user?.id);

        if (dbError) {
            setError('Erro ao salvar chave: ' + dbError.message);
        } else {
            onKeySaved(key);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl max-w-md w-full border-t-8 border-yellow-400">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">🔑</span>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">Configure sua Chave</h2>
                    <p className="text-slate-500 mt-2">Para usar o gerador, você precisa inserir sua própria chave da API do Google Gemini.</p>
                </div>

                <form onSubmit={handleSaveKey} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Chave API Gemini</label>
                        <input
                            type="text"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:border-yellow-500 focus:outline-none transition-colors"
                            placeholder="Cole sua chave aqui (AIza...)"
                        />
                        <p className="text-xs text-slate-400 mt-2">
                            Não tem uma chave? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline hover:text-purple-700">Gere uma gratuitamente aqui</a>.
                        </p>

                        {/* Botão de Tutorial em Vídeo */}
                        <a
                            href="https://youtu.be/amstkQD4Lgg"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                            📺 Não sabe como? Veja o Tutorial em Vídeo
                        </a>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-yellow-500 text-slate-900 py-3 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-200 dark:shadow-none disabled:opacity-50"
                    >
                        {loading ? 'Validando...' : 'Salvar e Continuar'}
                    </button>

                    {/* Botão de Suporte WhatsApp */}
                    <a
                        href="https://wa.me/5531999982884?text=Preciso%20de%20suporte%20para%20o%20Pegue%20%26%20Pregue"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        💬 Precisa de ajuda? Suporte via WhatsApp
                    </a>

                    {isEligibleForDemo && (
                        <div className="bg-purple-50 dark:bg-purple-900/30 p-5 rounded-2xl border-2 border-purple-100 dark:border-purple-800 text-center">
                            <p className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-3">
                                ✨ Você tem 10 dias de acesso cortesia!
                            </p>
                            <button
                                type="button"
                                onClick={onDemoMode}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-black transition-all transform hover:scale-105 shadow-lg"
                            >
                                Começar em Modo Cortesia
                            </button>
                            <p className="text-[10px] text-purple-400 mt-2">
                                Limite de 3 histórias por dia. Gerado pela nossa chave.
                            </p>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => supabase.auth.signOut()}
                        className="w-full py-2 text-sm text-slate-400 hover:text-red-500 transition-colors"
                    >
                        Sair da conta
                    </button>
                </form>
            </div>
        </div>
    );
};
