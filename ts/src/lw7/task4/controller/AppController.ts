import { WebGLView } from '../view/WebGLView';

export class AppController {
    private view: WebGLView;
    private rippleTime: number = 0;
    private rippleAnimating: boolean = false;
    private rippleCenter: [number, number] = [0.5, 0.5];
    private forward: boolean = true;

    constructor(canvas: HTMLCanvasElement) {
        this.view = new WebGLView(canvas);
        this.initMouse(canvas);
        this.animate();
    }

    private initMouse(canvas: HTMLCanvasElement) {
        canvas.addEventListener('click', (e) => {
            if (!this.rippleAnimating) {
                const rect = canvas.getBoundingClientRect();
                this.rippleCenter = [
                    (e.clientX - rect.left) / canvas.width,
                    1.0 - (e.clientY - rect.top) / canvas.height
                ];
                this.forward = !this.forward;
                this.startRipple();
            }
        });
    }

    private startRipple() {
        this.rippleAnimating = true;
        this.rippleTime = 0;
        const duration = 2.0;
        const animateStep = (dt: number) => {
            this.rippleTime += dt;
            if (this.rippleTime < duration) {
                requestAnimationFrame(() => animateStep(1/60));
            } else {
                this.rippleAnimating = false;
            }
        };
        requestAnimationFrame(() => animateStep(1/60));
    }

    private animate = () => {
        if (this.rippleAnimating) {
            this.rippleTime += 1/10000;
        }
        this.view.render(this.rippleTime, this.rippleCenter, this.forward);
        requestAnimationFrame(this.animate);
    };
} 