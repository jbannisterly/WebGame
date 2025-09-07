function CompileShader(source: string, type: number, gl: WebGL2RenderingContext){
    var shader = gl.createShader(type) as WebGLShader;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    console.log(gl.getShaderInfoLog(shader));
    return shader;
}

function CreateProgram(programInfo: {[index: string]: string}, gl: WebGL2RenderingContext){
  var program = gl.createProgram();
  var vert = CompileShader(programInfo["v"], gl.VERTEX_SHADER, gl);
  var frag = CompileShader(programInfo["f"], gl.FRAGMENT_SHADER, gl);

  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  return program;
}

function CreateTexture(src: string, gl: WebGL2RenderingContext){
  var image : HTMLImageElement = new Image();
  var texture = CreateDefaultTexture(gl);
  image.src = src;
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // gl.generateMipmap(gl.TEXTURE_2D);
  };
  return texture;
}

function CreateDefaultTexture(gl: WebGL2RenderingContext){
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 0, 128, 255]));
  return texture;
}



export {CreateProgram, CreateTexture};