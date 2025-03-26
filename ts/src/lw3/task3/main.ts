import './index.css'
import {TetrisGame} from './View/TetrisGame'
import {createShaderProgram, computeOrthoMatrix} from './WebGLUtils'

class App {
	private readonly canvas: HTMLCanvasElement
	private readonly gl: WebGLRenderingContext
	private readonly program: WebGLProgram
	private orthoMatrix: Float32Array
	private tetrisGame: TetrisGame

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
		this.orthoMatrix = computeOrthoMatrix(this.canvas.width, this.canvas.height)

		this.tetrisGame = new TetrisGame(gl, this.program)

		window.addEventListener('resize', this.resizeCanvas)
	}

	render = () => {
		requestAnimationFrame(this.render)
		const gl = this.gl
		gl.clearColor(0, 0, 0, 1)
		gl.clear(gl.COLOR_BUFFER_BIT)
		const matrixLocation = gl.getUniformLocation(this.program, 'u_matrix')
		gl.uniformMatrix4fv(matrixLocation, false, this.orthoMatrix)
		this.tetrisGame.render()
	}

	private resizeCanvas = () => {
		this.canvas.width = window.innerWidth
		this.canvas.height = window.innerHeight
		this.gl.viewport(0, 0, window.innerWidth, window.innerHeight)
		this.orthoMatrix = computeOrthoMatrix(window.innerWidth, window.innerHeight)
	}
}

const app = new App()
app.render()
