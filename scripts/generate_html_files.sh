#!/usr/bin/env bash
source "$HOME/.ark/ark_shlib/main.sh";

##
## Vars
##
SCRIPT_DIR="$(ark_get_script_dir)";
PROJECT_ROOT="$(ark_get_abspath "${SCRIPT_DIR}/..")";
OUTPUT_DIR="${PROJECT_ROOT}/_output";


##
## Script
##
echo "Generating html files...";

mkdir -p "${OUTPUT_DIR}";

cd "${PROJECT_ROOT}";
find . -iname "*.t.html"                        \
    | xargs "${SCRIPT_DIR}/process_t_file.py"   \
        --project-root "${PROJECT_ROOT}"        \
        --output-dir   "${OUTPUT_DIR}";
