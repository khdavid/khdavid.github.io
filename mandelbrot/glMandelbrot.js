var fragmentShaderCode = `
 precision mediump float;

 void main(void) {
     gl_FragColor = vec4(0.9, 0.3, 0.6, 1.0);
 }
 `;

 var vertexShaderCode = `
 attribute vec3 Position;

 uniform mat4 u_ModelView;
 uniform mat4 u_Persp;

 void main(void) {
     gl_Position = u_Persp * u_ModelView * vec4(Position, 1.0);
 }
 `;
 
 
 
 function initGL(canvas) {
     var gl
     try {
         gl = canvas.getContext("webgl");
         gl.viewportWidth = canvas.width;
         gl.viewportHeight = canvas.height;
     } catch (e) {
     }
     if (!gl) {
         alert("WebGL is not avaiable on your browser!");
     }
     return gl;
 }


 function getShader(gl, shaderType, shaderCode) {
     var shader = gl.createShader(shaderType);
     gl.shaderSource(shader, shaderCode);
     gl.compileShader(shader);

     if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
         alert(gl.getShaderInfoLog(shader));
         return null;
     }

     return shader;
 }


 var shader_prog;

 function initShaders(gl) {
     var fragmentShader = getShader(gl, gl.FRAGMENT_SHADER, fragmentShaderCode);
     var vertexShader = getShader(gl, gl.VERTEX_SHADER, vertexShaderCode);

     shader_prog = gl.createProgram();
     gl.attachShader(shader_prog, vertexShader);
     gl.attachShader(shader_prog, fragmentShader);
     gl.linkProgram(shader_prog);

     if (!gl.getProgramParameter(shader_prog, gl.LINK_STATUS)) {
         alert("Could not initialise shaders");
     }

     gl.useProgram(shader_prog);

     shader_prog.positionLocation = gl.getAttribLocation(shader_prog, "Position");
     gl.enableVertexAttribArray(shader_prog.positionLocation);

     shader_prog.u_PerspLocation = gl.getUniformLocation(shader_prog, "u_Persp");
     shader_prog.u_ModelViewLocation = gl.getUniformLocation(shader_prog, "u_ModelView");
 }



 var triangleVertexPositionBuffer;

 function initBuffers(gl) {

     triangleVertexPositionBuffer = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
     var vertices = [
          0.0,  1.0,  0.0,
         -1.0, -1.0,  0.0,
          1.0, -1.0,  0.0
     ];
     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
     triangleVertexPositionBuffer.itemSize = 3;
     triangleVertexPositionBuffer.numItems = 3;

 }

 var mvMatrix = mat4.create();
 var pMatrix = mat4.create();

 function drawScene(gl) {

     gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

     mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

     mat4.identity(mvMatrix);
     //Move our triangle
     mat4.translate(mvMatrix, [0.0, 0.0, -4.0]);

     //Pass triangle position to vertex shader
     gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
     gl.vertexAttribPointer(shader_prog.positionLocation, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

     //Pass model view projection matrix to vertex shader
     gl.uniformMatrix4fv(shader_prog.u_PerspLocation, false, pMatrix);
     gl.uniformMatrix4fv(shader_prog.u_ModelViewLocation, false, mvMatrix);

     //Draw our lovely triangle
     gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

 }

 
   $( document ).ready(function() 
  {
     var canvas = document.getElementById("webgl_hello_world");
     var gl = initGL(canvas);  
     initShaders(gl);
     initBuffers(gl);

     gl.clearColor(0.0, 0.0, 0.0, 1.0);
     gl.enable(gl.DEPTH_TEST);

     drawScene(gl);

  }
  );

