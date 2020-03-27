#!/usr/bin/env bash

source /usr/local/src/stdmatt/shellscript_utils/main.sh



SCRIPT_DIR="$(pw_get_script_dir)";
PROJECT_ROOT="$(pw_abspath "${SCRIPT_DIR}/..")";
PROJ_REPOS_DIR="${PROJECT_ROOT}/_project_repos";
OUTPUT_DIR="${PROJECT_ROOT}/_output/deploy";
RULES_DIR="${SCRIPT_DIR}/deploy_rules";

PROJECTS=" \
    demos/metaballs    \
    demos/simple_clock \
    demos/simple_tree  \
    demos/starfield    \
           \
    games/color_grid   \
    games/nuclear_rain \
    games/kaboom       \
    games/ramit        \
";



gitlab_url()
{
    echo "https://gitlab.com/stdmatt-${1}";
}



update_project_to_latest_tag()
{
    local PROJECT="$1";
    local PROJECT_PATH="${PROJ_REPOS_DIR}/$PROJECT";
    local PROJECT_OUTPUT_PATH="${OUTPUT_DIR}/${PROJECT}";

    pw_pushd "$PROJECT_PATH";

    ## Fetch...
    git fetch --tags;

    ## Grab the latest tag.
    local TAG=$(git describe --tags $(git rev-list --tags --max-count=1) 2> /dev/null);
    test -z "$TAG" \
        && pw_log_fatal "$(pw_FC "$PROJECT") has no version on git - Aborting...";

    pw_func_log "$(pw_FC "$PROJECT") Version: $(pw_FM "($TAG)")";

    ## Go to the latest version.
    git checkout $TAG

    ## Build.
    pw_func_log "$(pw_FC "$PROJECT")$(pw_FM "($TAG)") - $(pw_FB Building...)";
    ./scripts/build.sh --dist;

    ## Move to the ouput...
    mkdir -p    "$PROJECT_OUTPUT_PATH";
    mv ./dist/* "$PROJECT_OUTPUT_PATH";

    ## Deploy...
    pw_func_log "$(pw_FC "$PROJECT")$(pw_FM "($TAG)") - $(pw_FB Deploying...)";
    local PROJECT_NAME="$(basename "$PROJECT")";

    ## Project has some special deployment rules...
    if [ -f "${RULES_DIR}/${PROJECT_NAME}.sh" ]; then
        "${RULES_DIR}/${PROJECT_NAME}.sh"
    ## Project has not special deploymetn steps... It's just unzip and fun!!!
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
    init_repository              "$PROJECT";
    update_project_to_latest_tag "$PROJECT";
done;
