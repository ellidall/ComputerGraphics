import {Position, Renderable} from './types'

class Star implements Renderable {
	private buffer: WebGLBuffer | null = null
	private starBrightness = 0
	private segments = 60
	private radius = 0.2 // Радиус звезды (круга)

	constructor(
        private readonly gl: WebGLRenderingContext,
        private readonly program: WebGLProgram,
        private position: Position,
	) {
		this.initBuffer()
	}

	render() {
		const gl = this.gl
		const posLoc = gl.getAttribLocation(this.program, 'position')
		const colorLoc = gl.getUniformLocation(this.program, 'u_color')
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(posLoc)
		gl.uniform4f(colorLoc, 1, 1, 0, this.starBrightness)
		const vertices = this.calculateVertices()
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW)
		gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2)
	}

	update(sunHeight?: number) {
		this.starBrightness = Math.max(0, 1 - Math.abs(sunHeight ? sunHeight / 2 : 0))
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
		if (this.starBrightness < 0.5) {
			return vertices
		}
		for (let i = 0; i <= this.segments; i++) {
			const angle = (i / this.segments) * 2 * Math.PI
			vertices.push(
				this.position.x + this.radius * Math.cos(angle),
				this.position.y + this.radius * Math.sin(angle),
			)
		}
		vertices.push(this.position.x, this.position.y)
		return vertices
	}
}

export {
	Star,
}
