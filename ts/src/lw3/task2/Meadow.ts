import {Color, Renderable} from './types'
import {getWorldSize} from './WebGLUtils'

class Meadow implements Renderable {
	private vertices: Float32Array
	private color: Color

	constructor(
		private readonly gl: WebGLRenderingContext,
		private readonly program: WebGLProgram,
	) {
		this.color = { r: 0.3, g: 0.8, b: 0.4, a: 1 }
		this.vertices = this.createMeadowVertices()
	}

	render() {
		const gl = this.gl
		const posLoc = gl.getAttribLocation(this.program, 'position')
		const colorLoc = gl.getUniformLocation(this.program, 'u_color')

		const buffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW)
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(posLoc)
		gl.uniform4f(colorLoc, this.color.r, this.color.g, this.color.b, this.color.a)

		gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 2)
		gl.deleteBuffer(buffer)
	}

	update(): void {
	}

	private createMeadowVertices(): Float32Array {
		const {width, height} = getWorldSize()
		const [left, right, bottom, top] = [-width, width, -height / 2, 0]

		return new Float32Array([
			left, bottom,
			right, bottom,
			left, top,

			left, top,
			right, bottom,
			right, top,
		])
	}
}

export {
	Meadow,
}
