const canvas : HTMLCanvasElement = document.getElementById("can") as HTMLCanvasElement;
/** @type {WebGLRenderingContext} */
const gl : WebGL2RenderingContext = canvas.getContext("webgl2") as WebGL2RenderingContext;

const TILE_SIZE = 32;

var startTime = -1;
var program;
var vertexBuffer;
var vao;
var vertexLength;
var colourBuffer;
var tiles = Array.from({length: 357}, () => [Math.random(), Math.random()]);

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
  var grid : number[] = [];
  var tileW = Math.ceil(width / 2 / tileSize);
  var tileH = Math.ceil(height / 2 / tileSize);
  const square = [
    [0., 0.], 
    [1., 0.], 
    [0., 1.],
    [0., 1.],
    [1., 0.],
    [1., 1.], 
  ];
  for (let ii = -tileW; ii < tileW + 1; ii++){
    for (let jj = -tileH; jj < tileH + 1; jj++){
      for (let item = 0; item < square.length; item++){
        grid.push(square[item][0] + ii);
        grid.push(square[item][1] + jj);
      }
    }
  }
  return grid;
}

function GetScaleOffset(tileSize, width, height, position){
  var wScale = tileSize / width * 2;
  var hScale = tileSize / height * 2
  return [
    wScale,
    hScale,
    -(position[0] % 1) * wScale,
    -(position[1] % 1) * hScale,
  ];
}

function GetGridTile(tiles, evalFunction){
  var gridTiles = [];
  for (let ii = 0; ii < tiles.length; ii++){
    for (let jj = 0; jj < 6; jj++){
      gridTiles = gridTiles.concat(tiles[ii]);
    }
  }
  return gridTiles;
}

function Init(){
  program = CreateProgram({v: VERTEX_SHADER_SIMPLE, f: FRAGMENT_SHADER_SIMPLE}, gl);
  gl.useProgram(program);

  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  var vertexPos = GetGridVertices(TILE_SIZE, 640, 480);
  vertexLength = vertexPos.length;

  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPos), gl.STATIC_DRAW);

  var loc = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var vertexCol = GetGridTile(tiles, () => {});
  console.log(tiles);
  colourBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexCol), gl.DYNAMIC_DRAW);
  console.log(vertexCol);

  var locCol = gl.getAttribLocation(program, "inCol");
  gl.enableVertexAttribArray(locCol);
  gl.vertexAttribPointer(locCol, 2, gl.FLOAT, false, 0, 0);

  gl.useProgram(program);

  var scaleOffset = gl.getUniformLocation(program, "scaleOffset");
  var scaleOffsetValue = GetScaleOffset(TILE_SIZE, 640, 480, [0,0]);
  gl.uniform4fv(scaleOffset, scaleOffsetValue);

  requestAnimationFrame(MainLoop);
}

function UpdateGame(deltaTime){
  offset += deltaTime / 1000;
  offset = offset % 1;
}

var offset = 0;

function UpdateDisplay(){
  var scaleOffset = gl.getUniformLocation(program, "scaleOffset");
  var scaleOffsetValue = GetScaleOffset(TILE_SIZE, 640, 480, [offset, offset]);
  gl.uniform4fv(scaleOffset, scaleOffsetValue);


  gl.clearColor(1,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, vertexLength / 2);
}

function MainLoop(currentTime){
    if (startTime != -1) {
        var deltaTime = currentTime - startTime;
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
in vec2 inCol;
uniform vec4 scaleOffset;
out vec4 colour;

void main(){
  colour = vec4(inCol.xy, 1., 1.);
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
