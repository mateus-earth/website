//~---------------------------------------------------------------------------//
//                        _      _                 _   _                      //
//                    ___| |_ __| |_ __ ___   __ _| |_| |_                    //
//                   / __| __/ _` | '_ ` _ \ / _` | __| __|                   //
//                   \__ \ || (_| | | | | | | (_| | |_| |_                    //
//                   |___/\__\__,_|_| |_| |_|\__,_|\__|\__|                   //
//                                                                            //
//  File      : Main_Canvas.js                                                //
//  Project   : website                                                       //
//  Date      : 17 Jul, 2019                                                  //
//  License   : GPLv3                                                         //
//  Author    : stdmatt <stdmatt@pixelwizards.io>                             //
//  Copyright : stdmatt - 2019                                                //
//                                                                            //
//  Description :                                                             //
//    Script to load randomly the demos and games that are available.         //
//    The only thing that it does is to select and script source and append   //
//    a script tag on the page.                                               //
//                                                                            //
//    To make the scripts available is just a matter of putting their path    //
//    on the correct array.                                                   //
//---------------------------------------------------------------------------~//

//----------------------------------------------------------------------------//
// The scripts that we have...                                                //
//----------------------------------------------------------------------------//
demos = [
    "demos/Starfield.js",
    "demos/Simple_Clock.js",
    "demos/Metaballs.js",
    "demos/Simple_Tree.js",
];

games = [
    "games/Asteroids.js"
];

scripts = [demos, games];


//----------------------------------------------------------------------------//
// Loads the given script and makes it runs on the canvas                     //
//----------------------------------------------------------------------------//
function Load_Script(location, forceScript){
    let script_tag = document.createElement('script');

    let script_name = forceScript;
    if(forceScript == undefined) {
        let i = Math_RandomInt(0, scripts.length);
        let j = Math_RandomInt(0, scripts[i].length);

        script_name = scripts[i][j];
    }

    script_tag.src = "interactive/src/" + script_name;
    location.appendChild(script_tag);
}


//----------------------------------------------------------------------------//
// Entry Point                                                                //
//----------------------------------------------------------------------------//
Load_Script(document.body);
