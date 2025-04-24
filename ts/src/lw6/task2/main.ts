import './index.css'
import {mat4, vec3} from 'gl-matrix'
import {Game} from './Game'

class App {
    private readonly canvas: HTMLCanvasElement
    private readonly gl: WebGLRenderingContext
    private readonly game: Game

    private keys: { [key: string]: boolean } = {}
    private lastTime = 0

    constructor() {
        this.canvas = document.createElement('canvas')
        document.body.appendChild(this.canvas)
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight

        const gl = this.canvas.getContext('webgl')
        if (!gl) throw new Error('WebGL не поддерживается')

        this.gl = gl
        this.game = new Game(gl)

        this.setupEventListeners()
        this.resizeCanvas()
        this.render(this.lastTime)
    }

    run() {
        this.render(this.lastTime)
    }

    private render = (time: number) => {
        const deltaTime = (time - this.lastTime) / 1000
        this.lastTime = time
        requestAnimationFrame(this.render)

        this.gl.enable(this.gl.DEPTH_TEST)
        this.gl.clearColor(0.2, 0.2, 0.2, 1)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

        const projectionMatrix = this.calcProjectionMatrix()
        const viewMatrix = this.calcViewMatrix()

        this.game.update(deltaTime)
        this.game.render(projectionMatrix, viewMatrix)
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

    private calcProjectionMatrix() {
        const projectionMatrix = mat4.create()
        const fov = (60 * Math.PI) / 180
        const aspect = this.canvas.width / this.canvas.height
        const near = 0.1
        const far = 100
        mat4.perspective(projectionMatrix, fov, aspect, near, far)

        return projectionMatrix
    }

    private calcViewMatrix() {
        const size = this.game.getMapSize()
        const centerOffset = size / 2

        const eye = vec3.fromValues(centerOffset, 10, centerOffset + 8)
        const center = vec3.fromValues(centerOffset, 0, centerOffset)
        const up = vec3.fromValues(0, 1, 0)

        const viewMatrix = mat4.create()
        mat4.lookAt(viewMatrix, eye, center, up)
        return viewMatrix
    }
}

const app = new App()
app.run()

export {}
