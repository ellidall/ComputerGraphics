import {vec3} from 'gl-matrix'
import {Maze} from './Maze'

class Player {
    position: vec3
    direction: number
    speed: number
    rotationSpeed: number

    constructor() {
        this.position = vec3.fromValues(1.5, 0.5, 1.5)
        this.direction = 0
        this.speed = 1
        this.rotationSpeed = 1.5
    }

    moveForward(maze: Maze, deltaTime: number) {
        const nextX = this.position[0] + Math.cos(this.direction) * this.speed * deltaTime
        const nextZ = this.position[2] + Math.sin(this.direction) * this.speed * deltaTime
        this.updatePosition(maze, nextX, nextZ)
    }

    strafe(maze: Maze, deltaTime: number) {
        const nextX = this.position[0] + Math.sin(this.direction) * this.speed * deltaTime
        const nextZ = this.position[2] - Math.cos(this.direction) * this.speed * deltaTime
        this.updatePosition(maze, nextX, nextZ)
    }

    rotate(deltaTime: number) {
        this.direction += this.rotationSpeed * deltaTime
    }

    private updatePosition(maze: Maze, nextX: number, nextZ: number) {
        if (!maze.isWall(nextX, nextZ)) {
            this.position[0] = nextX
            this.position[2] = nextZ
        }
    }
}

export {
    Player,
}