@echo off
echo Iniciando Deploy com correcao de dependencias...
call npx vercel --prod --legacy-peer-deps --yes
if %errorlevel% neq 0 (
    echo.
    echo Ocorreu um erro. Tentando sem o --yes para voce ver o erro...
    call npx vercel --prod --legacy-peer-deps
)
echo.
echo Processo finalizado.
pause
