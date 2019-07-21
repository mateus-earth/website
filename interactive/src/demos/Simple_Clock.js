//~---------------------------------------------------------------------------//
//                        _      _                 _   _                      //
//                    ___| |_ __| |_ __ ___   __ _| |_| |_                    //
//                   / __| __/ _` | '_ ` _ \ / _` | __| __|                   //
//                   \__ \ || (_| | | | | | | (_| | |_| |_                    //
//                   |___/\__\__,_|_| |_| |_|\__,_|\__|\__|                   //
//                                                                            //
//  File      : Simple_Clock.js                                               //
//  Project   : demos                                                         //
//  Date      : 1y Jul, 2019                                                  //
//  License   : GPLv3                                                         //
//  Author    : stdmatt <stdmatt@pixelwizards.io>                             //
//  Copyright : stdmatt - 2019                                                //
//                                                                            //
//  Description :                                                             //
//   Displays a simple digital / analog clock.                                //
//---------------------------------------------------------------------------~//

//----------------------------------------------------------------------------//
// Constants                                                                  //
//----------------------------------------------------------------------------//
const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR   = SECONDS_IN_MINUTE * 60;
const SECONDS_IN_DAY    = 60 * 60 * 24;

//----------------------------------------------------------------------------//
// Variables                                                                  //
//----------------------------------------------------------------------------//
let hours   = 0;
let minutes = 0;
let seconds = 0;
let total_time;
let date = new Date();


//----------------------------------------------------------------------------//
// Helper Functions                                                           //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function Draw_Arc(value, maxValue, radius, color_a, color_b)
{
    // The shadow arc.
    Canvas_SetStrokeStyle(color_b);
    Canvas_DrawArc(0, 0, radius, 0, Math.PI * 2);

    // The actual arc.
    Canvas_SetStrokeStyle(color_a);
    let s = Math_Map(value, 0, maxValue, -Math.PI/2, (2 * Math.PI) - Math.PI/2);
    Canvas_DrawArc(0, 0, radius, -Math.PI/2, s);
}

//----------------------------------------------------------------------------//
// Setup / Draw                                                               //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function Setup()
{
    hours   = date.getHours  ();
    minutes = date.getMinutes();
    seconds = date.getSeconds();

    total_time = hours   * SECONDS_IN_HOUR
               + minutes * SECONDS_IN_MINUTE
               + seconds;
}

//------------------------------------------------------------------------------
function Draw(dt)
{
    Canvas_ClearWindow();
    Canvas_SetStrokeSize(10);
    Canvas_SetStrokeStyle("white");

    total_time += dt;

    let sin    = (1 + Math.sin(seconds / 60 * Math.PI)) / 2;
    let radius = 80 + (sin * 60);

    seconds = (total_time % SECONDS_IN_MINUTE);
    minutes = (total_time % SECONDS_IN_HOUR  ) / SECONDS_IN_MINUTE;
    hours   = (total_time % SECONDS_IN_DAY   ) / SECONDS_IN_HOUR;
    if(hours > 12) {
        hours -= 12;
    }

    //
    // Arcs.
    Draw_Arc(seconds, 60, radius + 00, "#FF0000", "#FF000020");
    Draw_Arc(minutes, 60, radius + 20, "#00FF00", "#00FF0020");
    Draw_Arc(hours,   12, radius + 40, "#0000FF", "#0000FF20");

    //
    // Timer.
    var str = "" + Math.floor(hours)   + " : "
                 + Math.floor(minutes) + " : "
                 + Math.floor(seconds);

    Context.font = "30px Arial";
    Context.fillStyle = "white";
    Context.fillText(str, -Context.measureText(str).width/2, 0);
}


//----------------------------------------------------------------------------//
// Entry Point                                                                //
//----------------------------------------------------------------------------//
Canvas_Setup({
    main_title        : "Simple Clock",
    main_date         : "Jul 17, 2019",
    main_version      : "v0.0.1",
    main_instructions : "",
    main_link: "<a href=\"http://stdmatt.com/demos/startfield.html\">More info</a>"
});
