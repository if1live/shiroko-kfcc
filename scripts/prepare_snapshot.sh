#!/bin/bash

set -exuo pipefail

rm -rf output
mkdir output

# 로컬에서 삽질할때는 재현하기 쉽게 하려고 cp
# cp -r packages/cli/data_rate output/details
# cp -r packages/cli/data_summary output/summary

# CI안에서는 임시 파일 사라져도 상관없으니까 mv
mv packages/cli/data_rate output/details
mv packages/cli/data_summary output/summary
