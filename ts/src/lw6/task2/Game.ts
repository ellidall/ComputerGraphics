import {mat4} from 'gl-matrix'
import {Map} from './level/Map'
import {BlockRenderer} from './renderer/BlockRenderer'
import {createShaderProgram} from './utils/WebGLUtils'
import {FirstLevel} from './level/FirstLevel'
import {Tank, TankDirection} from './tank/Tank'

class Game {
    private readonly events: { [key: string]: boolean }
    private gl: WebGLRenderingContext
    private readonly program: WebGLProgram

    private blockRenderer: BlockRenderer

    private readonly map: Map
    private tank: Tank;

    constructor(gl: WebGLRenderingContext, events: { [key: string]: boolean }) {
        this.events = events
        this.gl = gl
        this.program = createShaderProgram(gl, false)

        this.blockRenderer = new BlockRenderer(gl, this.program)

        const level = new FirstLevel()
        this.map = level.createMap()
        this.tank = new Tank(2, 0)

    }

    render(projectionMatrix: mat4, viewMatrix: mat4): void {
        this.gl.useProgram(this.program)
        this.blockRenderer.render(this.map, projectionMatrix, viewMatrix)
    }

    getMapSize(): number {
        return this.map.size;
    }

    update(deltaTime: number): void {
        this.handleTankMovement(deltaTime);
    }

    private handleTankMovement(deltaTime: number): void {
        if (this.isKeyPressed('w') || this.isKeyPressed('ArrowUp')) {
            if (this.isTankMoveValid(this.tank.getPosition()[0], this.tank.getPosition()[2] + 1)) {
                this.tank.move(TankDirection.FORWARD, deltaTime);
            }
        }
        if (this.isKeyPressed('s') || this.isKeyPressed('ArrowDown')) {
            if (this.isTankMoveValid(this.tank.getPosition()[0], this.tank.getPosition()[2] - 1)) {
                this.tank.move(TankDirection.BACK, deltaTime);
            }
        }
        if (this.isKeyPressed('a') || this.isKeyPressed('ArrowLeft')) {
            if (this.isTankMoveValid(this.tank.getPosition()[0] - 1, this.tank.getPosition()[2])) {
                this.tank.move(TankDirection.LEFT, deltaTime);
            }
        }
        if (this.isKeyPressed('d') || this.isKeyPressed('ArrowRight')) {
            if (this.isTankMoveValid(this.tank.getPosition()[0] + 1, this.tank.getPosition()[2])) {
                this.tank.move(TankDirection.RIGHT, deltaTime);
            }
        }
        if (this.isKeyPressed(' ')) {
            this.tank.shoot();
        }
    }

    private isTankMoveValid(newX: number, newZ: number): boolean {
        return this.map.isMoveValid(newX, newZ)
    }

    private isKeyPressed(key: string): boolean {
        return !!this.events[key];
    }
}

export {
    Game,
}
