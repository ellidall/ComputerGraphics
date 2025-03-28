import './index.css'
import {mat4, vec3} from 'gl-matrix'
import {createShaderProgram} from './WebGLUtils'

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
    position: vec3       // Позиция игрока в лабиринте (x, y, z)
    direction: number    // Направление взгляда в радианах

    constructor() {
        // Начальное положение — клетка (1, 0, 1) с небольшим смещением, чтобы быть в центре
        this.position = vec3.fromValues(1.5, 0.5, 1.5)
        this.direction = 0  // смотрим вдоль оси X
    }

    // Функция для движения вперед
    moveForward(maze: Maze, step: number = 0.1) {
        // Вычисляем потенциальную новую позицию
        const nextX = this.position[0] + Math.cos(this.direction) * step
        const nextZ = this.position[2] + Math.sin(this.direction) * step

        // Вычисляем индекс ячейки лабиринта (используем Math.floor)
        const cellX = Math.floor(nextX)
        const cellZ = Math.floor(nextZ)
        // Проверяем, что не выходим за пределы лабиринта и не врезаемся в стену (1)
        if (
            cellX >= 0 && cellX < maze.size &&
            cellZ >= 0 && cellZ < maze.size &&
            maze.grid[cellZ][cellX] === 0
        ) {
            this.position[0] = nextX
            this.position[2] = nextZ
        }
    }

    // Функция для поворота (изменение направления взгляда)
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

    // Буферы для куба (используем для стен)
    private cubeVertexBuffer: WebGLBuffer | null = null
    private cubeIndexBuffer: WebGLBuffer | null = null
    private cubeIndexCount: number = 0

    // Uniform-ы шейдеров
    private uMatrixLocation: WebGLUniformLocation
    private uColorLocation: WebGLUniformLocation

    constructor() {
        // Создаем канвас и получаем контекст WebGL
        this.canvas = document.createElement('canvas')
        document.body.appendChild(this.canvas)
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        const gl = this.canvas.getContext('webgl')
        if (!gl) throw new Error('WebGL не поддерживается')
        this.gl = gl

        // Создаем шейдерную программу
        this.program = createShaderProgram(gl)
        gl.useProgram(this.program)

        // Получаем локации uniform-переменных
        const matrixLoc = gl.getUniformLocation(this.program, 'u_matrix')
        const colorLoc = gl.getUniformLocation(this.program, 'u_color')
        if (!matrixLoc || !colorLoc) throw new Error('Не удалось получить uniform-переменные')
        this.uMatrixLocation = matrixLoc
        this.uColorLocation = colorLoc

        // Используем фиксированный лабиринт 16×16
        this.maze = new Maze(16)
        // Инициализируем игрока (добавлено)
        this.player = new Player()

        // Инициализируем буферы для куба (стена)
        this.initCubeBuffers()

        // Настраиваем событие ресайза окна
        window.addEventListener('resize', this.resizeCanvas)
        // Добавлено: обработчик клавиатуры для управления игроком
        window.addEventListener('keydown', this.handleKeyDown)

        this.render()
    }

    run() {
        this.render()
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
            case 'ArrowUp':   // движение вперед
                this.player.moveForward(this.maze)
                break
            case 'ArrowLeft': // поворот влево
                this.player.rotate(-0.1)
                break
            case 'ArrowRight': // поворот вправо
                this.player.rotate(0.1)
                break
            // Можно добавить и другие клавиши, например, движение назад
            case 'ArrowDown':
                this.player.moveForward(this.maze, -0.1)
                break
        }
    }

    // Инициализация буферов для модели куба размером 1x1x1
    private initCubeBuffers() {
        const gl = this.gl
        const vertices = new Float32Array([
            // 8 вершин куба
            0, 0, 0,  // 0
            1, 0, 0,  // 1
            1, 1, 0,  // 2
            0, 1, 0,  // 3
            0, 0, 1,  // 4
            1, 0, 1,  // 5
            1, 1, 1,  // 6
            0, 1, 1,  // 7
        ])
        const indices = new Uint16Array([
            // Передняя грань
            4, 5, 6, 4, 6, 7,
            // Задняя грань
            0, 2, 1, 0, 3, 2,
            // Левая грань
            0, 7, 3, 0, 4, 7,
            // Правая грань
            1, 2, 6, 1, 6, 5,
            // Верхняя грань
            3, 6, 2, 3, 7, 6,
            // Нижняя грань
            0, 1, 5, 0, 5, 4,
        ])
        this.cubeIndexCount = indices.length

        // Вершинный буфер
        this.cubeVertexBuffer = gl.createBuffer()!
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

        // Индексный буфер
        this.cubeIndexBuffer = gl.createBuffer()!
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeIndexBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

        // Настраиваем атрибут a_position
        const aPositionLocation = gl.getAttribLocation(this.program, 'a_position')
        gl.enableVertexAttribArray(aPositionLocation)
        gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0)
    }

    // Обработчик изменения размера канваса
    private resizeCanvas = () => {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.gl.viewport(0, 0, window.innerWidth, window.innerHeight)
    }

    // Основной цикл рендеринга
    private render = () => {
        requestAnimationFrame(this.render)
        const gl = this.gl
        gl.enable(gl.DEPTH_TEST)
        gl.clearColor(0.2, 0.2, 0.2, 1)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        // Создаем перспективную матрицу
        const projectionMatrix = mat4.create()
        const fov = (60 * Math.PI) / 180
        const aspect = this.canvas.width / this.canvas.height
        const near = 0.1
        const far = 100
        mat4.perspective(projectionMatrix, fov, aspect, near, far)

        // Создаем матрицу вида (статическая камера)
        const viewMatrix = mat4.create()
        // Камера установлена на позиции (8, 20, 30) и смотрит на центр лабиринта (8, 0, 8)
        const eye = vec3.fromValues(8, 20, 30)
        const center = vec3.fromValues(8, 0, 8)
        const up = vec3.fromValues(0, 1, 0)
        mat4.lookAt(viewMatrix, eye, center, up)

        // Проходим по каждой клетке лабиринта и рисуем стену, если в клетке стоит 1
        for (let z = 0; z < this.maze.size; z++) {
            for (let x = 0; x < this.maze.size; x++) {
                if (this.maze.grid[z]![x] === 1) {
                    // Создаем модельную матрицу для размещения стены в нужной клетке
                    const modelMatrix = mat4.create()
                    mat4.translate(modelMatrix, modelMatrix, [x, 0, z])

                    // Итоговая матрица: projection * view * model
                    const mvpMatrix = mat4.create()
                    mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix)
                    mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix)

                    // Передаем матрицу в шейдер
                    gl.uniformMatrix4fv(this.uMatrixLocation, false, mvpMatrix)
                    // Задаем цвет стены (например, красный)
                    gl.uniform4fv(this.uColorLocation, [1, 0, 0, 1])

                    // Привязываем буферы и отрисовываем куб
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
