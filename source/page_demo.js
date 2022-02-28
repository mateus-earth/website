const canvas = document.createElement('canvas');

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

console.log("asdfasdf")
