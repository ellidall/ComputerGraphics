export class WebGLView {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private positionBuffer: WebGLBuffer;
  private texBuffer: WebGLBuffer;
  private startTexture: WebGLTexture;
  private endTexture: WebGLTexture;
  private aPosition: number;
  private aTexCoord: number;
  private uTime: WebGLUniformLocation;
  private uRippleCenter: WebGLUniformLocation;
  private uImageA: WebGLUniformLocation;
  private uImageB: WebGLUniformLocation;
  private uResolution: WebGLUniformLocation;

  constructor(private canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext('webgl')!;
    this.program = this.createProgram();
    this.aPosition = this.gl.getAttribLocation(this.program, 'aPosition');
    this.aTexCoord = this.gl.getAttribLocation(this.program, 'aTexCoord');
    this.uTime = this.gl.getUniformLocation(this.program, 'uTime')!;
    this.uRippleCenter = this.gl.getUniformLocation(this.program, 'uRippleCenter')!;
    this.uImageA = this.gl.getUniformLocation(this.program, 'uImageA')!;
    this.uImageB = this.gl.getUniformLocation(this.program, 'uImageB')!;
    this.uResolution = this.gl.getUniformLocation(this.program, 'uResolution')!;
    this.positionBuffer = this.gl.createBuffer()!;
    this.texBuffer = this.gl.createBuffer()!;
    this.startTexture = this.createTexture('/assets/start.png');
    this.endTexture = this.createTexture('/assets/end.png');
    this.setRectangle();
  }

  private setRectangle() {
    const gl = this.gl;
    const positions = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1
    ]);
    const texCoords = new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
  }

  private createTexture(url: string): WebGLTexture {
    const gl = this.gl;
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const image = new Image();
    image.src = url;
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };
    return texture;
  }

  render(time: number, rippleCenter: [number, number], forward: boolean) {
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    // Атрибуты
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.enableVertexAttribArray(this.aPosition);
    gl.vertexAttribPointer(this.aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
    gl.enableVertexAttribArray(this.aTexCoord);
    gl.vertexAttribPointer(this.aTexCoord, 2, gl.FLOAT, false, 0, 0);

    if (forward) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.startTexture);
      gl.uniform1i(this.uImageA, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.endTexture);
      gl.uniform1i(this.uImageB, 1);
    } else {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.endTexture);
      gl.uniform1i(this.uImageA, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.startTexture);
      gl.uniform1i(this.uImageB, 1);
    }

    gl.uniform1f(this.uTime, time);
    gl.uniform2fv(this.uRippleCenter, rippleCenter);
    gl.uniform2f(this.uResolution, this.canvas.width, this.canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  createProgram(): WebGLProgram {
    const vsSource = `
    precision mediump float;
    attribute vec2 aPosition;
    attribute vec2 aTexCoord;
    varying vec2 vUv;
    void main() {
      vUv = aTexCoord;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
    `;
    const fsSource = `
    precision mediump float;
    uniform float uTime;
    uniform vec2 uRippleCenter;
    uniform sampler2D uImageA;
    uniform sampler2D uImageB;
    uniform vec2 uResolution;
    varying vec2 vUv;
    void main() {
      float dist = distance(vUv, uRippleCenter);
      float speed = 1.0;
      float wavelength = 0.45;
      float amplitude = 0.3;
      float front = uTime * speed;
      float wave = sin(20.0 * (dist - front)) * amplitude * smoothstep(front - wavelength, front, dist);
      vec2 displacedUv = vUv + (vUv - uRippleCenter) * wave;
      float reveal = smoothstep(front - wavelength, front, dist);
      vec4 colorA = texture2D(uImageA, displacedUv);
      vec4 colorB = texture2D(uImageB, vUv);
      gl_FragColor = mix(colorA, colorB, reveal);
    }
    `;
    // sin(20.0 * (dist - front))- периодическое колебание. 20 - частота волн
    // amplitude - максимальная сила искажения
    // smoothstep - ограничивает искажение в определённой зоне

    const gl = this.gl;
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      throw new Error('Vertex shader: ' + gl.getShaderInfoLog(vs));
    }
    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      throw new Error('Fragment shader: ' + gl.getShaderInfoLog(fs));
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error('Program: ' + gl.getProgramInfoLog(prog));
    }
    return prog;
  }
} 