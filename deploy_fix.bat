@echo off
echo ===================================================
echo      INICIANDO DEPLOY TOTAL (LIMPEZA PROFUNDA)
echo ===================================================
echo.
echo 1. Removendo node_modules e package-lock (para corrigir erros)...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo.
echo 2. Reinstalando dependencias (pode demorar um pouco)...
call npm install --legacy-peer-deps
echo.
echo 3. Forcando deploy para PRODUCAO...
echo.
call npx vercel --prod --legacy-peer-deps --yes
echo.
echo ===================================================
echo Se aparecer SUCCESS acima, o deploy funcionou!
echo Agora aguarde 1 minuto para o site atualizar.
echo.
echo DICA: Abra o site em ABA ANONIMA para ver as mudancas.
echo ===================================================
pause
