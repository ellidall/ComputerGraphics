import {Axes} from './Axes'
import './index.css'
import {Parabola} from './Parabola'
import {createShaderProgram, computeOrthoMatrix} from './WebGLUtils'

class App {
	private readonly canvas: HTMLCanvasElement
	private readonly gl: WebGLRenderingContext
	private readonly program: WebGLProgram
	private parabola: Parabola
	private axes: Axes
	private orthoMatrix: Float32Array

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

		this.parabola = new Parabola(gl, this.program)
		this.axes = new Axes(gl, this.program)

		this.orthoMatrix = computeOrthoMatrix(
			this.canvas.width,
			this.canvas.height,
		)
		this.setupEventListeners()
	}


	render = () => {
		requestAnimationFrame(this.render)
		const gl = this.gl

		const matrixLocation = gl.getUniformLocation(this.program, 'u_matrix')
		gl.useProgram(this.program)
		gl.uniformMatrix4fv(matrixLocation, false, this.orthoMatrix)

		gl.clearColor(0, 0, 0, 1)
		gl.clear(gl.COLOR_BUFFER_BIT)

		this.axes.render()
		this.parabola.render()
	}

	run = () => {
		this.render()
	}

	private setupEventListeners() {
		window.addEventListener('resize', this.resizeCanvas)
	}

	private resizeCanvas = () => {
		this.canvas.width = window.innerWidth
		this.canvas.height = window.innerHeight
		this.gl.viewport(0, 0, window.innerWidth, window.innerHeight)
		this.orthoMatrix = computeOrthoMatrix(
			this.canvas.width,
			this.canvas.height,
		)
		this.render()
	}
}

const app = new App()
app.run()


export {
}