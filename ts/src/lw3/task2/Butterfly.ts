import {Color, Position, Renderable} from './types'
import {getWorldSize} from './WebGLUtils'

type ButterflyData = {
    position: Position,
    target: Position,
    color: Color,
}

class Butterfly implements Renderable {
	private readonly baseVertices = [
		// Левое верхнее крыло
		-0.3, 0.15,    // Верхний левый угол
		-0.5, 0.4,     // Внешний левый угол (верх)
		-0.25, 0.5,    // Нижний левый угол (внешний)

		-0.3, 0.15,    // Верхний левый угол
		-0.15, 0.35,   // Внешний правый угол (верх)
		-0.25, 0.5,    // Нижний левый угол (внешний)

		// Правое верхнее крыло
		0.3, 0.15,     // Верхний правый угол
		0.5, 0.4,      // Внешний правый угол (верх)
		0.25, 0.5,     // Нижний правый угол (внешний)

		0.3, 0.15,     // Верхний правый угол
		0.15, 0.35,    // Внешний левый угол (верх)
		0.25, 0.5,     // Нижний правый угол (внешний)

		// Левое нижнее крыло
		-0.2, -0.1,    // Левый нижний угол
		-0.4, -0.35,   // Внешний левый угол (нижний)
		-0.25, -0.5,   // Внешний нижний угол

		-0.2, -0.1,    // Левый нижний угол
		0.2, -0.1,     // Правый нижний угол
		-0.25, -0.5,   // Внешний нижний угол

		// Правое нижнее крыло
		0.2, -0.1,     // Правый нижний угол
		0.4, -0.35,    // Внешний правый угол (нижний)
		0.25, -0.5,    // Внешний нижний угол

		0.2, -0.1,     // Правый нижний угол
		-0.2, -0.1,    // Левый нижний угол
		0.25, -0.5,    // Внешний нижний угол

		// Тело бабочки (центр)
		0, 0.3,          // Центр тела
		0.2, 0.15,       // Верхняя точка тела
		0, -0.1,      // Нижняя точка тела

		0, 0.3,          // Центр тела
		-0.2, 0.15,       // Верхняя точка тела
		0, -0.1,

		// Голова бабочки
		-0.1, 0.4,     // Левый верхний угол головы
		0.1, 0.4,      // Правый верхний угол головы
		0, 0.35,       // Верхняя точка головы

		// Дополнительные контуры головы для видимости
		-0.1, 0.4,    // Левый нижний угол головы
		0.1, 0.4,     // Правый нижний угол головы
		0, 0.45,        // Нижняя точка головы
	]
	private vertexBuffer: WebGLBuffer | null = null
	private readonly vertexCount: number = this.baseVertices.length / 2

	constructor(
        private readonly gl: WebGLRenderingContext,
        private readonly program: WebGLProgram,
        private data: ButterflyData,
	) {
		this.initBuffer()
	}

	update() {
		const {width, height} = getWorldSize()
		const dx = this.data.target.x - this.data.position.x
		const dy = this.data.target.y - this.data.position.y
		const dist = Math.hypot(dx, dy)
		if (dist < 0.1) {
			this.data.target.x = Math.random() * width - width / 2
			this.data.target.y = Math.random() * height / 2 - height / 4
		}
		else {
			this.data.position.x += dx * 0.001
			this.data.position.y += dy * 0.001
		}
	}

	render() {
		const gl = this.gl
		const posLoc = gl.getAttribLocation(this.program, 'position')
		const colorLoc = gl.getUniformLocation(this.program, 'u_color')

		const transformedVertices = new Float32Array(this.baseVertices.length)
		for (let i = 0; i < this.baseVertices.length; i += 2) {
			transformedVertices[i] = (this.baseVertices[i] ?? 0) + this.data.position.x
			transformedVertices[i + 1] = (this.baseVertices[i + 1] ?? 0) + this.data.position.y
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, transformedVertices, gl.DYNAMIC_DRAW)
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(posLoc)
		gl.uniform4f(colorLoc, this.data.color.r, this.data.color.g, this.data.color.b, this.data.color.a)
		gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount)
	}

	private initBuffer() {
		this.vertexBuffer = this.gl.createBuffer()
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer)
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			new Float32Array(this.baseVertices),
			this.gl.DYNAMIC_DRAW,
		)
	}
}

export {
	Butterfly,
}