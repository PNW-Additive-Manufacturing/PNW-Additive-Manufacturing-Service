cd apps/website
call npm run build
cd ..
move website/out . core/api/wwwroot
cd core/api
call dotnet run