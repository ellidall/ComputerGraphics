abstract class Renderer {
    protected gl: WebGLRenderingContext
    protected program: WebGLProgram

    protected constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
        this.gl = gl
        this.program = program
    }

    abstract render(...args: any[]): void
}

export {
    Renderer,
}
