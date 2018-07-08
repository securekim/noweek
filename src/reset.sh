#/bin/sh
rm -rf blocks/*
killall node
node server.js > ../../server.log &
node mobileFront.js > ../../mobileFront.log &
tail -f ../../server.log &
tail -f ../../mobileFront.log &
