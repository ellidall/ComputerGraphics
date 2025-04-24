import {mat4} from 'gl-matrix'
import {Map} from './Map'
import {BlockRenderer} from './renderer/BlockRenderer'
import {createShaderProgram} from './utils/WebGLUtils'
import {FirstLevel} from './level/FirstLevel'

class Game {
    private gl: WebGLRenderingContext
    private readonly program: WebGLProgram
    private readonly map: Map
    private blockRenderer: BlockRenderer

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl
        this.program = createShaderProgram(gl, false)

        const level = new FirstLevel()
        this.map = level.createMap()

        this.blockRenderer = new BlockRenderer(gl, this.program)
    }

    update(deltaTime: number): void {
        // В будущем: обновление танков, пуль, логики
    }

    render(projectionMatrix: mat4, viewMatrix: mat4): void {
        this.gl.useProgram(this.program)
        this.blockRenderer.render(this.map, projectionMatrix, viewMatrix)
    }
}

export {
    Game,
}
