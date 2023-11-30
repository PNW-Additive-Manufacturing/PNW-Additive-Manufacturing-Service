#!/bin/bash

rm -rf apps/core/api/wwwroot
mkdir apps/core/api/wwwroot

cd apps/website
npm run build

cd ..
rsync -vr --delete website/out/ core/api/wwwroot

cd core/api
dotnet run
