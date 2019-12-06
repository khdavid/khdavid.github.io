var vertexShaderCode = `
 attribute vec3 Position;


 void main(void) {
     gl_Position = vec4(Position, 1.0);
 }
 `;


var fragmentShaderCode = `
  precision lowp float;
  float xShift = 200.0;
  float yShift = 50.0;
  float fade = 0.02;

  struct ComplexNumber
  {
    float Real;
    float Imagine;
  };

  struct ComplexNumberFast
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
  
  ComplexNumberFast Product(in ComplexNumberFast first, in ComplexNumberFast second)
  {
    ComplexNumberFast result;  
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
  
  ComplexNumberFast Add(in ComplexNumberFast first, in ComplexNumberFast second)
  {
    ComplexNumberFast result;  
    result.Real = first.Real + second.Real;
    result.Imagine = first.Imagine + second.Imagine;
    return result;
  }

  float length2(in ComplexNumber number)
  {
     return number.Real * number.Real + number.Imagine * number.Imagine;
  }

  float length2(in ComplexNumberFast number)
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
    const int nMax = 1000;

    ComplexNumberFast z;
    z.Real = 0.;
    z.Imagine = 0.;
  
    ComplexNumberFast c;
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
    

    const float fadeThreshold = 1e-7;
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

