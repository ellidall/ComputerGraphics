import { vec3 } from 'gl-matrix'

enum TankDirection {
    FORWARD,
    LEFT,
    RIGHT,
    BACK
}

class Tank {
    private readonly position: vec3
    private readonly speed: number

    constructor(startX: number, startZ: number, speed: number) {
        this.position = vec3.fromValues(startX, 0, startZ)
        this.speed = speed
    }

    getPosition(): vec3 {
        return this.position
    }

    getSpeed(): number {
        return this.speed
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
}

export {
    Tank,
    TankDirection,
}
