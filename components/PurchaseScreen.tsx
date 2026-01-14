import React from 'react';
import { ICONS } from '../constants';

interface PurchaseScreenProps {
    userEmail: string;
    onRefresh: () => void;
    checkoutUrl?: string;
}

export const PurchaseScreen: React.FC<PurchaseScreenProps> = ({ userEmail, onRefresh }) => {
    // Links oficiais Assiny
    const ANNUAL_URL = `https://pay.assiny.com.br/a717bc/node/LhRmiW?email=${encodeURIComponent(userEmail)}`;
    const LIFETIME_URL = `https://pay.assiny.com.br/c10ee5/node/8Mgfhz?email=${encodeURIComponent(userEmail)}`;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6] dark:bg-slate-900 p-4 relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <ICONS.Star className="absolute top-20 left-[10%] w-24 h-24 text-yellow-400 animate-spin-slow" />
                <ICONS.Heart className="absolute bottom-20 right-[10%] w-32 h-32 text-pink-500 animate-pulse" />
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 md:p-14 rounded-[3rem] shadow-2xl max-w-2xl w-full text-center border-t-8 border-purple-500 relative z-10">

                <div className="flex justify-center mb-8">
                    <span className="text-6xl animate-bounce">🔒</span>
                </div>

                <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-6 tracking-tight">
                    Acesso Exclusivo
                </h1>

                <p className="text-slate-500 dark:text-slate-300 text-lg mb-8 leading-relaxed">
                    Olá <b>{userEmail}</b>!<br />
                    Para acessar o criador de histórias mágicas, escolha seu plano:
                </p>

                <div className="space-y-4">
                    {/* Plano Vitalício - Destaque */}
                    <a
                        href={LIFETIME_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-5 rounded-[2rem] font-black text-xl shadow-xl transition-transform hover:-translate-y-1 active:scale-95 border-b-4 border-orange-700 relative overflow-hidden"
                    >
                        <span className="absolute top-0 right-0 bg-red-600 text-white text-xs px-3 py-1 rounded-bl-xl font-bold">MELHOR OPÇÃO</span>
                        <div className="flex flex-col items-center">
                            <span>👑 VITALÍCIO - R$ 197</span>
                            <span className="text-sm font-normal opacity-90">Acesso para sempre, uma única vez!</span>
                        </div>
                    </a>

                    {/* Plano Anual */}
                    <a
                        href={ANNUAL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-5 rounded-[2rem] font-black text-xl shadow-xl transition-transform hover:-translate-y-1 active:scale-95 border-b-4 border-blue-800"
                    >
                        <div className="flex flex-col items-center">
                            <span>📅 ANUAL - R$ 97</span>
                            <span className="text-sm font-normal opacity-90">Acesso por 12 meses</span>
                        </div>
                    </a>

                    <div className="flex items-center gap-4 my-6">
                        <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                        <span className="text-slate-400 text-sm font-bold uppercase">Já comprou?</span>
                        <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                    </div>

                    <button
                        onClick={onRefresh}
                        className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-200 py-4 rounded-[2rem] font-black text-lg transition-colors border-2 border-slate-200 dark:border-slate-600"
                    >
                        🔄 Verificar meu pagamento
                    </button>
                </div>

                <p className="mt-8 text-xs text-slate-400 dark:text-slate-500 font-bold max-w-sm mx-auto">
                    Ao comprar, use o MESMO email ({userEmail}) no checkout para liberar seu acesso automaticamente.
                </p>

            </div>
        </div>
    );
};
