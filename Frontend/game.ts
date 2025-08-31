const canvas : HTMLCanvasElement = document.getElementById("can") as HTMLCanvasElement;
/** @type {WebGLRenderingContext} */
const gl : WebGL2RenderingContext = canvas.getContext("webgl2") as WebGL2RenderingContext;

const TILE_SIZE = 256;

var startTime = -1;
var program;
var vertexBuffer;
var vao;
var vertexLength;
var colourBuffer;
var textureBuffer;
var vertexPos;

class Tile{
  location: number[];
  data: number[][];
  size: number;

  constructor(location: number[], size: number){
    this.location = location;
    this.data = new Array(size * 2).fill(new Array(size * 2).fill(0));
    this.size = size;
  }

  GetTile(location){
    var lookup = [location[0] - this.location[0] + this.size, location[1] - this.location[1] + this.size];
    return this.data[lookup[0]][lookup[1]];
  }
}
 
var tile = GenerateTiles([0,0], (loc) => {
  return ((loc[0] * .23 + loc[1] * .85) + 100) % 1;
});

function GenerateTiles(location: number[], tileGenFunction: (location: number[]) => number){
  var newTile = new Tile(location, 32);
  newTile.data = newTile.data.map((col, colIndex) =>{
    return col.map((row, rowIndex) =>{
      return tileGenFunction([location[0] + colIndex, location[1] + rowIndex]);
    });
  });
  return newTile;
}

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

function CreateTexture(src: string){
  var image : HTMLImageElement = new Image();
  var texture = CreateDefaultTexture();
  image.src = src;
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  };
  return texture;
}

function CreateDefaultTexture(){
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 0, 128, 255]));
  return texture;
}

CreateTexture("res/texture_test.png");

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

function GetGridVertexInformation(vertices, offset, evalFunction : (tilePos: number[], vertex: number[]) => number[]){
  var gridInfo: number[] = [];
  for (let ii = 0; ii < vertices.length / 12; ii++){
    var tilePos = [vertices[ii * 12] + offset[0], vertices[ii * 12 + 1] + offset[1]];
    for (let jj = 0; jj < 6; jj++){
      var vertex = [vertices[ii * 12 + jj * 2] + offset[0], vertices[ii * 12 + jj * 2 + 1] + offset[1]];
      gridInfo = gridInfo.concat(evalFunction(tilePos, vertex));
    }
  }
  return gridInfo;
}

function GetTextureCoords(vertexPos, offset2D){
  let textureSize = 1024;
  let tileSize = 128;

  let nWidth = textureSize / tileSize;
  let tileRel = tileSize / textureSize;
  let pixel = 1 / textureSize;

  return GetGridVertexInformation(vertexPos, offset2D,
    (tilePos, vertex) => {
      var index = 1;
      
      let base = [index % nWidth, nWidth - Math.floor(index / nWidth) - 1];
      let relative = [vertex[0] - tilePos[0], vertex[1] - tilePos[1]];

      return [
        base[0] * tileRel + pixel / 2 + relative[0] * (tileRel - pixel), 
        1 - base[1] * tileRel - pixel / 2 - relative[1] * (tileRel - pixel)
      ];
    }
  );
}

function Init(){
  program = CreateProgram({v: VERTEX_SHADER_SIMPLE, f: FRAGMENT_SHADER_SIMPLE}, gl);
  gl.useProgram(program);

  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  vertexPos = GetGridVertices(TILE_SIZE, 640, 480);
  vertexLength = vertexPos.length;

  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPos), gl.STATIC_DRAW);

  var loc = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var vertexCol = GetGridVertexInformation(vertexPos, [0,0],
    (tilePos, vertex) => {
      return [tile.GetTile(tilePos), Math.sin(tile.GetTile(tilePos)), Math.cos(tile.GetTile(tilePos))];
    }
  );

  colourBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexCol), gl.DYNAMIC_DRAW);
  var locCol = gl.getAttribLocation(program, "inCol");
  gl.enableVertexAttribArray(locCol);
  gl.vertexAttribPointer(locCol, 3, gl.FLOAT, false, 0, 0);
  console.log(locCol + " col");

  textureBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
  var locTex = gl.getAttribLocation(program, "inTex");
  gl.enableVertexAttribArray(locTex);
  gl.vertexAttribPointer(locTex, 2, gl.FLOAT, false, 0, 0);
  console.log(locTex + " tex");


  gl.useProgram(program);

  var scaleOffset = gl.getUniformLocation(program, "scaleOffset");
  var scaleOffsetValue = GetScaleOffset(TILE_SIZE, 640, 480, [0,0]);
  gl.uniform4fv(scaleOffset, scaleOffsetValue);

  requestAnimationFrame(MainLoop);
}

function UpdateGame(deltaTime){
  // offset += deltaTime / 1000;
}

var offset = 0;

function UpdateDisplay(){
  var scaleOffset = gl.getUniformLocation(program, "scaleOffset");
  var scaleOffsetValue = GetScaleOffset(TILE_SIZE, 640, 480, [offset, offset]);
  gl.uniform4fv(scaleOffset, scaleOffsetValue);

  var vertexCol = GetGridVertexInformation(vertexPos, [Math.floor(offset), Math.floor(offset)],
    (tilePos, vertex) => {
      return [tile.GetTile(tilePos), Math.sin(tile.GetTile(tilePos)), Math.cos(tile.GetTile(tilePos))];
    }
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexCol), gl.DYNAMIC_DRAW);

  var vertexTex = GetTextureCoords(vertexPos, [Math.floor(offset), Math.floor(offset)]);
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTex), gl.DYNAMIC_DRAW);

  console.log(vertexTex);

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
in vec3 inCol;
in vec2 inTex;
uniform vec4 scaleOffset;
out vec4 vertColour;
out vec2 vertTex;

void main(){
  vertColour = vec4(inCol.x, 1., 1., 1.);
  vertTex = inTex;
  gl_Position = vec4(position.xy * scaleOffset.xy + scaleOffset.zw, 1., 1.);
}
`;

const FRAGMENT_SHADER_SIMPLE = 
`#version 300 es

precision mediump float;

in vec4 vertColour;
in vec2 vertTex;
uniform sampler2D tileMap;
out vec4 fragColour;

void main(){
  fragColour = vec4(texture(tileMap, vertTex).xyz, 1.) + vec4(0.01, 0.001, 0., 0.) * vertColour;
}
`

Init();
