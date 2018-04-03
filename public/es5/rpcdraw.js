var canvas, context, width = 1, paint = false, color = "#222222";
var points = new Array();

function init(){
  var canvasDiv = document.getElementById('canvas');
  canvas = document.createElement('canvas');
  canvas.setAttribute('id', 'canvasElement');
  canvas.innerHTML = "Your browser does not support this software because it is missign canvas support."
  canvasDiv.appendChild(canvas);
  context = canvas.getContext("2d");
  window.addEventListener('resize', resizeCanvas, false);
  canvas.addEventListener("touchstart", startPainting);
  canvas.addEventListener("mousedown", startPainting);
  canvas.addEventListener("touchmove", drag);
  canvas.addEventListener("mousemove", drag);
  canvas.addEventListener("touchend", stopPainting);
  canvas.addEventListener("touchcancel", stopPainting);
  canvas.addEventListener("mouseleave", stopPainting);
  canvas.addEventListener("mouseup", stopPainting);
  resizeCanvas();
}
// given x,y, color, width, and if drag/mousedown or not
function createPoint(x,y,c,w,d){
  points.push({
    x: x,
    y: y,
    color: c,
    width: w,
    drag: d,
  })
}
function getX(e){
  return !isNaN(e.pageX) ? e.pageX : e.touches[0].pageX;
}
function getY(e){
  return !isNaN(e.pageY) ? e.pageY : e.touches[0].pageY;
}
function setColor(hexStr){
  color = hexStr;
}
function clearCanvas(clearData){
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
  if (clearData == true){
    points = new Array();
  }
}
function resizeCanvas() {
  // fit to outer height of element
  var canvasDiv = document.getElementById('canvas');
  canvas.height = canvasDiv.clientHeight;
  canvas.width = canvasDiv.clientWidth;
  redraw();
}
function startPainting(e){
  e.preventDefault();
  var mouseX = getX(e) - this.offsetLeft;
  var mouseY = getY(e) - this.offsetTop;
  paint = true;
  var drag = false;
  createPoint(mouseX, mouseY, color, width, drag);
  redraw();
}
function drag(e){
  e.preventDefault();
  if (paint){
    var mouseX = getX(e) - this.offsetLeft;
    var mouseY = getY(e) - this.offsetTop;
    var drag = true;
    createPoint(mouseX, mouseY, color, width, drag);
    redraw();
  };
}
function stopPainting(e){
  paint = false;
  var mouseX = getX(e) - this.offsetLeft;
  var mouseY = getY(e) - this.offsetTop;
  var drag = false;
  createPoint(mouseX, mouseY, color, width, drag)
  redraw();
}
function redraw(){
  clearCanvas();
  context.strokeStyle = color;
  context.lineJoin = "round";
  context.lineWidth = width;
  for(var i=0; i < points.length; i++) {
    context.strokeStyle = points[i].color;
    context.lineWidth = points[i].width;
    context.beginPath();
    if(points[i].drag && i){
      context.moveTo(points[i-1].x, points[i-1].y);
     } else {
       context.moveTo(points[i].x-1, points[i].y);
     }
     context.lineTo(points[i].x, points[i].y);
     context.closePath();
     context.stroke();
  }
}
