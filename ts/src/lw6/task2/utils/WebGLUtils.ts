const vertexShaderSource = `
  attribute vec3 a_position;
  attribute vec2 a_texcoord;
  uniform mat4 u_matrix;
  varying vec2 v_texcoord;

  void main() {
    gl_Position = u_matrix * vec4(a_position, 1.0);
    v_texcoord = a_texcoord;	
  }
`

const fragmentShaderSource = `
  precision mediump float;
  uniform sampler2D u_texture;
  varying vec2 v_texcoord;

  void main() {
    gl_FragColor = texture2D(u_texture, v_texcoord);
  }
`

const compileShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader => {
    const shader = gl.createShader(type)
    if (!shader) {
        throw new Error('Не удалось создать шейдер')
    }
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const err = gl.getShaderInfoLog(shader)
        gl.deleteShader(shader)
        throw new Error('Ошибка компиляции шейдера: ' + err)
    }
    return shader
}

const createShaderProgram = (gl: WebGLRenderingContext): WebGLProgram => {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

    const program = gl.createProgram()
    if (!program) {
        throw new Error('Не удалось создать программу')
    }
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const err = gl.getProgramInfoLog(program)
        throw new Error('Ошибка линковки программы: ' + err)
    }
    return program
}

export {
    createShaderProgram,
}