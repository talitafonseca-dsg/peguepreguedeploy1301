@echo off
echo ===================================================
echo      ENVIANDO CORRECOES VIA GITHUB
echo ===================================================
echo.
echo 1. Adicionando arquivos modificados...
git add .
echo.
echo 2. Salvando alteracoes (commit)...
git commit -m "Correcoes de consistencia e botao refresh"
echo.
echo 3. Enviando para o servidor (push)...
git push origin main
echo.
echo ===================================================
echo Se apareceu "Everything up-to-date" ou o envio completou:
echo O Vercel vai pegar as mudancas automaticamente.
echo Aguarde 2 a 3 minutos e atualize o site.
echo ===================================================
pause
