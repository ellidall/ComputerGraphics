import {GameEvent} from '../Document/GameEvent'
import {IDocumentListener} from '../Document/IDocumentListener'
import {TetrisDocument} from '../Document/TetrisDocument'
import {Renderer} from './Renderer'

class ScoreView implements IDocumentListener {
	private readonly scoreTexture: WebGLTexture | null = null
	private readonly offscreenCanvas: HTMLCanvasElement
	private readonly ctx: CanvasRenderingContext2D
	private score: number
	private level: number
	private clearedLines: number

	private x = -9
	private y = 12
	private width = 8
	private height = 4

	constructor(
		private readonly gl: WebGLRenderingContext,
		private readonly gameDocument: TetrisDocument,
		private readonly renderer: Renderer,
	) {
		const scoreData = gameDocument.getScoreData()
		this.score = scoreData.score
		this.level = scoreData.level
		this.clearedLines = scoreData.clearedLines
		gameDocument.addListener(this)
		this.offscreenCanvas = document.createElement('canvas')
		this.offscreenCanvas.width = 256
		this.offscreenCanvas.height = 128
		const ctx = this.offscreenCanvas.getContext('2d')
		if (!ctx) {
			throw new Error('Не удалось получить 2D контекст')
		}
		this.ctx = ctx
		this.scoreTexture = gl.createTexture()
		this.updateScoreTexture()
	}

	notify(event: GameEvent) {
		if (event.type === 'scoreUpdated') {
			this.score = event.data.score
			this.level = event.data.level
			this.clearedLines = event.data.clearedLines
		}
	}

	render() {
		this.updateScoreTexture()
		if (this.scoreTexture) {
			this.renderer.drawTexturedQuad({x: this.x, y: this.y}, {width: this.width, height: this.height}, this.scoreTexture)
		}
	}

	private updateScoreTexture() {
		const ctx = this.ctx
		ctx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height)
		ctx.fillStyle = 'black'
		ctx.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height)
		ctx.fillStyle = 'yellow'
		ctx.font = '20px Montserrat'
		ctx.textAlign = 'left'
		ctx.textBaseline = 'top'
		const scoreText = `Score: ${this.score}`
		const levelText = `Level: ${this.level}`
		const linesText = `Lines: ${this.clearedLines}/${this.gameDocument.getLinesToLevelUp()}`
		ctx.fillText(scoreText, 10, 40)
		ctx.fillText(levelText, 10, 70)
		ctx.fillText(linesText, 10, 100)
		const gl = this.gl
		gl.bindTexture(gl.TEXTURE_2D, this.scoreTexture)
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.offscreenCanvas)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.bindTexture(gl.TEXTURE_2D, null)
	}
}

export {ScoreView}
