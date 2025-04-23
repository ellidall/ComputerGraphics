import { mat4 } from 'gl-matrix'
import { Map } from '../Map'
import { Renderer } from './Renderer'

class BlockRenderer extends Renderer {
	private vertexBuffer: WebGLBuffer | null = null
	private indexBuffer: WebGLBuffer | null = null
	private colorMap: { [key: number]: [number, number, number] } = {
		0: [0.5, 0.5, 0.5],  // Ground (серый)
		1: [0.8, 0.2, 0.2],  // Brick (красный)
		2: [0.2, 0.2, 0.8],  // Water (синий)
		3: [0.8, 0.8, 0.2],  // Armor (желтый)
		4: [0.2, 0.8, 0.2],  // Ice (зеленый)
		5: [0.4, 0.2, 0.2],  // Tree (темно-коричневый)
		6: [0.6, 0.6, 0.6],  // Base (серый светлый)
	};

	constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
		super(gl, program);
		this.loadGeometry();
	}

	render(map: Map, projectionMatrix: mat4, viewMatrix: mat4): void {
		const gl = this.gl;
		const uMatrixLocation = gl.getUniformLocation(this.program, 'u_matrix');
		const uColorLocation = gl.getUniformLocation(this.program, 'u_color');

		for (let z = 0; z < map.size; z++) {
			for (let x = 0; x < map.size; x++) {
				const block = map.grid[z]![x];
				const color = this.colorMap[block!.type] || [1, 1, 1];

				gl.uniform3fv(uColorLocation, color);

				const modelMatrix = mat4.create();
				mat4.translate(modelMatrix, modelMatrix, [x, 0, z]);
				const mvpMatrix = mat4.create();
				mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix);
				mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix);

				gl.uniformMatrix4fv(uMatrixLocation, false, mvpMatrix);

				// Привязка буферов и атрибутов
				const aPosition = gl.getAttribLocation(this.program, 'a_position');
				const aTexcoord = gl.getAttribLocation(this.program, 'a_texcoord');

				gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
				gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 5 * 4, 0);
				gl.enableVertexAttribArray(aPosition);

				gl.vertexAttribPointer(aTexcoord, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
				gl.enableVertexAttribArray(aTexcoord);

				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

				gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
			}
		}
	}

	private loadGeometry() {
		const vertices = new Float32Array([
			// позиция         // текстура
			-0.5, -0.5, -0.5, 0, 0, // 0
			0.5, -0.5, -0.5, 1, 0, // 1
			0.5,  0.5, -0.5, 1, 1, // 2
			-0.5,  0.5, -0.5, 0, 1, // 3
			-0.5, -0.5,  0.5, 0, 0, // 4
			0.5, -0.5,  0.5, 1, 0, // 5
			0.5,  0.5,  0.5, 1, 1, // 6
			-0.5,  0.5,  0.5, 0, 1, // 7
		]);

		const indices = new Uint16Array([
			0, 1, 2, 2, 3, 0, // back
			4, 5, 6, 6, 7, 4, // front
			3, 2, 6, 6, 7, 3, // top
			0, 1, 5, 5, 4, 0, // bottom
			1, 2, 6, 6, 5, 1, // right
			0, 3, 7, 7, 4, 0  // left
		]);

		this.vertexBuffer = this.gl.createBuffer()!;
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

		this.indexBuffer = this.gl.createBuffer()!;
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);
	}
}

export {
	BlockRenderer,
}
