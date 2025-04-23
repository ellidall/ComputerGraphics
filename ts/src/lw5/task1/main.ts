import './index.css'
import {mat4, vec3} from 'gl-matrix'
import {Maze} from './Maze'
import {Player} from './Player'
import {Renderer} from './Renderer'
import {createShaderProgram} from './WebGLUtils'

class App {
	private readonly canvas: HTMLCanvasElement
	private readonly gl: WebGLRenderingContext
	private readonly program: WebGLProgram
	private readonly maze: Maze
	private player: Player
	private mazeRenderer: Renderer

	private keys: {[key: string]: boolean} = {}
	private lastTime = 0


	constructor() {
		this.canvas = document.createElement('canvas')
		document.body.appendChild(this.canvas)
		this.canvas.width = window.innerWidth
		this.canvas.height = window.innerHeight
		const gl = this.canvas.getContext('webgl')
		if (!gl) {
			throw new Error('WebGL не поддерживается')
		}
		this.gl = gl

		this.program = createShaderProgram(gl)
		gl.useProgram(this.program)

		this.maze = new Maze()
		this.player = new Player()
		this.mazeRenderer = new Renderer(this.gl, this.program)

		this.setupEventListeners()
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

		this.updatePlayer(deltaTime)

		const projectionMatrix = this.calcProjectionMatrix()
		const viewMatrix = this.calcViewMatrix()
		this.drawMaze(projectionMatrix, viewMatrix)
	}

	private updatePlayer(deltaTime: number) {
		if (this.keys['ArrowUp']) {
			this.player.moveForward(this.maze, deltaTime)
		}
		if (this.keys['ArrowDown']) {
			this.player.moveForward(this.maze, -deltaTime)
		}
		if (this.keys['ArrowLeft']) {
			this.player.rotate(-deltaTime)
		}
		if (this.keys['ArrowRight']) {
			this.player.rotate(deltaTime)
		}
		if (this.keys['a'] || this.keys['A']) {
			this.player.strafe(this.maze, deltaTime)
		}
		if (this.keys['d'] || this.keys['D']) {
			this.player.strafe(this.maze, -deltaTime)
		}
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
		const viewMatrix = mat4.create()
		const eye = vec3.fromValues(this.player.position[0], this.player.position[1], this.player.position[2])
		const center = vec3.fromValues(
			eye[0] + Math.cos(this.player.direction),
			eye[1],
			eye[2] + Math.sin(this.player.direction),
		)
		const up = vec3.fromValues(0, 1, 0)
		mat4.lookAt(viewMatrix, eye, center, up)

		return viewMatrix
	}

	private drawMaze(projectionMatrix: mat4, viewMatrix: mat4) {
		this.mazeRenderer.draw(this.maze, projectionMatrix, viewMatrix)
	}
}

const app = new App()
app.run()

export {}
