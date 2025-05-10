import {mat4, vec3} from 'gl-matrix'
import {Tank} from "../tank/Tank";

class TankRenderer {
    private readonly gl: WebGLRenderingContext
    private readonly program: WebGLProgram
    private vertexBuffer: WebGLBuffer | null = null
    private indexBuffer: WebGLBuffer | null = null
    private readonly tank: Tank

    constructor(gl: WebGLRenderingContext, program: WebGLProgram, tank: Tank) {
        this.gl = gl
        this.program = program
        this.tank = tank

        this.loadGeometry()
    }

    render(position: vec3, projectionMatrix: mat4, viewMatrix: mat4): void {
        this.gl.useProgram(this.program)
        const uMatrix = this.gl.getUniformLocation(this.program, 'u_matrix')
        const uColor = this.gl.getUniformLocation(this.program, 'u_color')

        const modelMatrix = mat4.create()
        mat4.translate(modelMatrix, modelMatrix, position)
        const mvpMatrix = mat4.create()
        mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix)
        mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix)

        this.gl.uniformMatrix4fv(uMatrix, false, mvpMatrix)
        this.gl.uniform3fv(uColor, [0, 1, 0])

        this.bindBuffers()
        this.gl.drawElements(this.gl.TRIANGLES, 36, this.gl.UNSIGNED_SHORT, 0)
    }

    private loadGeometry(): void {
        const halfSize = this.tank.getSize() / 2
        const vertices = new Float32Array([
            -halfSize, -halfSize, -halfSize, 0, 0,
            halfSize, -halfSize, -halfSize, 1, 0,
            halfSize,  halfSize, -halfSize, 1, 1,
            -halfSize,  halfSize, -halfSize, 0, 1,
            -halfSize, -halfSize,  halfSize, 0, 0,
            halfSize, -halfSize,  halfSize, 1, 0,
            halfSize,  halfSize,  halfSize, 1, 1,
            -halfSize,  halfSize,  halfSize, 0, 1,
        ])

        const indices = new Uint16Array([
            0, 1, 2, 2, 3, 0,
            4, 5, 6, 6, 7, 4,
            3, 2, 6, 6, 7, 3,
            0, 1, 5, 5, 4, 0,
            1, 2, 6, 6, 5, 1,
            0, 3, 7, 7, 4, 0
        ])

        this.vertexBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW)

        this.indexBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW)
    }

    private bindBuffers(): void {
        const gl = this.gl;
        const aPosition = gl.getAttribLocation(this.program, 'a_position')
        const aTexcoord = gl.getAttribLocation(this.program, 'a_texcoord')

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 20, 0)
        gl.enableVertexAttribArray(aPosition)

        gl.vertexAttribPointer(aTexcoord, 2, gl.FLOAT, false, 20, 12)
        gl.enableVertexAttribArray(aTexcoord)

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
    }
}

export {
    TankRenderer,
}
