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

    constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
        this.gl = gl
        this.program = program
        this.loadModel()
        this.texture = this.loadTexture('../texture/Palette.png')
    }

    private loadModel(): void {
        const parser = new ObjFileParser(tankModel)
        const parsedData = parser.parse()
        const model = parsedData.models[0]!

        // 1) Разворачиваем вершины в плоский массив чисел [x1, y1, z1, x2, y2, z2, …]
        const flatVerts: number[] = []
        for (const v of model.vertices) {
            flatVerts.push(v.x, v.y, v.z)
        }
        const vertices = new Float32Array(flatVerts)

        // 2) Разворачиваем UV-координаты в [u1, v1, u2, v2, …]
        const flatUVs: number[] = []
        for (const uv of model.textureCoords) {
            flatUVs.push(uv.u, uv.v)
        }
        const texCoords = new Float32Array(flatUVs)

        // 3) Собираем индексы для треугольников в Uint16Array
        const idxs: number[] = []
        for (const face of model.faces) {
            // face.vertices — массив из 3 объектов типа { vertexIndex, textureCoordsIndex, … }
            for (const vert of face.vertices) {
                // OBJ-файлы нумеруются с единицы, а WebGL — с нуля:
                idxs.push(vert.vertexIndex - 1)
            }
        }
        const indices = new Uint16Array(idxs)

        // 4) Загружаем в WebGL
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
    }

    render(position: vec3, projectionMatrix: mat4, viewMatrix: mat4): void {
        this.gl.useProgram(this.program)

        const uMatrix = this.gl.getUniformLocation(this.program, 'u_matrix')
        const uTexture = this.gl.getUniformLocation(this.program, 'u_texture')

        // Создаем модельную матрицу
        const modelMatrix = mat4.create()
        mat4.translate(modelMatrix, modelMatrix, position)
        mat4.scale(modelMatrix, modelMatrix, [0.3, 0.3, 0.3])

        // Создаем модельно-видовую-пропорциональную матрицу (MVP)
        const mvpMatrix = mat4.create()
        mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix)
        mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix)

        // Передаем MVP-матрицу в шейдер
        this.gl.uniformMatrix4fv(uMatrix, false, mvpMatrix)

        // Загружаем текстуру
        this.gl.activeTexture(this.gl.TEXTURE0)
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture)
        this.gl.uniform1i(uTexture, 0)

        this.bindBuffers()
        this.gl.drawElements(this.gl.TRIANGLES, this.vertexCount, this.gl.UNSIGNED_SHORT, 0)
    }

    private bindBuffers(): void {
        const aPosition = this.gl.getAttribLocation(this.program, 'a_position')
        const aTexCoord = this.gl.getAttribLocation(this.program, 'a_texcoord')

        // Связываем и заполняем буфер для вершин
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer)
        this.gl.vertexAttribPointer(aPosition, 3, this.gl.FLOAT, false, 0, 0)
        this.gl.enableVertexAttribArray(aPosition)

        // Связываем и заполняем буфер для текстурных координат
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer)
        this.gl.vertexAttribPointer(aTexCoord, 2, this.gl.FLOAT, false, 0, 0)
        this.gl.enableVertexAttribArray(aTexCoord)

        // Связываем буфер индексов
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
