//~---------------------------------------------------------------------------//
//                        _      _                 _   _                      //
//                    ___| |_ __| |_ __ ___   __ _| |_| |_                    //
//                   / __| __/ _` | '_ ` _ \ / _` | __| __|                   //
//                   \__ \ || (_| | | | | | | (_| | |_| |_                    //
//                   |___/\__\__,_|_| |_| |_|\__,_|\__|\__|                   //
//                                                                            //
//  File      : Base.js                                                       //
//  Project   : website                                                       //
//  Date      : 17 Jul, 2019                                                  //
//  License   : GPLv3                                                         //
//  Author    : stdmatt <stdmatt@pixelwizards.io>                             //
//  Copyright : stdmatt - 2019                                                //
//                                                                            //
//  Description :                                                             //
//    "Creative Framework" that is used to create the games and demos         //
//    for my website. Nothing fancy and most of the stuff is created          //
//    on demand.                                                              //
//                                                                            //
//    Nothing to take too serious, but a lot of fun to make nevertheless...   //
//---------------------------------------------------------------------------~//


//----------------------------------------------------------------------------//
//                                                                            //
// Canvas                                                                     //
//                                                                            //
//----------------------------------------------------------------------------//
var Canvas  = null;
var Context = null;

var _Time_Prev = 0;
var _Time_Now  = 0;

var Canvas_Edge_Left;
var Canvas_Edge_Right;
var Canvas_Edge_Top;
var Canvas_Edge_Bottom;

var Canvas_Width;
var Canvas_Height;

var Canvas_Half_Width;
var Canvas_Half_Height;


//------------------------------------------------------------------------------
function _Canvas_GetFromHtml(id)
{
    Canvas  = document.getElementById('main_canvas');
    Context = Canvas.getContext('2d');

    Canvas_Width  = Canvas.width;
    Canvas_Height = Canvas.height;

    Canvas_Half_Width  = Canvas_Width  / 2;
    Canvas_Half_Height = Canvas_Height / 2;

    Canvas_Edge_Left    = -Canvas_Half_Width;
    Canvas_Edge_Right   = +Canvas_Half_Width;
    Canvas_Edge_Top     = -Canvas_Half_Height;
    Canvas_Edge_Bottom  = +Canvas_Half_Height;

    Canvas_Translate(Canvas_Half_Width, Canvas_Half_Width);
}

//------------------------------------------------------------------------------
function _Canvas_SetupInfo(info)
{
    function append_info(tag) {
        let elem = document.getElementById(tag);
        if(elem == null) {
            return;
        }
        if(info[tag].length == 0){
            elem.innerHTML = "";
        } else {
            elem.innerHTML += " " + info[tag];
        }
    };

    for(let i in info) {
        append_info(i);
    }
}

//------------------------------------------------------------------------------
function Canvas_ClearWindow(color)
{
    Context.fillStyle = color == undefined ? 'black' : color;
    // Context.clearRect(0, 0, Canvas.width, Canvas.height);
    Context.fillRect(
        -Canvas.width,
        -Canvas.height,
        Canvas.width  * 2,
        Canvas.height * 2
    );
}

//------------------------------------------------------------------------------
function Canvas_Setup(info)
{
    _Canvas_GetFromHtml();
    _Canvas_SetupInfo(info);

    Canvas.addEventListener("mousemove", function(e){
        var r = Canvas.getBoundingClientRect();
        _Mouse_Update(e.clientX - r.left, e.clientY - r.top);
    }, false);



    window.addEventListener("keydown", event => {
        if(typeof KeyDown === 'function') {
            KeyDown(event.keyCode);
        }
    });

    window.addEventListener("keyup", event => {
        if(typeof KeyUp === 'function') {
            KeyUp(event.keyCode);
        }
    });

    Setup(); // Should be defined by the user
    Canvas_Draw(0);
}

//------------------------------------------------------------------------------
function Canvas_Draw(t)
{
    if(t != _Time_Now) {
        _Time_Now = t;
    }
    let dt = (_Time_Now - _Time_Prev) / 1000;
    _Time_Prev = _Time_Now;

    Draw(dt); // Should be defined by user.
    window.requestAnimationFrame(Canvas_Draw);
}

//------------------------------------------------------------------------------
function Canvas_Push()
{
    Context.save();
}

//------------------------------------------------------------------------------
function Canvas_Pop()
{
    Context.restore();
}


//------------------------------------------------------------------------------
function Canvas_Translate(x, y)
{
    Context.translate(x, y);
}

function Canvas_Rotate(a)
{
    Context.rotate(a);
}

//------------------------------------------------------------------------------
function Canvas_SetStrokeStyle(style)
{
    Context.strokeStyle = style;
}

function Canvas_SetStrokeSize(size)
{
    Context.lineWidth = size;
}

//------------------------------------------------------------------------------
function Canvas_DrawPoint(x, y, size)
{
    Context.beginPath();
        Context.arc(x, y, size, 0, 2 * Math.PI, true);
    Context.closePath();
    Context.stroke();
    Context.fill();
}

function Canvas_DrawLine(x1, y1, x2, y2)
{
    Context.beginPath();
        Context.moveTo(x1, y1);
        Context.lineTo(x2, y2);
    Context.closePath();
    Context.stroke();
}

//------------------------------------------------------------------------------
function Canvas_DrawArc(x, y, r, sa, ea)
{
    Context.beginPath();
        Context.arc(x, y, r, sa, ea);
    Context.stroke();
}

//------------------------------------------------------------------------------
function Canvas_DrawCircle(x, y, r)
{
    Canvas_DrawArc(x, y, r, 0, MATH_2PI);
}

//------------------------------------------------------------------------------
function Canvas_DrawShape(vertices, closed)
{
    for(let i = 0; i < vertices.length-1; ++i) {
        let v1 = vertices[i + 0];
        let v2 = vertices[i + 1];

        // Canvas_SetStrokeStyle("red");
        // Canvas_DrawPoint(v1.x, v1.y, 5);
        // Canvas_DrawPoint(v2.x, v2.y, 5);
        // Canvas_SetStrokeStyle("white");
        Canvas_DrawLine(v1.x, v1.y, v2.x, v2.y);
    }

    if(closed != undefined && closed) {
        let v1 = vertices[0];
        let v2 = vertices[vertices.length - 1];
        Canvas_DrawLine(v1.x, v1.y, v2.x, v2.y);
    }
}

//------------------------------------------------------------------------------
function Canvas_DrawRect(x, y, w, h)
{
    Context.beginPath();
    Context.rect(x, y, w, h);
    Context.stroke();
}


//------------------------------------------------------------------------------
var _Canvas_ImageData = null;
function Canvas_LockPixels()
{
    if(_Canvas_ImageData != null) {
        return;
    }

    _Canvas_ImageData = Context.getImageData(0, 0, Canvas_Width, Canvas_Height);
}

//------------------------------------------------------------------------------
function Canvas_UnlockPixels()
{
    if(_Canvas_ImageData == null) {
        return;
    }

    Context.putImageData(_Canvas_ImageData, 0, 0);
    _Canvas_ImageData = null;
}


function Canvas_SetColor(x, y, color)
{
    // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
    function get_pixel_index(x, y, width) {
        var red = y * (width * 4) + x * 4;
        return [red, red + 1, red + 2, red + 3];
    }

    var indices = get_pixel_index(x, y, Canvas_Width);

    _Canvas_ImageData.data[indices[0]] = color[0];
    _Canvas_ImageData.data[indices[1]] = color[1];
    _Canvas_ImageData.data[indices[2]] = color[2];
    _Canvas_ImageData.data[indices[3]] = color[3];
}

//----------------------------------------------------------------------------//
// Color                                                                      //
//----------------------------------------------------------------------------//
function Color_Create(a, b, c, d)
{
    return [a, b, c, (d == undefined) ? 255 : d];
}





//----------------------------------------------------------------------------//
//                                                                            //
// Input                                                                      //
//                                                                            //
//----------------------------------------------------------------------------//
const KEY_UP    = 38;
const KEY_DOWN  = 40;
const KEY_LEFT  = 37;
const KEY_RIGHT = 39;


var Mouse_X = 0;
var Mouse_Y = 0;
function _Mouse_Update(x, y)
{
    Mouse_X = x;
    Mouse_Y = y;
}





//----------------------------------------------------------------------------//
//                                                                            //
// Math                                                                       //
//                                                                            //
//----------------------------------------------------------------------------//
const MATH_PI  = Math.PI;
const MATH_2PI = MATH_PI * 2;

const Math_Cos = Math.cos;
const Math_Sin = Math.sin;

//------------------------------------------------------------------------------
function Math_Random(m, M)
{
    return m + (Math.random() * (M - m));
}
//------------------------------------------------------------------------------
function Math_RandomInt(m, M)
{
    return Math.floor(Math_Random(m, M));
}

//------------------------------------------------------------------------------
// Precise method, which guarantees v = v1 when t = 1.
function Math_Lerp(v0, v1, t)
{
    return (1 - t) * v0 + t * v1;
}

//------------------------------------------------------------------------------
// 0.5, 0, 1, 0, 800 -> 400
function Math_Map(value, s1, e1, s2, e2)
{
    // @XXX(stdmatt): This is wrong....
    let t = value / (e1 - s1);
    let r = Math_Lerp(s2, e2, t);
    return r;
}

//------------------------------------------------------------------------------
function Math_Distance(x1, y1, x2, y2)
{
    let x = (x2 - x1);
    let y = (y2 - y1);
    return Math.sqrt(x*x + y*y);
}

//------------------------------------------------------------------------------
function Math_CreateVector(x, y)
{
    return {x:x, y:y};
}

function Math_Radians(d)
{
    return d * (MATH_PI / 180);
}


//----------------------------------------------------------------------------//
//                                                                            //
// Vector                                                                     //
//                                                                            //
//----------------------------------------------------------------------------//
function Vector_Add(a, b)
{
    return Vector_Create(a.x + b.x, a.y + b.y);
}

function Vector_Create(x, y)
{
    let v = {x:0, y:0}
    if(x != undefined) {
        v.x = x;
    }
    if(y != undefined) {
        v.y = y;
    }
    return v;
}

//----------------------------------------------------------------------------//
//                                                                            //
// Array                                                                      //
//                                                                            //
//----------------------------------------------------------------------------//
function Array_Get(arr, i)
{
    if(i < 0 || i >= arr.length) {
        debugger;
    }

    return arr[i];
}

function Array_GetFront(arr)
{
    return Array_Get(arr, 0);
}

function Array_GetBack(arr)
{
    return Array_Get(arr, arr.length -1);
}


function Array_PushFront(arr, e)
{
    arr.unshift(e);
}

function Array_PushBack(arr, e)
{
    arr.push(e);
}


function Array_PopBack(arr)
{
    let e = Array_GetBack(arr);
    arr = arr.splice(arr.length -1, 1);
    return e;
}

function Array_PopFront(arr)
{
    let e = Array_GetFront(arr);
    arr = arr.splice(0, 1);
    return e;
}



//----------------------------------------------------------------------------//
//                                                                            //
// Log                                                                        //
//                                                                            //
//----------------------------------------------------------------------------//
//------------------------------------------------------------------------------
function Log()
{
    s = "";
    for (var i = 0; i < arguments.length -1; i++) {
        s += arguments[i] + " ";
    }
    s += arguments[arguments.length -1];
    console.log(s);
}


function Utils_Swap(a, b)
{
    let c = a;
    a = b;
    b = c;
}




/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [ r * 255, g * 255, b * 255,  255];
}
