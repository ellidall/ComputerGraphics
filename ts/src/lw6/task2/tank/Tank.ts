import { vec3 } from 'gl-matrix'
import {Block, BlockType} from "../block/Block";

enum TankDirection {
    FORWARD,
    LEFT,
    RIGHT,
    BACK
}

class Tank {
    private readonly grid: Block[][]
    private readonly position: vec3
    private readonly speed: number
    private readonly size: number

    constructor(grid: Block[][], startX: number, startZ: number, speed: number, size: number = 0.5) {
        this.grid = grid
        this.position = vec3.fromValues(startX, 0, startZ)
        this.speed = speed
        this.size = size
    }

    getPosition(): vec3 {
        return this.position
    }

    getSpeed(): number {
        return this.speed
    }

    getSize(): number {
        return this.size
    }

    move(direction: TankDirection, distance: number): void {
        let moveX = 0
        let moveZ = 0

        switch (direction) {
            case TankDirection.FORWARD:
                moveZ = -distance
                break
            case TankDirection.BACK:
                moveZ = distance
                break
            case TankDirection.LEFT:
                moveX = -distance
                break
            case TankDirection.RIGHT:
                moveX = distance
                break
        }

        this.position[0] += moveX
        this.position[2] += moveZ
    }

    shoot(): void {
        console.log('Танк стреляет!')
    }

    isMoveValid(newX: number, newZ: number): boolean {
        const x = Math.floor(newX);
        const z = Math.floor(newZ);

        if (x < 0 || z < 0 || x >= this.grid[0]!.length || z >= this.grid.length) {
            console.log('Вышли за пределы карты:', x, z);
            return false;
        }

        const type = this.grid[z]![x]!.type;
        console.log(`Проверка блока ${x},${z}:`, type);
        return type === BlockType.Ground;
    }
}

export {
    Tank,
    TankDirection,
}
