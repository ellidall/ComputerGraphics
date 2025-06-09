import {SurfaceModel} from '../model/SurfaceModel';
import {CameraModel} from '../model/CameraModel';
import {mat4, mat3, vec3} from 'gl-matrix';

export class WebGLView {
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private positionBuffer: WebGLBuffer;
    private colorBuffer: WebGLBuffer;
    private triangleIndexBuffer: WebGLBuffer;
    private aPosition: number;
    private aColor: number;
    private uT: WebGLUniformLocation;
    private uModelView: WebGLUniformLocation;
    private uProjection: WebGLUniformLocation;
    private uNormalMatrix: WebGLUniformLocation;
    private triangleIndexCount: number = 0;

    constructor(private canvas: HTMLCanvasElement) {
        this.gl = canvas.getContext('webgl')!;
        this.program = this.createProgram();
        this.aPosition = this.gl.getAttribLocation(this.program, 'aPosition');
        this.aColor = this.gl.getAttribLocation(this.program, 'aColor');
        this.uT = this.gl.getUniformLocation(this.program, 'uT')!;
        this.uModelView = this.gl.getUniformLocation(this.program, 'uModelView')!;
        this.uProjection = this.gl.getUniformLocation(this.program, 'uProjection')!;
        this.uNormalMatrix = this.gl.getUniformLocation(this.program, 'uNormalMatrix')!;
        this.positionBuffer = this.gl.createBuffer()!;
        this.colorBuffer = this.gl.createBuffer()!;
        this.triangleIndexBuffer = this.gl.createBuffer()!;
    }

    setSurface(model: SurfaceModel) {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, model.colors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.triangleIndices, gl.STATIC_DRAW);
        this.triangleIndexCount = model.triangleIndices.length;
    }

    render(model: SurfaceModel, camera: CameraModel) {
        const gl = this.gl;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(this.program);
        // Атрибуты
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(this.aPosition);
        gl.vertexAttribPointer(this.aPosition, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.enableVertexAttribArray(this.aColor);
        gl.vertexAttribPointer(this.aColor, 3, gl.FLOAT, false, 0, 0);
        // Индексы
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleIndexBuffer);
        // Uniforms
        gl.uniform1f(this.uT, model.morphingParameter);
        // Считаем modelView и normalMatrix
        const view = this.lookAt(camera.getEye(), camera.target, [0, 1, 0]);
        const modelView = mat4.create();
        mat4.multiply(modelView, view, model.modelMatrix as mat4);
        gl.uniformMatrix4fv(this.uModelView, false, modelView);
        gl.uniformMatrix4fv(this.uProjection, false, this.perspective(45, this.canvas.width / this.canvas.height, 0.1, 100));
        const normalMat = mat3.create();
        mat3.normalFromMat4(normalMat, modelView);
        gl.uniformMatrix3fv(this.uNormalMatrix, false, normalMat);
        // Сплошная заливка
        gl.enable(gl.DEPTH_TEST);
        gl.drawElements(gl.TRIANGLES, this.triangleIndexCount, gl.UNSIGNED_SHORT, 0);
    }

    // --- МАТРИЦЫ ---
    lookAt(eye: vec3, center: vec3, up: vec3): Float32Array {
        const out = mat4.create();
        mat4.lookAt(out, eye, center, up);
        return out as Float32Array;
    }

    perspective(fovy: number, aspect: number, near: number, far: number): Float32Array {
        const out = mat4.create();
        mat4.perspective(out, (fovy * Math.PI) / 180, aspect, near, far);
        return out as Float32Array;
    }

    // --- ШЕЙДЕРЫ ---
    createProgram(): WebGLProgram {
        const vsSource = `
    attribute vec2 aPosition;
    attribute vec3 aColor;
    uniform float uT;
    uniform mat4 uModelView;
    uniform mat4 uProjection;
    uniform mat3 uNormalMatrix;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vColor;
    
    vec3 mobius(vec2 uv) {
      float u = uv.x * 2.0 * 3.1415926;
      float v = (uv.y - 0.5) * 1.0;
      float x = (1.0 + v * cos(u / 2.0)) * cos(u);
      float y = (1.0 + v * cos(u / 2.0)) * sin(u);
      float z = v * sin(u / 2.0);
      return vec3(x, y, z);
    }
    vec3 klein(vec2 uv) {
      float u = uv.x * 2.0 * 3.1415926;
      float v = uv.y * 2.0 * 3.1415926;
      float x, y, z;
      if (u < 3.1415926) {
        x = 3.0 * cos(u) * (1.0 + sin(u)) + (2.0 * (1.0 - cos(u) / 2.0)) * cos(u) * cos(v);
        z = -8.0 * sin(u) - 2.0 * (1.0 - cos(u) / 2.0) * sin(u) * cos(v);
      } else {
        x = 3.0 * cos(u) * (1.0 + sin(u)) + (2.0 * (1.0 - cos(u) / 2.0)) * cos(v + 3.1415926);
        z = -8.0 * sin(u);
      }
      y = -2.0 * (1.0 - cos(u) / 2.0) * sin(v);
      return vec3(x, y, z) * 0.1;
    }
    vec3 surface(vec2 uv, float t) {
      vec3 p1 = mobius(uv);
      vec3 p2 = klein(uv);
      return mix(p1, p2, t);
    }
    vec3 computeNormal(vec2 uv, float t) {
      float eps = 0.001;
      vec3 p = surface(uv, t);
      vec3 pu = surface(uv + vec2(eps, 0.0), t) - p;
      vec3 pv = surface(uv + vec2(0.0, eps), t) - p;
      return normalize(cross(pu, pv));
    }
    void main() {
      vec2 uv = aPosition;
      vec3 pos = surface(uv, uT);
      vNormal = normalize(uNormalMatrix * computeNormal(uv, uT));
      vPosition = (uModelView * vec4(pos, 1.0)).xyz;
      vColor = aColor;
      gl_Position = uProjection * uModelView * vec4(pos, 1.0);
    }
    `;
        const fsSource = `
    precision mediump float;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vColor;
    void main() {
      vec3 N = normalize(vNormal);
      vec3 L = normalize(vec3(1.0, 1.0, 1.0));

      if (!gl_FrontFacing) N = -N;

      float diff = max(dot(N, L), 0.0);
      vec3 color = vec3(0.1, 0.7, 0.1) * diff + vec3(0.1);
      gl_FragColor = vec4(color, 1.0);
    }
    `;

        // поправить артефакт с освещением
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