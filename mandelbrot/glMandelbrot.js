var vertexShaderCode = 
`#version 300 es
 in vec3 Position;


 void main(void) {
     gl_Position = vec4(Position, 1.0);
 }
 `;


var fragmentShaderCode = 
 `#version 300 es
  precision highp float;
  uniform float xShift;
  uniform float yShift;
  uniform float fade;
  out vec4 color;


  vec2 sumStrict(float a, float b)
  {
    //|a| > |b|
    vec2 result;
    result.x = a + b;
    result.y = b - (result.x - a);
    return result;
  }

  vec2 sum(float a, float b)
  {
    return (abs(a) > abs(b)) ? sumStrict(a, b) : sumStrict(b, a);
  }

  vec2 minus(float a, float b)
  {
    return sum(a, -b);
  }

  vec2 sum(vec2 a, vec2 b)
  {
    vec2 highSum = sum(a.x, b.x);
    vec2 lowSum = sum(a.y, b.y);
    return highSum;
    highSum.y += lowSum.x;
    highSum = sum(highSum.x, highSum.y);

    highSum.y += lowSum.y;
    highSum = sum(highSum.x, highSum.y);

    return highSum;
  }

  vec2 minus(vec2 a, vec2 b)
  {
    return sum(a, -b);
  }

  vec2 split(float a)
  {
    float split = 4097.0; // 2^12 + 1
    vec2 result;
    float t = a * split;
    result.x = t - (t - a);
    result.y = a - result.x;
    return result;
  }

  vec2 product(float a, float b)
  {
    vec2 result;
    result.x = a * b;
    vec2 splA = split(a);
    vec2 splB = split(b);
    float error = result.x - splA.x * splB.x -
    splA.x * splB.y - splA.y * splB.x;
    result.y = splA.y * splB.y - error; 
    return result;
  }

  vec2 product(vec2 a, vec2 b)
  {
    vec2 result;
    result = product(a.x, b.x);
    result.y += a.x * b.y;
    result.y += a.y * b.x;
    result = sum(result.x, result.y);
    return result;
  }


  struct ComplexNumber
  {
    float Real;
    float Imagine;
  };

  struct ComplexNumber64
  {
    vec2 Real;
    vec2 Imagine;
  };

  
  ComplexNumber Product(in ComplexNumber first, in ComplexNumber second)
  {
    ComplexNumber result;  
    result.Real = first.Real * second.Real - first.Imagine * second.Imagine;
    result.Imagine = first.Real * second.Imagine + first.Imagine * second.Real;
    return result;
  }

  ComplexNumber64 Product(in ComplexNumber64 first, in ComplexNumber64 second)
  {
    ComplexNumber64 result;  
    result.Real = minus(product(first.Real, second.Real), product(first.Imagine, second.Imagine));
    result.Imagine = sum(product(first.Real , second.Imagine), product(first.Imagine, second.Real));
    return result;
  }
  

  ComplexNumber Add(in ComplexNumber first, in ComplexNumber second)
  {
    ComplexNumber result;  
    result.Real = first.Real + second.Real;
    result.Imagine = first.Imagine + second.Imagine;
    return result;
  }

  ComplexNumber64 Add(in ComplexNumber64 first, in ComplexNumber64 second)
  {
    ComplexNumber64 result;  
    result.Real = sum(first.Real, second.Real);
    result.Imagine = sum(first.Imagine, second.Imagine);
    return result;
  }
  

  float length2(in ComplexNumber number)
  {
     return number.Real * number.Real + number.Imagine * number.Imagine;
  }

  vec2 length2(in ComplexNumber64 number)
  {
     return sum(product(number.Real, number.Real), product(number.Imagine, number.Imagine));
  }

  
  vec4 linearExtrapolation(const vec4 first, const vec4 last, int min, int max, int x)
  {
    float xDiff = float(max - min);
    return first + float(x - min) * (last - first) / xDiff;
  }
  
  int getOutOfBoundsIdx()
  {
    const int nMax = 400;

    ComplexNumber64 z;
    z.Real = vec2(0, 0);
    z.Imagine = vec2(0, 0);
  
    ComplexNumber64 c;
    c.Real = product(minus(float(gl_FragCoord.x), xShift ), vec2(fade, 0));
    c.Imagine = product(minus(float(gl_FragCoord.y), yShift), vec2(fade,0)); 

    for (int i = 0; i < nMax; i++)
    {
       z = Add (Product(z, z), c);
       if (length2(z).x > 4.)
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

  }

 `;

 
 
function initGL(canvas)
{
  var gl = canvas.getContext("webgl2");
  if (!gl)
  {
     alert("Your browser does not support WebGL2");
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
  //gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
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
var xShift_ = 0;
var yShift_ = 0;
var xPrev_ = 0;
var yPrev_ = 0;
var touchDistancePrev_ = 0;

function getRelativeCoordinates(e)
{
  var rect = e.target.getBoundingClientRect();
  var x = e.clientX - rect.left; 
  var y = e.clientY - rect.top;  
  return [x, y];
}

function mouseDownEvent(e)
{
  [xPrev_, yPrev_] = getRelativeCoordinates(e);
}

function doMouseMove(e)
{
  [x,y] =  getRelativeCoordinates(e);
  xShift_ += (x - xPrev_);
  yShift_ -= (y - yPrev_);
  
  xPrev_ = x;
  yPrev_ = y;
  
  updateScene(gl_, xShift_, yShift_, fade_)  
}

function mouseMoveEvent(e)
{
  if (e.buttons == 1)
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
  e.preventDefault();

  var k = e.originalEvent.deltaY > 0 ? 0.9 : 1.1;
  [x,y] =  getRelativeCoordinates(e);
  doScrolling(x, y, k * fade_ )
}  

function touchStartEvent(e)
{
  $('#log').html("touch start");
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
  [x1, y1] = getRelativeCoordinates(touchEvt1);
  [x2, y2] = getRelativeCoordinates(touchEvt2);

  var xCenter = (x1 + x2) / 2;
  var yCenter = (y1 + y2) / 2;
  doScrolling(xCenter, yCenter, fade_ / k);
  touchDistancePrev_  = dist;
}

function touchMoveEvent(e)
{
  $('#log').html("touchMove");
  var touches = e.touches;
  if ((touches.length == 1) && (touchDistancePrev_ == 0)) 
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
  var length = e.touches.length;
  $('#log').html(length);
  if (length == 0)
  {
    touchDistancePrev_ = 0;
  }
}


function setupScene()
{
   var width = $(window).width();
   var height = $(window).height() - 40;
   xShift_ = width / 2;
   yShift_ = height / 2;

   var canvas = document.getElementById("webgl_canvas");
   canvas.width = width;
   canvas.height = height;

   
   gl_ = initGL(canvas);
   var shader_prog = initShaders(gl_);
   var triangleVertexPositionBuffer = initBuffers(gl_);

   gl_.clearColor(0.0, 0.0, 0.0, 1.0);
   gl_.enable(gl_.DEPTH_TEST);

   drawScene(gl_, triangleVertexPositionBuffer, shader_prog);
   updateScene(gl_, xShift_, yShift_, fade_);
}

$(window).resize(function() 
{
  setupScene();
}
);

window.onpageshow = function() 
{
   setupScene();

   $('#webgl_canvas').on(
     'wheel', 
     mouseWheelEvent);
     
   $('#webgl_canvas').on(
     'mousedown', 
     mouseDownEvent);

   $('#webgl_canvas').on(
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
     
};

