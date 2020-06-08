#!/usr/bin/env bash

##----------------------------------------------------------------------------##
## Imports                                                                    ##
##----------------------------------------------------------------------------##
source /usr/local/src/stdmatt/shellscript_utils/main.sh


##----------------------------------------------------------------------------##
## Constants                                                                  ##
##----------------------------------------------------------------------------##
SCRIPT_DIR="$(pw_get_script_dir)";
PROJECT_ROOT="$(pw_abspath "${SCRIPT_DIR}/..")";

PROJ_REPOS_DIR="/tmp/project_repos";
BUILD_RULES_DIR="${SCRIPT_DIR}/build_rules";
DEPLOY_RULES_DIR="${SCRIPT_DIR}/deploy_rules";

OUTPUT_DIR="${PROJECT_ROOT}/_output/deploy";

PROJECT_NAME="";
PROJECT_URL="";
PROJECT_TAG="";
PROJECT_PATH="";
PROJECT_OUTPUT_PATH="";

##----------------------------------------------------------------------------##
## Functions                                                                  ##
##----------------------------------------------------------------------------##
##------------------------------------------------------------------------------
show_usage()
{
    echo "Usage:"
    echo "  $0 <project-name> <git-url>";
    exit 1;
}

##------------------------------------------------------------------------------
gitlab_url()
{
    echo "https://gitlab.com/stdmatt-${1}";
}

##------------------------------------------------------------------------------
git_init_repository()
{
    PROJECT_PATH="${PROJ_REPOS_DIR}/$PROJECT_NAME";
    if [ -d "$PROJECT_PATH" ]; then
        pw_func_log "$(pw_FC $PROJECT_NAME) already cloned";
        return;
    fi;

    pw_func_log "$(pw_FW Cloning Project: $(pw_FC $PROJECT_NAME))";
    git clone "$PROJECT_URL" "$PROJECT_PATH";
}

##------------------------------------------------------------------------------
git_go_to_latest_tag()
{
    ## Fetch...
    git fetch --tags;

    ## Grab the latest tag.
    PROJECT_TAG=$(git describe --tags "$(git rev-list --tags --max-count=1)" 2> /dev/null);
    test -z "$PROJECT_TAG" \
        && pw_log_fatal "$(pw_FC "$PROJECT_NAME") has no version on git - Aborting...";

    pw_func_log "$(pw_FC "$PROJECT_NAME") Version: $(pw_FM "($PROJECT_TAG)")";

    ## Go to the latest version.
    git checkout "$PROJECT_TAG";
    git submodule update --init --recursive;
}

##------------------------------------------------------------------------------
build_project()
{
    ## Build.
    pw_func_log \
        "$(pw_FC "$PROJECT_NAME")$(pw_FM "($PROJECT_TAG)") - $(pw_FB Building...)";

    ## Project has some special build rules...
    if [ -f "${BUILD_RULES_DIR}/${PROJECT_NAME}.sh" ]; then
        pw_func_log \
            "$(pw_FC "$PROJECT_NAME")$(pw_FM "($PROJECT_TAG)") - $(pw_FB Has special build rules...)";

        "${BUILD_RULES_DIR}/${PROJECT_NAME}.sh"
        return;
    fi;

    ## Project has not special build steps...
    ./scripts/build.sh --dist;
}

deploy_project()
{
    pw_func_log "$(pw_FC "$PROJECT_NAME")$(pw_FM "($PROJECT_TAG)") - $(pw_FB Deploying...)";

    local ARCHIVE_PATH="${PROJECT_OUTPUT_PATH}/archive";
    local LATEST_PATH="${PROJECT_OUTPUT_PATH}/latest";

    rm -rf   "$LATEST_PATH";
    mkdir -p "$LATEST_PATH";
    mkdir -p "$ARCHIVE_PATH";

    ## Move the artifact to the output directory.
    find ./dist -maxdepth 1 -type f -exec mv {} "$ARCHIVE_PATH" \;

    ## Project has some special deployment rules...
    if [ -f "${DEPLOY_RULES_DIR}/${PROJECT_NAME}.sh" ]; then
        pw_func_log \
            "$(pw_FC "$PROJECT_NAME")$(pw_FM "($PROJECT_TAG)") - $(pw_FB Has special deploy rules...)";

        "${DEPLOY_RULES_DIR}/${PROJECT_NAME}.sh"
        return;
    fi;

    ## Project has not special deployment steps...
    ## It's just unzip and fun!!!
    pw_pushd "$LATEST_PATH"
        unzip -o "${ARCHIVE_PATH}"/*.zip
    pw_popd;

    pw_func_log \
        "$(pw_FC "$PROJECT_NAME")$(pw_FM "($PROJECT_TAG)") - $(pw_FB Deployed at) (${PROJECT_OUTPUT_PATH})";
}


##----------------------------------------------------------------------------##
## Script                                                                     ##
##----------------------------------------------------------------------------##
PROJECT_NAME="$1";
PROJECT_CATEGORY="$2";
PROJECT_URL="$3";
PROJECT_OUTPUT_PATH="${OUTPUT_DIR}/${PROJECT_CATEGORY}/${PROJECT_NAME}";

test -z "$PROJECT_NAME"      && show_usage;
test -z "$PROJECT_CATEGORY"  && show_usage;
test -z "$PROJECT_URL"       && show_usage;

echo "PROJECT_NAME:       $1";
echo "PROJECT_CATEGORY:   $2";
echo "PROJECT_URL:        $3";
echo "PROJECT_OUTPUT_PATH $PROJECT_OUTPUT_PATH";

export PROJECT_NAME;
export PROJECT_CATEGORY;
export PROJECT_URL;
export PROJECT_OUTPUT_PATH;

mkdir -p "${PROJ_REPOS_DIR}"

git_init_repository;
cd "$PROJECT_PATH";
git_go_to_latest_tag;
build_project;
deploy_project;

