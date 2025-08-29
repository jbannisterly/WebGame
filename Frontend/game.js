const canvas = document.getElementById("can");
/** @type {WebGLRenderingContext} */
const gl = canvas.getContext("webgl2");


var startTime = -1;
var program;
var vertexBuffer;
var vao;

function Init(){
  const vert_simple = CompileShader(VERTEX_SHADER_SIMPLE, gl.VERTEX_SHADER, gl);
  const frag_simple = CompileShader(FRAGMENT_SHADER_SIMPLE, gl.FRAGMENT_SHADER, gl);

  program = gl.createProgram();
  gl.attachShader(program, vert_simple);
  gl.attachShader(program, frag_simple);
  gl.linkProgram(program);
  gl.useProgram(program);

  var vertexPos = [
    0., 0.,
    0.5, 0.,
    0.5, 0.5,
  ]

  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPos), gl.STATIC_DRAW);

  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  var loc = gl.getAttribLocation(program, "position");
  console.log(loc);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  requestAnimationFrame(MainLoop);
}

function UpdateGame(){

}

function UpdateDisplay(){

  vertexPos()
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPos), gl.STATIC_DRAW);


  gl.clearColor(1,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function MainLoop(currentTime){
    if (startTime != -1) {
        deltaTime = currentTime - startTime;
        UpdateGame(deltaTime);
    }
    startTime = currentTime;
    UpdateDisplay();
    requestAnimationFrame(MainLoop);
}

function CompileShader(source, type, gl){
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    console.log(gl.getShaderInfoLog(shader));
    return shader;
}

const VERTEX_SHADER_SIMPLE = 
`#version 300 es

precision highp float;

in vec2 position;
out vec4 colour;

void main(){
  colour = vec4(0., 0., 1., 1.);
  gl_Position = vec4(position.x, position.y, 1., 1.);
}
`;

const FRAGMENT_SHADER_SIMPLE = 
`#version 300 es

precision highp float;

in vec4 colour;
out vec4 fragColour;

void main(){
  fragColour = colour;
}
`

Init();
