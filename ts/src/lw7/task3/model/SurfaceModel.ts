export class SurfaceModel {
    public t: number = 0; // Параметр морфинга [0,1]
    public resolution: number;
    public vertices: Float32Array;
    public triangleIndices: Uint16Array;
    public colors: Float32Array;
    public modelMatrix: Float32Array;

    constructor(resolution: number = 100) {
        this.resolution = resolution;
        this.vertices = this.generateVertices();
        this.triangleIndices = this.generateTriangleIndices();
        this.colors = this.generateColors();
        this.modelMatrix = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    setModelMatrix(mat: Float32Array) {
        this.modelMatrix = mat;
    }

    generateVertices(): Float32Array {
        const verts: number[] = [];
        for (let i = 0; i < this.resolution; ++i) {
            for (let j = 0; j < this.resolution; ++j) {
                verts.push(i / (this.resolution - 1), j / (this.resolution - 1));
            }
        }
        return new Float32Array(verts);
    }

    generateTriangleIndices(): Uint16Array {
        const idx: number[] = [];
        const N = this.resolution;
        for (let i = 0; i < N - 1; ++i) {
            for (let j = 0; j < N - 1; ++j) {
                const a = i * N + j;
                const b = (i + 1) * N + j;
                const c = (i + 1) * N + (j + 1);
                const d = i * N + (j + 1);
                idx.push(a, b, d, b, c, d);
            }
        }
        return new Uint16Array(idx);
    }

    generateColors(): Float32Array {
        const cols: number[] = [];
        for (let i = 0; i < this.resolution; ++i) {
            for (let j = 0; j < this.resolution; ++j) {
                const u = i / (this.resolution - 1);
                const v = j / (this.resolution - 1);
                cols.push(u, v, 1.0 - u - v);
            }
        }
        return new Float32Array(cols);
    }

    setT(t: number) {
        this.t = Math.max(0, Math.min(1, t));
    }
} 