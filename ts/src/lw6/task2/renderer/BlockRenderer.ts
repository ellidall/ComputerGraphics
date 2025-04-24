import {mat4} from 'gl-matrix'
import {Map} from '../level/Map'
import {Renderer} from './Renderer'

class BlockRenderer extends Renderer {
    private vertexBuffer: WebGLBuffer | null = null
    private indexBuffer: WebGLBuffer | null = null
    private flatVertexBuffer: WebGLBuffer | null = null;
    private flatIndexBuffer: WebGLBuffer | null = null;
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
        this.loadFlatGeometry();
    }

    render(map: Map, projectionMatrix: mat4, viewMatrix: mat4): void {
        const gl = this.gl;
        const uMatrixLocation = gl.getUniformLocation(this.program, 'u_matrix');
        const uColorLocation = gl.getUniformLocation(this.program, 'u_color');

        for (let z = 0; z < map.size; z++) {
            for (let x = 0; x < map.size; x++) {
                const block = map.grid[z]![x];
                const color = this.colorMap[block!.type] || [1, 1, 1];

                const modelMatrix = mat4.create();
                mat4.translate(modelMatrix, modelMatrix, [x, 0, z]);
                const mvpMatrix = mat4.create();
                mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix);
                mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix);

                gl.uniformMatrix4fv(uMatrixLocation, false, mvpMatrix);
                gl.uniform3fv(uColorLocation, color);

                if (block!.type === 1) {
                    this.bindBuffersForBlock();
                    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
                } else {
                    this.bindBuffersForFlatBlock();
                    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
                }
            }
        }
    }

    private loadGeometry() {
        const vertices = new Float32Array([
            -0.5, -0.5, -0.5, 0, 0, // 0
            0.5, -0.5, -0.5, 1, 0, // 1
            0.5, 0.5, -0.5, 1, 1, // 2
            -0.5, 0.5, -0.5, 0, 1, // 3
            -0.5, -0.5, 0.5, 0, 0, // 4
            0.5, -0.5, 0.5, 1, 0, // 5
            0.5, 0.5, 0.5, 1, 1, // 6
            -0.5, 0.5, 0.5, 0, 1, // 7
        ]);

        const indices = new Uint16Array([
            0, 1, 2, 2, 3, 0, // back
            4, 5, 6, 6, 7, 4, // front
            3, 2, 6, 6, 7, 3, // top
            0, 1, 5, 5, 4, 0, // bottom
            1, 2, 6, 6, 5, 1, // right
            0, 3, 7, 7, 4, 0  // left
        ]);

        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);
    }

    private loadFlatGeometry() {
        const flatVertices = new Float32Array([
            -0.5, 0, -0.5, 0, 0,
            0.5, 0, -0.5, 1, 0,
            0.5, 0, 0.5, 1, 1,
            -0.5, 0, 0.5, 0, 1,
        ]);

        const flatIndices = new Uint16Array([
            0, 1, 2, 2, 3, 0,
        ]);

        this.flatVertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.flatVertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatVertices, this.gl.STATIC_DRAW);

        this.flatIndexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.flatIndexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, flatIndices, this.gl.STATIC_DRAW);
    }

    private bindBuffersForBlock(): void {
        const gl = this.gl;
        const aPosition = gl.getAttribLocation(this.program, 'a_position');
        const aTexcoord = gl.getAttribLocation(this.program, 'a_texcoord');

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 20, 0);
        gl.enableVertexAttribArray(aPosition);

        gl.vertexAttribPointer(aTexcoord, 2, gl.FLOAT, false, 20, 12);
        gl.enableVertexAttribArray(aTexcoord);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    }

    private bindBuffersForFlatBlock(): void {
        const gl = this.gl;
        const aPosition = gl.getAttribLocation(this.program, 'a_position');
        const aTexcoord = gl.getAttribLocation(this.program, 'a_texcoord');

        gl.bindBuffer(gl.ARRAY_BUFFER, this.flatVertexBuffer);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 20, 0);
        gl.enableVertexAttribArray(aPosition);

        gl.vertexAttribPointer(aTexcoord, 2, gl.FLOAT, false, 20, 12);
        gl.enableVertexAttribArray(aTexcoord);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.flatIndexBuffer);
    }
}

export {
    BlockRenderer,
}
