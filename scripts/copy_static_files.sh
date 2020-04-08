#!/usr/bin/env bash
source /usr/local/src/stdmatt/shellscript_utils/main.sh


SCRIPT_DIR="$(pw_get_script_dir)";
PROJECT_ROOT="$(pw_abspath "${SCRIPT_DIR}/..")";
OUTPUT_DIR="${PROJECT_ROOT}/_output";


mkdir -p "${OUTPUT_DIR}";

##
## Process the files.
cd "${PROJECT_ROOT}";

cp -vr ./img "${OUTPUT_DIR}";
cp -vr ./css "${OUTPUT_DIR}";
