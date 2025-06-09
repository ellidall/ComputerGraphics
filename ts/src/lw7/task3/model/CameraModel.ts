export class CameraModel {
    public theta: number = Math.PI / 4;
    public phi: number = Math.PI / 4;
    public radius: number = 4;
    public target: [number, number, number] = [0, 0, 0];

    setRadius(r: number) {
        this.radius = Math.max(1, r);
    }

    getEye(): [number, number, number] {
        const x = this.radius * Math.sin(this.phi) * Math.sin(this.theta);
        const y = this.radius * Math.cos(this.phi);
        const z = this.radius * Math.sin(this.phi) * Math.cos(this.theta);
        return [x, y, z];
    }
} 