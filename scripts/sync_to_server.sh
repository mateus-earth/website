#!/usr/bin/env bash


source /usr/local/src/stdmatt/shellscript_utils/main.sh

SCRIPT_DIR="$(pw_get_script_dir)";
PROJECT_ROOT="$(pw_abspath "${SCRIPT_DIR}/..")";
OUTPUT_DIR="${PROJECT_ROOT}/_output";

rsync -azP "${OUTPUT_DIR}/" stdmatt@stdmatt.com:/home/stdmatt/this_www/stdmatt.com
