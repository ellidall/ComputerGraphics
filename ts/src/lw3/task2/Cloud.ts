import { Position, Renderable } from './types'
import { getWorldSize } from './WebGLUtils'

type CloudData = {
	position: Position,
	speed: number,
}

class Cloud implements Renderable {
	private buffer: WebGLBuffer | null = null
	private segments = 60
	private radiusX: number
	private radiusY: number

	constructor(
		private readonly gl: WebGLRenderingContext,
		private readonly program: WebGLProgram,
		private data: CloudData,
	) {
		this.radiusX = 1.5 + Math.random() * 1.1
		this.radiusY = 0.7 + Math.random() * 0.6
		this.initBuffer()
	}

	render() {
		const gl = this.gl
		const posLoc = gl.getAttribLocation(this.program, 'position')
		const colorLoc = gl.getUniformLocation(this.program, 'u_color')
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(posLoc)
		gl.uniform4f(colorLoc, 1, 1, 1, 1)
		const vertices = this.calculateVertices()
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW)
		gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2)
	}

	// управлять позицией вершин с помощью матрицы
	update() {
		const { width } = getWorldSize()
		this.data.position.x -= this.data.speed
		if (this.data.position.x > width) {
			this.data.position.x = -width
		}
	}

	private initBuffer() {
		this.buffer = this.gl.createBuffer()
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer)
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(this.calculateVertices()),
			this.gl.DYNAMIC_DRAW,
		)
	}

	private calculateVertices() {
		const vertices: number[] = []
		for (let i = 0; i <= this.segments; i++) {
			const angle = (i / this.segments) * 2 * Math.PI
			vertices.push(
				this.data.position.x + this.radiusX * Math.cos(angle),
				this.data.position.y + this.radiusY * Math.sin(angle)
			)
		}
		vertices.push(this.data.position.x, this.data.position.y)
		return vertices
	}
}

export {
	Cloud,
}
