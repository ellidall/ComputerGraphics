import { mat4 } from 'gl-matrix'
import { Maze } from './Maze'
import {EnvironmentRenderer} from "./EnvironmentRenderer";

class Renderer {
    private readonly gl: WebGLRenderingContext
    private readonly program: WebGLProgram
    private readonly uMatrixLocation: WebGLUniformLocation
    private readonly uTextureLocation: WebGLUniformLocation

    private cubeVertexBuffer: WebGLBuffer | null = null
    private cubeIndexBuffer: WebGLBuffer | null = null
    private cubeIndexCount: number = 0

    private textures: WebGLTexture[] = []

    private environmentRenderer: EnvironmentRenderer;

    constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
        this.gl = gl
        this.program = program

        const matrixLoc = gl.getUniformLocation(program, 'u_matrix')
        const textureLoc = gl.getUniformLocation(program, 'u_texture')
        if (!matrixLoc || !textureLoc) throw new Error('Не удалось получить uniform-переменные')
        this.uMatrixLocation = matrixLoc
        this.uTextureLocation = textureLoc

        this.environmentRenderer = new EnvironmentRenderer(gl);

        this.initCubeBuffers()
        this.loadTextures()
    }

    public draw(maze: Maze, projectionMatrix: mat4, viewMatrix: mat4) {
        this.environmentRenderer.drawSkybox(
            projectionMatrix,
            viewMatrix,
            this.uMatrixLocation,
            this.uTextureLocation,
            this.cubeIndexCount
        );

        const gl = this.gl
        for (let z = 0; z < maze.size; z++) {
            for (let x = 0; x < maze.size; x++) {
                const cell = maze.grid[z]![x]
                if (cell! > 0) {
                    const texture = this.textures[cell! - 1]
                    gl.activeTexture(gl.TEXTURE0)
                    gl.bindTexture(gl.TEXTURE_2D, texture!)
                    gl.uniform1i(this.uTextureLocation, 0)

                    const mvpMatrix = this.calcFinalMatrix(x, z, projectionMatrix, viewMatrix)
                    gl.uniformMatrix4fv(this.uMatrixLocation, false, mvpMatrix)
                    gl.drawElements(gl.TRIANGLES, this.cubeIndexCount, gl.UNSIGNED_SHORT, 0)
                }
            }
        }
    }

    private calcFinalMatrix(x: number, z: number, projectionMatrix: mat4, viewMatrix: mat4) {
        const modelMatrix = mat4.create()
        mat4.translate(modelMatrix, modelMatrix, [x, 0, z])
        const mvpMatrix = mat4.create()
        mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix)
        mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix)
        return mvpMatrix
    }

    private initCubeBuffers() {
        const gl = this.gl;

        const vertices = new Float32Array([
            // Front face
            0, 0, 0, 0, 0,
            1, 0, 0, 1, 0,
            1, 1, 0, 1, 1,
            0, 1, 0, 0, 1,

            // Back face
            1, 0, 1, 0, 0,
            0, 0, 1, 1, 0,
            0, 1, 1, 1, 1,
            1, 1, 1, 0, 1,

            // Top face
            0, 1, 0, 0, 0,
            1, 1, 0, 1, 0,
            1, 1, 1, 1, 1,
            0, 1, 1, 0, 1,

            // Bottom face
            0, 0, 1, 0, 0,
            1, 0, 1, 1, 0,
            1, 0, 0, 1, 1,
            0, 0, 0, 0, 1,

            // Right face
            1, 0, 0, 0, 0,
            1, 0, 1, 1, 0,
            1, 1, 1, 1, 1,
            1, 1, 0, 0, 1,

            // Left face
            0, 0, 1, 0, 0,
            0, 0, 0, 1, 0,
            0, 1, 0, 1, 1,
            0, 1, 1, 0, 1,
        ]);

        const indices = new Uint16Array([
            0, 1, 2, 0, 2, 3,      // front
            4, 5, 6, 4, 6, 7,      // back
            8, 9,10, 8,10,11,      // top
            12,13,14,12,14,15,      // bottom
            16,17,18,16,18,19,      // right
            20,21,22,20,22,23,      // left
        ]);
        this.cubeIndexCount = indices.length;

        // Создаем и заполняем вершинный буфер
        this.cubeVertexBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // Создаем и заполняем индексный буфер
        this.cubeIndexBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        // Настраиваем атрибуты
        const aPositionLocation = gl.getAttribLocation(this.program, 'a_position');
        if (aPositionLocation === -1) throw new Error('Атрибут "a_position" не найден');

        const aTexcoordLocation = gl.getAttribLocation(this.program, 'a_texcoord');
        if (aTexcoordLocation === -1) throw new Error('Атрибут "a_texcoord" не найден');

        const stride = 5 * Float32Array.BYTES_PER_ELEMENT;
        // Позиция занимает первые 3 значения (x, y, z)
        gl.enableVertexAttribArray(aPositionLocation);
        gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, stride, 0);
        // Текстурные координаты занимают оставшиеся 2 значения (s, t)
        gl.enableVertexAttribArray(aTexcoordLocation);
        gl.vertexAttribPointer(aTexcoordLocation, 2, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
    }

    private loadTextures(): void {
        const gl = this.gl;
        const textureURLs = [
            'textures/wall1.jpg',
            'textures/wall2.jpg',
            'textures/wall3.jpg',
            'textures/wall4.jpg',
            'textures/wall5.jpg',
            'textures/wall6.jpg',
        ];

        // использовать подходящий режим заворачивания текстур
        textureURLs.forEach(url => {
            const texture = gl.createTexture()!;
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // Placeholder пока изображение не загрузилось
            const level = 0;
            const internalFormat = gl.RGBA;
            const width = 1;
            const height = 1;
            const border = 0;
            const srcFormat = gl.RGBA;
            const srcType = gl.UNSIGNED_BYTE;
            const pixel = new Uint8Array([255, 255, 255, 255]);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType, pixel);

            const image = new Image();
            image.src = url;
            image.addEventListener('load', () => {
                gl.bindTexture(gl.TEXTURE_2D, texture);

                let source: HTMLImageElement | HTMLCanvasElement = image;
                if (!this.isPowerOf2(image.width) || !this.isPowerOf2(image.height)) {
                    source = this.resizeToPowerOf2(image);
                }

                gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    srcFormat, srcType, source);

                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            });

            this.textures.push(texture);
        });
    }

    private resizeToPowerOf2(image: HTMLImageElement): HTMLCanvasElement {
        const canvas = document.createElement('canvas');

        const nextPowerOf2 = (x: number) => {
            return Math.pow(2, Math.floor(Math.log2(x)));
        };

        const width = nextPowerOf2(image.width);
        const height = nextPowerOf2(image.height);

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(image, 0, 0, width, height);

        return canvas;
    }

    private isPowerOf2(value: number): boolean {
        return (value & (value - 1)) === 0;
    }
}

export {
    Renderer
}
