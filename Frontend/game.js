const canvas = document.getElementById("can");
/** @type {WebGLRenderingContext} */
const gl = canvas.getContext("webgl2");


var startTime = -1;
var program;
var vertexBuffer;
var vao;
var vertexLength;

function CompileShader(source, type, gl){
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    console.log(gl.getShaderInfoLog(shader));
    return shader;
}

function CreateProgram(programInfo, gl){
  var program = gl.createProgram();
  var vert = CompileShader(programInfo["v"], gl.VERTEX_SHADER, gl);
  var frag = CompileShader(programInfo["f"], gl.FRAGMENT_SHADER, gl);

  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  return program;
}

function GetGridVertices(tileSize, width, height){
  var grid = [];
  var tileW = Math.ceil(width / tileSize) + 1;
  var tileH = Math.ceil(height / tileSize) + 1;
  const square = [
    [0., 0.], 
    [1., 0.], 
    [0., 1.],
    [0., 1.],
    [1., 0.],
    [1., 1.], 
  ];
  for (let ii = 0; ii < tileW; ii++){
    for (let jj = 0; jj < tileH; jj++){
      for (let item = 0; item < square.length; item++){
        grid.push(square[item][0] + ii);
          grid.push(square[item][1] + jj);
      }
    }
  }
  return grid;
}

function GetScaleOffset(tileSize, width, height, subOffset){
  var wScale = tileSize / width * 2;
  var hScale = tileSize / height * 2
  return [
    wScale,
    hScale,
    subOffset[0] * wScale -1,
    subOffset[1] * hScale - 1,
  ];
}

function Init(){
  program = CreateProgram({v: VERTEX_SHADER_SIMPLE, f: FRAGMENT_SHADER_SIMPLE}, gl);
  gl.useProgram(program);

  var vertexPos = GetGridVertices(32, 640, 480);
  vertexLength = vertexPos.length;

  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPos), gl.STATIC_DRAW);

  console.log(vertexPos)

  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  var loc = gl.getAttribLocation(program, "position");
  console.log(loc);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  gl.useProgram(program);

  var scaleOffset = gl.getUniformLocation(program, "scaleOffset");
  console.log(scaleOffset);
  var scaleOffsetValue = GetScaleOffset(32, 640, 480, [0,0]);
  console.log(scaleOffsetValue);
  gl.uniform4fv(scaleOffset, scaleOffsetValue);

  requestAnimationFrame(MainLoop);
}

function UpdateGame(){

}

function UpdateDisplay(){

  gl.clearColor(1,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, vertexLength / 2);
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

const VERTEX_SHADER_SIMPLE = 
`#version 300 es

precision highp float;


in vec2 position;
uniform vec4 scaleOffset;
out vec4 colour;

void main(){
  colour = vec4(0., 0., 1., 1.);
  gl_Position = vec4(position.xy * scaleOffset.xy + scaleOffset.zw, 1., 1.);
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
