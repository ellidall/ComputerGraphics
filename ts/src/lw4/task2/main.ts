import './index.css'
import {mat4, vec3} from 'gl-matrix'
import {createShaderProgram} from './WebGLUtils'
import {Player} from './Player'
import {Maze} from './Maze'

class App {
    private readonly canvas: HTMLCanvasElement
    private readonly gl: WebGLRenderingContext
    private readonly program: WebGLProgram
    private readonly maze: Maze
    private player: Player

    private cubeVertexBuffer: WebGLBuffer | null = null
    private cubeIndexBuffer: WebGLBuffer | null = null
    private cubeIndexCount: number = 0

    private readonly uMatrixLocation: WebGLUniformLocation
    private readonly uColorLocation: WebGLUniformLocation

    private keys: { [key: string]: boolean } = {}
    private lastTime: number = 0

    constructor() {
        this.canvas = document.createElement('canvas')
        document.body.appendChild(this.canvas)
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        const gl = this.canvas.getContext('webgl')
        if (!gl) throw new Error('WebGL не поддерживается')
        this.gl = gl

        this.program = createShaderProgram(gl)
        gl.useProgram(this.program)

        const matrixLoc = gl.getUniformLocation(this.program, 'u_matrix')
        const colorLoc = gl.getUniformLocation(this.program, 'u_color')
        if (!matrixLoc || !colorLoc) throw new Error('Не удалось получить uniform-переменные')
        this.uMatrixLocation = matrixLoc
        this.uColorLocation = colorLoc

        this.maze = new Maze()
        this.player = new Player()

        this.initCubeBuffers()
        this.setupEventListeners()

        this.render(this.lastTime)
    }

    run() {
        this.render(this.lastTime)
    }

    private render = (time: number) => {
        const deltaTime = (time - this.lastTime) / 1000 // time в миллисекундах, делим на 1000, чтобы получить секунды
        this.lastTime = time
        requestAnimationFrame(this.render)
        const gl = this.gl
        gl.enable(gl.DEPTH_TEST)
        gl.clearColor(0.2, 0.2, 0.2, 1)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        // Перед отрисовкой обновляем позицию игрока
        this.updatePlayer(deltaTime)

        const projectionMatrix = mat4.create()
        const fov = (60 * Math.PI) / 180
        const aspect = this.canvas.width / this.canvas.height
        const near = 0.1
        const far = 100
        mat4.perspective(projectionMatrix, fov, aspect, near, far)

        // Камера установлена в позиции игрока, высота фиксирована (например, 0.5)
        const eye = vec3.fromValues(this.player.position[0], this.player.position[1], this.player.position[2])
        const center = vec3.fromValues(
            eye[0] + Math.cos(this.player.direction),
            eye[1],
            eye[2] + Math.sin(this.player.direction),
        )
        const up = vec3.fromValues(0, 1, 0)
        const viewMatrix = mat4.create()
        mat4.lookAt(viewMatrix, eye, center, up)

        for (let z = 0; z < this.maze.size; z++) {
            for (let x = 0; x < this.maze.size; x++) {
                if (this.maze.grid[z]![x] === 1) {
                    const modelMatrix = mat4.create()
                    mat4.translate(modelMatrix, modelMatrix, [x, 0, z])
                    const mvpMatrix = mat4.create()
                    mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix)
                    mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix)
                    gl.uniformMatrix4fv(this.uMatrixLocation, false, mvpMatrix)
                    gl.uniform4fv(this.uColorLocation, [1, 0, 0, 1])
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexBuffer)
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeIndexBuffer)
                    gl.drawElements(gl.TRIANGLES, this.cubeIndexCount, gl.UNSIGNED_SHORT, 0)
                }
            }
        }
    }

    private updatePlayer(deltaTime: number) {
        if (this.keys['ArrowUp']) this.player.moveForward(this.maze, deltaTime)
        if (this.keys['ArrowDown']) this.player.moveForward(this.maze, -deltaTime)
        if (this.keys['ArrowLeft']) this.player.rotate(-deltaTime)
        if (this.keys['ArrowRight']) this.player.rotate(deltaTime)
        if (this.keys['a'] || this.keys['A']) this.player.strafe(this.maze, deltaTime)
        if (this.keys['d'] || this.keys['D']) this.player.strafe(this.maze, -deltaTime)
    }

    private initCubeBuffers() {
        const gl = this.gl
        const vertices = new Float32Array([
            0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0,
            0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1,
        ])
        const indices = new Uint16Array([
            4, 5, 6, 4, 6, 7,  // Передняя грань
            0, 2, 1, 0, 3, 2,  // Задняя грань
            0, 7, 3, 0, 4, 7,  // Левая грань
            1, 2, 6, 1, 6, 5,  // Правая грань
            3, 6, 2, 3, 7, 6,  // Верхняя грань
            0, 1, 5, 0, 5, 4,  // Нижняя грань
        ])
        this.cubeIndexCount = indices.length

        this.cubeVertexBuffer = gl.createBuffer()!
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

        this.cubeIndexBuffer = gl.createBuffer()!
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeIndexBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

        const aPositionLocation = gl.getAttribLocation(this.program, 'a_position')
        if (aPositionLocation === -1) {
            throw new Error('Атрибут "a_position" не найден')
        }
        gl.enableVertexAttribArray(aPositionLocation)
        gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0)
    }

    private setupEventListeners() {
        window.addEventListener('resize', this.resizeCanvas)
        window.addEventListener('keydown', this.handleKeyDown)
        window.addEventListener('keyup', this.handleKeyUp)
    }

    private resizeCanvas = () => {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.gl.viewport(0, 0, window.innerWidth, window.innerHeight)
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        this.keys[event.key] = true
    }

    private handleKeyUp = (event: KeyboardEvent) => {
        this.keys[event.key] = false
    }
}

const app = new App()
app.run()

export {}
