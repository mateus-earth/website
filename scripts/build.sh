#!/usr/bin/env bash

source /usr/local/src/stdmatt/shellscript_utils/main.sh

SCRIPT_DIR="$(pw_get_script_dir)";

## @todo(stdmatt): Improve the script to accept what we want to build...
${SCRIPT_DIR}/generate_html_files.sh
${SCRIPT_DIR}/copy_static_files.sh
