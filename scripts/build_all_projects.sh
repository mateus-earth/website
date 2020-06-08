#!/usr/bin/env bash

##----------------------------------------------------------------------------##
## Imports                                                                    ##
##----------------------------------------------------------------------------##
source /usr/local/src/stdmatt/shellscript_utils/main.sh


##----------------------------------------------------------------------------##
## Constants                                                                  ##
##----------------------------------------------------------------------------##
SCRIPT_DIR="$(pw_get_script_dir)";


##----------------------------------------------------------------------------##
## Constants                                                                  ##
##----------------------------------------------------------------------------##
gitlab()
{
    echo "https://gitlab.com/stdmatt-$1";
}

build()
{
    "${SCRIPT_DIR}/build_project.sh" $1 $2 $3;
}


##----------------------------------------------------------------------------##
## Constants                                                                  ##
##----------------------------------------------------------------------------##
build metaballs    demos $(gitlab demos/metaballs);
build simple_clock demos $(gitlab demos/simple_clock);
build simple_tree  demos $(gitlab demos/simple_tree);
build starfield    demos $(gitlab demos/starfield);

build el_jamon_volador games $(gitlab games/el_jamon_volador);
build color_grid       games $(gitlab games/color_grid);
build nuclear_rain     games $(gitlab games/nuclear_rain);
build simple_snake     games $(gitlab games/simple_snake);

build kaboom       games $(gitlab games/old_old_old_games/kaboom);
build ramit        games $(gitlab games/old_old_old_games/ramit);
build taz          games $(gitlab games/old_old_old_games/taz);


