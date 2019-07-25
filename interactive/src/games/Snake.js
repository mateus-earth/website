//----------------------------------------------------------------------------//
// Constants                                                                  //
//----------------------------------------------------------------------------//
const BLOCK_SIZE = 20;

const SNAKE_COLOR_ANIMATION_DURATION = 2.0;
const FOOD_SCALE_ANIMATION_DURATION  = 0.5;

const FOOD_INITIAL_SCALE = 20;

//----------------------------------------------------------------------------//
// Types                                                                      //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
class Snake
{
    constructor()
    {
        this.blocks = [];

        this.direction       = Vector_Create(0, 0);
        this.directionLocked = false;

        this.timeSinceLastMove = 0;
        this.movementCooldown  = 0.2;


        this.initialHue    = 0;
        this.currHue       = 0;
        this.targetHue     = 0;
        this.colorCooldown = 0.0;
    }
} // class Snake

//------------------------------------------------------------------------------
class Food
{
    constructor(x, y)
    {
        this.pos        = Math_CreateVector(x, y);
        this.hue        = Math_Random(0, 1);
        this.scaleTime = 0;
    }
} // Class Food


//----------------------------------------------------------------------------//
// Variables                                                                  //
//----------------------------------------------------------------------------//
let snake = null;
let foods = [];

// Field
let leftEdge;
let rightEdge;
let topEdge;
let bottomEdge;

let points = [];


//----------------------------------------------------------------------------//
// Snake Functions                                                            //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function CreateSnake(x, y, size)
{
    snake = new Snake();
    for(let i = 0; i < 1; ++i) {
        snake.blocks.push(Vector_Create(leftEdge, topEdge));
    }
}

//------------------------------------------------------------------------------
function UpdateSnakePosition(dt)
{
    snake.timeSinceLastMove += dt;
    if(snake.timeSinceLastMove >= snake.movementCooldown) {
        snake.timeSinceLastMove -= snake.movementCooldown;
        snake.directionLocked    = false;

        MoveSnake         ();
        CheckEdges        ();
        CheckFoodCollision();
    }
}

//------------------------------------------------------------------------------
function UpdateSnakeColor(dt)
{
    snake.colorCooldown += dt;
    if(snake.colorCooldown >= SNAKE_COLOR_ANIMATION_DURATION) { // Clamp it...
        snake.colorCooldown = SNAKE_COLOR_ANIMATION_DURATION;
    }


    snake.currHue = Math_Lerp(
        snake.initialHue,
        snake.targetHue,
        snake.colorCooldown / SNAKE_COLOR_ANIMATION_DURATION
    );

    let rgb     = hslToRgb(snake.currHue, 1, 0.5);
    let rgb_str = Color_MakeRGBString(rgb);
    return rgb_str;
}

//------------------------------------------------------------------------------
function RenderSnake(color)
{
    for(let i = 0; i < snake.blocks.length; ++i) {
        let block = snake.blocks[i];
        Canvas_Push();
            Canvas_SetFillStyle(color);
            Canvas_Translate((block.x * BLOCK_SIZE), (block.y * BLOCK_SIZE));
            Canvas_FillRect(0, 0, BLOCK_SIZE, BLOCK_SIZE);
        Canvas_Pop();
    }
}


//------------------------------------------------------------------------------
function MoveSnake()
{
    let head     = Array_GetFront(snake.blocks);
    let new_head = Vector_Add(head, snake.direction);

    Array_PopBack(snake.blocks);
    Array_PushFront(snake.blocks, new_head);
}

//------------------------------------------------------------------------------
function GrowSnake()
{
    let tail = Array_GetBack(snake.blocks);
    Array_PushBack(snake.blocks, Vector_Create(tail.x, tail.y));
}

//------------------------------------------------------------------------------
function CheckEdges()
{
    let head = Array_GetFront(snake.blocks);

    if(head.x < leftEdge) {
        head.x = rightEdge-1;
    } else if(head.x >= rightEdge) {
        head.x = leftEdge;
    }

    if(head.y < topEdge) {
        head.y = bottomEdge-1;
    } else if(head.y >= bottomEdge) {
        head.y = topEdge;
    }
}

//------------------------------------------------------------------------------
function CheckFoodCollision()
{
    let head = Array_GetFront(snake.blocks);
    for(let i = 0; i < foods.length; ++i) {
        let food = foods[i];
        if(head.x == food.pos.x && head.y == food.pos.y) {
            // Reset snake target color to the food color.
            // So the snake will start to animate towards that color.
            snake.initialHue        = snake.targetHue;
            snake.targetHue      = food.hue;
            snake.colorCooldown  = 0;

            // Remove the Food and Generate new one.
            Array_RemoveAt(foods, i);
            CreateFood();

            // Make sure that snake grows.
            GrowSnake();
            break;
        }
    }
}


//----------------------------------------------------------------------------//
// Food Functions                                                             //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function CreateFood()
{
    while(true) {
        let x = Math_RandomInt(leftEdge, rightEdge );
        let y = Math_RandomInt(topEdge,  bottomEdge);

        // Check if is on snake.
        for(let i = 0; i < snake.blocks.length; ++i) {
            let block = snake.blocks[i];
            if(block.x == x && block.y == i) {
                continue; // We can't place here...
            }
        }

        // We're ok to place the food here...
        foods.push(new Food(x, y));
        Log("Create food at", x, y);
        break;
    }
}

//------------------------------------------------------------------------------
function RenderFoods(dt)
{
    for(let i = 0; i < foods.length; ++i) {
        // Position
        let block = foods[i];
        let x = block.pos.x;
        let y = block.pos.y

        // Color
        let rgb   = hslToRgb(block.hue, 1, 0.5);
        let color = Color_MakeRGBString(rgb);

        // Scale
        block.scaleTime += dt;
        if(block.scaleTime >= FOOD_SCALE_ANIMATION_DURATION) {
            block.scaleTime = FOOD_SCALE_ANIMATION_DURATION;
        }

        let scale = Math_Lerp(
            FOOD_INITIAL_SCALE,
            1,
            block.scaleTime / FOOD_SCALE_ANIMATION_DURATION
        );

        // Render
        Canvas_Push();
            Canvas_SetFillStyle(color);
            Canvas_Translate((x * BLOCK_SIZE) + BLOCK_SIZE/2, (y * BLOCK_SIZE) + BLOCK_SIZE/2);
            Canvas_Rotate(MATH_PI/22 * scale);
            Canvas_Scale(scale, scale);
            Canvas_FillRect(-BLOCK_SIZE/2, -BLOCK_SIZE/2, BLOCK_SIZE, BLOCK_SIZE);
        Canvas_Pop();
    }
}


//----------------------------------------------------------------------------//
// Setup / Draw                                                               //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function Setup()
{
    leftEdge   = Math_Int(Canvas_Edge_Left   / BLOCK_SIZE);
    rightEdge  = Math_Int(Canvas_Edge_Right  / BLOCK_SIZE);
    topEdge    = Math_Int(Canvas_Edge_Top    / BLOCK_SIZE);
    bottomEdge = Math_Int(Canvas_Edge_Bottom / BLOCK_SIZE);


    Log(Canvas_Edge_Left ,Canvas_Edge_Right ,Canvas_Edge_Top ,Canvas_Edge_Bottom);
    Log(leftEdge, rightEdge, topEdge, bottomEdge);

    CreateSnake(0, 0, 3);
    CreateFood ();


    for(let i = leftEdge; i < rightEdge; ++i) {
        for(let j = topEdge; j < bottomEdge; ++j) {
            points.push({x:i, y:j});
        }
    }
}


//------------------------------------------------------------------------------
function Draw(dt)
{
    Canvas_ClearWindow("black");

    UpdateSnakePosition(dt);
    let snake_color = UpdateSnakeColor(dt);

    Canvas_Push();
    Canvas_Scale(0.9, 0.9);
    Canvas_SetStrokeStyle("white");
    Canvas_DrawRect(-200, -200, 400, 400);

    // @TODO(stdmatt): How we gonna mix the colors???
    for(let i = 0; i < points.length; ++i) {
        let px = points[i].x;
        let py = points[i].y;

        let sx = foods[0].pos.x;
        let sy = foods[0].pos.y;
        Canvas_Push();
            let dist       = Math_Distance(px, py, sx, sy);
            let saturation = Math_Map(dist, 0, 10, 0.7, 0);
            let luminance  = Math_Map(dist, 0, 10, 0.5, 0);
            let rgb        = hslToRgb(foods[0].hue, saturation, luminance);
            let rgb_str    = Color_MakeRGBString(rgb);

            Canvas_SetStrokeStyle(rgb_str);
            Canvas_Translate((px * BLOCK_SIZE) + BLOCK_SIZE/2, (py * BLOCK_SIZE) + BLOCK_SIZE/2);
            Canvas_DrawLine(0, 0, BLOCK_SIZE, 0);
            Canvas_DrawLine(0, 0, 0, BLOCK_SIZE);

            // Canvas_FillRect(-BLOCK_SIZE/2, -BLOCK_SIZE/2, BLOCK_SIZE, BLOCK_SIZE);
            // Canvas_DrawRect(0, 0, 2, 2);
        Canvas_Pop();
    }
    Log("--");

    RenderSnake(snake_color);
    RenderFoods(dt);


    Canvas_Pop()
}


//----------------------------------------------------------------------------//
// Input                                                                      //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function KeyDown(code)
{
    if(snake.directionLocked) {
        return;
    }

    if(code == KEY_LEFT && snake.direction.x != 1) {
        snake.direction = Vector_Create(-1, 0);
    } else if(code == KEY_RIGHT && snake.direction.x != -1) {
        snake.direction = Vector_Create(+1, 0);
    } else if(code == KEY_UP && snake.direction.y != 1) {
        snake.direction = Vector_Create(0, -1);
    } else if(code == KEY_DOWN && snake.direction.y != -1) {
        snake.direction = Vector_Create(0, +1);
    }

    // snake.blocks[0].x += snake.direction.x;
    // snake.blocks[0].y += snake.direction.y;
    // snake.direction.x = 0;
    // snake.direction.y = 0;
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
