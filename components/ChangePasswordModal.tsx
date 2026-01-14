import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Validações
        if (newPassword.length < 6) {
            setError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) {
                setError('Erro ao alterar senha: ' + updateError.message);
            } else {
                setSuccess(true);
                setNewPassword('');
                setConfirmPassword('');
                // Fechar modal após 2 segundos
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                }, 2000);
            }
        } catch (err: any) {
            setError('Erro inesperado: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 border-t-8 border-blue-500 animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white text-2xl font-bold"
                >
                    ×
                </button>

                <div className="text-center mb-6">
                    <span className="text-5xl mb-4 block">🔒</span>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">Alterar Senha</h2>
                    <p className="text-slate-500 mt-2 text-sm">Digite sua nova senha abaixo</p>
                </div>

                {success ? (
                    <div className="text-center py-8">
                        <span className="text-6xl block mb-4">✅</span>
                        <p className="text-green-600 font-bold text-lg">Senha alterada com sucesso!</p>
                    </div>
                ) : (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Nova Senha
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Confirmar Nova Senha
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="Repita a nova senha"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-bold">
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin">⏳</span> Alterando...
                                </span>
                            ) : (
                                'Alterar Senha'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-2 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            Cancelar
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
