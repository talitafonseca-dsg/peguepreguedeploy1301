import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface ApiKeyScreenProps {
    onKeySaved: (key: string) => void;
}

export const ApiKeyScreen: React.FC<ApiKeyScreenProps> = ({ onKeySaved }) => {
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
