
// Test script para diagnosticar o erro 404 do Gemini API
// Execute com: node test_gemini.mjs

import { GoogleGenerativeAI } from '@google/generative-ai';

// Cole sua chave API aqui para testar diretamente:
const API_KEY = 'AIzaSyC-wlxIkjt-IhojF1pRcvOxqe9gXMt_NFY';

async function testGeminiConnection() {
    console.log('🔍 Iniciando diagnóstico da API Gemini...\n');

    if (API_KEY === 'AIzaSyC-wlxIkjt-IhojF1pRcvOxqe9gXMt_NFY') {
        console.error('❌ ERRO: Você precisa colar sua chave API na linha 7 deste arquivo!');
        return;
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    // Lista de modelos para testar
    const modelsToTest = [
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash',
        'gemini-1.5-pro-latest',
        'gemini-1.5-pro',
        'gemini-pro',
        'models/gemini-1.5-flash-latest',
        'models/gemini-1.5-pro-latest',
    ];

    console.log('📋 Testando acesso aos modelos...\n');

    for (const modelName of modelsToTest) {
        try {
            console.log(`  ⏳ Testando: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Diga apenas "OK"');
            const text = result.response.text();
            console.log(`  ✅ ${modelName}: FUNCIONOU! Resposta: "${text.trim()}"\n`);
            console.log('\n🎉 SUCESSO! Este modelo funciona. Use este nome no código:');
            console.log(`   model: "${modelName}"\n`);
            return; // Para no primeiro que funcionar
        } catch (error) {
            const errMsg = error.message || String(error);
            if (errMsg.includes('404')) {
                console.log(`  ❌ ${modelName}: 404 - Modelo não encontrado`);
            } else if (errMsg.includes('401') || errMsg.includes('API key')) {
                console.log(`  ❌ ${modelName}: Chave API inválida ou sem permissões`);
            } else if (errMsg.includes('403')) {
                console.log(`  ❌ ${modelName}: Acesso negado (verifique quota e billing)`);
            } else {
                console.log(`  ❌ ${modelName}: Erro - ${errMsg.substring(0, 80)}...`);
            }
        }
    }

    console.log('\n');
    console.log('❌ NENHUM MODELO FUNCIONOU!');
    console.log('');
    console.log('🔧 POSSÍVEIS SOLUÇÕES:');
    console.log('   1. Verifique se a chave foi criada em https://aistudio.google.com/app/apikey');
    console.log('   2. Certifique-se de que "Generative Language API" está ATIVA no projeto da chave');
    console.log('   3. Se criou a chave no Google Cloud Console, talvez precise usar o AI Studio');
    console.log('   4. Verifique se o projeto tem faturamento (billing) configurado');
    console.log('');
}

testGeminiConnection();
