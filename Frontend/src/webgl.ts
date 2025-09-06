function CompileShader(source: string, type: number, gl: WebGL2RenderingContext){
    var shader = gl.createShader(type) as WebGLShader;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    console.log(gl.getShaderInfoLog(shader));
    return shader;
}

export {CompileShader};