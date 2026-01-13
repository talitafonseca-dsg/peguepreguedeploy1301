
// Test REST API direto (sem SDK)
// Execute com: node test_rest.mjs

const API_KEY = 'AIzaSyC-wlxIkjt-IhojF1pRcvOxqe9gXMt_NFY';

async function testRestAPI() {
    console.log('🔍 Testando API REST direta (sem SDK)...\n');

    // Primeiro, listar os modelos disponíveis
    console.log('1️⃣ Listando modelos disponíveis para sua chave...\n');

    try {
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const listResponse = await fetch(listUrl);
        const listData = await listResponse.json();

        if (listData.error) {
            console.log('❌ Erro ao listar modelos:', listData.error.message);
            console.log('   Código:', listData.error.code);
            console.log('   Status:', listData.error.status);

            if (listData.error.code === 403) {
                console.log('\n⚠️  PROBLEMA: Sua chave está bloqueada ou a API não está ativada.');
                console.log('   Acesse: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
                console.log('   E clique em ATIVAR para o projeto da sua chave.');
            }
            return;
        }

        if (listData.models && listData.models.length > 0) {
            console.log('✅ Modelos disponíveis para sua conta:\n');
            listData.models.forEach(m => {
                console.log(`   - ${m.name} (${m.displayName})`);
            });

            // Testar geração com o primeiro modelo disponível
            const firstModel = listData.models[0].name;
            console.log(`\n2️⃣ Testando geração com: ${firstModel}...\n`);

            const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${firstModel}:generateContent?key=${API_KEY}`;
            const generateResponse = await fetch(generateUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'Diga apenas OK' }] }]
                })
            });
            const generateData = await generateResponse.json();

            if (generateData.error) {
                console.log('❌ Erro na geração:', generateData.error.message);
            } else if (generateData.candidates) {
                const text = generateData.candidates[0]?.content?.parts?.[0]?.text;
                console.log(`✅ SUCESSO! Resposta: "${text}"`);
                console.log('\n🎉 Sua API está funcionando! O problema pode ser o SDK.');
            }
        } else {
            console.log('❌ Nenhum modelo disponível para esta chave.');
            console.log('   Verifique se a "Generative Language API" está ativada.');
        }
    } catch (err) {
        console.log('❌ Erro de conexão:', err.message);
    }
}

testRestAPI();
