import { mat4, vec3 } from 'gl-matrix'
// @ts-ignore
import tankModel from '../model/tank.obj?raw'
import ObjFileParser from "obj-file-parser"

class TankRenderer {
    private readonly gl: WebGLRenderingContext
    private readonly program: WebGLProgram
    private vertexBuffer: WebGLBuffer | null = null
    private indexBuffer: WebGLBuffer | null = null
    private texCoordBuffer: WebGLBuffer | null = null
    private readonly texture: WebGLTexture | null = null
    private vertexCount = 0

    private halfWidth = 0
    private halfDepth = 0
    private rawVertices: number[] = []

    constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
        this.gl = gl
        this.program = program
        this.loadModel()
        this.computeBounds();
        this.texture = this.loadTexture('../texture/Palette.png')
    }

    getHalfSize(): { halfWidth: number; halfDepth: number } {
        return { halfWidth: this.halfWidth, halfDepth: this.halfDepth };
    }

    render(position: vec3, projectionMatrix: mat4, viewMatrix: mat4): void {
        this.gl.useProgram(this.program)

        const uMatrix = this.gl.getUniformLocation(this.program, 'u_matrix')
        const uTexture = this.gl.getUniformLocation(this.program, 'u_texture')

        const modelMatrix = mat4.create()
        mat4.translate(modelMatrix, modelMatrix, position)
        mat4.scale(modelMatrix, modelMatrix, [0.3, 0.3, 0.3])

        const mvpMatrix = mat4.create()
        mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix)
        mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix)

        this.gl.uniformMatrix4fv(uMatrix, false, mvpMatrix)

        this.gl.activeTexture(this.gl.TEXTURE0)
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture)
        this.gl.uniform1i(uTexture, 0)

        this.bindBuffers()
        this.gl.drawElements(this.gl.TRIANGLES, this.vertexCount, this.gl.UNSIGNED_SHORT, 0)
    }

    private loadModel(): void {
        const parser = new ObjFileParser(tankModel)
        const parsedData = parser.parse()
        const model = parsedData.models[0]!

        const flatVerts: number[] = []
        for (const v of model.vertices) {
            flatVerts.push(v.x, v.y, v.z)
        }
        const vertices = new Float32Array(flatVerts)

        const flatUVs: number[] = []
        for (const uv of model.textureCoords) {
            flatUVs.push(uv.u, uv.v)
        }
        const texCoords = new Float32Array(flatUVs)

        const idxs: number[] = []
        for (const face of model.faces) {
            for (const vert of face.vertices) {
                idxs.push(vert.vertexIndex - 1)
            }
        }
        const indices = new Uint16Array(idxs)

        this.vertexBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW)

        this.texCoordBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW)

        this.indexBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW)

        this.vertexCount = indices.length
        this.rawVertices = flatVerts
    }

    private computeBounds() {
        // модель мы масштабируем на 0.3
        const S = 0.3;
        let minX = +Infinity, maxX = -Infinity;
        let minZ = +Infinity, maxZ = -Infinity;
        const v = this.rawVertices!;
        for (let i = 0; i < v.length; i += 3) {
            const x = v[i]!   * S;
            const z = v[i+2]! * S;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (z < minZ) minZ = z;
            if (z > maxZ) maxZ = z;
        }
        this.halfWidth = (maxX - minX) / 2;
        this.halfDepth = (maxZ - minZ) / 2;
    }

    private bindBuffers(): void {
        const aPosition = this.gl.getAttribLocation(this.program, 'a_position')
        const aTexCoord = this.gl.getAttribLocation(this.program, 'a_texcoord')

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer)
        this.gl.vertexAttribPointer(aPosition, 3, this.gl.FLOAT, false, 0, 0)
        this.gl.enableVertexAttribArray(aPosition)

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer)
        this.gl.vertexAttribPointer(aTexCoord, 2, this.gl.FLOAT, false, 0, 0)
        this.gl.enableVertexAttribArray(aTexCoord)

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
    }

    private loadTexture(url: string): WebGLTexture | null {
        const texture = this.gl.createTexture()
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture)

        const image = new Image()
        image.onload = () => {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image)
            this.gl.generateMipmap(this.gl.TEXTURE_2D)
        }
        image.onerror = () => {
            console.error('Ошибка при загрузке текстуры')
        }

        image.src = url
        return texture
    }
}

export {
    TankRenderer,
}
