const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;



class House {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 200;
        this.height = 150;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    draw() {
        ctx.fillStyle = '#8B4513'; // Коричневый цвет для стен
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Крыша
        ctx.fillStyle = '#B22222'; // Красный цвет
        ctx.beginPath();
// переписать на транслате
        ctx.moveTo(this.x - 20, this.y);
        ctx.lineTo(this.x + this.width + 20, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y - 80);
        ctx.closePath();
        ctx.fill();

        // Дверь
        ctx.fillStyle = '#654321';
        ctx.fillRect(this.x + this.width / 3, this.y + this.height - 50, 40, 50);

        // Окно
        ctx.fillStyle = '#ADD8E6'; // Голубой цвет
        ctx.fillRect(this.x + (2 * this.width) / 3 - 20, this.y + 30, 40, 40);

        // Разделение окна
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(this.x + (2 * this.width) / 3 - 20, this.y + 50);
        ctx.lineTo(this.x + (2 * this.width) / 3 + 20, this.y + 50);
        ctx.moveTo(this.x + (2 * this.width) / 3, this.y + 30);
        ctx.lineTo(this.x + (2 * this.width) / 3, this.y + 70);
        ctx.stroke();

        // Труба
        ctx.fillStyle = '#A52A2A';
        ctx.fillRect(this.x + this.width - 40, this.y - 50, 20, 50);

        // Забор
        ctx.fillStyle = '#D2691E';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(this.x - 60 + i * 30, this.y + this.height - 20, 10, 50);
        }
        ctx.fillRect(this.x - 60, this.y + this.height + 10, 130, 10);
    }
}

const house = new House(200, 300);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    house.draw();
}

canvas.addEventListener('mousedown', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    if (mouseX > house.x && mouseX < house.x + house.width &&
        mouseY > house.y && mouseY < house.y + house.height) {
        house.isDragging = true;
        house.offsetX = mouseX - house.x;
        house.offsetY = mouseY - house.y;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (house.isDragging) {
        house.x = e.clientX - house.offsetX;
        house.y = e.clientY - house.offsetY;
        draw();
    }
});

canvas.addEventListener('mouseup', () => {
    house.isDragging = false;
});

draw();
