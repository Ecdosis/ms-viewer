#!/bin/bash
for f in *.metadata; do
    cont=`cat $f`
    next=0
    docid=""
    for w in $cont; do
        if [ $next -eq 1 ]; then
            docid=${w:1:${#w}-3}
            break
        fi
        if [ $w = "\"docid\":" ]; then
            next=1
        else
            next=0
        fi
    done
    mongo --eval "db.metadata.remove({docid:\"$docid\"})" calliope
    mongo --eval "db.metadata.insert($cont)" calliope
done
