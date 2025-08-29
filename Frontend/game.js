const canvas = document.getElementById("can");
const gl = canvas.getContext("webgl");

const vert_simple = CompileShader(VERTEX_SHADER_SIMPLE, gl.VERTEX_SHADER, gl);
const frag_simple = CompileShader(FRAGMENT_SHADER_SIMPLE, gl.FRAGMENT_SHADER, gl);

var program = gl.createProgram();
gl.attachShader(program, vert_simple);
gl.attachShader(program, frag_simple);
gl.linkProgram(program);


gl.clearColor(1,0,0,1);
gl.clear(gl.COLOR_BUFFER_BIT);

requestAnimationFrame(MainLoop);

var startTime = -1;

function UpdateGame(){

}

function UpdateDisplay(){

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
    return shader;
}

const VERTEX_SHADER_SIMPLE = 
`
#version 300 es

in vec4 position;
out vec4 colour;

void main(){
  colour = vec4(0., 0., 1., 1.);
  gl_Position = position;
}
`;

const FRAGMENT_SHADER_SIMPLE = 
`
#version 300 es

in vec4 colour;
out vec4 fragColour;

void main(){
  fragColour = colour;
}
`