var fragmentShaderCode = `
 precision mediump float;

 void main(void) {
     gl_FragColor = vec4(0.2, 0.3, 0.2, 1.0);
 }
 `;

var vertexShaderCode = `
 attribute vec3 Position;


 void main(void) {
     gl_Position = vec4(Position, 1.0);
 }
 `;
 
 
 
function initGL(canvas)
{
  var gl = canvas.getContext("webgl");
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;

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

  shader_prog.u_PerspLocation = gl.getUniformLocation(shader_prog, "u_Persp");
  shader_prog.u_ModelViewLocation = gl.getUniformLocation(shader_prog, "u_ModelView");
  
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

  //Draw our lovely triangle
  gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
}


$(document).ready(function() 
{
   var canvas = document.getElementById("webgl_canvas");
   var gl = initGL(canvas);
   var shader_prog = initShaders(gl);
   var triangleVertexPositionBuffer = initBuffers(gl);

   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   gl.enable(gl.DEPTH_TEST);

   drawScene(gl, triangleVertexPositionBuffer, shader_prog);

}
);

