#!/bin/bash

set -exuo pipefail

# https://unix.stackexchange.com/a/330326
export TZ="Etc/GMT-9"
current_datetime=$(date --iso-8601=seconds)
echo $current_datetime

pushd ./packages/frontend/dist

sed "s/__MODIFIED_TIME_ISO__/$current_datetime/g" index.html > index.next.html
mv index.next.html index.html

popd
