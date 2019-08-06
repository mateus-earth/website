//~---------------------------------------------------------------------------//
//                        _      _                 _   _                      //
//                    ___| |_ __| |_ __ ___   __ _| |_| |_                    //
//                   / __| __/ _` | '_ ` _ \ / _` | __| __|                   //
//                   \__ \ || (_| | | | | | | (_| | |_| |_                    //
//                   |___/\__\__,_|_| |_| |_|\__,_|\__|\__|                   //
//                                                                            //
//  File      : Metaballs.js                                                  //
//  Project   : demos                                                         //
//  Date      : 18 Jul, 2019                                                  //
//  License   : GPLv3                                                         //
//  Author    : stdmatt <stdmatt@pixelwizards.io>                             //
//  Copyright : stdmatt - 2019                                                //
//                                                                            //
//  Description :                                                             //
//                                                                            //
//---------------------------------------------------------------------------~//


//----------------------------------------------------------------------------//
// Constants                                                                  //
//----------------------------------------------------------------------------//
const BALLS_MAX_RADIUS = 50;
const BALLS_MIN_RADIUS = 10;
const MAX_BALLS        = 20;
const MIN_BALLS        =  2;


//----------------------------------------------------------------------------//
// Variables                                                                  //
//----------------------------------------------------------------------------//
let balls_x     = [];
let balls_y     = [];
let balls_r     = [];
let balls_vel_x = [];
let balls_vel_y = [];
let balls_length = 0;
var total_time   = 0;


//----------------------------------------------------------------------------//
// Helper Functions                                                           //
//----------------------------------------------------------------------------//
function CreateBall()
{
    if(balls_length >= MAX_BALLS) {
        return;
    }

    balls_x    .push(Math_Random(Canvas_Edge_Left,    Canvas_Edge_Right));
    balls_y    .push(Math_Random(Canvas_Edge_Bottom,  Canvas_Edge_Top  ));
    balls_r    .push(Math_Random(BALLS_MIN_RADIUS,    BALLS_MAX_RADIUS ));
    balls_vel_x.push(Math_Random(-5,                  +5               ));
    balls_vel_y.push(Math_Random(-5,                  +5               ));

    ++balls_length;
}


function UpdateBall(i, dt)
{
    x     = balls_x    [i];
    y     = balls_y    [i];
    r     = balls_r    [i];
    vel_x = balls_vel_x[i];
    vel_y = balls_vel_y[i];

    //
    // Physics.
    balls_x[i] += (vel_x * dt * 10);
    balls_y[i] += (vel_y * dt * 10);

    //
    // Wrap the balls.
    if(balls_x[i] + r < Canvas_Edge_Left ||
       balls_x[i] - r > Canvas_Edge_Right)
    {
        balls_vel_x[i] *= -1;
    }

    if(balls_y[i] + r < Canvas_Edge_Top ||
       balls_y[i] - r > Canvas_Edge_Bottom)
    {
        balls_vel_y[i] *= -1;
    }
}

//----------------------------------------------------------------------------//
// Setup / Draw                                                               //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function Setup()
{
    for(let i = 0; i < Math_Random(MIN_BALLS, MAX_BALLS); ++i) {
        CreateBall();
    }

    max_dist = Math_Distance(
        Canvas_Half_Width, Canvas_Half_Height,
        Canvas_Edge_Left,  Canvas_Edge_Top
    ) ;
}


//------------------------------------------------------------------------------
function Draw(dt)
{
    total_time += dt;

    Canvas_LockPixels();
    for(let y = 0; y < Canvas_Height; ++y) {
        for(let x = 0; x < Canvas_Width; ++x) {
            let sum = 0;

            for(let b = 0; b < balls_length; ++b) {
                var ball_x = (Canvas_Half_Width  + balls_x[b]);
                var ball_y = (Canvas_Half_Height + balls_y[b]);
                var ball_r = balls_r[b];

                let dist = Math_Distance(
                    x,y,
                    ball_x,
                    ball_y
                );

                let value = (ball_r * 1100 / dist);
                sum += value;
            }


            var final = Math_Map(sum, 0, max_dist, 0, 360);
            if(final > 360) {
                final %= 360;
            }

            let rgb = hslToRgb(final / 360, 1.0, 0.5);
            Canvas_SetColor(x,y, rgb);
        }
    }
    Canvas_UnlockPixels();


    for(let i = 0; i < balls_length; ++i) {
        UpdateBall(i, dt);

        balls_x[0] = Mouse_X - Canvas_Half_Width;
        balls_y[0] = Mouse_Y - Canvas_Half_Height;
    }
}


//----------------------------------------------------------------------------//
// Entry Point                                                                //
//----------------------------------------------------------------------------//
Canvas_Setup({
    main_title        : "Metaballs",
    main_date         : "Jul 18, 2019",
    main_version      : "v0.0.1",
    main_instructions : "<br>Move your mouse closer to the edge to increase speed",
    main_link: "<a href=\"http://stdmatt.com/demos/startfield.html\">More info</a>"
});
