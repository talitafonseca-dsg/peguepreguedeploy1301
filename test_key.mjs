// Teste de chave API Gemini - Lista modelos disponíveis
// Execute: node test_key.mjs SUA_CHAVE_AQUI

const apiKey = process.argv[2];

if (!apiKey) {
    console.log('❌ Uso: node test_key.mjs SUA_CHAVE_API');
    process.exit(1);
}

console.log('🔑 Testando chave:', apiKey.substring(0, 15) + '...');
console.log('');

// Primeiro, listar os modelos disponíveis
console.log('📋 Listando modelos disponíveis...');
const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

try {
    const listResponse = await fetch(listUrl);
    const listData = await listResponse.json();

    if (listResponse.ok && listData.models) {
        console.log('✅ Modelos disponíveis:');
        listData.models.forEach(m => {
            if (m.name.includes('gemini')) {
                console.log(`   - ${m.name} (${m.displayName})`);
            }
        });
        console.log('');

        // Pegar o primeiro modelo gemini disponível
        const geminiModel = listData.models.find(m => m.name.includes('gemini-1.5-flash') || m.name.includes('gemini-pro'));

        if (geminiModel) {
            console.log(`🧪 Testando modelo: ${geminiModel.name}`);

            const testUrl = `https://generativelanguage.googleapis.com/v1beta/${geminiModel.name}:generateContent?key=${apiKey}`;
            const testBody = {
                contents: [{ parts: [{ text: "Diga apenas: Olá!" }] }]
            };

            const testResponse = await fetch(testUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testBody)
            });

            const testData = await testResponse.json();

            if (testResponse.ok) {
                console.log('✅ SUCESSO! A chave funciona!');
                console.log('Resposta:', testData.candidates?.[0]?.content?.parts?.[0]?.text);
            } else {
                console.log('❌ Erro ao gerar:', testData.error?.message);
            }
        }
    } else {
        console.log('❌ Erro ao listar modelos:', listData.error?.message);
        console.log('');
        console.log('💡 Possíveis causas:');
        console.log('   1. A API "Generative Language API" não está habilitada');
        console.log('   2. A chave precisa ser criada em: https://aistudio.google.com/app/apikey');
        console.log('   3. O projeto do Google Cloud pode precisar de billing');
    }
} catch (error) {
    console.log('❌ Erro de conexão:', error.message);
}
