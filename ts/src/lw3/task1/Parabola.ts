class Parabola {
	private vertexBuffer: WebGLBuffer | null = null
	private vertexCount = 0

	constructor(
		private readonly gl: WebGLRenderingContext,
		private readonly program: WebGLProgram,
	) {
		this.initVertexBuffer()
	}

	render() {
		const gl = this.gl
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
		const positionLocation = gl.getAttribLocation(this.program, 'position')
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(positionLocation)

		const colorLocation = gl.getUniformLocation(this.program, 'u_color')
		gl.uniform4f(colorLocation, 1, 1, 1, 1)

		gl.drawArrays(gl.LINE_STRIP, 0, this.vertexCount)
	}

	private initVertexBuffer() {
		const vertices: number[] = []
		const step = 0.01
		const xMin = -2
		const xMax = 3

		for (let x = xMin; x <= xMax; x += step) {
			const y = 2 * x * x - 3 * x - 8
			vertices.push(x, y)
		}
		this.vertexCount = vertices.length / 2

		this.vertexBuffer = this.gl.createBuffer()
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer)
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(vertices),
			this.gl.STATIC_DRAW,
		)
	}
}

export {
	Parabola,
}
