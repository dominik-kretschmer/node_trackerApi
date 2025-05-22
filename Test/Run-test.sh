#!/usr/bin/env bash
set -uo pipefail

echo '#########################################################################'
./run-curls.sh
result="$(node ./checkExpected.js)"
echo "$result"
echo '#########################################################################'
