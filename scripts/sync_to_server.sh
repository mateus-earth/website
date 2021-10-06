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
rsync -azP "${OUTPUT_DIR}/" stdmatt@stdmatt.com:/home/stdmatt/this_www/stdmatt.com
