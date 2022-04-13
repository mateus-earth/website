const DEMOS_LIST = [
    // "flowfield",
    // "starfield",
    "roses",
]

//------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", ()=> {
    _on_ready();
});

//------------------------------------------------------------------------------
function _on_ready()
{
    //
    // Create the default canvas...
    //

    const canvas = document.createElement("canvas");

    canvas.width            = window.innerWidth;
    canvas.height           = window.innerHeight;
    canvas.style.position   = "fixed";
    canvas.style.left       = "0px";
    canvas.style.top        = "0px";
    canvas.style.zIndex     = "-100";

    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grd.addColorStop(0,   "yellow");
    grd.addColorStop(0.5, "blue"  );
    grd.addColorStop(1,   "white" );

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //
    // Load the demo...
    //
    const demo_index         = Math.trunc(Math.random() * DEMOS_LIST.length);
    const demo_name          = DEMOS_LIST[demo_index];
    const demo_path_prefix   = "/modules/demos/" + demo_name;
    const demo_main_filename = "/source/main.js";

    // @notice: [Load order] at 22-03-06, 13:45
    //   Load the demo's main file, with that we have
    //   the info of all files that that demo requires...
    demolib_load_script(demo_main_filename, demo_path_prefix).then(()=>{
        demolib_load_all_scripts(__SOURCES, demo_path_prefix).then(()=> {
            demo_start(canvas);
        });
    });
}
