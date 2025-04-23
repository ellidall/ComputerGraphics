import {mat4} from 'gl-matrix'
import {Map} from '../Map'
import {Renderer} from './Renderer'

class BlockRenderer extends Renderer {
	private textures: WebGLTexture[] = []

	constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
		super(gl, program)
		this.loadTextures()
	}

	render(map: Map, projectionMatrix: mat4, viewMatrix: mat4): void {
		const gl = this.gl
		const uMatrixLocation = gl.getUniformLocation(this.program, 'u_matrix')
		const uTextureLocation = gl.getUniformLocation(this.program, 'u_texture')

		for (let z = 0; z < map.size; z++) {
			for (let x = 0; x < map.size; x++) {
				const block = map.grid[z]![x]
				const texture = this.textures[block!.type]

				gl.activeTexture(gl.TEXTURE0)
				gl.bindTexture(gl.TEXTURE_2D, texture!)
				gl.uniform1i(uTextureLocation, 0)

				const modelMatrix = mat4.create()
				mat4.translate(modelMatrix, modelMatrix, [x, 0, z])
				const mvpMatrix = mat4.create()
				mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix)
				mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix)

				gl.uniformMatrix4fv(uMatrixLocation, false, mvpMatrix)
				gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)
			}
		}
	}

	private loadTextures(): void {
		const urls = [
			'textures/ground.jpg',
			'textures/brick.jpg',
			'textures/water.jpg',
			'textures/armor.jpg',
			'textures/ice.jpg',
			'textures/tree.jpg',
			'textures/base.jpg',
		]

		for (const url of urls) {
			const texture = this.gl.createTexture()!
			this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
			const pixel = new Uint8Array([255, 255, 255, 255])
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0,
				this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixel)

			const image = new Image()
			image.src = url
			image.onload = () => {
				this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
				this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,
					this.gl.RGBA, this.gl.UNSIGNED_BYTE, image)
				this.gl.generateMipmap(this.gl.TEXTURE_2D)
			}

			this.textures.push(texture)
		}
	}
}

export {
	BlockRenderer,
}
