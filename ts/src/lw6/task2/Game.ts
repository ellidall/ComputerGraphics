import {mat4} from 'gl-matrix'
import {Map} from './level/Map'
import {BlockRenderer} from './renderer/BlockRenderer'
import {createShaderProgram} from './utils/WebGLUtils'
import {FirstLevel} from './level/FirstLevel'
import {Tank, TankDirection} from './tank/Tank'
import {TankRenderer} from './renderer/TankRenderer'

class Game {
    private readonly events: { [key: string]: boolean }
    private gl: WebGLRenderingContext
    private readonly program: WebGLProgram

    private blockRenderer: BlockRenderer
    private tankRenderer: TankRenderer

    private readonly map: Map
    private tank: Tank

    constructor(gl: WebGLRenderingContext, events: { [key: string]: boolean }) {
        this.events = events
        this.gl = gl
        this.program = createShaderProgram(gl, false)

        const level = new FirstLevel()
        this.map = level.createMap()
        this.tank = new Tank(this.map.getGrid(), 1, 1, 2)

        this.blockRenderer = new BlockRenderer(gl, this.program)
        this.tankRenderer = new TankRenderer(gl, this.program)
    }

    render(projectionMatrix: mat4, viewMatrix: mat4): void {
        this.gl.useProgram(this.program)
        this.blockRenderer.render(this.map, projectionMatrix, viewMatrix)
        this.tankRenderer.render(this.tank.getPosition(), projectionMatrix, viewMatrix)
    }

    getMapSize(): number {
        return this.map.grid.length
    }

    update(deltaTime: number): void {
        const anyKeyPressed = Object.values(this.events).some(value => value)
        if (anyKeyPressed) {
            this.handleTankMovement(deltaTime)
        }
    }

    private handleTankMovement(deltaTime: number): void {
        const pos = this.tank.getPosition()
        const distance = this.tank.getSpeed() * deltaTime

        let gridX = 0
        let gridZ = 0

        // console.log("Current tank pos: ", pos)
        if (this.isKeyPressed('w') || this.isKeyPressed('ArrowUp')) {
            gridX = Math.floor(pos[0])
            gridZ = Math.floor(pos[2] - distance)
            if (this.map.isWall(gridX, gridZ)) {
                return
            }
            this.tank.move(TankDirection.FORWARD, distance)
        }
        if (this.isKeyPressed('s') || this.isKeyPressed('ArrowDown')) {
            gridX = Math.floor(pos[0])
            gridZ = Math.floor(pos[2] + distance)
            if (this.map.isWall(gridX, gridZ)) {
                return
            }
            this.tank.move(TankDirection.BACK, distance)
        }
        if (this.isKeyPressed('a') || this.isKeyPressed('ArrowLeft')) {
            gridX = Math.floor(pos[0] + distance)
            gridZ = Math.floor(pos[2])
            if (this.map.isWall(gridX, gridZ)) {
                return
            }
            this.tank.move(TankDirection.LEFT, distance)
        }
        if (this.isKeyPressed('d') || this.isKeyPressed('ArrowRight')) {
            gridX = Math.floor(pos[0] - distance)
            gridZ = Math.floor(pos[2])
            if (this.map.isWall(gridX, gridZ)) {
                return
            }
            this.tank.move(TankDirection.RIGHT, distance)
        }
        if (this.isKeyPressed(' ')) {
            this.tank.shoot()
        }
    }

    private isKeyPressed(key: string): boolean {
        return !!this.events[key]
    }
}

export {
    Game,
}
