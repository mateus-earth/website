#!/usr/bin/env bash

source "$HOME/.ark/ark_shlib/main.sh";

##
## Vars
##
SCRIPT_DIR="$(ark_get_script_dir)";

##
## Script
##
## @todo(stdmatt): Improve the script to accept what we want to build...
${SCRIPT_DIR}/generate_html_files.sh
${SCRIPT_DIR}/copy_static_files.sh
