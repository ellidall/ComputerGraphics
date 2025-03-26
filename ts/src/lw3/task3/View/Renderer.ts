import {Position} from '../Document/Tetramino'
import {Color} from '../Document/TetrisDocument'
import {Size} from '../types'

class Renderer {
	private readonly positionBuffer: WebGLBuffer
	private readonly texCoordBuffer: WebGLBuffer

	constructor(
		private readonly gl: WebGLRenderingContext,
		private readonly program: WebGLProgram,
	) {
		const posBuffer = gl.createBuffer()
		if (!posBuffer) {
			throw new Error('Не удалось создать буфер для вершин')
		}
		this.positionBuffer = posBuffer

		const texBuffer = gl.createBuffer()
		if (!texBuffer) {
			throw new Error('Не удалось создать буфер для текстурных координат')
		}
		this.texCoordBuffer = texBuffer
	}

	// eslint-disable-next-line max-params
	drawBorder(x: number, y: number, width: number, height: number, color: Color, lineWidth = 0.1) {
		this.drawColoredQuad({x: x - lineWidth, y: y - lineWidth}, {width: width + lineWidth * 2, height: lineWidth}, color)
		this.drawColoredQuad({x: x - lineWidth, y: y + height}, {width: width + lineWidth * 2, height: lineWidth}, color)
		this.drawColoredQuad({x: x - lineWidth, y: y - lineWidth}, {width: lineWidth, height: height + lineWidth}, color)
		this.drawColoredQuad({x: x + width, y: y - lineWidth}, {width: lineWidth, height: height + lineWidth}, color)
	}

	drawColoredQuad(position: Position, size: Size, color: Color) {
		const gl = this.gl
		const positions = new Float32Array([
			position.x, position.y,
			position.x + size.width, position.y,
			position.x, position.y + size.height,
			position.x + size.width, position.y + size.height,
		])
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
		const posLocation = gl.getAttribLocation(this.program, 'position')
		gl.enableVertexAttribArray(posLocation)
		gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0)

		const colorLocation = gl.getUniformLocation(this.program, 'u_color')
		gl.uniform4f(colorLocation, color.r / 255, color.g / 255, color.b / 255, 1)
		const useTextureLocation = gl.getUniformLocation(this.program, 'u_useTexture')
		gl.uniform1f(useTextureLocation, 0.0)

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
	}

	drawTexturedQuad(position: Position, size: Size, texture: WebGLTexture) {
		const gl = this.gl
		const positions = new Float32Array([
			position.x, position.y,
			position.x + size.width, position.y,
			position.x, position.y + size.height,
			position.x + size.width, position.y + size.height,
		])
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
		const posLocation = gl.getAttribLocation(this.program, 'position')
		gl.enableVertexAttribArray(posLocation)
		gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0)

		const texCoords = new Float32Array([
			0, 0,
			1, 0,
			0, 1,
			1, 1,
		])
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW)
		const texCoordLocation = gl.getAttribLocation(this.program, 'a_texCoord')
		gl.enableVertexAttribArray(texCoordLocation)
		gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, texture)
		const textureLocation = gl.getUniformLocation(this.program, 'u_texture')
		gl.uniform1i(textureLocation, 0)
		const useTextureLocation = gl.getUniformLocation(this.program, 'u_useTexture')
		gl.uniform1f(useTextureLocation, 1.0)

		const colorLocation = gl.getUniformLocation(this.program, 'u_color')
		gl.uniform4f(colorLocation, 1, 1, 1, 1)

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
	}
}

export {Renderer}
