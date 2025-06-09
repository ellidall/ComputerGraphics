import {SurfaceModel} from '../model/SurfaceModel';
import {CameraModel} from '../model/CameraModel';
import {WebGLView} from '../view/WebGLView';

export class AppController {
    private model: SurfaceModel;
    private camera: CameraModel;
    private view: WebGLView;
    private animating: boolean = false;
    private lastX: number = 0;
    private lastY: number = 0;
    private dragging: boolean = false;

    constructor(canvas: HTMLCanvasElement) {
        this.model = new SurfaceModel(100);
        this.camera = new CameraModel();
        this.view = new WebGLView(canvas);
        this.view.setSurface(this.model);
        this.initMouse(canvas);
        this.animate();
    }

    private initMouse(canvas: HTMLCanvasElement) {
        canvas.addEventListener('mousedown', (e) => {
            this.dragging = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
        });
        window.addEventListener('mousemove', (e) => {
            if (!this.dragging) return;
            const dx = e.clientX - this.lastX;
            const dy = e.clientY - this.lastY;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            this.camera.theta += dx * 0.01; // setAngles
            this.camera.phi += dy * 0.01;
            this.camera.phi = Math.max(0.05, Math.min(Math.PI - 0.05, this.camera.phi));
        });
        window.addEventListener('mouseup', () => {
            this.dragging = false;
        });
        canvas.addEventListener('wheel', (e) => {
            this.camera.setRadius(this.camera.radius + e.deltaY * 0.01);
        });
        canvas.addEventListener('click', () => {
            if (!this.animating) {
                this.startMorph();
            }
        });
    }

    private startMorph() {
        this.animating = true;
        const startT = this.model.t;
        const endT = startT < 0.5 ? 1 : 0;
        const duration = 1.5; // секунд
        const startTime = performance.now();
        const animateStep = (now: number) => {
            const t = Math.min(1, (now - startTime) / (duration * 1000));
            this.model.setT(startT + (endT - startT) * t);
            if (t < 1) {
                requestAnimationFrame(animateStep);
            } else {
                this.model.setT(endT);
                this.animating = false;
            }
        };
        requestAnimationFrame(animateStep);
    }

    private animate = () => {
        this.view.render(this.model, this.camera);
        requestAnimationFrame(this.animate);
    };
} 