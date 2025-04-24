import { vec3 } from 'gl-matrix';

enum TankDirection {
    FORWARD,
    LEFT,
    RIGHT,
    BACK
}

class Tank {
    private position: vec3
    private direction: vec3 // Направление движения
    private speed: number
    private size: number

    constructor(startX: number, startY: number, size: number = 1) {
        this.position = vec3.fromValues(startX, 0, startY); // Начальная позиция танка
        this.direction = vec3.fromValues(0, 0, 1); // Изначально танк двигается вперед
        this.speed = 0.1; // Скорость движения
        this.size = size; // Размер танка
    }

    // Метод для перемещения танка
    move(direction: TankDirection, deltaTime: number): void {
        let moveX = 0;
        let moveZ = 0;

        switch (direction) {
            case TankDirection.FORWARD:
                moveZ = 1;
                break;
            case TankDirection.BACK:
                moveZ = -1;
                break;
            case TankDirection.LEFT:
                moveX = -1;
                break;
            case TankDirection.RIGHT:
                moveX = 1;
                break;
        }

        const distance = this.speed * deltaTime;
        this.position[0] += moveX * distance;
        this.position[2] += moveZ * distance;
    }

    // Стрельба
    shoot(): void {
        console.log('Танк стреляет!');
        // Логика для стрельбы
    }

    // Получаем текущую позицию танка
    getPosition(): vec3 {
        return this.position;
    }

    // Получаем направление танка
    getDirection(): vec3 {
        return this.direction;
    }
}

export {
    Tank,
    TankDirection,
};
