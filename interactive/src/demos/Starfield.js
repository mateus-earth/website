//~---------------------------------------------------------------------------//
//                        _      _                 _   _                      //
//                    ___| |_ __| |_ __ ___   __ _| |_| |_                    //
//                   / __| __/ _` | '_ ` _ \ / _` | __| __|                   //
//                   \__ \ || (_| | | | | | | (_| | |_| |_                    //
//                   |___/\__\__,_|_| |_| |_|\__,_|\__|\__|                   //
//                                                                            //
//  File      : Starfield.js                                                  //
//  Project   : demos                                                         //
//  Date      : 17 Jul, 2019                                                  //
//  License   : GPLv3                                                         //
//  Author    : stdmatt <stdmatt@pixelwizards.io>                             //
//  Copyright : stdmatt - 2019                                                //
//                                                                            //
//  Description :                                                             //
//   Just a simple starfield simulation...                                    //
//---------------------------------------------------------------------------~//

//----------------------------------------------------------------------------//
// Constants                                                                  //
//----------------------------------------------------------------------------//
const STARS_COUNT     = 100;
const STAR_MAX_SIZE   =   3;
const STAR_MIN_SPEED  =   3;
const STAR_MAX_SPEED  =  20;


//----------------------------------------------------------------------------//
// Variables                                                                  //
//----------------------------------------------------------------------------//
var start_x  = new Array(STARS_COUNT);
var start_y  = new Array(STARS_COUNT);
var start_z  = new Array(STARS_COUNT);
var start_pz = new Array(STARS_COUNT);

let max_mouse_dis;


//----------------------------------------------------------------------------//
// Helper Functions                                                           //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function CreateStar(i)
{
    start_x [i] = Math_Random(Canvas_Edge_Left, Canvas_Edge_Right);
    start_y [i] = Math_Random(Canvas_Edge_Top,  Canvas_Edge_Bottom);
    start_z [i] = Math_Random(1, Canvas_Width);
    start_pz[i] = start_z[i];
}


//----------------------------------------------------------------------------//
// Setup / Draw                                                               //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function Setup()
{
    for(let i = 0; i < STARS_COUNT; ++i) {
        CreateStar(i);
    }

    max_mouse_dis = Math_Distance(
        Canvas.width / 2, Canvas.height / 2,
        Canvas.width,     Canvas.height
    );
}

//------------------------------------------------------------------------------
function Draw()
{
    Canvas_ClearWindow();
    let mouse_dis = Math_Distance(
        Canvas.width / 2, Canvas.height / 2,
        Mouse_X,          Mouse_Y
    );

    let speed = Math_Map(mouse_dis, 0, max_mouse_dis, STAR_MIN_SPEED, STAR_MAX_SPEED);

    for(let i = 0; i < STARS_COUNT; ++i) {
        let x  = start_x [i];
        let y  = start_y [i];
        let z  = start_z [i];
        let pz = start_pz[i];

        // @XXX(stdmatt): Math_Map is not correct....
        let size = STAR_MAX_SIZE - Math_Map(z, 0, Canvas.width, 0, STAR_MAX_SIZE);

        Canvas_SetStrokeStyle("#FFFFFF");
        let cx = Math_Map(x / z, 0, 1, 0, Canvas.width);
        let cy = Math_Map(y / z, 0, 1, 0, Canvas.height);
        Canvas_DrawPoint(cx, cy, size);

        Canvas_SetStrokeStyle("#707070");
        let px = Math_Map(x / pz, 0, 1, 0, Canvas.width);
        let py = Math_Map(y / pz, 0, 1, 0, Canvas.height);
        // Canvas_DrawLine(cx, cy, px, py);
        Canvas_DrawLine(px, py, cx, cy);

        start_pz[i] = z + speed;
        start_z [i] -= speed;

        if(start_z[i] < 1 ||
            cx > Canvas_Edge_Right  || cx < Canvas_Edge_Left ||
            cy > Canvas_Edge_Bottom || cy < Canvas_Edge_Top)
        {
            CreateStar(i);
        }
    }
}


//----------------------------------------------------------------------------//
// Entry Point                                                                //
//----------------------------------------------------------------------------//
Canvas_Setup({
    main_title        : "Starfield",
    main_date         : "Jul 17, 2019",
    main_version      : "v0.0.1",
    main_instructions : "<br>Move your mouse closer to the edge to increase speed",
    main_link: "<a href=\"http://stdmatt.com/demos/startfield.html\">More info</a>"
});
