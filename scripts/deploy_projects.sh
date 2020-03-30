#!/usr/bin/env bash

source /usr/local/src/stdmatt/shellscript_utils/main.sh



SCRIPT_DIR="$(pw_get_script_dir)";
PROJECT_ROOT="$(pw_abspath "${SCRIPT_DIR}/..")";
PROJ_REPOS_DIR="${PROJECT_ROOT}/_project_repos";
OUTPUT_DIR="${PROJECT_ROOT}/_output/deploy";
BUILD_RULES_DIR="${SCRIPT_DIR}/build_rules";
DEPLOY_RULES_DIR="${SCRIPT_DIR}/deploy_rules";

    # demos/metaballs    \
    # demos/simple_clock \
    # demos/simple_tree  \
    # demos/starfield    \
    #        \
    # games/color_grid   \
    # games/nuclear_rain \
    # games/simple_snake \
    #        \
    # games/old_old_old_games/kaboom \
    # games/old_old_old_games/ramit  \
PROJECTS=" \
    games/old_old_old_games/taz    \
";


gitlab_url()
{
    echo "https://gitlab.com/stdmatt-${1}";
}



deploy_project()
{
    local PROJECT="$1";
    local PROJECT_PATH="${PROJ_REPOS_DIR}/$PROJECT";
    local PROJECT_OUTPUT_PATH="${OUTPUT_DIR}/${PROJECT}";

    pw_pushd "$PROJECT_PATH";

    ##
    ## Fetch...
    git fetch --tags;

    ##
    ## Grab the latest tag.
    local TAG=$(git describe --tags $(git rev-list --tags --max-count=1) 2> /dev/null);
    test -z "$TAG" \
        && pw_log_fatal "$(pw_FC "$PROJECT") has no version on git - Aborting...";

    pw_func_log "$(pw_FC "$PROJECT") Version: $(pw_FM "($TAG)")";

    ##
    ## Go to the latest version.
    git checkout $TAG
    git submodule update --init --recursive;


    local PROJECT_NAME="$(basename "$PROJECT")";

    ##
    ## Build.
    pw_func_log "$(pw_FC "$PROJECT")$(pw_FM "($TAG)") - $(pw_FB Building...)";

    ## Project has some special build rules...
    if [ -f "${BUILD_RULES_DIR}/${PROJECT_NAME}.sh" ]; then
        "${BUILD_RULES_DIR}/${PROJECT_NAME}.sh"
    ## Project has not special build steps...
    else
        ./scripts/build.sh --dist;
    fi;


    ##
    ## Move build artifacts to the output...
    mkdir -p    "$PROJECT_OUTPUT_PATH";
    find ./dist -maxdepth 1 -type f -exec mv {} "$PROJECT_OUTPUT_PATH" \;

    ##
    ## Deploy...
    pw_func_log "$(pw_FC "$PROJECT")$(pw_FM "($TAG)") - $(pw_FB Deploying...)";

    ## Project has some special deployment rules...
    if [ -f "${DEPLOY_RULES_DIR}/${PROJECT_NAME}.sh" ]; then
        "${DEPLOY_RULES_DIR}/${PROJECT_NAME}.sh"
    ## Project has not special deployment steps... It's just unzip and fun!!!
    else
        pw_pushd "$PROJECT_OUTPUT_PATH"
            unzip -o *.zip
        pw_popd;
    fi;

    pw_popd;
}

init_repository()
{
    local PROJECT="$1";
    local PROJECT_PATH="${PROJ_REPOS_DIR}/$PROJECT";

    test -d "$PROJECT_PATH" && return;
    pw_func_log "$(pw_FW Cloning Project: $(pw_FC "$PROJECT"))";
    git clone "$(gitlab_url $PROJECT)" "$PROJECT_PATH";
}

mkdir -p "${PROJ_REPOS_DIR}";
mkdir -p "${OUTPUT_DIR}";

for PROJECT in $PROJECTS; do
    echo "Deploying project: ($(pw_FG $PROJECT))";
    init_repository "$PROJECT";
    deploy_project  "$PROJECT";
done;
