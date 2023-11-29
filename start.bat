:: remove old files
rmdir apps\core\api\wwwroot /s /q
md apps\core\api\wwwroot
:: build front-end
cd apps\website
call npm run build

if %errorlevel% == 0 (
    :: copy front-end into server
    cd ..
    robocopy website\out core\api\wwwroot /S /MOV
    :: run server
    cd core\api
    call dotnet run
)