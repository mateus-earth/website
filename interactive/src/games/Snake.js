//----------------------------------------------------------------------------//
// Constants                                                                  //
//----------------------------------------------------------------------------//
const ASTEROID_MIN_RADIUS = 10;


//----------------------------------------------------------------------------//
// Variables                                                                  //
//----------------------------------------------------------------------------//
let snakeBlocks = [];
let speed       = Vector_Create(-1, 0);
let score       = 0;
let blockSize   = 20;

let timeSinceLastMove = 0;
let movementCooldown  = 0.2;


//----------------------------------------------------------------------------//
// Snake Functions                                                            //
//----------------------------------------------------------------------------//
function MoveSnake()
{
    Array_PopBack(snakeBlocks);

    let head     = Array_GetFront(snakeBlocks);
    let new_head = Vector_Add(head, speed);

    Array_PushFront(snakeBlocks, new_head);
}

function CheckEdges()
{
    let left_edge   = (Canvas_Edge_Left   / blockSize);
    let right_edge  = (Canvas_Edge_Right  / blockSize);
    let top_edge    = (Canvas_Edge_Top    / blockSize);
    let bottom_edge = (Canvas_Edge_Bottom / blockSize);

    let head = Array_GetFront(snakeBlocks);
    if(head.x < left_edge) {
        head.x = right_edge;
    } else if(head.x > right_edge) {
        head.x = left_edge;
    }

    if(head.y < top_edge) {
        head.y = bottom_edge;
    } else if(head.y > bottom_edge) {
        head.y = top_edge;
    }
}


//----------------------------------------------------------------------------//
// Setup / Draw                                                               //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function Setup()
{
    snakeBlocks.push(Vector_Create(0, 0));
    snakeBlocks.push(Vector_Create(0, 0));
}


//------------------------------------------------------------------------------
function Draw(dt)
{
    Canvas_ClearWindow("black");
    Canvas_SetStrokeStyle("white");

    // Update
    timeSinceLastMove += dt;
    if(timeSinceLastMove >= movementCooldown) {
        timeSinceLastMove -= movementCooldown;
        MoveSnake();
        CheckEdges();
    }

    // Render
    for(let i = 0; i < snakeBlocks.length; ++i) {
        let block = snakeBlocks[i];
        Canvas_DrawRect(
            block.x * blockSize,
            block.y * blockSize,
            blockSize,
            blockSize
        );
    }
}


//----------------------------------------------------------------------------//
// Input                                                                      //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function KeyDown(code)
{
    if(code == KEY_LEFT && speed.x != 1) {
        speed = Vector_Create(-1, 0);
    } else if(code == KEY_RIGHT && speed.x != -1) {
        speed = Vector_Create(+1, 0);
    } else if(code == KEY_UP && speed.y != 1) {
        speed = Vector_Create(0, -1);
    } else if(code == KEY_DOWN && speed.y != -1) {
        speed = Vector_Create(0, +1);
    }
}



//----------------------------------------------------------------------------//
// Entry Point                                                                //
//----------------------------------------------------------------------------//
Canvas_Setup({
    main_title        : "Simple Trees",
    main_date         : "Jul 19, 2019",
    main_version      : "v0.0.1",
    main_instructions : "<br>Move your mouse closer to the edge to increase speed",
    main_link: "<a href=\"http://stdmatt.com/demos/startfield.html\">More info</a>"
});
