// requires jquery, tested with ver 1-11
    // Variables for referencing the canvas and 2dcanvas context
var canvas,ctx;

// constants
var eraserURL = "/static/img/rpc/eraser.png";

var clearScreenURL = "/static/img/rpc/clearscreen.png"
// jquery elements for various things
var $container, $toolbar, $currentColor, $canvas;

// Variables to keep track of the mouse position and left-button status 
var mouseX,mouseY,mouseDown=0;

// Variables to keep track of the touch position
var touchX=4;
var touchY=4;

var _reduceX = 1.0;
var _reduceY = 1.0;
var ox = 4;
var oy = 4;
// string value ie "red"
var drawColor = "#000";
// floating point number for line width
var drawLineWidth = 5.0;


// TODO: Set a flag when we select Eraser
var eraserOn = false;

function color(args) {
    if ( eraserOn) {
        eraseStop();
    }
    drawColor = args;
    $currentColor.css("background-color", drawColor);
    
}

// Clear the canvas context using the canvas width and height
function clearArea() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Keep track of the mouse button being pressed and draw a dot at current location
function sketchpad_mouseDown(e) {
    mouseDown=1;
    getMousePos(e)
    ox = touchX;
    oy = touchY;
}

// Keep track of the mouse button being released
function sketchpad_mouseUp() {
    mouseDown=0;
}

// Keep track of the mouse position and draw a dot if mouse button is currently pressed
function sketchpad_mouseMove(e) { 
    // Update the mouse co-ordinates when moved
    getMousePos(e);

    // Draw a dot if the mouse button is currently being pressed
    if (mouseDown==1) {
        if (eraserOn) {
            doErase();
        } else {
            // During a touchmove event, unlike a mousemove event, we don't need to check if the touch is engaged, since there will always be contact with the screen by definition.
            // drawDot(ctx,touchX,touchY,5); 
        
            ctx.beginPath();
            ctx.lineJoin = "round";
        
            // TODO: Accept these two as parameters on init        
            ctx.strokeStyle = drawColor;//"#000000";
            ctx.lineWidth = drawLineWidth;
            
            ctx.moveTo(ox, oy);
            ctx.lineTo(touchX, touchY);
            ctx.stroke()
            
            ox = touchX;
            oy = touchY;
            
            // Prevent a scrolling action as a result of this touchmove triggering.
            event.preventDefault();
        }
    }
    
}

// Get the current mouse position relative to the top-left of the canvas
function getMousePos(e) {
    if (!e)
        var e = e;
    
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;
    if (e.clientX) {
        //code
        touchX = e.clientX;
        touchY = e.clientY;
    }
    else if (e.offsetX) {
        touchX = e.offsetX;
        touchY = e.offsetY;
    }
    else if (e.layerX) {
        touchX = e.layerX;
        touchY = e.layerY;
    }
    touchX -= (rect.left + root.scrollLeft);
    touchY -= (rect.top +  root.scrollTop);
    // scaling
    touchX /= _reduceX;
    touchY /= _reduceY;
 }


// Draw something when a touch start is detected
function sketchpad_touchStart() {
    // Update the touch co-ordinates
    getTouchPos();

    // drawDot(ctx,touchX,touchY,5);

    ox = touchX;
    oy = touchY;
    // Prevents an additional mousedown event being triggered
    event.preventDefault();
}

// Draw something and prevent the default scrolling when touch movement is detected
function sketchpad_touchMove(e) { 
    // Update the touch co-ordinates
    getTouchPos(e);

    console.log(touchX + " " + touchY);
    if (eraserOn) {
        doErase();
    } else {
        // During a touchmove event, unlike a mousemove event, we don't need to check if the touch is engaged, since there will always be contact with the screen by definition.
        // drawDot(ctx,touchX,touchY,5); 
    
        ctx.beginPath();
        ctx.lineJoin = "round";
    
        // TODO: Accept these two as parameters on init        
        ctx.strokeStyle = drawColor;//"#000000";
        ctx.lineWidth = drawLineWidth;
        
        ctx.moveTo(ox, oy);
        ctx.lineTo(touchX, touchY);
        ctx.stroke()
        
        ox = touchX;
        oy = touchY;
        
        // Prevent a scrolling action as a result of this touchmove triggering.
        event.preventDefault();
    }
}

// Get the touch position relative to the top-left of the canvas
// When we get the raw values of pageX and pageY below, they take into account the scrolling on the page
// but not the position relative to our target div. We'll adjust them using "target.offsetLeft" and
// "target.offsetTop" to get the correct values in relation to the top left of the canvas.
function getTouchPos(e) {
    if (!e)
        var e = event;

    if(e.touches) {
        if (e.touches.length == 1) { // Only deal with one finger
            var touch = e.touches[0]; // Get the information for finger #1
            touchX=touch.pageX-touch.target.offsetLeft;
            touchY=touch.pageY-touch.target.offsetTop;
            // scaling
            touchX /= _reduceX;
            touchY /= _reduceY;
            
        }
    }
}

function eraseStart() {
    eraserOn = true;
    var dimension = $currentColor.width();
    $currentColor.css({
        "background" : "url(" + eraserURL + ")"
        , "background-size" : dimension 
    });
}

function eraseStop() {
    eraserOn = false;
    $currentColor.css("background", "");
}

function doErase() {
    var delta = drawLineWidth * 5;
    var x1 = touchX - delta
    , w =2*delta
    , y1 = touchY - delta
   h = 2*delta;
    
    //rect around touch x,y
    ctx.clearRect(x1,y1,w,h);
}
    
// 
function addColorBar(element, width) {
   
   $toolbar = element;
    
    //code to add elements to the top of the container that allow select color, erase, and clear
    // TODO: Save and save with BG image
    
    
    var colors = ["FFF", "#F00","F90",  "#FF0", "#0F0", "#0FF", "#00F", "#909", "#999", "#000"];
    
    var w = width;
    // $toolbar = $("<div id=\"toolbar\" ></div>").css("width", w + "px");
   $toolbar.append($toolbar);
    
    var l = colors.length + 3; // 3 more, first for current color, last two for eraser and clear
    var b = 4;
    var m = 2;
    var delta = (b*2 + m*2 ) * l;
    var dimension = (w - delta) / l;
    var tbHeight = $toolbar.height() - m*2 - b*2;
    
    $toolbar.width(width + b);
    // add current color indicator
    $currentColor = $("<span>&nbsp</span>").css({
        "border-radius" : (1.5 * dimension) + "px"
        , "width" : dimension + "px"
            , "height" : tbHeight + "px"
            , "display" : "inline-block"
            , "border" : b + "px inset black"
            , "margin" : m + "px"
            , "background-color" : drawColor
        });
    $toolbar.append($currentColor);
                    
    // add color selectors
    for ( var i = 0; i < colors.length; i++){
         $toolbar.append($("<span>&nbsp;</span>").css(
        {
            "background-color" : colors[i]
            , "width" : dimension + "px"
            , "height" : tbHeight + "px"
            , "display" : "inline-block"
            , "border" : b + "px outset gray"
            , "margin" : m + "px"
        }
    ));
    }
    
    // eraser
    // var url = "http://test-pagesapps.rhcloud.com/static/img/rpc/eraser.png";
    $toolbar.append($("<span id='eraser'>&nbsp;</span>").css(
        {
            "width" : dimension + "px"
            , "height" : tbHeight  + "px"
            , "display" : "inline-block"
            , "border" : b + "px outset black"
            , "margin" : m + "px"
            , "background-image" : "url(" + eraserURL + ")"
            , "background-size" : "100%"
            , "background-repeat" : "no-repeat"
        } ));
   
    // last one should be clear
    $toolbar.append($("<span id='clearScreen'>&nbsp;</span>").css(
        {
            "width" : dimension + "px"
            , "height" : tbHeight + "px"
            , "display" : "inline-block"
            , "border" : b + "px outset black"
            , "margin" : m + "px"
            , "background-image" : "url(" + clearScreenURL + ")"
            , "background-size" : "100%"
            , "background-repeat" : "no-repeat"
            ,  }
            ));
   
    // Set handler for all the color changing stuff
    $toolbar.on('click', 'span:nth-child(n+2):nth-last-child(n+3)', function() {
        var bg = $(this).css("background-color");
        color(bg);
        
    });
    
    // Set handler for eraser
    $toolbar.on('click', '#eraser', function() {
        eraseStart();
    });
    
    // Set handler for clear screen
    $toolbar.on('click', '#clearScreen', function() {
        clearArea();
    });
}

function standardEventListeners() {
    if (!ctx) {
        //code
        if (!canvas) {
            canvas = document.getElementById('myCanvas');
        }
        // If the browser supports the canvas tag, get the 2d drawing context for this canvas
        if (canvas.getContext){
            ctx = canvas.getContext('2d');
        } else {
            alert("Sorry, your browser does not support drawing onto a canvas!");
        }
    }
    // Check that we have a valid context to draw on/with before adding event handlers
    if (ctx) {
        // React to mouse events on the canvas, and mouseup on the entire document
        canvas.addEventListener('mousedown', sketchpad_mouseDown, false);
        canvas.addEventListener('mousemove', sketchpad_mouseMove, false);
        window.addEventListener('mouseup', sketchpad_mouseUp, false);

        // React to touch events on the canvas
        canvas.addEventListener('touchstart', sketchpad_touchStart, false);
        canvas.addEventListener('touchmove', sketchpad_touchMove, false);
    }
}

function setBackgroundImageAsUrl(url){
    // Load image from URL
    url = url.replace(/(\r\n|\n|\r)/gm, "");
    $canvas.css("background-image", "url('"+ url + "')");
}


/**
 * With no arguments, finds
 * the first div and adds
 * a canvas and toolbar to it.
 * Elements be fit to height and width
 * of the containing div
 * Arguments supplied as dict,
 * ["drawingHeight"] pixel height of drawing area, default 800
 * ["drawingWidth"] pixel width, default 600
 * ["drawingContainer"] jquery element to put toolbar and canvas
 * ["cssWidth"]
 * ["cssHeight"]
 * ["toolbar"] the element for the toolbar
 */
function initCanvas(args) {
    if (typeof $toolbar != 'undefined') {
        $toolbar.children("span").remove();
        $canvas.remove();
    }
    if (!args) {
        args = {}
        console.log("Loading Drawing Defaults");
    }
     // container
     if (!args['drawingContainer']) {
        console.log("Loading Default Container, first div");
        $container = $('div').first();
    } else {
        $container = args['drawingContainer'];
    };
    // calculate the height and width we have to work with
    var containerH = $container.height();
    var containerW = $container.width();
    // do we detect portait mode or landscape?
    var deviceRatio = Number(containerH / containerW);
    var portraitDevice = Boolean(deviceRatio > 1.0);
    
    if (!args['drawingHeight']) {
        if (portraitDevice) {
        args["drawingHeight"] = 800;
        } else {
            args["drawingHeight"] = 600;
        }
    }
    if (!args['drawingWidth']) {
        if (portraitDevice) {
            args["drawingWidth"] = 600;
        } else {
            args["drawingWidth"] = 800;
        }
    }
    
    // TODO: Handle undefined container jQuery Element
   
    // var canvasH, canvasW;
    var ratio = args["drawingHeight"] / args["drawingWidth"];
    var scaleH, scaleW;
    
    console.log("Container is H " + containerH + " W " + containerW);
    
    var borderSize = 1; // + "px"
    var borderDelta = borderSize * 2;
    // var extraDelta = 10;
    containerW -= borderDelta;
    containerH -= borderDelta;
    // containerH -= extraDelta;

    // now we need to fix canvas size, reducing whichever depending on portrait or not
    // Note that this is the CSS based on the provided size, not the containing div size 
    var portrait = Boolean(ratio >= 1);
    if (portrait) {
        console.log("portrait");
         if( containerH / ratio > containerW){
            scaleH = containerW * ratio;
            scaleW = containerW;// * ratio; // shrink, w * (<1)
        } else {
            scaleH = containerH;
            scaleW = containerH / ratio;// * ratio; // shrink, w * (<1)
        }
        
    } else {
        
        if( containerW * ratio > containerH){
            scaleH  = containerH;
            scaleW = containerH / ratio;
        } else {
            scaleW = containerW;
            scaleH = containerW * ratio;// * ratio; // shrink, w * (<1)
        }
        
    }
    console.log("Scale is H " + scaleH + " W " + scaleW);
    console.log("Ratio deaired " + ratio + " cauclated: " + scaleH/scaleW);
    
    if ( scaleH > containerH || scaleW > containerW) {
        console.log("CONDITION");
    }
    // add canvas
    $canvas = $('<canvas id="myCanvas"></canvas>').prop({
            "width" : args["drawingWidth"]
            , "height" : args["drawingHeight"]
        })
       ///.attr("id", "myCanvas")
        .css({
            "width" : scaleW
            , "height" : scaleH
            , "margin" : "0 auto"
            , 'background-repeat': 'no-repeat'
            , 'background-size' : '100%'
            , 'border' : borderSize + 'px solid black'
        })
    $container.append($canvas)
    console.log("Canvas is H " + $canvas.prop("height") + " W " + $canvas.prop("width"));
    
    // for drawing on the canvas, we need to translate CSS touches to the element somehow
    _reduceX = scaleW / args["drawingWidth"];; // args should be equal to or greater than scaled
    _reduceY = scaleH / args["drawingHeight"];;
    
    //toolbar
    if (!args["toolbar"]) {
        console.log("No color bar, B&W drawing only");
    }
    else {
       addColorBar(args["toolbar"], scaleW);
    };
    
   standardEventListeners();
   
   if (args["currentImage"]) {
    console.log("draw " + args["currentImage"]);
    var img = new Image();
    img.onload = function() {
      ctx.clearRect(0,0,can.width, can.height);
      ctx.drawImage(this, 0, 0);
    }
    img.src = args["currentImage"];
   }
}

// retrieve as a url the value of the current drawing
function getCurrentDrawing() {
    if (!ctx) {
        //code
        if (!canvas) {
            canvas = document.getElementById('myCanvas');
        }
        // If the browser supports the canvas tag, get the 2d drawing context for this canvas
        if (canvas.getContext){
            ctx = canvas.getContext('2d');
        } else {
            alert("Sorry, your browser does not support drawing onto a canvas!");
        }
    }
    
   return canvas.toDataURL("image/png");
}
