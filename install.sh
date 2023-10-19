echo Installing packages via Yarn.

yarn install
cd ./apps
cd ./commissions && yarn install
cd .. && cd ./maintainer && yarn install