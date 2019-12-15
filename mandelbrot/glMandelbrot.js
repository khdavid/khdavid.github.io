var vertexShaderCode = 
`
 attribute vec3 Position;


 void main(void) {
     gl_Position = vec4(Position, 1.0);
 }
 `;


var fragmentShaderCode = 
 `
  precision highp float;
  uniform float xShift;
  uniform float yShift;
  uniform float fade;

  struct ComplexNumber
  {
    float Real;
    float Imagine;
  };

  
  ComplexNumber Product(in ComplexNumber first, in ComplexNumber second)
  {
    ComplexNumber result;  
    result.Real = first.Real * second.Real - first.Imagine * second.Imagine;
    result.Imagine = first.Real * second.Imagine + first.Imagine * second.Real;
    return result;
  }
  

  ComplexNumber Add(in ComplexNumber first, in ComplexNumber second)
  {
    ComplexNumber result;  
    result.Real = first.Real + second.Real;
    result.Imagine = first.Imagine + second.Imagine;
    return result;
  }
  

  float length2(in ComplexNumber number)
  {
     return number.Real * number.Real + number.Imagine * number.Imagine;
  }

  
  vec4 linearExtrapolation(const vec4 first, const vec4 last, int min, int max, int x)
  {
    float xDiff = float(max - min);
    return first + float(x - min) * (last - first) / xDiff;
  }
  
  int getOutOfBoundsIdx()
  {
    const int nMax = 400;

    ComplexNumber z;
    z.Real = 0.;
    z.Imagine = 0.;
  
    ComplexNumber c;
    c.Real = float((gl_FragCoord.x - xShift ) * fade);
    c.Imagine = float((gl_FragCoord.y - yShift) * fade); 

    for (int i = 0; i < nMax; i++)
    {
       z = Add (Product(z,z), c);
       if (length2(z) > 4.)
       {
         return i;
       }
    }
    
    return nMax;
  } 

  
  void main()
  {

    const vec4 blue = vec4(166, 202, 240, 255) / 255.;
    const vec4 biruz = vec4(123, 228, 209, 255) / 255.;
    const vec4 red = vec4(255, 0, 0, 255) / 255.;
    const vec4 green = vec4(0, 255, 0, 255) / 255.;
    const vec4 black = vec4(0, 0, 0, 255) / 255.;
     
    

    const int kThreshold0 = 0;
    const int kThreshold1 = 100;
    const int kThreshold2 = 150;
    const int kThreshold3 = 250;
    const int kThreshold4 = 390;
    

    int k = getOutOfBoundsIdx();

    vec4 color;
    if (k < kThreshold1)
    {
       color = linearExtrapolation(biruz, blue, kThreshold0, kThreshold1, k);
    }
    else if (k < kThreshold2)
    {
       color = linearExtrapolation(red, green, kThreshold1, kThreshold2, k);
    }
    else if (k < kThreshold3)
    {
       color = linearExtrapolation(biruz, blue, kThreshold2, kThreshold3, k);
    }
    else if (k < kThreshold4)
    {
       color = linearExtrapolation(biruz, green, kThreshold3, kThreshold4, k);
    }

    else
    {
       color = black;  
    }
    
    gl_FragColor = color;

  }

 `;

 
 
function initGL(canvas)
{
  var gl = canvas.getContext("webgl");
  if (!gl)
  {
     alert("Your browser does not support WebGL");
  }

  gl.viewportWidth = canvas.clientWidth;
  gl.viewportHeight = canvas.clientHeight;
  return gl;
}


function createShader(gl, shaderType, shaderCode) 
{
  var shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderCode);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
  {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}


function initShaders(gl) 
{
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderCode);
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderCode);

  shader_prog = gl.createProgram();
  gl.attachShader(shader_prog, vertexShader);
  gl.attachShader(shader_prog, fragmentShader);
  gl.linkProgram(shader_prog);

  if (!gl.getProgramParameter(shader_prog, gl.LINK_STATUS))
  {
    alert("Could not initialise shaders");
  }

  gl.useProgram(shader_prog);

  shader_prog.positionLocation = gl.getAttribLocation(shader_prog, "Position");
  gl.enableVertexAttribArray(shader_prog.positionLocation);
  
  var fadeLoc = gl.getUniformLocation(shader_prog, 'fade');
  gl.uniform1f(fadeLoc, 0.02);

  var xShiftLoc = gl.getUniformLocation(shader_prog, 'xShift');
  gl.uniform1f(xShiftLoc, 400);

  var yShiftLoc = gl.getUniformLocation(shader_prog, 'yShift');
  gl.uniform1f(yShiftLoc, 400);
  

  return shader_prog;
}



function initBuffers(gl) 
{
  triangleVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  var vertices = 
  [
       -1.0,  -1.0,  0.0,
      1.0, -1.0,  0.0,
       1.0, 1.0,  0.0,
       -1.0,  -1.0,  0.0,
      -1.0, 1.0,  0.0,
       1.0, 1.0,  0.0
       
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  triangleVertexPositionBuffer.itemSize = 3;
  triangleVertexPositionBuffer.numItems = 6;
  return triangleVertexPositionBuffer;
}


function drawScene(gl, triangleVertexPositionBuffer, shader_prog)
{
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //Pass triangle position to vertex shader
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  gl.vertexAttribPointer(shader_prog.positionLocation, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  //Draw triangle
  gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
}

function updateScene(gl, xShift, yShift, fade)
{
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var fadeLoc = gl.getUniformLocation(shader_prog, 'fade');
  gl.uniform1f(fadeLoc, fade);

  var xShiftLoc = gl.getUniformLocation(shader_prog, 'xShift');
  gl.uniform1f(xShiftLoc, xShift);

  var yShiftLoc = gl.getUniformLocation(shader_prog, 'yShift');
  gl.uniform1f(yShiftLoc, yShift);

  gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
}

var gl_;
var fade_ = 0.02; 
var xShift_ = 400;
var yShift_ = 400;
var xPrev_ = 0;
var yPrev_ = 0;
var touchDistancePrev_ = 0;

function mouseDownEvent(e)
{
  xPrev_ = e.pageX;
  yPrev_ = e.pageY;
}

function doMouseMove(e)
{
  var x = e.pageX;
  var y = e.pageY;
  
  xShift_ += (x - xPrev_);
  yShift_ -= (y - yPrev_);
  
  xPrev_ = x;
  yPrev_ = y;
  
  updateScene(gl_, xShift_, yShift_, fade_)  
}

function mouseMoveEvent(e)
{
  if (event.which == 1)
  {
    doMouseMove(e);
  }
}

function doScrolling(pageX, pageY, fadeNew)
{
  var x = pageX ;
  var y = gl_.viewportHeight - pageY;

  xShift_ = x - (x - xShift_) * fade_ / fadeNew;
  yShift_ = y - (y - yShift_) * fade_ / fadeNew;
  fade_ = fadeNew;
  updateScene(gl_, xShift_, yShift_, fade_);
}


function mouseWheelEvent(e)
{
  var k = e.originalEvent.wheelDelta > 0 ? 0.96 : 1.04;
  doScrolling(e.pageX, e.pageY, k * fade_ )
}  

function touchStartEvent(e)
{
  e.preventDefault();
  var touches = e.changedTouches;
  if (touches.length > 0) 
  {
    mouseDownEvent(touches[0]);
  }
}

function getDistanceFromTouch(touchEvt1, touchEvt2) 
{
  var dist = Math.sqrt(Math.pow(touchEvt1.pageX - touchEvt2.pageX, 2) +
  Math.pow(touchEvt1.pageY - touchEvt2.pageY, 2));
  return dist;
}

function doTouchZooming(touchEvt1, touchEvt2)
{
   var dist = getDistanceFromTouch(touchEvt1, touchEvt2);
   if (touchDistancePrev_ == 0) 
   {
     touchDistancePrev_ = dist;
     return;
   }
   
  var k = dist / touchDistancePrev_;
  var xCenter = (touchEvt1.pageX + touchEvt2.pageX) / 2;
  var yCenter = (touchEvt1.pageY + touchEvt2.pageY) / 2;
  doScrolling(xCenter, yCenter, fade_ / k);
  touchDistancePrev_  = dist;
}

function touchMoveEvent(e)
{
  var touches = e.touches;
  if (touches.length == 1) 
  {
    doMouseMove(touches[0]);
  }
  else if (touches.length == 2) 
  {
    doTouchZooming(touches[0], touches[1]);
  }
}

function touchEndEvent(e)
{
  touchDistancePrev_ = 0;
}


$(document).ready(function() 
{
   var canvas = document.getElementById("webgl_canvas");
   gl_ = initGL(canvas);
   var shader_prog = initShaders(gl_);
   var triangleVertexPositionBuffer = initBuffers(gl_);

   gl_.clearColor(0.0, 0.0, 0.0, 1.0);
   gl_.enable(gl_.DEPTH_TEST);

   drawScene(gl_, triangleVertexPositionBuffer, shader_prog);

   $('#webgl_canvas').bind(
     'mousewheel', 
     mouseWheelEvent);
     
   $('#webgl_canvas').bind(
     'mousedown', 
     mouseDownEvent);

   $('#webgl_canvas').bind(
     'mousemove', 
     mouseMoveEvent);
     
   $('#webgl_canvas').on(
     'touchstart', 
     touchStartEvent);

   $('#webgl_canvas').on(
     'touchmove', 
     touchMoveEvent);
     
   $('#webgl_canvas').on(
     'touchend', 
     touchEndEvent);
     
}
);

