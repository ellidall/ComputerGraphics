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
        const playerRadius = 0.2;
        const gridX = Math.floor(nextX);
        const gridZ = Math.floor(nextZ);

        if (maze.isWall(gridX, gridZ)) {
            return
        }

        const offsetX = nextX - gridX;
        const offsetZ = nextZ - gridZ;

        if (offsetX < playerRadius && gridX > 0 && maze.grid[gridZ]![gridX - 1] !== 0) {
            nextX = gridX + playerRadius;
        }
        if (offsetX > 1 - playerRadius && gridX < maze.size - 1 && maze.grid[gridZ]![gridX + 1] !== 0) {
            nextX = gridX + 1 - playerRadius;
        }
        if (offsetZ < playerRadius && gridZ > 0 && maze.grid[gridZ - 1]![gridX] !== 0) {
            nextZ = gridZ + playerRadius;
        }
        if (offsetZ > 1 - playerRadius && gridZ < maze.size - 1 && maze.grid[gridZ + 1]![gridX] !== 0) {
            nextZ = gridZ + 1 - playerRadius;
        }

        this.position[0] = nextX;
        this.position[2] = nextZ;
    }
}

export {
    Player,
}