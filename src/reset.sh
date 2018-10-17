#!/bin/bash
if [ -z $1 ]; then
	echo "there is no parameter"
	rm -rf blocks/*
else 
	last=`ls blocks | grep blk | tail -n 1 | cut -d'.' -f1`
	#echo "remove blocks $1 ~ $last"
	#for i in {$1..$last}
	#do
	#	echo rm -f blocks/$i.blk
	#done
	for ((i=$1;i<=$last;i++)); do rm -f blocks/$i.blk; done
fi
#rm -rf blocks/*
killall node
killall "tail"
node server.js > ../../server.log &
node mobileFront.js > ../../mobileFront.log &
tail -f ../../server.log &
tail -f ../../mobileFront.log &
