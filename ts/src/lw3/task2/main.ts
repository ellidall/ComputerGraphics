import './index.css'
import {Meadow} from './Meadow'
import {Moon} from './Moon'
import {Star} from './Star'
import {Sun} from './Sun'
import {createShaderProgram, computeOrthoMatrix, getWorldSize} from './WebGLUtils'
import {Butterfly} from './Butterfly'
import {Cloud} from './Cloud'
import {GrassBlade} from './GrassBlade'

class App {
    private readonly canvas: HTMLCanvasElement
    private readonly gl: WebGLRenderingContext
    private readonly program: WebGLProgram
    private orthoMatrix: Float32Array
    private meadow: Meadow
    private grassBlades: GrassBlade[] = []
    private butterflies: Butterfly[] = []
    private sun: Sun
    private clouds: Cloud[] = []
    private moon: Moon
    private stars: Star[] = []

    constructor() {
        this.canvas = document.createElement('canvas')
        document.body.appendChild(this.canvas)
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        const gl = this.canvas.getContext('webgl')
        if (!gl) {
            throw new Error('WebGL не поддерживается')
        }
        this.gl = gl
        this.program = createShaderProgram(gl)
        gl.useProgram(this.program)
        this.orthoMatrix = computeOrthoMatrix(this.canvas.width, this.canvas.height)

        const {width, height} = getWorldSize()

        this.meadow = new Meadow(gl, this.program)
        this.sun = new Sun(gl, this.program, {x: width / 2, y: height / 2})
        this.moon = new Moon(gl, this.program, {x: -width / 2, y: -height / 2})
        this.initButterflies()
        this.initClouds()
        this.initGrassBlades()
        this.initStars()

        window.addEventListener('resize', this.resizeCanvas)
    }


    render = () => {
        requestAnimationFrame(this.render)
        const gl = this.gl

        this.sun.update()
        this.clouds.forEach(cloud => cloud.update())
        this.butterflies.forEach(butterfly => butterfly.update())
        this.moon.update()
        this.stars.forEach(star => star.update(this.sun.getSunHeight()))

        const skyColor = this.computeSkyColor(this.sun.getSunHeight())
        gl.clearColor(skyColor.r, skyColor.g, skyColor.b, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)

        const matrixLocation = gl.getUniformLocation(this.program, 'u_matrix')
        gl.uniformMatrix4fv(matrixLocation, false, this.orthoMatrix)

        this.stars.forEach(star => star.render())
        this.moon.render()
        this.sun.render()
        this.meadow.render()
        this.grassBlades.forEach(grassBlade => grassBlade.render())
        this.clouds.forEach(cloud => cloud.render())
        this.butterflies.forEach(butterfly => butterfly.render())
    }

    private computeSkyColor(sunHeight: number) {
        const minColor = {r: 0.05, g: 0.05, b: 0.2}

        if (sunHeight > 0) {
            return {
                r: minColor.r + (0.63 - minColor.r) * sunHeight,
                g: minColor.g + (0.61 - minColor.g) * sunHeight,
                b: minColor.b + (0.98 - minColor.b) * sunHeight,
            }
        }

        return minColor
    }

    private resizeCanvas = () => {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.gl.viewport(0, 0, window.innerWidth, window.innerHeight)
        this.orthoMatrix = computeOrthoMatrix(window.innerWidth, window.innerHeight)
    }

    private initButterflies() {
        const {width, height} = getWorldSize()
        const [left, right, bottom, top] = [-width, width, -height / 2, 0]

        for (let i = 0; i < 10; i++) {
            const x = Math.random() * (right - left) + left
            const y = Math.random() * (top - bottom) + bottom
            const targetX = Math.random() * (right - left) + left
            const targetY = Math.random() * (top - bottom) + bottom

            this.butterflies.push(new Butterfly(
                this.gl,
                this.program,
                {
                    position: {x, y},
                    target: {x: targetX, y: targetY},
                    color: {r: Math.random(), g: Math.random(), b: Math.random(), a: 1},
                },
            ))
        }
    }

    private initClouds() {
        const {width, height} = getWorldSize()
        const [left, right, bottom, top] = [-width, width, height * 0.1, height * 0.45]
        for (let i = 0; i < 2; i++) {
            const x = Math.random() * (right - left) + left
            const y = Math.random() * (top - bottom) + bottom
            const speed = 0.005 + Math.random() * 0.008

            this.clouds.push(new Cloud(this.gl, this.program, {
                position: {x, y},
                speed,
            }))
        }
    }

    private initGrassBlades() {
        const {width, height} = getWorldSize()
        const [left, right, bottom, top] = [-width, width, -height / 2, 0]

        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * (right - left) + left
            const y = Math.random() * (top - bottom) + bottom
            const bladeWidth = 0.1 + Math.random() * 0.4
            const bladeHeight = 0.3 + Math.random() * 0.2

            this.grassBlades.push(
                new GrassBlade(
                    this.gl,
                    this.program,
                    {
                        firstAngle: {x, y},
                        secondAngle: {x: x + bladeWidth, y},
                        thirdAngle: {x: x + bladeWidth / 2, y: y + bladeHeight},
                    },
                ),
            )
        }
    }

    private initStars() {
        const {width, height} = getWorldSize()
        const [left, right, bottom, top] = [-width, width, height * 0.01, height * 0.5]
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * (right - left) + left
            const y = Math.random() * (top - bottom) + bottom
            this.stars.push(new Star(this.gl, this.program, {x, y}))
        }
    }
}

const app = new App()
app.render()
