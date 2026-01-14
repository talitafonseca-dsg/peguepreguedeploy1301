import React, { useState } from 'react';
import { supabase } from '../services/supabase';

export const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingReset, setLoadingReset] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError('Erro ao fazer login: ' + error.message);
        }
        setLoading(false);
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            setError('Digite seu e-mail primeiro para recuperar a senha.');
            return;
        }

        setLoadingReset(true);
        setError('');
        setSuccessMessage('');

        try {
            // Verificar se o email existe na tabela profiles (ou seja, se é um comprador)
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('id, email')
                .eq('email', email.trim().toLowerCase())
                .limit(1);

            if (profileError) {
                console.error('Erro ao verificar perfil:', profileError);
                setError('Erro ao verificar cadastro. Tente novamente.');
                setLoadingReset(false);
                return;
            }

            // Se não encontrou o perfil, o usuário não é um comprador
            if (!profiles || profiles.length === 0) {
                setError('Este e-mail não está cadastrado. Você precisa comprar o acesso primeiro.');
                setLoadingReset(false);
                return;
            }

            // Usuário é comprador, enviar email de recuperação
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}`,
            });

            if (resetError) {
                setError('Erro ao enviar email de recuperação: ' + resetError.message);
            } else {
                setSuccessMessage('✅ E-mail de recuperação enviado! Verifique sua caixa de entrada.');
            }
        } catch (err: any) {
            setError('Erro inesperado: ' + err.message);
        } finally {
            setLoadingReset(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl max-w-md w-full border-t-8 border-purple-500">
                <div className="text-center mb-8">
                    <img src="/logo.png" className="w-24 h-auto mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">Bem-vindo!</h2>
                    <p className="text-slate-500">Faça login para acessar o gerador</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:border-purple-500 focus:outline-none transition-colors"
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:border-purple-500 focus:outline-none transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-bold">
                            ⚠️ {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-xl text-sm font-bold">
                            {successMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 dark:shadow-none disabled:opacity-50"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>

                    <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={loadingReset}
                        className="w-full py-2 text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors font-bold disabled:opacity-50"
                    >
                        {loadingReset ? '⏳ Enviando...' : '🔓 Esqueci minha senha'}
                    </button>
                </form>
            </div>
        </div>
    );
};
