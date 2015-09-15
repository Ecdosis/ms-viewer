#!/bin/bash
md=$1
if [ -z "$md" ]; then
    echo "usage: ./upload-one.sh <metadata-file>"
else
    cont=`cat $md`
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
fi
