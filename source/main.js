
//------------------------------------------------------------------------------
files_to_load = [
    // demolib - modules
    "/modules/demolib/modules/external/chroma.js",
    "/modules/demolib/modules/external/perlin.js",
    "/modules/demolib/modules/external/tween.umd.js",
    // demolib - main
    "/modules/demolib/source/demolib.js",

    // demo -main
    "/source/Version.js",
    "/source/Starfield.js",
];

//------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", ()=> {
    demolib_load_all_scripts(files_to_load).then(()=> {
        _on_ready();
    });
});

//------------------------------------------------------------------------------
function _on_ready()
{
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
    grd.addColorStop(0, "yellow");
    grd.addColorStop(0.5, "blue");
    grd.addColorStop(1, "white");

    // Fill with gradient
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    demo_start(canvas);

}
