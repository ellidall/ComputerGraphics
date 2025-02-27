const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Letter {
    static SIZE = 80;
    static TIME_STABILIZER = 16
//отделить код рисования от кода расчёта физики

    constructor(type, x, color, phaseDelay, isUniform = false) {
        this.type = type;
        this.x = x;
        this.baseY = canvas.height / 2;
        this.y = this.baseY;
        this.color = color;
        this.velocity = 0;
        this.gravity = 1.6;
        this.maxJumpHeight = 300;
        this.jumpPower = -Math.sqrt(2 * this.gravity * this.maxJumpHeight);
        this.phaseDelay = phaseDelay;
        this.time = 0;
        this.uniform = isUniform;
        this.speed = 6;
        this.direction = -1;
    }

    update(deltaTime) {
        this.time += deltaTime;

        if (this.time > this.phaseDelay) {
            if (this.uniform) {
                this.updateUniform(deltaTime);
            } else {
                this.updateAccelerated(deltaTime);
            }
        }
    }
    updateUniform(deltaTime) {
        this.y += this.speed * this.direction * (deltaTime / Letter.TIME_STABILIZER);

        if (this.y <= this.baseY - this.maxJumpHeight || this.y >= this.baseY) {
            this.direction *= -1;
        }
    }


    updateAccelerated(deltaTime) {
        this.velocity += this.gravity * (deltaTime / Letter.TIME_STABILIZER);
        this.y += this.velocity * (deltaTime / Letter.TIME_STABILIZER);

        if (this.y >= this.baseY) {
            this.y = this.baseY;
            this.velocity = this.jumpPower;
            this.time = this.phaseDelay;
        }
    }

    draw() {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';

        if (this.type === 'A') {
            this.drawA();
        } else if (this.type === 'B') {
            this.drawB();
        } else {
            console.log('Неизвестная буква:', this.type);
        }
    }

    drawA() {
        ctx.beginPath();
        ctx.moveTo(this.x - Letter.SIZE / 2, this.y + Letter.SIZE);
        ctx.lineTo(this.x, this.y);
        ctx.lineTo(this.x + Letter.SIZE / 2, this.y + Letter.SIZE);
        ctx.moveTo(this.x - Letter.SIZE / 4, this.y + Letter.SIZE / 2);
        ctx.lineTo(this.x + Letter.SIZE / 4, this.y + Letter.SIZE / 2);
        ctx.stroke();
    }

    drawB() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + Letter.SIZE);
        ctx.lineTo(this.x + Letter.SIZE / 4, this.y + Letter.SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x + Letter.SIZE / 4, this.y + (3 * Letter.SIZE) / 4, Letter.SIZE / 4, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x, this.y + Letter.SIZE / 2);
        ctx.lineTo(this.x + Letter.SIZE / 4, this.y + Letter.SIZE / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x + Letter.SIZE / 4, this.y + Letter.SIZE / 4, Letter.SIZE / 4, -Math.PI / 2, Math.PI / 2);
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + Letter.SIZE / 4, this.y);
        ctx.stroke();
    }
}

let letters = [
    new Letter('A', canvas.width / 4, 'red', 0),
    new Letter('A', canvas.width / 2, 'blue', 500),
    new Letter('B', (3 * canvas.width) / 4, 'green', 1000),
];

let lastTime = 0;
function animate(time = 0) {
    let deltaTime = time - lastTime;
    lastTime = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    letters.forEach(letter => {
        letter.update(deltaTime);
        letter.draw();
    });

    requestAnimationFrame(animate);
}

animate();
