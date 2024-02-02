#!/bin/bash
nginx -g "daemon on;"
echo 'Instalando dependencias...';
npm i --force;
echo 'Contruyendo la app...';
npm run build:export;
rm -r /usr/share/nginx/html/*
cp -R /src/out/* /usr/share/nginx/html/;
echo '-----------------------TERMINÓ LA EJECUCIÓN----------------------------';
tail -f /dev/null