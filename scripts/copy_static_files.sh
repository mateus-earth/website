#!/usr/bin/env bash
source "$HOME/.ark/ark_shlib/main.sh";

##
## Vars
##
SCRIPT_DIR="$(ark_get_script_dir)";
PROJECT_ROOT="$(ark_get_abspath "${SCRIPT_DIR}/..")";
OUTPUT_DIR="${PROJECT_ROOT}/_output";

echo "Copying static files...";

##
## Ensure that output dir.
mkdir -p "${OUTPUT_DIR}";

##
## Process the files.
cd "${PROJECT_ROOT}";

cp -vr ./img   "${OUTPUT_DIR}";
cp -vr ./css   "${OUTPUT_DIR}";
cp -vr ./fonts "${OUTPUT_DIR}";
