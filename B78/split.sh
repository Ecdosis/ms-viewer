#!/bin/bash
for f in *.jpg
  do
    convert -crop 50%x100% $f +repage $f
  done
