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
        const cellX = Math.floor(nextX)
        const cellZ = Math.floor(nextZ)
        if (
            cellX >= 0 && cellX < maze.size &&
            cellZ >= 0 && cellZ < maze.size &&
            maze.grid[cellZ]![cellX] === 0
        ) {
            this.position[0] = nextX
            this.position[2] = nextZ
        }
    }

    strafe(maze: Maze, deltaTime: number) {
        const rightX = Math.sin(this.direction)
        const rightZ = -Math.cos(this.direction)
        const nextX = this.position[0] + rightX * this.speed * deltaTime
        const nextZ = this.position[2] + rightZ * this.speed * deltaTime
        const cellX = Math.floor(nextX)
        const cellZ = Math.floor(nextZ)
        if (
            cellX >= 0 && cellX < maze.size &&
            cellZ >= 0 && cellZ < maze.size &&
            maze.grid[cellZ]![cellX] === 0
        ) {
            this.position[0] = nextX
            this.position[2] = nextZ
        }
    }

    rotate(deltaTime: number) {
        this.direction += this.rotationSpeed * deltaTime
    }
}

export {
    Player,
}