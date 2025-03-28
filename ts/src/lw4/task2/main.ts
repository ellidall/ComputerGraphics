import './index.css'
import { mat4, vec3 } from 'gl-matrix'
import { createShaderProgram } from './WebGLUtils'

class Maze {
    size: number
    grid: number[][]

    constructor(size: number = 16) {
        this.size = size
        this.grid = this.getFixedMaze()
    }

    private getFixedMaze(): number[][] {
        return [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
            [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1],
            [1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,1],
            [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1],
            [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
            [1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1],
            [1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,1],
            [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1],
            [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
            [1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ]
    }
}

class Player {
    position: vec3       // Позиция игрока (x, y, z)
    direction: number    // Направление взгляда в радианах

    constructor() {
        this.position = vec3.fromValues(1.5, 0.5, 1.5)
        this.direction = 0
    }

    // Движение вперед/назад (если step отрицательный – движение назад)
    moveForward(maze: Maze, step: number = 0.1) {
        const nextX = this.position[0] + Math.cos(this.direction) * step
        const nextZ = this.position[2] + Math.sin(this.direction) * step
        const cellX = Math.floor(nextX)
        const cellZ = Math.floor(nextZ)
        if (
            cellX >= 0 && cellX < maze.size &&
            cellZ >= 0 && cellZ < maze.size &&
            maze.grid[cellZ][cellX] === 0
        ) {
            this.position[0] = nextX
            this.position[2] = nextZ
        }
    }

    // Стрейф (боковое движение). Если step отрицательный – влево, если положительный – вправо.
    strafe(maze: Maze, step: number = 0.1) {
        // Вычисляем вектор вправо: (sin, 0, -cos) по отношению к направлению взгляда
        const rightX = Math.sin(this.direction)
        const rightZ = -Math.cos(this.direction)
        const nextX = this.position[0] + rightX * step
        const nextZ = this.position[2] + rightZ * step
        const cellX = Math.floor(nextX)
        const cellZ = Math.floor(nextZ)
        if (
            cellX >= 0 && cellX < maze.size &&
            cellZ >= 0 && cellZ < maze.size &&
            maze.grid[cellZ][cellX] === 0
        ) {
            this.position[0] = nextX
            this.position[2] = nextZ
        }
    }

    // Поворот
    rotate(angle: number) {
        this.direction += angle
    }
}

class App {
    private canvas: HTMLCanvasElement
    private gl: WebGLRenderingContext
    private program: WebGLProgram
    private maze: Maze
    private player: Player

    // Буферы для куба (стена)
    private cubeVertexBuffer: WebGLBuffer | null = null
    private cubeIndexBuffer: WebGLBuffer | null = null
    private cubeIndexCount: number = 0

    // Uniform-переменные
    private uMatrixLocation: WebGLUniformLocation
    private uColorLocation: WebGLUniformLocation

    // ===== Новое: объект для хранения состояний клавиш =====
    private keys: { [key: string]: boolean } = {}

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

        this.maze = new Maze(16)
        this.player = new Player()

        this.initCubeBuffers()
        window.addEventListener('resize', this.resizeCanvas)
        // ===== Новое: Обработчики клавиатуры =====
        window.addEventListener('keydown', this.handleKeyDown)
        window.addEventListener('keyup', this.handleKeyUp)

        this.render()
    }

    run() {
        this.render()
    }

    // ===== Новое: Обработчик keydown сохраняет состояние клавиши =====
    private handleKeyDown = (event: KeyboardEvent) => {
        this.keys[event.key] = true
    }

    // ===== Новое: Обработчик keyup сбрасывает состояние клавиши =====
    private handleKeyUp = (event: KeyboardEvent) => {
        this.keys[event.key] = false
    }

    // Инициализация буферов для куба
    private initCubeBuffers() {
        const gl = this.gl
        const vertices = new Float32Array([
            0, 0, 0,  1, 0, 0,  1, 1, 0,  0, 1, 0,
            0, 0, 1,  1, 0, 1,  1, 1, 1,  0, 1, 1,
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
        if(aPositionLocation === -1) {
            throw new Error('Атрибут "a_position" не найден')
        }
        gl.enableVertexAttribArray(aPositionLocation)
        gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0)
    }

    private resizeCanvas = () => {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.gl.viewport(0, 0, window.innerWidth, window.innerHeight)
    }

    // ===== Новое: Обновление позиции игрока на основе состояний клавиш =====
    private updatePlayer() {
        // Движение вперед/назад
        if (this.keys['ArrowUp']) {
            this.player.moveForward(this.maze, 0.005)
        }
        if (this.keys['ArrowDown']) {
            this.player.moveForward(this.maze, -0.005)
        }
        // Поворот
        if (this.keys['ArrowLeft']) {
            this.player.rotate(-0.008)
        }
        if (this.keys['ArrowRight']) {
            this.player.rotate(0.008)
        }
        // Стрейф (боковое движение): добавляем, например, клавиши 'a' и 'd'
        if (this.keys['a'] || this.keys['A']) {
            this.player.strafe(this.maze, 0.005)
        }
        if (this.keys['d'] || this.keys['D']) {
            this.player.strafe(this.maze, -0.005)
        }
    }

    // Основной цикл рендеринга
    private render = () => {
        requestAnimationFrame(this.render)
        const gl = this.gl
        gl.enable(gl.DEPTH_TEST)
        gl.clearColor(0.2, 0.2, 0.2, 1)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        // Перед отрисовкой обновляем позицию игрока
        this.updatePlayer()

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
            eye[2] + Math.sin(this.player.direction)
        )
        const up = vec3.fromValues(0, 1, 0)
        const viewMatrix = mat4.create()
        mat4.lookAt(viewMatrix, eye, center, up)

        for (let z = 0; z < this.maze.size; z++) {
            for (let x = 0; x < this.maze.size; x++) {
                if (this.maze.grid[z][x] === 1) {
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
}

const app = new App()
app.run()

export {}
